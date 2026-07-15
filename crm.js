/* ===================================================
   SOLUCIONES IA CM — CRM Application Logic
   Version: 1.1.0  (security hardened)

   Para cambiar la contraseña:
   1. Calcula el SHA-256 de tu nueva contraseña en:
      https://emn178.github.io/online-tools/sha256.html
   2. Sustituye PASSWORD_HASH por el nuevo hash.
   =================================================== */

'use strict';

/* ===================================================
   CONFIGURATION (no secrets in plain text)
   =================================================== */
// SHA-256 hash of 'siacm2025'  — never store the plain password
const PASSWORD_HASH  = '629fa32d039e8ada557b3e018dd183e766015bee95008f2644906e94b5e2b546';
const STORAGE_KEY    = 'siacm_leads';
const SESSION_KEY    = 'siacm_crm_auth';

// Brute-force protection
const MAX_ATTEMPTS      = 5;
const LOCKOUT_MS        = 10 * 60 * 1000; // 10 minutes
const ATTEMPTS_KEY      = 'siacm_login_attempts';
const LOCKOUT_UNTIL_KEY = 'siacm_lockout_until';

/* ===================================================
   STATUS CONFIG
   =================================================== */
const STATUS = {
  nuevo:      { label: 'Nuevo',            emoji: '🆕', cls: 'nuevo'      },
  contactado: { label: 'Contactado',       emoji: '📞', cls: 'contactado' },
  propuesta:  { label: 'Propuesta env.',   emoji: '📄', cls: 'propuesta'  },
  ganado:     { label: 'Ganado',           emoji: '🏆', cls: 'ganado'     },
  perdido:    { label: 'Perdido',          emoji: '❌', cls: 'perdido'    },
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
   STATE
   =================================================== */
let leads         = [];
let filteredLeads = [];
let activeFilter  = '';
let searchQuery   = '';
let sortCol       = 'createdAt';
let sortDir       = 'desc';
let currentLeadId = null;

/* ===================================================
   LOCAL STORAGE HELPERS
   =================================================== */
function getLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveLeads(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addLead(lead) {
  leads.unshift(lead);
  saveLeads(leads);
  refreshAll();
  showToast('✅', 'Lead guardado correctamente');
}

function updateLead(id, updates) {
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return;
  leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
  saveLeads(leads);
  refreshAll();
}

function deleteLead(id) {
  leads = leads.filter(l => l.id !== id);
  saveLeads(leads);
  refreshAll();
  closePanel();
  showToast('🗑', 'Lead eliminado');
}

/* ===================================================
   FILTER + SORT
   =================================================== */
function applyFilter() {
  let data = [...leads];

  // Status filter
  if (activeFilter) {
    data = data.filter(l => l.status === activeFilter);
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(l =>
      (l.name    || '').toLowerCase().includes(q) ||
      (l.email   || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.phone   || '').toLowerCase().includes(q)
    );
  }

  // Sort
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
   RENDER TABLE
   =================================================== */
function renderTable() {
  const tbody     = document.getElementById('crm-tbody');
  const emptyState = document.getElementById('empty-state');

  if (!filteredLeads.length) {
    tbody.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  tbody.innerHTML = filteredLeads.map(lead => {
    const st     = STATUS[lead.status] || STATUS.nuevo;
    const src    = SOURCE_LABELS[lead.source] || lead.source || 'Web';
    const date   = formatDate(lead.createdAt);
    const name   = esc(lead.name   || '—');
    const email  = esc(lead.email  || '—');
    const company= esc(lead.company|| '—');
    const phone  = esc(lead.phone  || '—');

    return `
      <tr data-id="${esc(lead.id)}" title="Clic para ver detalle" tabindex="0" role="row">
        <td><strong>${name}</strong></td>
        <td><a href="mailto:${email}" style="color:#818CF8" onclick="event.stopPropagation()">${email}</a></td>
        <td>${company}</td>
        <td>${phone}</td>
        <td>
          <span class="status-badge status-${st.cls}">
            <span class="dot"></span>${st.label}
          </span>
        </td>
        <td><span class="source-badge">${src}</span></td>
        <td style="color:var(--text-muted)">${date}</td>
        <td>
          <div class="row-actions">
            <button class="action-btn" onclick="openPanel('${esc(lead.id)}');event.stopPropagation();" title="Ver detalle">👁</button>
            <button class="action-btn danger" onclick="confirmDelete('${esc(lead.id)}');event.stopPropagation();" title="Eliminar">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Click row → open panel
  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', () => openPanel(row.dataset.id));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openPanel(row.dataset.id);
    });
  });
}

/* ===================================================
   STATS
   =================================================== */
function renderStats() {
  document.getElementById('stat-all').textContent       = leads.length;
  document.getElementById('stat-nuevo').textContent     = leads.filter(l => l.status === 'nuevo').length;
  document.getElementById('stat-contactado').textContent= leads.filter(l => l.status === 'contactado').length;
  document.getElementById('stat-propuesta').textContent = leads.filter(l => l.status === 'propuesta').length;
  document.getElementById('stat-ganado').textContent    = leads.filter(l => l.status === 'ganado').length;
  document.getElementById('stat-perdido').textContent   = leads.filter(l => l.status === 'perdido').length;
}

/* ===================================================
   DETAIL PANEL
   =================================================== */
function openPanel(id) {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;
  currentLeadId = id;

  const panel   = document.getElementById('detail-panel');
  const overlay = document.getElementById('panel-overlay');

  // Header title
  document.getElementById('panel-lead-name').textContent = lead.name || 'Lead';

  // Info grid
  const st  = STATUS[lead.status] || STATUS.nuevo;
  const src = SOURCE_LABELS[lead.source] || lead.source || '—';
  document.getElementById('panel-info-grid').innerHTML = `
    <div class="info-item"><div class="info-label">Nombre</div><div class="info-value">${esc(lead.name || '—')}</div></div>
    <div class="info-item"><div class="info-label">Email</div><div class="info-value"><a href="mailto:${esc(lead.email)}">${esc(lead.email || '—')}</a></div></div>
    <div class="info-item"><div class="info-label">Empresa</div><div class="info-value">${esc(lead.company || '—')}</div></div>
    <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value"><a href="tel:${esc(lead.phone)}">${esc(lead.phone || '—')}</a></div></div>
    <div class="info-item"><div class="info-label">Origen</div><div class="info-value">${esc(src)}</div></div>
    <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${formatDateLong(lead.createdAt)}</div></div>
  `;

  // Status buttons
  document.querySelectorAll('.status-option').forEach(btn => {
    const s = btn.dataset.status;
    btn.className = 'status-option' + (s === lead.status ? ` selected-${s}` : '');
  });

  // Message
  const msgSection = document.getElementById('panel-message-section');
  const msgEl      = document.getElementById('panel-message-text');
  if (lead.message) {
    msgEl.textContent = lead.message;
    msgSection.style.display = '';
  } else {
    msgSection.style.display = 'none';
  }

  // Notes
  renderNotes(lead.notes || []);

  // Clear note input
  document.getElementById('note-input').value = '';

  // Open
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

  const lead  = leads.find(l => l.id === currentLeadId);
  if (!lead) return;

  const note = { id: 'note_' + Date.now(), text, createdAt: new Date().toISOString() };
  const notes = [...(lead.notes || []), note];
  updateLead(currentLeadId, { notes });
  renderNotes(notes);
  input.value = '';
  showToast('📝', 'Nota guardada');
}

function confirmDelete(id) {
  if (confirm('¿Eliminar este lead? Esta acción no se puede deshacer.')) {
    deleteLead(id);
  }
}

/* ===================================================
   ADD LEAD MODAL
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
  if (!name || !email) {
    showToast('⚠️', 'Nombre y email son obligatorios');
    return;
  }
  const lead = {
    id:        'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name,
    email,
    company:   document.getElementById('ml-company').value.trim(),
    phone:     document.getElementById('ml-phone').value.trim(),
    message:   document.getElementById('ml-message').value.trim(),
    status:    document.getElementById('ml-status').value,
    source:    document.getElementById('ml-source').value,
    notes:     [],
  };
  addLead(lead);
  closeModal();
}

/* ===================================================
   EXPORT CSV
   =================================================== */
function exportCSV() {
  const headers = ['ID', 'Nombre', 'Email', 'Empresa', 'Teléfono', 'Estado', 'Origen', 'Mensaje', 'Fecha'];
  const rows = leads.map(l => [
    l.id, l.name, l.email, l.company, l.phone,
    STATUS[l.status]?.label || l.status,
    SOURCE_LABELS[l.source] || l.source,
    (l.message || '').replace(/\n/g, ' '),
    formatDate(l.createdAt)
  ].map(v => `"${String(v || '').replace(/"/g, '""')}"`));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `leads_siacm_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📊', 'CSV exportado correctamente');
}

/* ===================================================
   TOAST
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

/* ===================================================
   AUTH
   =================================================== */
function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'ok';
}

/* Password hashing via Web Crypto API (SHA-256) */
async function hashPassword(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* Brute-force protection helpers */
function isLockedOut() {
  const until = parseInt(sessionStorage.getItem(LOCKOUT_UNTIL_KEY) || '0');
  return Date.now() < until;
}

function lockoutMinutesLeft() {
  const until = parseInt(sessionStorage.getItem(LOCKOUT_UNTIL_KEY) || '0');
  return Math.max(1, Math.ceil((until - Date.now()) / 60000));
}

function recordFailedAttempt() {
  const attempts = parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
  if (attempts >= MAX_ATTEMPTS) {
    sessionStorage.setItem(LOCKOUT_UNTIL_KEY, String(Date.now() + LOCKOUT_MS));
    sessionStorage.setItem(ATTEMPTS_KEY, '0');
  } else {
    sessionStorage.setItem(ATTEMPTS_KEY, String(attempts));
  }
  return attempts;
}

function clearLoginAttempts() {
  sessionStorage.removeItem(ATTEMPTS_KEY);
  sessionStorage.removeItem(LOCKOUT_UNTIL_KEY);
}

/* Async login with hash comparison */
async function login(password) {
  if (isLockedOut()) return false;
  const hash = await hashPassword(password);
  if (hash === PASSWORD_HASH) {
    clearLoginAttempts();
    sessionStorage.setItem(SESSION_KEY, 'ok');
    showCRM();
    return true;
  }
  recordFailedAttempt();
  return false;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('crm-app').classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-password').value = '';
}

function showCRM() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('crm-app').classList.add('visible');
  leads = getLeads();
  refreshAll();
}

/* ===================================================
   REFRESH ALL
   =================================================== */
function refreshAll() {
  leads = getLeads(); // Always reload from storage
  applyFilter();
  renderTable();
  renderStats();
}

/* ===================================================
   HELPERS
   =================================================== */
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
    return new Date(iso).toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'2-digit' });
  } catch { return iso; }
}

function formatDateLong(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-ES', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}

/* ===================================================
   INIT
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {

  // --- AUTH ---
  if (isAuthenticated()) {
    showCRM();
  }

  // Login form (async due to SHA-256 hashing)
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = document.getElementById('login-error');
    const pwdInput = document.getElementById('login-password');

    if (isLockedOut()) {
      err.textContent = `Demasiados intentos fallidos. Espera ${lockoutMinutesLeft()} minuto(s) e inténtalo de nuevo.`;
      err.classList.add('show');
      return;
    }

    const pwd = pwdInput.value;
    const ok  = await login(pwd);

    if (!ok) {
      const remaining = MAX_ATTEMPTS - parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || '0');
      const msg = isLockedOut()
        ? `Cuenta bloqueada ${lockoutMinutesLeft()} minuto(s) por exceso de intentos.`
        : `Contraseña incorrecta. Intentos restantes: ${remaining}.`;
      err.textContent = msg;
      err.classList.add('show');
      pwdInput.value = '';
      pwdInput.focus();
    } else {
      err.classList.remove('show');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  // --- SEARCH ---
  document.getElementById('crm-search').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    applyFilter();
    renderTable();
  });

  // --- STATUS DROPDOWN FILTER ---
  document.getElementById('crm-status-filter').addEventListener('change', (e) => {
    activeFilter = e.target.value;
    updateSidebarActive(activeFilter);
    applyFilter();
    renderTable();
    renderStats();
  });

  // --- SIDEBAR STAT CARDS ---
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
      if (e.key === 'Enter' || e.key === ' ') card.click();
    });
  });

  function updateSidebarActive(filter) {
    document.querySelectorAll('.stat-card[data-filter]').forEach(c => {
      c.classList.toggle('active', c.dataset.filter === filter);
    });
  }

  // --- SORT (table header click) ---
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
      th.querySelector('.sort-icon').textContent = sortDir === 'asc' ? '↑' : '↓';
      applyFilter();
      renderTable();
    });
  });

  // --- ADD LEAD ---
  document.getElementById('add-lead-btn').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-bg').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-bg')) closeModal();
  });
  document.getElementById('add-lead-form').addEventListener('submit', handleAddLead);

  // --- PANEL CONTROLS ---
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('panel-overlay').addEventListener('click', closePanel);

  // Status buttons in panel
  document.querySelectorAll('.status-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentLeadId) return;
      const newStatus = btn.dataset.status;
      updateLead(currentLeadId, { status: newStatus });

      // Re-render status buttons
      document.querySelectorAll('.status-option').forEach(b => {
        const s = b.dataset.status;
        b.className = 'status-option' + (s === newStatus ? ` selected-${s}` : '');
      });
      showToast('✅', `Estado → ${STATUS[newStatus]?.label}`);
    });
  });

  // Note save
  document.getElementById('note-save').addEventListener('click', addNote);
  document.getElementById('note-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote();
  });

  // Delete lead from panel
  document.getElementById('delete-lead-btn').addEventListener('click', () => {
    if (!currentLeadId) return;
    confirmDelete(currentLeadId);
  });

  // --- EXPORT ---
  document.getElementById('export-btn').addEventListener('click', exportCSV);

  // --- ESC to close ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('modal-bg').classList.contains('open')) closeModal();
      else if (document.getElementById('detail-panel').classList.contains('open')) closePanel();
    }
  });

  // Listen for new leads from the main page (same origin, different tab via storage events)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && isAuthenticated()) {
      leads = getLeads();
      refreshAll();
      showToast('🔔', 'Nuevo lead recibido del formulario web');
    }
  });
});
