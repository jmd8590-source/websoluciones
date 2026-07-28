/* ===================================================
   LO ÚLTIMO EN IA — Datos mensuales de novedades
   Soluciones IA CM

   ✅ INSTRUCCIONES DE ACTUALIZACIÓN MENSUAL
   ────────────────────────────────────────────────────
   1. Cambia LO_ULTIMO_MONTH (español) y LO_ULTIMO_MONTH_EN (inglés)
   Este archivo es actualizado mensualmente por el equipo.
   Cada mes se reemplazan las entradas de NEWS_ITEMS,
   TOOLS_ITEMS y LEARN_ITEMS con las novedades más
   relevantes. No es necesario tocar HTML ni CSS.

   TIPOS DE TAG disponibles (campo tagType):
     'purple'  → Agentes, Modelos, IA Generativa
     'blue'    → Herramientas, Modelos, Productividad
     'green'   → Gratis, Open Source, Aprendizaje
     'orange'  → Automatización, Regulación, Industria
   =================================================== */

'use strict';


// ── 📰 NOTICIAS DEL MES ───────────────────────────────
// Máximo recomendado: 4 entradas
const NEWS_ITEMS = [
  {
    source:   'OpenAI',
    tag:      'Agentes',         tag_en: 'Agents',
    tagType:  'purple',
    url:      'https://openai.com/index/chatgpt-work/',
    title:    'ChatGPT Work: la IA que trabaja por ti de principio a fin',
    title_en: 'ChatGPT Work: AI that works for you from start to finish',
    desc:     'El nuevo agente de OpenAI gestiona proyectos complejos de forma autónoma: crea documentos, hojas de cálculo y más sin intervención.',
    desc_en:  'OpenAI\'s new agent autonomously handles complex projects: creates documents, spreadsheets and more without intervention.',
  },
  {
    source:   'Google DeepMind',
    tag:      'Modelos',         tag_en: 'Models',
    tagType:  'blue',
    url:      'https://blog.google/products/gemini/',
    title:    'Gemini 3.0 Pro disponible: contexto de 1 millón de tokens',
    title_en: 'Gemini 3.0 Pro available: 1 million token context window',
    desc:     'Google lanza su modelo más capaz, con una ventana de contexto sin precedentes e integración profunda con Google Search.',
    desc_en:  'Google launches its most capable model, with an unprecedented context window and deep Google Search integration.',
  },
  {
    source:   'Comisión Europea',
    tag:      'Regulación UE',   tag_en: 'EU Regulation',
    tagType:  'orange',
    url:      'https://digital-strategy.ec.europa.eu/en/policies/artificial-intelligence',
    title:    'Reglamento Ómnibus Digital IA entra en vigor el 27 de julio',
    title_en: 'EU AI Omnibus Regulation enters into force on July 27',
    desc:     'La UE simplifica el cumplimiento del Reglamento de IA para pymes y aplaza requisitos de alto riesgo hasta 2027-2028.',
    desc_en:  'The EU simplifies AI Act compliance for SMBs and postpones high-risk requirements to 2027-2028.',
  },
  {
    source:   'Anthropic',
    tag:      'Modelos',         tag_en: 'Models',
    tagType:  'purple',
    url:      'https://www.anthropic.com/claude',
    title:    'Claude Opus 5: razonamiento avanzado y 500K de contexto',
    title_en: 'Claude Opus 5: advanced reasoning and 500K context',
    desc:     'Anthropic presenta su modelo más potente con capacidades de automatización de escritorio y ventana de contexto de 500.000 tokens.',
    desc_en:  'Anthropic presents its most powerful model with desktop automation and a 500,000-token context window.',
  },
];


// ── 🛠️ HERRAMIENTAS NUEVAS ───────────────────────────
// Máximo recomendado: 4 entradas
const TOOLS_ITEMS = [
  {
    source:   'Perplexity',
    tag:      'Navegador IA',    tag_en: 'AI Browser',
    tagType:  'blue',
    url:      'https://www.perplexity.ai/comet',
    title:    'Perplexity Comet: el navegador web impulsado por IA',
    title_en: 'Perplexity Comet: the AI-powered web browser',
    desc:     'Navega, busca y resume sin cambiar de pestaña. Comet integra un asistente IA directamente en el navegador.',
    desc_en:  'Browse, search and summarize without switching tabs. Comet integrates an AI assistant directly into the browser.',
  },
  {
    source:   'Canva',
    tag:      'Creación',        tag_en: 'Creation',
    tagType:  'green',
    url:      'https://www.canva.com/code',
    title:    'Canva Code 2.0: crea webs con lenguaje natural',
    title_en: 'Canva Code 2.0: create websites with natural language',
    desc:     'Describe lo que quieres y Canva genera tu web o experiencia interactiva. Sin código, con edición visual posterior.',
    desc_en:  'Describe what you want and Canva generates your website or interactive experience. No code, with visual editing.',
  },
  {
    source:   'Zapier',
    tag:      'Automatización',  tag_en: 'Automation',
    tagType:  'orange',
    url:      'https://zapier.com/ai-agents',
    title:    'Zapier AI Agents: automatizaciones en lenguaje natural',
    title_en: 'Zapier AI Agents: automation in natural language',
    desc:     'Crea agentes de automatización complejos y multipasos describiendo lo que necesitas. Ya disponible para todos.',
    desc_en:  'Create complex multi-step automation agents by describing what you need. Now available for everyone.',
  },
  {
    source:   'Notion',
    tag:      'Productividad',   tag_en: 'Productivity',
    tagType:  'blue',
    url:      'https://www.notion.com/product/ai',
    title:    'Notion AI 2.5: pregunta a todo tu espacio de trabajo',
    title_en: 'Notion AI 2.5: query your entire workspace',
    desc:     'El nuevo Workspace Mode permite consultar información de todos tus documentos, bases de datos y calendario con una sola pregunta.',
    desc_en:  'New Workspace Mode lets you query information across all your documents, databases and calendar with a single question.',
  },
];


// ── 📚 APRENDIZAJE Y COMUNIDADES ─────────────────────
// Máximo recomendado: 3 entradas
const LEARN_ITEMS = [
  {
    source:   'Anthropic Academy',
    tag:      'Gratis',          tag_en: 'Free',
    tagType:  'green',
    url:      'https://www.anthropic.com/academy',
    title:    'Anthropic Academy: aprende a construir con IA y MCP',
    title_en: 'Anthropic Academy: learn to build with AI and MCP',
    desc:     'Cursos gratuitos sobre uso ético de la IA, flujos de trabajo con Claude y el estándar MCP para agentes.',
    desc_en:  'Free courses on ethical AI use, Claude workflows and the MCP standard for agents.',
  },
  {
    source:   'Google AI Learning',
    tag:      'Gratis',          tag_en: 'Free',
    tagType:  'green',
    url:      'https://ai.google/education/',
    title:    'Google AI Learning: desde fundamentos hasta ML avanzado',
    title_en: 'Google AI Learning: from fundamentals to advanced ML',
    desc:     'Rutas de aprendizaje estructuradas, desde qué es la IA generativa hasta cómo construir tus propios flujos de trabajo con ML.',
    desc_en:  'Structured learning paths from what generative AI is to how to build your own ML workflows.',
  },
  {
    source:   'Global AI Community',
    tag:      'Comunidad',       tag_en: 'Community',
    tagType:  'purple',
    url:      'https://www.globalai.community',
    title:    'Global AI Community: eventos, meetups y Agentic Nights',
    title_en: 'Global AI Community: events, meetups and Agentic Nights',
    desc:     'Red global de profesionales de IA con eventos presenciales y online. Especialmente recomendado para negocios que exploran agentes.',
    desc_en:  'Global network of AI professionals with in-person and online events. Recommended for businesses exploring agents.',
  },
];


// ── Motor de renderizado (no tocar) ──────────────────

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function _buildCard(item, lang, ctaLabel) {
  const isEs  = lang === 'es';
  const title = isEs ? item.title   : (item.title_en || item.title);
  const desc  = isEs ? item.desc    : (item.desc_en  || item.desc);
  const tag   = isEs ? item.tag     : (item.tag_en   || item.tag);

  const a = document.createElement('a');
  a.href      = item.url;
  a.target    = '_blank';
  a.rel       = 'noopener noreferrer';
  a.className = 'lo-ultimo-card';
  a.setAttribute('aria-label', `${_esc(item.source)}: ${_esc(title)}`);

  a.innerHTML = `
    <div class="lo-ultimo-card-header">
      <span class="lo-ultimo-source">${_esc(item.source)}</span>
      <span class="lo-ultimo-tag lo-ultimo-tag--${_esc(item.tagType)}">${_esc(tag)}</span>
    </div>
    <h4 class="lo-ultimo-card-title">${_esc(title)}</h4>
    <p class="lo-ultimo-card-desc">${_esc(desc)}</p>
    <span class="lo-ultimo-link" aria-hidden="true">${_esc(ctaLabel)} →</span>
  `;
  return a;
}

/**
 * Renderiza (o re-renderiza) las tarjetas de Lo Último.
 * Llamado automáticamente al cargar la página y al cambiar el idioma.
 * @param {string} lang - 'es' o 'en'
 */
function renderLoUltimo(lang) {
  lang = lang || localStorage.getItem('lang') || 'es';
  const isEs = lang === 'es';

  // Actualizar el badge de mes
  const monthEl = document.getElementById('lo-ultimo-month');
  if (monthEl) {
    monthEl.textContent = isEs
      ? `Actualizado: ${LO_ULTIMO_MONTH}`
      : `Updated: ${LO_ULTIMO_MONTH_EN}`;
  }

  const readMore = isEs ? 'Leer más'        : 'Read more';
  const seeTool  = isEs ? 'Ver herramienta' : 'See tool';
  const access   = isEs ? 'Acceder'         : 'Access';

  const grids = [
    { id: 'lo-ultimo-news-grid',  items: NEWS_ITEMS,  cta: readMore },
    { id: 'lo-ultimo-tools-grid', items: TOOLS_ITEMS, cta: seeTool  },
    { id: 'lo-ultimo-learn-grid', items: LEARN_ITEMS, cta: access   },
  ];

  grids.forEach(({ id, items, cta }) => {
    const grid = document.getElementById(id);
    if (!grid) return;
    grid.innerHTML = '';
    items.forEach(item => grid.appendChild(_buildCard(item, lang, cta)));
  });
}

// Inicialización automática al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  renderLoUltimo(localStorage.getItem('lang') || 'es');
});
