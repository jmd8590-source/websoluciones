/**
 * Soluciones IA CM — Entrypoint Cloudflare Worker + Static Assets
 * Conecta las rutas /api/* (reutilizando las handlers de functions/api/*)
 * y sirve el sitio estático mediante env.ASSETS bloqueando rutas sensibles.
 */
import * as leadsApi from './functions/api/leads.js';
import * as auditApi from './functions/api/audit.js';
import * as efemerideApi from './functions/api/efemeride.js';

const API_ROUTES = {
  '/api/leads': {
    GET: leadsApi.onRequestGet,
    POST: leadsApi.onRequestPost,
    PATCH: leadsApi.onRequestPatch,
    DELETE: leadsApi.onRequestDelete,
  },
  '/api/audit': {
    GET: auditApi.onRequestGet,
  },
  '/api/efemeride': {
    GET: efemerideApi.onRequestGet,
  },
};

const BLOCKED_EXACT = new Set([
  '/.gitignore',
  '/.gitmodules',
  '/.assetsignore',
  '/.htaccess',
  '/.htpasswd',
  '/wp-config.php',
  '/web.config',
  '/readme.md',
  '/package.json',
  '/package-lock.json',
  '/playwright.config.js',
  '/eslint.config.js',
  '/worker.js',
  '/wrangler.jsonc',
]);

const BLOCKED_PREFIXES = [
  '/.git/',
  '/.git',
  '/.github/',
  '/.env',
  '/.vscode/',
  '/.idea/',
  '/.wrangler/',
  '/node_modules/',
  '/dist/',
  '/build/',
  '/tests/',
  '/test-results/',
  '/playwright-report/',
  '/supabase/',
  '/functions/',
  '/data/',
];

function isBlockedPath(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {}
  const lower = decoded.replace(/\/{2,}/g, '/').toLowerCase();
  if (BLOCKED_EXACT.has(lower) || lower.endsWith('.sql')) {
    return true;
  }
  return BLOCKED_PREFIXES.some(prefix => lower === prefix || lower.startsWith(prefix));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (isBlockedPath(pathname)) {
      return new Response('Not Found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const routeHandlers = API_ROUTES[pathname];
    if (routeHandlers) {
      if (request.method === 'OPTIONS') {
        const allow = Object.keys(routeHandlers).join(', ');
        return new Response(null, {
          status: 204,
          headers: { Allow: `${allow}, OPTIONS` },
        });
      }
      const handler = routeHandlers[request.method];
      if (!handler) {
        return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Allow: Object.keys(routeHandlers).join(', '),
          },
        });
      }
      return handler({ request, env, ctx });
    }

    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Assets binding unavailable', { status: 500 });
  },
};

