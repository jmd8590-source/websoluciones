/* ===================================================
   SOLUCIONES IA CM — CRM Application Logic
   Version: 2.0.0 (Supabase Auth — server-side login)

   Autenticación: Supabase Auth (email + contraseña real).
   Ya no existe ninguna contraseña ni hash en este archivo.
   El acceso a los leads lo decide Supabase mediante Row
   Level Security (ver supabase/rls-leads.sql): solo un
   usuario autenticado puede leer, editar o borrar leads;
   el formulario público solo puede insertar.
   =================================================== */

'use strict';

/* ===================================================
   SUPABASE CONFIG
   La "anon key" es pública por diseño (no es un secreto):
   todo el control de acceso real vive en las políticas RLS
   del servidor, no en esta clave.
   =================================================== */
const SUPABASE_URL = 'https://qotpnbshccwyrledrorl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdHBuYnNoY2N3eXJsZWRyb3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM0MjcsImV4cCI6MjEwMjAzOTQyN30.ToLVuYZiEq4hNOTn2JcxU5GaaODFQIQ0zu2uE34QQ2M';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const STORAGE_KEY = 'siacm_leads_cache'; // local cache only, never the source of truth

/* ===================================================
   STATUS CONFIG
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
   DATA — Supabase es la única fuente de verdad.
   El cache local solo evita una pantalla en blanco mientras
   carga, nunca se usa para decidir quién puede ver qué.
   =================================================== */
function getCachedLeads() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function cacheLeads(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage full/blocked: ignore */ }
}

async function fetchLeads() {
  const { data, error } = await sb.from('leads').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.error('Error al leer leads:', error.message);
    showToast(iconWarning(), 'No se pudieron cargar los leads desde el servidor');
    return null;
  }
  return data || [];
}

async function addLead(lead) {
  const { data, error } = await sb.from('leads').insert(lead).select().single();
  if (error) {
    showToast(iconWarning(), 'No se pudo guardar el lead');
    console.error(error.message);
    return;
  }
  leads.unshift(data);
  cacheLeads(leads);
  refreshAll();
  showToast(iconCheck(), 'Lead guardado correctamente');
}

async function updateLead(id, updates) {
  const payload = { ...updates, updatedAt: new Date().toISOString() };
  const { data, error } = await sb.from('leads').update(payload).eq('id', id).select().single();
  if (error) {
    showToast(iconWarning(), 'No se pudo actualizar el lead');
    console.error(error.message);
    return;
  }
  const idx = leads.findIndex(l => l.id === id);
  if (idx !== -1) leads[idx] = data;
  cacheLeads(leads);
  refreshAll();
}

async function deleteLead(id) {
  const { error } = await sb.from('leads').delete().eq('id', id);
  if (error) {
    showToast(iconWarning(), 'No se pudo eliminar el lead');
    console.error(error.message);
    return;
  }
  leads = leads.filter(l => l.id !== id);
  cacheLeads(leads);
  refreshAll();
  closePanel();
  showToast(iconTrash(), 'Lead eliminado');
}

/* ===================================================
   FILTER + SORT
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
   SVG ICONS (sin emojis — consistentes con el resto del sitio)
   =================================================== */
function iconCheck() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'; }
function iconWarning() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>'; }
function iconTrash() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'; }
function iconNote() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>'; }
function iconBell() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'; }

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
        <td><a href="mailto:${email}" class="email-link">${email}</a></td>
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
            <button class="action-btn view-lead-btn" data-id="${esc(lead.id)}" title="Ver detalle" aria-label="Ver detalle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="action-btn danger delete-lead-btn" data-id="${esc(lead.id)}" title="Eliminar" aria-label="Eliminar lead">
              ${iconTrash()}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', () => openPanel(row.dataset.id));
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openPanel(row.dataset.id);
    });
  });

  tbody.querySelectorAll('.email-link').forEach(link => {
    link.addEventListener('click', (e) => e.stopPropagation());
  });

  tbody.querySelectorAll('.view-lead-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openPanel(btn.dataset.id); });
  });

  tbody.querySelectorAll('.delete-lead-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); confirmDelete(btn.dataset.id); });
  });
}

/* ===================================================
   STATS
   =================================================== */
function renderStats() {
  document.getElementById('stat-all').textContent        = leads.length;
  document.getElementById('stat-nuevo').textContent      = leads.filter(l => l.status === 'nuevo').length;
  document.getElementById('stat-contactado').textContent = leads.filter(l => l.status === 'contactado').length;
  document.getElementById('stat-propuesta').textContent  = leads.filter(l => l.status === 'propuesta').length;
  document.getElementById('stat-ganado').textContent     = leads.filter(l => l.status === 'ganado').length;
  document.getElementById('stat-perdido').textContent    = leads.filter(l => l.status === 'perdido').length;
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

  const lead  = leads.find(l => l.id === currentLeadId);
  if (!lead) return;

  const note = { id: 'note_' + Date.now(), text, createdAt: new Date().toISOString() };
  const notes = [...(lead.notes || []), note];
  updateLead(currentLeadId, { notes }).then(() => {
    renderNotes(notes);
    input.value = '';
    showToast(iconNote(), 'Nota guardada');
  });
}

function confirmDelete(id) {
  if (window.confirm('¿Eliminar este lead de forma permanente? Esta acción no se puede deshacer.')) {
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
    showToast(iconWarning(), 'Nombre y email son obligatorios');
    return;
  }
  const lead = {
    id:        'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
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
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `leads_siacm_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>', 'CSV exportado correctamente');
}

/* ===================================================
   TOAST
   =================================================== */
let toastTimer;
function showToast(iconHtml, msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').innerHTML = iconHtml;
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ===================================================
   AUTH — Supabase Auth (email + contraseña real).
   No hay contraseña, hash ni comprobación de sesión en
   este archivo: todo lo valida el servidor de Supabase.
   =================================================== */
function setLoginBusy(busy) {
  const btn = document.getElementById('login-submit-btn');
  if (btn) btn.disabled = busy;
  document.getElementById('login-form').classList.toggle('busy', busy);
}

function showLoginError(msg) {
  const err = document.getElementById('login-error');
  err.textContent = msg;
  err.classList.add('show');
}

function clearLoginError() {
  document.getElementById('login-error').classList.remove('show');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  clearLoginError();
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-password').value;
  if (!email || !pwd) { showLoginError('Introduce tu email y tu contraseña.'); return; }

  setLoginBusy(true);
  const { error } = await sb.auth.signInWithPassword({ email, password: pwd });
  setLoginBusy(false);

  if (error) {
    showLoginError('No hemos podido iniciar sesión. Comprueba el email y la contraseña.');
    return;
  }
  await showCRM();
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const msgEl = document.getElementById('forgot-msg');
  if (!email) {
    showLoginError('Escribe primero tu email arriba y pulsa de nuevo en "¿Olvidaste tu contraseña?".');
    return;
  }
  clearLoginError();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/crm.html',
  });
  msgEl.textContent = error
    ? 'No se pudo enviar el correo de recuperación. Inténtalo de nuevo más tarde.'
    : 'Si ese email tiene una cuenta, te hemos enviado un enlace para restablecer la contraseña.';
  msgEl.classList.add('show');
}

function logout() {
  sb.auth.signOut();
  document.getElementById('crm-app').classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-password').value = '';
  leads = [];
}

async function showCRM() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('crm-app').classList.add('visible');

  leads = getCachedLeads();
  refreshAll();

  const fresh = await fetchLeads();
  if (fresh) {
    leads = fresh;
    cacheLeads(leads);
    refreshAll();
  }
}

/* ===================================================
   REFRESH ALL
   =================================================== */
function refreshAll() {
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
document.addEventListener('DOMContentLoaded', async () => {

  // --- AUTH: ¿ya hay sesión activa en Supabase? ---
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    await showCRM();
  }

  sb.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      document.getElementById('crm-app').classList.remove('visible');
      document.getElementById('login-screen').style.display = 'flex';
    }
  });

  document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);
  document.getElementById('forgot-password-link').addEventListener('click', handleForgotPassword);
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

  document.querySelectorAll('.status-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentLeadId) return;
      const newStatus = btn.dataset.status;
      updateLead(currentLeadId, { status: newStatus }).then(() => {
        document.querySelectorAll('.status-option').forEach(b => {
          const s = b.dataset.status;
          b.className = 'status-option' + (s === newStatus ? ` selected-${s}` : '');
        });
        showToast(iconCheck(), `Estado → ${STATUS[newStatus]?.label}`);
      });
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
      if (document.getElementById('modal-bg').classList.contains('open')) closeModal();
      else if (document.getElementById('detail-panel').classList.contains('open')) closePanel();
    }
  });

  // Supabase Realtime: si otra pestaña/usuario inserta un lead, lo reflejamos
  sb.channel('leads-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, async () => {
      const fresh = await fetchLeads();
      if (fresh) {
        leads = fresh;
        cacheLeads(leads);
        refreshAll();
        showToast(iconBell(), 'Lista de leads actualizada');
      }
    })
    .subscribe();
});
