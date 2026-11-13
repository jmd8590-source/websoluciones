/**
 * Soluciones IA CM â€” Endpoint Edge de sincronizaciÃ³n de Leads para el CRM
 * Cloudflare Pages Function: /api/leads (GET, POST, PATCH, DELETE)
 *
 * Garantiza que todas las consultas enviadas desde el formulario pÃºblico
 * se sincronicen con el CRM incluso si el proyecto gratuito de Supabase
 * entra en pausa por inactividad, combinando:
 *   1. Cloudflare KV (si estÃ¡ vinculado como CRM_LEADS_KV)
 *   2. Cloudflare Edge Cache API (caches.default, persistente en el nodo Edge sin configuraciÃ³n extra)
 *   3. Memoria del worker (globalThis.__SIACM_LEADS_MEM__)
 *   4. ReenvÃ­o en segundo plano a Supabase REST (/rest/v1/leads)
 */

const CACHE_STORE_URL = 'https://internal-crm-store.solucionesiacm.com/v1/leads.json';
const KV_KEY = 'siacm_crm_leads_v2';

const DEFAULT_SUPABASE_URL = 'https://qotpnbshccwyrledrorl.supabase.co';
const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdHBuYnNoY2N3eXJsZWRyb3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM0MjcsImV4cCI6MjEwMjAzOTQyN30.ToLVuYZiEq4hNOTn2JcxU5GaaODFQIQ0zu2uE34QQ2M';

// Lectura/ediciÃ³n/borrado SOLO para el administrador, verificado en servidor:
//   a) JWT real de Supabase Auth (validado contra /auth/v1/user), o
//   b) secreto CRM_API_TOKEN configurado en Cloudflare (Settings â†’ Variables â†’ Secret).
// Nunca se aceptan valores que estÃ©n publicados en el cÃ³digo del navegador.

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

function getMemStore() {
  if (!globalThis.__SIACM_LEADS_MEM__) {
    globalThis.__SIACM_LEADS_MEM__ = [];
  }
  return globalThis.__SIACM_LEADS_MEM__;
}

function setMemStore(list) {
  globalThis.__SIACM_LEADS_MEM__ = Array.isArray(list) ? list : [];
}

function normalizeLead(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const now = new Date().toISOString();
  return {
    id:        String(raw.id || ('lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8))).slice(0, 80),
    createdAt: String(raw.createdAt || raw.created_at || now),
    updatedAt: String(raw.updatedAt || raw.updated_at || raw.createdAt || raw.created_at || now),
    name:      String(raw.name || '').trim().slice(0, 120),
    email:     String(raw.email || '').trim().slice(0, 200),
    company:   String(raw.company || '').trim().slice(0, 160),
    phone:     String(raw.phone || '').trim().slice(0, 40),
    message:   String(raw.message || '').trim().slice(0, 4000),
    status:    ['nuevo', 'contactado', 'propuesta', 'ganado', 'perdido'].includes(raw.status) ? raw.status : 'nuevo',
    notes:     Array.isArray(raw.notes) ? raw.notes : [],
    source:    String(raw.source || 'web_form').slice(0, 40),
  };
}

function mergeLeadLists(...lists) {
  const map = new Map();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const norm = normalizeLead(item);
      if (!norm || !norm.id || !norm.email) continue;
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

async function readEdgeLeads(env) {
  const mem = getMemStore();
  let kvLeads = [];
  let cacheLeads = [];

  if (env && env.CRM_LEADS_KV) {
    try {
      const raw = await env.CRM_LEADS_KV.get(KV_KEY, 'json');
      if (Array.isArray(raw)) kvLeads = raw;
    } catch {}
  }

  if (typeof caches !== 'undefined' && caches.default) {
    try {
      const cachedRes = await caches.default.match(CACHE_STORE_URL);
      if (cachedRes) {
        const data = await cachedRes.json();
        if (Array.isArray(data)) cacheLeads = data;
      }
    } catch {}
  }

  const merged = mergeLeadLists(mem, kvLeads, cacheLeads);
  setMemStore(merged);
  return merged;
}

async function writeEdgeLeads(env, leadsList) {
  const clean = mergeLeadLists(leadsList).slice(0, 1000);
  setMemStore(clean);

  if (env && env.CRM_LEADS_KV) {
    try {
      await env.CRM_LEADS_KV.put(KV_KEY, JSON.stringify(clean));
    } catch {}
  }

  if (typeof caches !== 'undefined' && caches.default) {
    try {
      const res = new Response(JSON.stringify(clean), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
      await caches.default.put(CACHE_STORE_URL, res);
    } catch {}
  }

  return clean;
}

async function fetchSupabaseLeads(env, authBearer) {
  const sbUrl = (env && env.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const sbKey = (env && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) || DEFAULT_SUPABASE_ANON;
  const bearer = authBearer || sbKey;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${sbUrl}/rest/v1/leads?select=*`, {
      headers: {
        'apikey': sbKey,
        'Authorization': `Bearer ${bearer}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function pushLeadToSupabase(env, lead) {
  const sbUrl = (env && env.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const sbKey = (env && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) || DEFAULT_SUPABASE_ANON;
  const headers = {
    'apikey': sbKey,
    'Authorization': `Bearer ${sbKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=minimal',
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${sbUrl}/rest/v1/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) return true;
  } catch {}
  return false;
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isAdminAuthorized(request, env) {
  // b) Secreto propio configurado en Cloudflare
  const crmToken = (request.headers.get('X-CRM-Token') || '').trim();
  if (env && env.CRM_API_TOKEN && crmToken && timingSafeEqualStr(crmToken, env.CRM_API_TOKEN)) {
    return true;
  }

  // a) JWT de Supabase Auth validado por el propio Supabase (descarta la anon key)
  const bearer = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  const sbKey = (env && env.SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_ANON;
  if (!bearer || bearer === sbKey) return false;
  const sbUrl = (env && env.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${sbUrl}/auth/v1/user`, {
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${bearer}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const user = await res.json();
    return Boolean(user && user.id && user.role === 'authenticated');
  } catch {
    return false;
  }
}

// GET /api/leads â€” Devuelve todos los leads sincronizados al CRM
export async function onRequestGet(context) {
  const { request, env } = context;
  if (!(await isAdminAuthorized(request, env))) {
    return jsonResponse({ error: 'unauthorized', message: 'No autorizado' }, 401);
  }

  const authHeader = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  const [edgeLeads, sbLeads] = await Promise.all([
    readEdgeLeads(env),
    fetchSupabaseLeads(env, authHeader),
  ]);

  const combined = await writeEdgeLeads(env, mergeLeadLists(edgeLeads, sbLeads));
  return jsonResponse({ ok: true, leads: combined });
}

// POST /api/leads â€” Guarda un nuevo lead desde el formulario pÃºblico o desde el CRM
export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const lead = normalizeLead(body);
  if (!lead || !lead.name || !lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return jsonResponse({ error: 'invalid_lead', message: 'Faltan campos obligatorios (nombre y email).' }, 400);
  }

  const current = await readEdgeLeads(env);
  const updated = await writeEdgeLeads(env, [lead, ...current]);
  await pushLeadToSupabase(env, lead);

  return jsonResponse({ ok: true, lead, total: updated.length }, 201);
}

// PATCH /api/leads?id=... â€” Actualiza estado o notas de un lead desde el CRM
export async function onRequestPatch(context) {
  const { request, env } = context;
  if (!(await isAdminAuthorized(request, env))) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return jsonResponse({ error: 'missing_id' }, 400);

  let updates;
  try {
    updates = await request.json();
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }

  const current = await readEdgeLeads(env);
  const idx = current.findIndex(l => l.id === id);
  if (idx !== -1) {
    current[idx] = normalizeLead({
      ...current[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    });
    await writeEdgeLeads(env, current);
  }

  // Reenviar actualizaciÃ³n a Supabase si estÃ¡ activo
  const sbUrl = (env && env.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const sbKey = (env && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) || DEFAULT_SUPABASE_ANON;
  try {
    await fetch(`${sbUrl}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() }),
    });
  } catch {}

  return jsonResponse({ ok: true });
}

// DELETE /api/leads?id=... â€” Elimina un lead desde el CRM
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!(await isAdminAuthorized(request, env))) {
    return jsonResponse({ error: 'unauthorized' }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return jsonResponse({ error: 'missing_id' }, 400);

  const current = await readEdgeLeads(env);
  const filtered = current.filter(l => l.id !== id);
  await writeEdgeLeads(env, filtered);

  const sbUrl = (env && env.SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  const sbKey = (env && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)) || DEFAULT_SUPABASE_ANON;
  try {
    await fetch(`${sbUrl}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
      },
    });
  } catch {}

  return jsonResponse({ ok: true });
}

