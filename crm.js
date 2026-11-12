/* ===================================================
   SOLUCIONES IA CM — Lógica del Panel CRM
   Versión: 2.0.0 (Seguridad Reforzada)

   Arquitectura de autenticación:
   1. Supabase Auth (JWT de rol 'authenticated' contra /auth/v1/token)
   2. Verificador criptográfico PBKDF2-HMAC-SHA256 (210.000 iteraciones)
      con sal de 128 bits y comparación en tiempo constante.
   3. Bloqueo antibruteforce persistente + expiración por inactividad.
   =================================================== */

'use strict';

/* ===================================================
   CONFIGURACIÓN CRIPTOGRÁFICA Y DE SESIÓN
   =================================================== */
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_SALT_HEX   = '9f4c8e2a71b64d03e85a19c7b2046df1';

/*
 * Verificadores de administradores autorizados:
 * - userSha256: huella SHA-256 del email en minúsculas (no expone el email en claro)
 * - verifier:   derivación PBKDF2-HMAC-SHA256(email:contraseña, sal, 210000)
 */
const ADMIN_VERIFIERS = Object.freeze([
  {
    userSha256: 'b1fb03a1048e2d754ab6407dd95ff924009d0aefd21dedb7ed7c59a73efed6b9',
    verifier:   '86db5081bae28e9e6ca5d2d1c25c78dee8fb2d06d0d65b0c42d46dbe8e6e2f7a',
  },
  {
    userSha256: '88028b926ec2bd8ee6366f640e9fc4dc9f31e4cebd603d2c1b8a0d23ba6e5d4e',
    verifier:   'cdb73a3d84e29cef0b3b4fb064463aaa910201de9eb546c61fd0b89a8175701a',
  },
]);

const SESSION_KEY       = 'siacm_crm_session_v2';
const CACHE_KEY         = 'siacm_crm_leads_cache';
const ATTEMPTS_KEY      = 'siacm_crm_attempts_v2';
const LOCKOUT_UNTIL_KEY = 'siacm_crm_lockout_v2';

const MAX_ATTEMPTS      = 5;
const LOCKOUT_MS        = 15 * 60 * 1000; // 15 minutos de bloqueo
const IDLE_TIMEOUT_MS   = 15 * 60 * 1000; // 15 minutos de inactividad

function getSupabaseConfig() {
  const cfg = window.SIACM_CONFIG || {};
  return {
    url:     cfg.SUPABASE_URL      || 'https://qotpnbshccwyrledrorl.supabase.co',
    anonKey: cfg.SUPABASE_ANON_KEY || '',
  };
}

/* ===================================================
   CONFIGURACIÓN DE ESTADOS Y ORÍGENES
   =================================================== */
const STATUS = {
  nuevo:      { label: 'Nuevo',          cls: 'nuevo'      },
  contactado: { label: 'Contactado',     cls: 'contactado' },
  propuesta:  { label: 'Propuesta env.', cls: 'propuesta'  },
  ganado:     { label: 'Ganado',         cls: 'ganado'     },
  perdido:    { label: 'Perdido',        cls: 'perdido'    },
};

const SOURCE_LABELS = {
  web_form: 'Web',
  manual:   'Manual',
  referral: 'Referido',
  social:   'Social',
  phone:    'Teléfono',
  email:    'Email',
  otro:     'Otro',
};

/* ===================================================
   ESTADO EN MEMORIA
   =================================================== */
let leads         = [];
let filteredLeads = [];
let activeFilter  = '';
let searchQuery   = '';
let sortCol       = 'createdAt';
let sortDir       = 'desc';
let currentLeadId = null;
let idleTimer     = null;

/* ===================================================
   UTILIDADES CRIPTOGRÁFICAS (Web Crypto API)
   =================================================== */
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return bytesToHex(buf);
}

async function derivePbkdf2Hex(username, password, saltHex = PBKDF2_SALT_HEX, iterations = PBKDF2_ITERATIONS) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(`${username.trim().toLowerCase()}:${password}`),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bytesToHex(bits);
}

/* Comparación en tiempo constante para evitar ataques de temporización */
function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/* ===================================================
   GESTIÓN DE SESIÓN Y PROTECCIÓN ANTIBRUTEFORCE
   =================================================== */
function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const sess = JSON.parse(raw);
    if (!sess || Date.now() > sess.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return sess;
  } catch {
    return null;
  }
}

function setSession(data) {
  const sess = {
    ...data,
    expiresAt: Date.now() + IDLE_TIMEOUT_MS,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
}

function touchSession() {
  const sess = getSession();
  if (!sess) return;
  sess.expiresAt = Date.now() + IDLE_TIMEOUT_MS;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
  resetIdleTimer();
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (getSession()) {
      logout('Sesión cerrada por inactividad (15 min)');
    }
  }, IDLE_TIMEOUT_MS);
}

function isLockedOut() {
  const until = parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) || '0', 10);
  return Date.now() < until;
}

function lockoutMinutesLeft() {
  const until = parseInt(localStorage.getItem(LOCKOUT_UNTIL_KEY) || '0', 10);
  return Math.max(1, Math.ceil((until - Date.now()) / 60000));
}

function recordFailedAttempt() {
  const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_UNTIL_KEY, String(Date.now() + LOCKOUT_MS));
    localStorage.setItem(ATTEMPTS_KEY, '0');
  } else {
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));
  }
  return attempts;
}

function clearLoginAttempts() {
  localStorage.removeItem(ATTEMPTS_KEY);
  localStorage.removeItem(LOCKOUT_UNTIL_KEY);
}

/* Intentar autenticación real contra Supabase Auth (GoTrue) */
async function trySupabaseAuthLogin(email, password) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.access_token) {
      return {
        mode: 'supabase_jwt',
        accessToken: data.access_token,
        userEmail: data.user?.email || email.trim().toLowerCase(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/* Autenticación principal con doble vía (Supabase Auth JWT + PBKDF2-SHA256) */
async function login(username, password) {
  if (isLockedOut()) return false;

  const cleanUser = (username || '').trim().toLowerCase();
  if (!cleanUser || !password) {
    recordFailedAttempt();
    return false;
  }

  // 1. Intentar primero Supabase Auth (si el usuario existe en Auth de Supabase)
  const sbSession = await trySupabaseAuthLogin(cleanUser, password);
  if (sbSession) {
    clearLoginAttempts();
    setSession(sbSession);
    showCRM();
    return true;
  }

  // 2. Verificación criptográfica local PBKDF2-HMAC-SHA256 (210.000 iteraciones)
  const [userHash, derived] = await Promise.all([
    sha256Hex(cleanUser),
    derivePbkdf2Hex(cleanUser, password),
  ]);

  let matched = false;
  let matchedVerifier = null;
  for (const entry of ADMIN_VERIFIERS) {
    const uOk = timingSafeEqualHex(userHash, entry.userSha256);
    const pOk = timingSafeEqualHex(derived, entry.verifier);
    if (uOk && pOk) {
      matched = true;
      matchedVerifier = entry.verifier;
    }
  }

  if (matched) {
    clearLoginAttempts();
    setSession({
      mode: 'pbkdf2_verified',
      accessToken: null,
      verifier: matchedVerifier,
      userEmail: cleanUser,
    });
    showCRM();
    return true;
  }

  recordFailedAttempt();
  return false;
}

function logout(reasonMsg) {
  clearTimeout(idleTimer);
  sessionStorage.removeItem(SESSION_KEY);
  leads = [];
  filteredLeads = [];

  document.getElementById('crm-app').classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
  const pwdInput = document.getElementById('login-password');
  if (pwdInput) pwdInput.value = '';

  if (reasonMsg) {
    const err = document.getElementById('login-error');
    if (err) {
      err.textContent = reasonMsg;
      err.classList.add('show');
    }
  }
}

function showCRM() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('crm-app').classList.add('visible');

  const sess = getSession();
  const badge = document.getElementById('crm-auth-mode');
  if (badge && sess) {
    badge.textContent = sess.mode === 'supabase_jwt'
      ? 'Supabase Auth JWT'
      : 'Cifrado PBKDF2 activo';
  }

  resetIdleTimer();
  checkUrlHashImport();
  leads = getCachedLeads();
  refreshAll();
  syncWithSupabase().catch(() => {});
}

/* ===================================================
   SINCRONIZACIÓN MULTICAPA (Local + Edge API + Supabase)
   =================================================== */
const DELETED_IDS_KEY = 'siacm_crm_deleted_ids';

function getDeletedIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function markIdDeleted(id) {
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch {}
}

function normalizeLead(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const now = new Date().toISOString();
  let parsedNotes = [];
  if (Array.isArray(raw.notes)) parsedNotes = raw.notes;
  else if (typeof raw.notes === 'string' && raw.notes.trim().startsWith('[')) {
    try { parsedNotes = JSON.parse(raw.notes); } catch { parsedNotes = []; }
  }
  return {
    id:        String(raw.id || ('lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8))),
    createdAt: String(raw.createdAt || raw.created_at || now),
    updatedAt: String(raw.updatedAt || raw.updated_at || raw.createdAt || raw.created_at || now),
    name:      String(raw.name || '').trim(),
    email:     String(raw.email || '').trim(),
    company:   String(raw.company || '').trim(),
    phone:     String(raw.phone || '').trim(),
    message:   String(raw.message || '').trim(),
    status:    STATUS[raw.status] ? raw.status : 'nuevo',
    notes:     parsedNotes,
    source:    String(raw.source || 'web_form'),
  };
}

function mergeLeadLists(...lists) {
  const deleted = getDeletedIds();
  const map = new Map();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const norm = normalizeLead(item);
      if (!norm || !norm.id || !norm.email || deleted.has(norm.id)) continue;
      const existing = map.get(norm.id);
      if (!existing || new Date(norm.updatedAt) >= new Date(existing.updatedAt)) {
        map.set(norm.id, norm);
      }
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function getCachedLeads() {
  let l1 = [], l2 = [], s1 = [];
  try { l1 = JSON.parse(localStorage.getItem('crm_leads') || '[]'); } catch {}
  try { l2 = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); } catch {}
  try { s1 = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '[]'); } catch {}
  return mergeLeadLists(l1, l2, s1);
}

function saveCachedLeads(data) {
  const clean = mergeLeadLists(data);
  const str = JSON.stringify(clean);
  try { localStorage.setItem('crm_leads', str); } catch {}
  try { localStorage.setItem(CACHE_KEY, str); } catch {}
  try { sessionStorage.setItem(CACHE_KEY, str); } catch {}
}

function getAuthHeaders(extra = {}) {
  const { anonKey } = getSupabaseConfig();
  const sess = getSession();
  const bearer = sess?.accessToken || anonKey;
  const verifier = sess?.verifier || ADMIN_VERIFIERS[0].verifier;
  return {
    'apikey': anonKey,
    'Authorization': `Bearer ${bearer}`,
    'X-CRM-Verifier': verifier,
    ...extra,
  };
}

async function fetchLeadsFromEdgeApi() {
  try {
    const res = await fetch('/api/leads', {
      headers: getAuthHeaders({ 'Accept': 'application/json' }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && Array.isArray(data.leads) ? data.leads : null;
  } catch {
    return null;
  }
}

async function fetchLeadsFromSupabase() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    let response = await fetch(`${url}/rest/v1/leads?select=*&order=createdAt.desc`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      response = await fetch(`${url}/rest/v1/leads?select=*`, {
        headers: getAuthHeaders(),
      });
    }
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  } catch {
    return null;
  }
}

async function syncWithSupabase(notify = false) {
  const [edgeLeads, supabaseLeads] = await Promise.all([
    fetchLeadsFromEdgeApi(),
    fetchLeadsFromSupabase(),
  ]);

  const localLeads = getCachedLeads();
  leads = mergeLeadLists(
    leads,
    localLeads,
    Array.isArray(edgeLeads) ? edgeLeads : [],
    Array.isArray(supabaseLeads) ? supabaseLeads : []
  );
  saveCachedLeads(leads);
  refreshAll();

  if (notify) {
    showToast('✓', `CRM sincronizado (${leads.length} consulta${leads.length === 1 ? '' : 's'})`);
  }
}

/* Importación directa desde enlace mágico del correo (#import=...) */
function checkUrlHashImport() {
  if (!location.hash || !location.hash.includes('import=')) return;
  try {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    const encoded = params.get('import');
    if (!encoded) return;
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const imported = normalizeLead(JSON.parse(jsonStr));
    if (imported && imported.email) {
      leads = mergeLeadLists([imported], getCachedLeads(), leads);
      saveCachedLeads(leads);
      history.replaceState(null, '', location.pathname + location.search);
      setTimeout(() => showToast('✓', `Consulta de ${imported.name} importada al CRM`), 150);
    }
  } catch {}
}

/* Escucha en tiempo real las consultas enviadas desde la landing en el mismo navegador */
function initRealtimeSync() {
  const onIncomingLead = (rawLead) => {
    const norm = normalizeLead(rawLead);
    if (!norm || !norm.email) return;
    leads = mergeLeadLists([norm], leads, getCachedLeads());
    saveCachedLeads(leads);
    if (getSession()) {
      refreshAll();
      showToast('✓', `Nueva consulta en vivo: ${norm.name}`);
    }
  };

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('siacm_crm_sync');
      bc.addEventListener('message', (ev) => {
        if (ev.data && ev.data.type === 'lead_created' && ev.data.lead) {
          onIncomingLead(ev.data.lead);
        }
      });
    }
  } catch {}

  window.addEventListener('storage', (ev) => {
    if (ev.key === 'crm_leads' || ev.key === CACHE_KEY) {
      leads = mergeLeadLists(leads, getCachedLeads());
      if (getSession()) refreshAll();
    }
  });

  window.addEventListener('hashchange', () => {
    checkUrlHashImport();
    if (getSession()) refreshAll();
  });

  // Sincronización periódica automática cada 25 s cuando el CRM está abierto
  setInterval(() => {
    if (getSession() && document.visibilityState === 'visible') {
      syncWithSupabase(false).catch(() => {});
    }
  }, 25000);
}

async function addLead(lead) {
  const norm = normalizeLead(lead);
  leads = mergeLeadLists([norm], leads);
  saveCachedLeads(leads);
  refreshAll();
  showToast('✓', 'Lead guardado correctamente');

  const { url } = getSupabaseConfig();
  await Promise.allSettled([
    fetch('/api/leads', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(norm),
    }),
    fetch(`${url}/rest/v1/leads`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(norm),
    }),
  ]);
}

async function updateLead(id, updates) {
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return;
  const payload = { ...updates, updatedAt: new Date().toISOString() };
  leads[idx] = { ...leads[idx], ...payload };
  saveCachedLeads(leads);
  refreshAll();

  const { url } = getSupabaseConfig();
  await Promise.allSettled([
    fetch(`/api/leads?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    }),
    fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    }),
  ]);
}

async function deleteLead(id) {
  markIdDeleted(id);
  leads = leads.filter(l => l.id !== id);
  saveCachedLeads(leads);
  refreshAll();
  closePanel();
  showToast('✓', 'Lead eliminado');

  const { url } = getSupabaseConfig();
  await Promise.allSettled([
    fetch(`/api/leads?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),
    fetch(`${url}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }),
  ]);
}

/* ===================================================
   FILTRADO Y ORDENACIÓN
   =================================================== */
function applyFilter() {
  let data = [...leads];

  if (activeFilter) {
    data = data.filter(l => l.status === activeFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(l =>
      (l.name    || '').toLowerCase().includes(q) ||
      (l.email   || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.phone   || '').toLowerCase().includes(q)
    );
  }

  data.sort((a, b) => {
    let va = a[sortCol] || '';
    let vb = b[sortCol] || '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  filteredLeads = data;
}

/* ===================================================
   RENDERIZADO DE TABLA Y MÉTRICAS
   =================================================== */
function renderTable() {
  const tbody      = document.getElementById('crm-tbody');
  const emptyState = document.getElementById('empty-state');

  if (!filteredLeads.length) {
    tbody.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  tbody.innerHTML = filteredLeads.map(lead => {
    const st      = STATUS[lead.status] || STATUS.nuevo;
    const src     = SOURCE_LABELS[lead.source] || lead.source || 'Web';
    const date    = formatDate(lead.createdAt);
    const name    = esc(lead.name    || '—');
    const email   = esc(lead.email   || '—');
    const company = esc(lead.company || '—');
    const phone   = esc(lead.phone   || '—');

    return `
      <tr data-id="${esc(lead.id)}" title="Clic para ver detalle" tabindex="0">
        <td><strong>${name}</strong></td>
        <td><a href="mailto:${email}" class="email-link">${email}</a></td>
        <td>${company}</td>
        <td>${phone}</td>
        <td>
          <span class="status-badge status-${st.cls}">
            <span class="dot"></span>${st.label}
          </span>
        </td>
        <td><span class="source-badge">${esc(src)}</span></td>
        <td style="color:var(--text-sec)">${date}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="action-btn view-lead-btn" data-id="${esc(lead.id)}" title="Ver ficha">Ver</button>
            <button type="button" class="action-btn danger delete-lead-btn" data-id="${esc(lead.id)}" title="Eliminar">×</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', () => openPanel(row.dataset.id));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPanel(row.dataset.id);
      }
    });
  });

  tbody.querySelectorAll('.email-link').forEach(link => {
    link.addEventListener('click', e => e.stopPropagation());
  });

  tbody.querySelectorAll('.view-lead-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openPanel(btn.dataset.id);
    });
  });

  tbody.querySelectorAll('.delete-lead-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      confirmDelete(btn.dataset.id);
    });
  });
}

function renderStats() {
  document.getElementById('stat-all').textContent        = leads.length;
  document.getElementById('stat-nuevo').textContent      = leads.filter(l => l.status === 'nuevo').length;
  document.getElementById('stat-contactado').textContent = leads.filter(l => l.status === 'contactado').length;
  document.getElementById('stat-propuesta').textContent  = leads.filter(l => l.status === 'propuesta').length;
  document.getElementById('stat-ganado').textContent     = leads.filter(l => l.status === 'ganado').length;
  document.getElementById('stat-perdido').textContent    = leads.filter(l => l.status === 'perdido').length;
}

/* ===================================================
   PANEL LATERAL DE DETALLE
   =================================================== */
function openPanel(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  currentLeadId = id;

  const panel   = document.getElementById('detail-panel');
  const overlay = document.getElementById('panel-overlay');

  document.getElementById('panel-lead-name').textContent = lead.name || 'Lead';

  const src = SOURCE_LABELS[lead.source] || lead.source || '—';
  document.getElementById('panel-info-grid').innerHTML = `
    <div class="info-item"><div class="info-label">Nombre</div><div class="info-value">${esc(lead.name || '—')}</div></div>
    <div class="info-item"><div class="info-label">Email</div><div class="info-value"><a href="mailto:${esc(lead.email)}">${esc(lead.email || '—')}</a></div></div>
    <div class="info-item"><div class="info-label">Empresa</div><div class="info-value">${esc(lead.company || '—')}</div></div>
    <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value"><a href="tel:${esc(lead.phone)}">${esc(lead.phone || '—')}</a></div></div>
    <div class="info-item"><div class="info-label">Origen</div><div class="info-value">${esc(src)}</div></div>
    <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${formatDateLong(lead.createdAt)}</div></div>
  `;

  document.querySelectorAll('.status-option').forEach(btn => {
    const s = btn.dataset.status;
    btn.className = 'status-option' + (s === lead.status ? ` selected-${s}` : '');
  });

  const msgSection = document.getElementById('panel-message-section');
  const msgEl      = document.getElementById('panel-message-text');
  if (lead.message) {
    msgEl.textContent = lead.message;
    msgSection.style.display = '';
  } else {
    msgSection.style.display = 'none';
  }

  renderNotes(lead.notes || []);
  document.getElementById('note-input').value = '';

  panel.classList.add('open');
  overlay.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  const panel   = document.getElementById('detail-panel');
  const overlay = document.getElementById('panel-overlay');
  panel.classList.remove('open');
  overlay.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentLeadId = null;
}

function renderNotes(notes) {
  const list = document.getElementById('panel-notes-list');
  if (!notes.length) {
    list.innerHTML = '<p style="font-size:13px;color:var(--text-muted);padding:4px 0;">Sin notas todavía.</p>';
    return;
  }
  list.innerHTML = notes.map(n => `
    <div class="note-item">
      <div class="note-meta">${formatDateLong(n.createdAt)}</div>
      <div class="note-text">${esc(n.text)}</div>
    </div>
  `).join('');
}

function addNote() {
  const input = document.getElementById('note-input');
  const text  = input.value.trim();
  if (!text || !currentLeadId) return;

  const lead = leads.find(l => l.id === currentLeadId);
  if (!lead) return;

  const note  = { id: 'note_' + Date.now(), text, createdAt: new Date().toISOString() };
  const notes = [...(lead.notes || []), note];
  updateLead(currentLeadId, { notes });
  renderNotes(notes);
  input.value = '';
  showToast('✓', 'Nota guardada');
}

function confirmDelete(id) {
  const lead = leads.find(l => l.id === id);
  const label = lead?.name ? `"${lead.name}"` : 'este lead';
  if (!window.confirm(`¿Seguro que deseas eliminar ${label}? Esta acción no se puede deshacer.`)) {
    return;
  }
  deleteLead(id);
}

/* ===================================================
   MODAL AÑADIR LEAD
   =================================================== */
function openModal() {
  const bg = document.getElementById('modal-bg');
  bg.classList.add('open');
  bg.setAttribute('aria-hidden', 'false');
  document.getElementById('ml-name').focus();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const bg = document.getElementById('modal-bg');
  bg.classList.remove('open');
  bg.setAttribute('aria-hidden', 'true');
  document.getElementById('add-lead-form').reset();
  document.body.style.overflow = '';
}

function handleAddLead(e) {
  e.preventDefault();
  const name  = document.getElementById('ml-name').value.trim();
  const email = document.getElementById('ml-email').value.trim();
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('!', 'Introduce un nombre y un email válido');
    return;
  }
  const lead = {
    id:        'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name:      name.slice(0, 120),
    email:     email.slice(0, 200),
    company:   document.getElementById('ml-company').value.trim().slice(0, 160),
    phone:     document.getElementById('ml-phone').value.trim().slice(0, 40),
    message:   document.getElementById('ml-message').value.trim().slice(0, 4000),
    status:    document.getElementById('ml-status').value,
    source:    document.getElementById('ml-source').value,
    notes:     [],
  };
  addLead(lead);
  closeModal();
}

/* ===================================================
   EXPORTACIÓN CSV (con protección contra CSV Injection)
   =================================================== */
function sanitizeCsvCell(val) {
  let str = String(val ?? '').replace(/\r?\n/g, ' ').trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

function exportCSV() {
  const headers = ['ID', 'Nombre', 'Email', 'Empresa', 'Teléfono', 'Estado', 'Origen', 'Mensaje', 'Fecha'];
  const rows = leads.map(l => [
    l.id,
    l.name,
    l.email,
    l.company,
    l.phone,
    STATUS[l.status]?.label || l.status,
    SOURCE_LABELS[l.source] || l.source,
    l.message || '',
    formatDate(l.createdAt),
  ].map(sanitizeCsvCell));

  const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `leads_siacm_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓', 'CSV exportado de forma segura');
}

/* ===================================================
   MODAL DE SEGURIDAD / ROTACIÓN DE CONTRASEÑA
   =================================================== */
function openSecurityModal() {
  const bg = document.getElementById('security-modal-bg');
  const sess = getSession();
  const userField = document.getElementById('sec-user');
  if (userField && sess?.userEmail) userField.value = sess.userEmail;
  document.getElementById('sec-output-wrap').style.display = 'none';
  bg.classList.add('open');
  bg.setAttribute('aria-hidden', 'false');
}

function closeSecurityModal() {
  const bg = document.getElementById('security-modal-bg');
  bg.classList.remove('open');
  bg.setAttribute('aria-hidden', 'true');
  document.getElementById('sec-pwd').value = '';
}

async function handleSecurityForm(e) {
  e.preventDefault();
  const user = document.getElementById('sec-user').value.trim().toLowerCase();
  const pwd  = document.getElementById('sec-pwd').value;
  if (!user || pwd.length < 12) {
    showToast('!', 'Usa un email válido y una contraseña de al menos 12 caracteres');
    return;
  }

  const [userSha256, verifier] = await Promise.all([
    sha256Hex(user),
    derivePbkdf2Hex(user, pwd),
  ]);

  // Si hay sesión JWT activa en Supabase Auth, actualizar también en el servidor
  const sess = getSession();
  const { url, anonKey } = getSupabaseConfig();
  if (sess?.accessToken && url && anonKey) {
    try {
      await fetch(`${url}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${sess.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: pwd }),
      });
    } catch {}
  }

  const outWrap = document.getElementById('sec-output-wrap');
  const outEl   = document.getElementById('sec-output');
  outEl.value = `{\n  userSha256: '${userSha256}',\n  verifier:   '${verifier}',\n}`;
  outWrap.style.display = '';
  showToast('✓', 'Verificador PBKDF2 generado');
}

/* ===================================================
   TOAST Y AYUDANTES
   =================================================== */
let toastTimer;
function showToast(icon, msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent  = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function refreshAll() {
  leads = getCachedLeads();
  applyFilter();
  renderTable();
  renderStats();
}

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return iso;
  }
}

function formatDateLong(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

/* ===================================================
   INICIALIZACIÓN
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  checkUrlHashImport();
  initRealtimeSync();

  if (getSession()) {
    showCRM();
  }

  // Mostrar / ocultar contraseña
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const pwdInput     = document.getElementById('login-password');
  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      togglePwdBtn.textContent = isPwd ? 'Ocultar' : 'Ver';
    });
  }

  // Renovar actividad de sesión al interactuar
  ['click', 'keydown', 'mousemove'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (getSession()) touchSession();
    }, { passive: true });
  });

  // Formulario de acceso
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err       = document.getElementById('login-error');
    const userInput = document.getElementById('login-username');
    const submitBtn = document.getElementById('login-submit-btn');

    if (isLockedOut()) {
      err.textContent = `Acceso bloqueado temporalmente. Inténtalo de nuevo en ${lockoutMinutesLeft()} minuto(s).`;
      err.classList.add('show');
      return;
    }

    submitBtn.disabled = true;
    const origText = submitBtn.textContent;
    submitBtn.textContent = 'Verificando credenciales…';

    const ok = await login(userInput.value, pwdInput.value);

    submitBtn.disabled = false;
    submitBtn.textContent = origText;

    if (!ok) {
      const used = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
      const remaining = Math.max(0, MAX_ATTEMPTS - used);
      err.textContent = isLockedOut()
        ? `Demasiados intentos fallidos. Bloqueado durante ${lockoutMinutesLeft()} minuto(s).`
        : `Credenciales incorrectas. Intentos restantes: ${remaining}.`;
      err.classList.add('show');
      pwdInput.value = '';
      pwdInput.focus();
    } else {
      err.classList.remove('show');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', () => logout());

  // Búsqueda
  document.getElementById('crm-search').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    applyFilter();
    renderTable();
  });

  // Filtro desplegable
  document.getElementById('crm-status-filter').addEventListener('change', (e) => {
    activeFilter = e.target.value;
    updateSidebarActive(activeFilter);
    applyFilter();
    renderTable();
    renderStats();
  });

  // Tarjetas de estado en barra lateral
  document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
    card.addEventListener('click', () => {
      activeFilter = card.dataset.filter;
      document.getElementById('crm-status-filter').value = activeFilter;
      updateSidebarActive(activeFilter);
      applyFilter();
      renderTable();
      renderStats();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  function updateSidebarActive(filter) {
    document.querySelectorAll('.stat-card[data-filter]').forEach(c => {
      const active = c.dataset.filter === filter;
      c.classList.toggle('active', active);
      c.setAttribute('aria-pressed', String(active));
    });
  }

  // Ordenación por columnas
  document.querySelectorAll('.crm-table th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (sortCol === col) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortCol = col;
        sortDir = 'asc';
      }
      document.querySelectorAll('.crm-table th').forEach(h => h.classList.remove('sorted'));
      th.classList.add('sorted');
      const icon = th.querySelector('.sort-icon');
      if (icon) icon.textContent = sortDir === 'asc' ? '↑' : '↓';
      applyFilter();
      renderTable();
    });
  });

  // Sincronización manual
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    syncWithSupabase(true);
  });

  // Añadir lead
  document.getElementById('add-lead-btn').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-bg').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-bg')) closeModal();
  });
  document.getElementById('add-lead-form').addEventListener('submit', handleAddLead);

  // Modal de seguridad
  document.getElementById('security-btn')?.addEventListener('click', openSecurityModal);
  document.getElementById('security-modal-close')?.addEventListener('click', closeSecurityModal);
  document.getElementById('security-modal-cancel')?.addEventListener('click', closeSecurityModal);
  document.getElementById('security-modal-bg')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('security-modal-bg')) closeSecurityModal();
  });
  document.getElementById('security-form')?.addEventListener('submit', handleSecurityForm);

  // Controles de panel lateral
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('panel-overlay').addEventListener('click', closePanel);

  document.querySelectorAll('.status-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentLeadId) return;
      const newStatus = btn.dataset.status;
      updateLead(currentLeadId, { status: newStatus });

      document.querySelectorAll('.status-option').forEach(b => {
        const s = b.dataset.status;
        b.className = 'status-option' + (s === newStatus ? ` selected-${s}` : '');
      });
      showToast('✓', `Estado actualizado a ${STATUS[newStatus]?.label}`);
    });
  });

  document.getElementById('note-save').addEventListener('click', addNote);
  document.getElementById('note-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote();
  });

  document.getElementById('delete-lead-btn').addEventListener('click', () => {
    if (!currentLeadId) return;
    confirmDelete(currentLeadId);
  });

  document.getElementById('export-btn').addEventListener('click', exportCSV);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('security-modal-bg')?.classList.contains('open')) closeSecurityModal();
      else if (document.getElementById('modal-bg').classList.contains('open')) closeModal();
      else if (document.getElementById('detail-panel').classList.contains('open')) closePanel();
    }
  });
});
