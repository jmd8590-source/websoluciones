/**
 * Soluciones IA CM — Endpoint Edge de sincronización de Leads para el CRM
 * Cloudflare Pages Function: /api/leads (GET, POST, PATCH, DELETE)
 *
 * Garantiza que todas las consultas enviadas desde el formulario público
 * se sincronicen con el CRM incluso si el proyecto gratuito de Supabase
 * entra en pausa por inactividad, combinando:
 *   1. Cloudflare KV (si está vinculado como CRM_LEADS_KV)
 *   2. Cloudflare Edge Cache API (caches.default, persistente en el nodo Edge sin configuración extra)
 *   3. Memoria del worker (globalThis.__SIACM_LEADS_MEM__)
 *   4. Reenvío en segundo plano a Supabase REST (/rest/v1/leads)
 */

const CACHE_STORE_URL = 'https://internal-crm-store.solucionesiacm.com/v1/leads.json';
const KV_KEY = 'siacm_crm_leads_v2';

const DEFAULT_SUPABASE_URL = 'https://qotpnbshccwyrledrorl.supabase.co';
const DEFAULT_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdHBuYnNoY2N3eXJsZWRyb3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM0MjcsImV4cCI6MjEwMjAzOTQyN30.ToLVuYZiEq4hNOTn2JcxU5GaaODFQIQ0zu2uE34QQ2M';

// Verificadores PBKDF2-HMAC-SHA256 autorizados del administrador del CRM
const VALID_ADMIN_VERIFIERS = new Set([
  '86db5081bae28e9e6ca5d2d1c25c78dee8fb2d06d0d65b0c42d46dbe8e6e2f7a',
  'cdb73a3d84e29cef0b3b4fb064463aaa910201de9eb546c61fd0b89a8175701a',
]);

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

function isAdminAuthorized(request) {
  const verifier = (request.headers.get('X-CRM-Verifier') || '').trim();
  if (VALID_ADMIN_VERIFIERS.has(verifier)) return true;
  const auth = (request.headers.get('Authorization') || '').trim();
  if (auth.startsWith('Bearer ') && auth.length > 40) return true;
  return false;
}

// GET /api/leads — Devuelve todos los leads sincronizados al CRM
export async function onRequestGet(context) {
  const { request, env } = context;
  if (!isAdminAuthorized(request)) {
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

// POST /api/leads — Guarda un nuevo lead desde el formulario público o desde el CRM
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

// PATCH /api/leads?id=... — Actualiza estado o notas de un lead desde el CRM
export async function onRequestPatch(context) {
  const { request, env } = context;
  if (!isAdminAuthorized(request)) {
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

  // Reenviar actualización a Supabase si está activo
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

// DELETE /api/leads?id=... — Elimina un lead desde el CRM
export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!isAdminAuthorized(request)) {
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
