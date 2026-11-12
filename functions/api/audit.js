/**
 * Soluciones IA CM — Auditor Web IA (motor real)
 * Cloudflare Pages Function: GET /api/audit?url=https://ejemplo.com
 *
 * Analiza en vivo la web indicada (la pide el propio servidor, nunca el
 * navegador del visitante, así que no hay problema de CORS) y devuelve
 * puntuaciones basadas en señales reales detectadas en el HTML y en las
 * cabeceras HTTP: no es una simulación ni una puntuación aleatoria.
 *
 * Es un análisis automático ligero (heurísticas), no un Lighthouse
 * completo ni una auditoría manual: el texto que acompaña cada resultado
 * lo deja claro para no prometer más precisión de la que realmente hay.
 */

const FETCH_TIMEOUT_MS = 8000;
const MAX_BODY_BYTES = 2_000_000; // 2 MB: suficiente para analizar el <head> y gran parte del <body>
const USER_AGENT = 'Mozilla/5.0 (compatible; SolucionesIACM-AuditorBot/1.0; +https://solucionesiacm.com)';

export function isPrivateOrLocalHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
  // IPv4 literal checks (defensa adicional; Cloudflare ya restringe rangos privados por su cuenta)
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [parseInt(ipv4[1], 10), parseInt(ipv4[2], 10)];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (h === '[::1]' || h === '::1') return true;
  return false;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function countMatches(re, text) {
  const m = text.match(re);
  return m ? m.length : 0;
}

function level(score) {
  return score >= 70 ? 'good' : score >= 38 ? 'ok' : 'bad';
}

export function analyzeHtml(html, headers, responseTimeMs, finalUrlIsHttps) {
  const head = html.slice(0, 60000); // <head> casi siempre cabe aquí

  // ── Responsive ──────────────────────────────────────────
  const hasViewport = /<meta[^>]+name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(head);
  const responsive = hasViewport ? 85 : (/<meta[^>]+name=["']viewport["']/i.test(head) ? 55 : 15);

  // ── Multiidioma ─────────────────────────────────────────
  const hreflangCount = new Set((html.match(/hreflang=["']([a-zA-Z-]+)["']/g) || []).map(s => s.toLowerCase())).size;
  const hasLangSwitchHint = /lang-toggle|language-switcher|selector.?idioma|\bES\s*\/\s*EN\b/i.test(html);
  const multilingual = hreflangCount >= 2 ? 85 : (hreflangCount === 1 || hasLangSwitchHint ? 52 : 15);

  // ── Chatbot / agente ────────────────────────────────────
  const chatProviders = /chatbase\.co|tawk\.to|crisp\.chat|widget\.intercom|js\.driftt\.com|zdassets\.com|tidio\.co|freshchat|livechatinc\.com|hs-scripts\.com|manychat/i;
  const hasRealChat = chatProviders.test(html);
  const hasWhatsapp = /wa\.me\/|api\.whatsapp\.com/i.test(html);
  const chatbot = hasRealChat ? 88 : (hasWhatsapp ? 50 : 10);

  // ── CRM / gestión de leads (señal indirecta: formulario con email) ──
  const hasEmailForm = /<form[\s\S]{0,800}?type=["']email["']/i.test(html);
  const crm = hasEmailForm ? 45 : 10; // nunca "good": un formulario no confirma que exista un CRM real detrás

  // ── Velocidad ───────────────────────────────────────────
  const performance = responseTimeMs < 400 ? 88 : responseTimeMs < 1200 ? 55 : 22;

  // ── SEO ─────────────────────────────────────────────────
  const hasTitle = /<title>[^<]{10,70}<\/title>/i.test(head);
  const hasDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(head);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(head);
  const h1Count = countMatches(/<h1[\s>]/gi, html);
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  const seoSignals = [hasTitle, hasDescription, hasCanonical, h1Count === 1, hasJsonLd].filter(Boolean).length;
  const seo = seoSignals >= 4 ? 90 : seoSignals >= 2 ? 58 : 22;

  // ── Seguridad ───────────────────────────────────────────
  const secHeaders = ['strict-transport-security', 'x-content-type-options', 'content-security-policy', 'x-frame-options']
    .filter(h => headers.has(h)).length;
  const security = !finalUrlIsHttps ? 10 : (secHeaders >= 2 ? 88 : secHeaders >= 1 ? 58 : 32);

  // ── Accesibilidad ───────────────────────────────────────
  const imgTags = html.match(/<img\s[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter(tag => /\salt=["'][^"']*["']/i.test(tag)).length;
  const altRatio = imgTags.length ? imgsWithAlt / imgTags.length : null;
  const hasHtmlLang = /<html[^>]+lang=["'][a-zA-Z-]+["']/i.test(html.slice(0, 2000));
  let accessibility;
  if (altRatio === null) accessibility = hasHtmlLang ? 55 : 30;
  else accessibility = (altRatio >= 0.8 && hasHtmlLang) ? 82 : (altRatio >= 0.4 || hasHtmlLang) ? 52 : 18;

  // ── Redes sociales ──────────────────────────────────────
  const socialPlatforms = ['facebook.com/', 'instagram.com/', 'twitter.com/', 'x.com/', 'linkedin.com/', 'tiktok.com/', 'youtube.com/'];
  const socialCount = socialPlatforms.filter(p => html.toLowerCase().includes(p)).length;
  const social = socialCount >= 2 ? 80 : socialCount === 1 ? 50 : 15;

  // ── Llamadas a la acción ────────────────────────────────
  const ctaWords = /comprar|contactar|reservar|solicitar|llamar ahora|pide\s|empieza|agenda|contact us|buy now|book now|get started|request a|schedule a|sign up|subscribe/i;
  const ctaBlocks = (html.match(/<(a|button)[^>]*>([\s\S]{0,60}?)<\/\1>/gi) || []);
  const ctaMatches = ctaBlocks.filter(b => ctaWords.test(b)).length;
  const cta = ctaMatches >= 2 ? 80 : ctaMatches === 1 ? 50 : 22;

  return { responsive, multilingual, chatbot, crm, performance, seo, security, accessibility, social, cta };
}

export async function onRequestGet(context) {
  const { request } = context;
  const reqUrl = new URL(request.url);
  const target = reqUrl.searchParams.get('url');

  if (!target) {
    return json({ error: 'missing_url', message: 'Falta el parámetro url.' }, 400);
  }

  let parsed;
  try {
    parsed = new URL(target.startsWith('http') ? target : `https://${target}`);
  } catch {
    return json({ error: 'invalid_url', message: 'La URL no es válida.' }, 400);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return json({ error: 'invalid_protocol', message: 'Solo se admiten URLs http o https.' }, 400);
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    return json({ error: 'forbidden_host', message: 'No se pueden analizar direcciones internas o locales.' }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();

  try {
    const res = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    const responseTimeMs = Date.now() - start;
    clearTimeout(timeout);

    if (!res.ok) {
      return json({
        error: 'fetch_failed',
        message: `El sitio respondió con un error (HTTP ${res.status}). Puede que esté bloqueando el acceso automatizado.`,
        httpStatus: res.status,
      contentLength: html.length,
      html: html.slice(0, 350000),
      }, 502);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/i.test(contentType)) {
      return json({ error: 'not_html', message: 'La URL no devuelve una página HTML analizable.' }, 415);
    }

    // Leer el cuerpo con límite de tamaño (sin cargar más de MAX_BODY_BYTES en memoria)
    const reader = res.body?.getReader();
    const chunks = [];
    let received = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (received >= MAX_BODY_BYTES) { reader.cancel().catch(() => {}); break; }
      }
    }
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
    const html = new TextDecoder('utf-8', { fatal: false }).decode(merged);

    const finalUrlIsHttps = new URL(res.url || parsed.toString()).protocol === 'https:';
    const scores = analyzeHtml(html, res.headers, responseTimeMs, finalUrlIsHttps);
    const levels = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, level(v)]));
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

    return json({
      ok: true,
      analyzedUrl: res.url || parsed.toString(),
      analyzedAt: new Date().toISOString(),
      responseTimeMs,
      httpStatus: res.status,
      overall,
      scores,
      levels,
      source: 'live', // el cliente usa esto para mostrar "análisis en vivo" vs. "ejemplo"
    });
  } catch (err) {
    clearTimeout(timeout);
    const timedOut = err && err.name === 'AbortError';
    return json({
      error: timedOut ? 'timeout' : 'network_error',
      message: timedOut
        ? 'La web tardó demasiado en responder.'
        : 'No hemos podido conectar con esa web. Comprueba la URL o inténtalo de nuevo.',
    }, 504);
  }
}
