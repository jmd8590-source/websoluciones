/**
 * Soluciones IA CM — Efeméride del día
 * Cloudflare Pages Function: GET /api/efemeride
 *
 * Sirve solo el hecho histórico de hoy (unos cientos de bytes) en vez de
 * los 366 del año entero. El dato sigue siendo el mismo (data/efemerides.json,
 * la misma fuente que antes vivía duplicada dentro de facts.js), lo único
 * que cambia es cuánto se manda al navegador en cada visita.
 */
import TECH_FACTS from '../../data/efemerides.js';

function dayOfYearMs(key) {
  const [m, d] = key.split('-').map(Number);
  return new Date(2024, m - 1, d).getTime(); // 2024: año bisiesto, cubre el 29-02
}

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const now = new Date();
  const todayKey = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const requested = searchParams.get('date'); // solo para pruebas manuales

  const allKeys = Object.keys(TECH_FACTS);
  let key = (requested && TECH_FACTS[requested]) ? requested : todayKey;

  if (!TECH_FACTS[key]) {
    const todayMs = dayOfYearMs(todayKey);
    let minDist = Infinity;
    for (const k of allKeys) {
      const diff = Math.abs(dayOfYearMs(k) - todayMs);
      const circular = Math.min(diff, 365 * 86400000 - diff);
      if (circular < minDist) { minDist = circular; key = k; }
    }
  }

  return new Response(JSON.stringify({ key, isToday: key === todayKey, ...TECH_FACTS[key] }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Un día entero de caché en el borde: el resultado solo cambia una vez al día
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
