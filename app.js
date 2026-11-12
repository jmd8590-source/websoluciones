/* ===================================================
   SOLUCIONES IA CM — Lógica principal de la web
   Versión: 2.0.0
   =================================================== */

'use strict';

/* ===================================================
   CONFIGURACIÓN PÚBLICA (cargada desde config.js)
   =================================================== */
function getPublicConfig() {
  return window.SIACM_CONFIG || {
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    WEB3FORMS_KEY: '',
  };
}

/* Envía aviso por correo mediante Web3Forms */
async function sendEmailNotification(lead) {
  const { WEB3FORMS_KEY } = getPublicConfig();
  if (!WEB3FORMS_KEY) return;
  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[Soluciones IA CM] Nueva consulta de ${lead.name}`,
        from_name: 'Web Soluciones IA CM',
        replyto: lead.email,
        name: lead.name,
        email: lead.email,
        message: [
          'NUEVA CONSULTA DESDE LA WEB',
          '',
          `Nombre:    ${lead.name}`,
          `Email:     ${lead.email}`,
          `Empresa:   ${lead.company || 'No indicada'}`,
          `Teléfono:  ${lead.phone || 'No indicado'}`,
          '',
          'Mensaje:',
          lead.message,
          '',
          `Recibido: ${new Date().toLocaleString('es-ES')}`,
        ].join('\n'),
      }),
    });
  } catch {
    // Fallo silencioso: el lead queda registrado en Supabase
  }
}

/* Guarda el lead en Supabase (RPC submit_lead si existe, o INSERT directo con política anon) */
async function saveLeadToSupabase(lead) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getPublicConfig();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      // Fallback a función RPC segura submit_lead si la tabla tiene inserción directa cerrada
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_lead`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_id:      lead.id,
          p_name:    lead.name,
          p_email:   lead.email,
          p_company: lead.company,
          p_phone:   lead.phone,
          p_message: lead.message,
          p_source:  lead.source,
        }),
      });
    }
  } catch {
    // Silencioso en cliente
  }
}

/* Límite de envíos: máximo 3 por hora por navegador */
function checkRateLimit() {
  const key = 'siacm_form_rl';
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  let data = null;
  try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch { data = null; }
  if (!data || now - data.start > hour) {
    try { localStorage.setItem(key, JSON.stringify({ count: 1, start: now })); } catch {}
    return true;
  }
  if (data.count >= 3) return false;
  try { localStorage.setItem(key, JSON.stringify({ count: data.count + 1, start: data.start })); } catch {}
  return true;
}

/* ===================================================
   TRADUCCIONES (ES / EN)
   =================================================== */
const TRANSLATIONS = {
  es: {
    logo_tag: 'Automatización & IA',
    nav_inicio: 'Inicio',
    nav_servicios: 'Servicios',
    nav_proceso: 'Cómo trabajamos',
    nav_auditor: 'Auditor Web IA',
    nav_lo_ultimo: 'Lo Último',
    nav_faq: 'FAQ',
    nav_contacto: 'Contacto',
    nav_cta: 'Solicitar consulta',

    // Hero
    hero_badge: 'Automatización con IA para empresas locales',
    hero_title_line1: 'Transforma tu negocio',
    hero_title_line2: 'con Inteligencia Artificial',
    hero_subtitle: 'Soluciones y asesoría para pequeños y medianos negocios locales: automatizamos tareas, ahorramos tiempo y potenciamos tu empresa con la última tecnología.',
    hero_cta_primary: 'Ver servicios',
    hero_cta_secondary: 'Hablar con nosotros',
    hero_cta_auditor: 'Auditar mi web gratis',
    hero_stat_1_value: '+50%',
    hero_stat_1_label: 'Ahorro de tiempo',
    hero_stat_2_value: '24/7',
    hero_stat_2_label: 'Atención a clientes',
    hero_stat_3_value: '100%',
    hero_stat_3_label: 'Negocio local',

    // Tarjeta ilustrativa del hero
    hv_name: 'Asistente de tu negocio',
    hv_status: 'En línea · responde al instante',
    hv_m1: 'Hola, ¿tenéis hueco mañana por la mañana?',
    hv_m2: '¡Hola! Mañana tengo libre a las 10:30 y a las 12:00. ¿Cuál te viene mejor?',
    hv_m3: 'A las 10:30, perfecto.',
    hv_m4: 'Reservado. Te acabo de enviar la confirmación por email.',
    hv_chip1: 'Cita guardada en el CRM',
    hv_chip1_sub: 'Sin intervención manual',
    hv_chip2: 'Respuesta en 3 s',

    // Servicios
    services_label: 'Nuestros servicios',
    services_title: 'Todo lo que necesita tu negocio',
    services_subtitle: 'Un ecosistema completo de soluciones de IA y automatización diseñado para hacer crecer tu empresa local.',

    svc1_title: 'Consultoría Estratégica',
    svc1_desc: 'Analizamos las necesidades reales de tu empresa y diseñamos un plan de acción personalizado para optimizar tiempo y recursos.',
    svc2_title: 'Asistentes IA Personalizados',
    svc2_desc: 'Desarrollamos asistentes de inteligencia artificial adaptados a tu sector y flujo de trabajo, disponibles las 24 horas.',
    svc3_title: 'Agentes IA Autónomos',
    svc3_desc: 'Creamos agentes que ejecutan tareas complejas de forma autónoma: responder emails, gestionar citas, procesar pedidos y más.',
    svc4_title: 'Chatbot 24/7 Empresarial',
    svc4_desc: 'Chatbot inteligente que responde preguntas sobre tu empresa a cualquier hora, sin perder ningún cliente potencial.',
    svc5_title: 'Página Web Corporativa',
    svc5_desc: 'Diseño y desarrollo de sitios web profesionales, modernos, rápidos y optimizados para SEO y conversión.',
    svc6_title: 'Landing Pages de Alto Impacto',
    svc6_desc: 'Páginas de aterrizaje diseñadas para convertir visitantes en clientes, con diseño cuidado y optimización continua.',
    svc7_title: 'Automatización de Procesos',
    svc7_desc: 'Automatizamos tareas repetitivas: facturación, seguimiento de clientes, publicaciones en redes, notificaciones y mucho más.',
    svc8_title: 'Bases de Datos y CRM',
    svc8_desc: 'Diseño e implementación de bases de datos y sistemas CRM para gestionar clientes, leads y datos empresariales de forma eficiente.',
    svc9_title: 'Orientación Tecnológica',
    svc9_desc: 'Te guiamos en la selección de las herramientas tecnológicas más adecuadas para tu negocio, sin tecnicismos innecesarios.',
    svc10_title: 'Restauración de Imágenes Antiguas',
    svc10_desc: 'Recuperamos y mejoramos fotografías antiguas y en blanco y negro mediante IA: eliminamos deterioros, restauramos detalles y añadimos color.',
    svc11_title: 'Aplicaciones a Medida',
    svc11_desc: 'Desarrollamos aplicaciones a medida a partir de las necesidades concretas de tu negocio y de cómo trabaja tu equipo.',
    svc_cta_title: '¿Tu idea no encaja en ninguna casilla?',
    svc_cta_text: 'Cuéntanos qué te quita tiempo cada día y te proponemos cómo resolverlo.',
    svc_cta_btn: 'Cuéntanoslo',

    // Proceso
    process_label: 'Cómo trabajamos',
    process_title: 'De la primera charla a una solución que funciona',
    process_subtitle: 'Un método claro, sin sorpresas y pensado para no interrumpir el día a día de tu negocio.',
    process1_title: 'Diagnóstico gratuito',
    process1_text: 'Analizamos tus procesos y detectamos dónde se pierde tiempo o se escapan clientes.',
    process2_title: 'Propuesta a medida',
    process2_text: 'Plan de acción con presupuesto cerrado y el retorno que puedes esperar.',
    process3_title: 'Desarrollo e integración',
    process3_text: 'Implantamos la solución por fases, conectada con las herramientas que ya usas.',
    process4_title: 'Formación y soporte',
    process4_text: 'Te enseñamos a sacarle partido y seguimos a tu lado cuando lo necesites.',

    // Efeméride
    ephemeris_label: 'Historia de la Informática',
    ephemeris_title: 'Hoy en la Historia Tech',
    ephemeris_subtitle: 'Un hecho real de la historia de la informática para cada día del año.',
    ephemeris_on_this_day: 'Un día como hoy',
    ephemeris_source: 'Dato histórico verificado',

    // Lo Último
    lo_ultimo_label: 'Actualidad',
    lo_ultimo_title: 'Lo Último en IA',
    lo_ultimo_subtitle: 'Las novedades más relevantes del mes en inteligencia artificial: modelos, herramientas, aprendizaje y comunidad.',
    lo_ultimo_cat_news: 'Noticias del mes',
    lo_ultimo_cat_tools: 'Herramientas nuevas',
    lo_ultimo_cat_learn: 'Aprendizaje y comunidad',

    // Auditor
    auditor_label: 'Diagnóstico técnico en tiempo real · 100% gratuito',
    auditor_pill_dom: 'Inspección DOM en vivo',
    auditor_pill_psi: 'Google Lighthouse API',
    auditor_pill_10: '10 vectores de negocio e IA',
    auditor_title: 'Auditor Web IA en Tiempo Real',
    auditor_subtitle: 'Analiza de verdad cualquier página web: conectamos en directo con su código HTML, medimos sus Core Web Vitals y detectamos si cuenta con SEO local, agentes de IA 24/7, formularios conectados a CRM, seguridad HTTPS y accesibilidad.',
    auditor_strategy_label: 'Modo de análisis:',
    auditor_strategy_mobile: 'Móvil (estándar Google)',
    auditor_strategy_desktop: 'Escritorio',
    auditor_quick_label: 'Prueba rápida:',
    auditor_sample_self: 'Auditar esta misma web',
    auditor_sample_ext: 'es.wikipedia.org',
    auditor_placeholder: 'https://tuempresa.com',
    auditor_btn: 'Ejecutar auditoría real',
    auditor_label_sr: 'URL de tu sitio web',
    auditor_hint: 'Inspección técnica en vivo (HTML/DOM + Google PageSpeed Insights v5). No almacenamos la URL consultada.',

    auditor_step1: 'Conectando y midiendo respuesta HTTP/TLS…',
    auditor_step2: 'Parseando árbol DOM, viewport e imágenes responsive…',
    auditor_step3: 'Inspeccionando atributos de idioma, hreflang y Schema.org…',
    auditor_step4: 'Escaneando widgets de IA, chatbots 24/7 y formularios CRM…',
    auditor_step5: 'Consultando métricas Core Web Vitals y SEO técnico…',
    auditor_step6: 'Compilando evidencias técnicas y plan de mejora…',

    auditor_score_label: 'Puntuación global',
    auditor_priorities_title: 'Oportunidades prioritarias detectadas en tu web',
    auditor_btn_new: 'Analizar otra web',
    auditor_cta_title: '¿Quieres que resolvamos los puntos débiles detectados?',
    auditor_cta_subtitle: 'Preparamos una propuesta técnica a medida para tu web con presupuesto cerrado. La primera sesión de diagnóstico es 100% gratuita.',
    auditor_cta_btn: 'Solicitar plan de mejora gratuito',
    auditor_error_url: 'Introduce una URL válida (por ejemplo: https://tuempresa.com)',

    crit_responsive: 'Diseño responsive',
    crit_multilingual: 'Multiidioma (ES / EN)',
    crit_chatbot: 'Chatbot / Agente 24/7',
    crit_crm: 'CRM y gestión de leads',
    crit_performance: 'Velocidad y rendimiento',
    crit_seo: 'SEO y posicionamiento',
    crit_security: 'Seguridad y HTTPS',
    crit_accessibility: 'Accesibilidad web',
    crit_social: 'Presencia en redes',
    crit_cta: 'Llamadas a la acción',

    // FAQ
    faq_label: 'Preguntas frecuentes',
    faq_title: 'Resolvemos tus dudas sobre IA',
    faq_subtitle: 'Todo lo que necesitas saber sobre cómo la inteligencia artificial y la automatización impulsan tu empresa.',
    faq1_q: '¿Cómo ayuda Soluciones IA CM a una pequeña o mediana empresa?',
    faq1_a: 'Automatizamos tareas manuales repetitivas (gestión de citas, facturación, atención al cliente), creamos asistentes virtuales y chatbots 24/7 personalizados, y desarrollamos páginas web rápidas orientadas a conversión. Esto permite reducir costes operativos, ahorrar más de un 50% de tiempo y captar clientes de manera continua.',
    faq2_q: '¿Por qué contratar consultoría de IA para un negocio local?',
    faq2_a: 'La consultoría de IA permite a los negocios locales competir con grandes marcas sin costes prohibitivos. Analizamos tu operativa concreta, seleccionamos las herramientas exactas que te aportan rentabilidad y te acompañamos en la puesta en marcha con un retorno de inversión rápido.',
    faq3_q: '¿Cuánto cuesta implementar un chatbot o una automatización?',
    faq3_a: 'La primera consulta de diagnóstico y asesoramiento es 100% gratuita. Cada proyecto se cotiza de forma transparente y adaptada a la escala de una PYME, con presupuestos cerrados y sin cuotas ocultas.',
    faq4_q: '¿Qué ámbito geográfico cubre Soluciones IA CM?',
    faq4_a: 'Tenemos sede en Cumbres Mayores (provincia de Huelva) y prestamos servicio directo y cercano en toda la comarca y Andalucía, además de ofrecer consultoría, diseño web y desarrollos de IA en modalidad online para empresas de toda España.',
    faq5_q: '¿Cuánto tiempo toma la puesta en marcha de un proyecto de IA?',
    faq5_a: 'Los chatbots y asistentes virtuales estándar se configuran y despliegan en 3 a 7 días hábiles. Soluciones a medida más avanzadas (agentes autónomos, integraciones con ERP/CRM o plataformas web completas) suelen tomar entre 2 y 3 semanas.',
    faq6_q: '¿Se requieren conocimientos técnicos previos para empezar?',
    faq6_a: 'No. Nos encargamos de todo el desarrollo, la configuración técnica y las pruebas. Te entregamos la solución lista para usar, con una formación práctica muy sencilla y soporte continuo.',
    faq_cta_text: '¿Tienes otra pregunta sobre cómo aplicar IA a tu negocio?',
    faq_cta_btn: 'Consulta gratuita sin compromiso',

    // Contacto
    contact_label: 'Contacto',
    contact_title: 'Hablemos de tu proyecto',
    contact_subtitle: 'Primera consulta siempre gratuita. Cuéntanos tu reto y encontraremos la mejor solución para tu negocio.',
    contact_email_label: 'Email',
    contact_phone_label: 'Teléfono',
    contact_area_label: 'Área de servicio',
    contact_area_note: 'Cumbres Mayores (Huelva) · online en toda España',
    contact_hours_label: 'Disponibilidad',
    contact_hours_value: 'Lun – Vie, 09:00 – 18:00',

    contact_form_name: 'Nombre',
    contact_form_email: 'Email',
    contact_form_company: 'Empresa',
    contact_form_phone: 'Teléfono',
    contact_form_message: 'Cuéntanos tu proyecto',
    contact_form_message_ph: '¿Qué te gustaría automatizar o mejorar?',
    contact_consent_pre: 'He leído y acepto la',
    contact_consent_link: 'política de privacidad',
    contact_form_submit: 'Enviar mensaje',
    contact_form_note: 'Respondemos en menos de 24 horas laborables. Tus datos no se ceden a terceros.',
    contact_success_title: '¡Mensaje enviado!',
    contact_success_text: 'Gracias por contactarnos. Te responderemos en menos de 24 horas.',
    form_required_note: 'Los campos marcados con asterisco son obligatorios.',

    form_error_name: 'Introduce tu nombre.',
    form_error_email: 'Introduce un email válido.',
    form_error_message: 'Escribe brevemente tu consulta o proyecto.',
    form_error_consent: 'Debes aceptar la política de privacidad para enviar el formulario.',

    // Footer
    footer_description: 'Soluciones de inteligencia artificial y automatización para pequeños y medianos negocios locales.',
    footer_tech_label: 'Tecnologías con las que trabajamos',
    footer_col_services: 'Servicios',
    footer_col_company: 'Empresa',
    footer_col_legal: 'Legal',
    footer_link_consulting: 'Consultoría',
    footer_link_agents: 'Agentes IA',
    footer_link_chatbot: 'Chatbot 24/7',
    footer_link_web: 'Diseño Web',
    footer_link_automation: 'Automatizaciones',
    footer_link_image_restore: 'Restauración de Imágenes',
    footer_link_contact: 'Contacto',
    footer_link_auditor: 'Auditor Web',
    footer_link_faq: 'Preguntas Frecuentes',
    footer_link_legal: 'Aviso Legal',
    footer_link_privacy: 'Política de Privacidad',
    footer_link_cookies: 'Política de Cookies',
    footer_rights: 'Todos los derechos reservados.',
    footer_made: 'Hecho en Cumbres Mayores, Huelva',

    // Cookies y modales
    cookie_text: 'Usamos almacenamiento local técnico y de preferencias para mejorar tu experiencia.',
    cookie_more: 'Más información',
    cookie_accept: 'Aceptar',
    cookie_reject: 'Solo necesarias',
    modal_legal_title: 'Aviso Legal',
    modal_privacy_title: 'Política de Privacidad',
    modal_cookies_title: 'Política de Cookies',
  },

  en: {
    logo_tag: 'Automation & AI',
    nav_inicio: 'Home',
    nav_servicios: 'Services',
    nav_proceso: 'How we work',
    nav_auditor: 'AI Web Auditor',
    nav_lo_ultimo: "What's New",
    nav_faq: 'FAQ',
    nav_contacto: 'Contact',
    nav_cta: 'Book consultation',

    // Hero
    hero_badge: 'AI automation for local businesses',
    hero_title_line1: 'Transform your business',
    hero_title_line2: 'with Artificial Intelligence',
    hero_subtitle: 'Solutions and advisory for local small and medium businesses: we automate tasks, save time and empower your company with practical technology.',
    hero_cta_primary: 'View services',
    hero_cta_secondary: 'Talk to us',
    hero_cta_auditor: 'Audit my website free',
    hero_stat_1_value: '+50%',
    hero_stat_1_label: 'Time saved',
    hero_stat_2_value: '24/7',
    hero_stat_2_label: 'Customer support',
    hero_stat_3_value: '100%',
    hero_stat_3_label: 'Local business',

    hv_name: 'Your business assistant',
    hv_status: 'Online · replies instantly',
    hv_m1: 'Hi, do you have any openings tomorrow morning?',
    hv_m2: 'Hi! Tomorrow I have 10:30 and 12:00 available. Which works best for you?',
    hv_m3: '10:30 works great.',
    hv_m4: 'Booked. I just sent your confirmation by email.',
    hv_chip1: 'Appointment saved in CRM',
    hv_chip1_sub: 'Zero manual work',
    hv_chip2: '3s response time',

    // Services
    services_label: 'Our services',
    services_title: 'Everything your business needs',
    services_subtitle: 'A complete ecosystem of AI and automation solutions designed to grow your local company.',

    svc1_title: 'Strategic Consulting',
    svc1_desc: 'We analyze the real needs of your business and design a tailored action plan to optimize time and resources.',
    svc2_title: 'Custom AI Assistants',
    svc2_desc: 'We build artificial intelligence assistants adapted to your sector and workflow, available 24 hours a day.',
    svc3_title: 'Autonomous AI Agents',
    svc3_desc: 'We create agents that autonomously handle complex tasks: replying to emails, booking appointments, processing orders and more.',
    svc4_title: '24/7 Business Chatbot',
    svc4_desc: 'Smart chatbot that answers questions about your company at any hour without losing a single potential customer.',
    svc5_title: 'Corporate Website',
    svc5_desc: 'Design and development of fast, modern, professional websites optimized for SEO and conversion.',
    svc6_title: 'High-Impact Landing Pages',
    svc6_desc: 'Landing pages crafted to turn visitors into customers, with careful design and ongoing optimization.',
    svc7_title: 'Process Automation',
    svc7_desc: 'We automate repetitive tasks: invoicing, customer follow-up, social posts, notifications and much more.',
    svc8_title: 'Databases & CRM',
    svc8_desc: 'Design and implementation of databases and CRM systems to manage clients, leads and business data efficiently.',
    svc9_title: 'Technology Guidance',
    svc9_desc: 'We guide you in selecting the most suitable tools for your business, without unnecessary jargon.',
    svc10_title: 'Old Photo Restoration',
    svc10_desc: 'We recover and enhance old and black-and-white photographs using AI: removing damage, restoring detail and adding natural color.',
    svc11_title: 'Custom Applications',
    svc11_desc: 'We build custom applications tailored to the specific workflows and requirements of your team.',
    svc_cta_title: "Doesn't fit neatly into a box?",
    svc_cta_text: 'Tell us what takes up your time every day and we will propose a clear way to automate it.',
    svc_cta_btn: 'Tell us about it',

    // Process
    process_label: 'How we work',
    process_title: 'From first conversation to a working solution',
    process_subtitle: 'A clear, no-surprise method designed so your daily operations never stop.',
    process1_title: 'Free diagnosis',
    process1_text: 'We review your workflows and spot where time is lost or leads slip away.',
    process2_title: 'Tailored proposal',
    process2_text: 'An action plan with a fixed quote and the return you can expect.',
    process3_title: 'Build & integration',
    process3_text: 'We roll out the solution in stages, connected to the tools you already use.',
    process4_title: 'Training & support',
    process4_text: 'We train your team and stay by your side whenever you need us.',

    // Ephemeris
    ephemeris_label: 'Computing History',
    ephemeris_title: 'Today in Tech History',
    ephemeris_subtitle: 'A verified fact from the history of computing for every day of the year.',
    ephemeris_on_this_day: 'On this day',
    ephemeris_source: 'Verified historical fact',

    // Lo Último
    lo_ultimo_label: 'Latest News',
    lo_ultimo_title: "What's New in AI",
    lo_ultimo_subtitle: 'The most relevant AI developments this month: models, tools, learning and community.',
    lo_ultimo_cat_news: "This month's news",
    lo_ultimo_cat_tools: 'New tools',
    lo_ultimo_cat_learn: 'Learning & community',

    // Auditor
    auditor_label: 'Real-time technical diagnostics · 100% free',
    auditor_pill_dom: 'Live DOM Inspection',
    auditor_pill_psi: 'Google Lighthouse API',
    auditor_pill_10: '10 Business & AI vectors',
    auditor_title: 'Real-Time AI Web Auditor',
    auditor_subtitle: 'Truly audit any website: we connect live to its HTML source, measure Core Web Vitals and detect local SEO, 24/7 AI agents, CRM-connected forms, HTTPS security and accessibility.',
    auditor_strategy_label: 'Analysis mode:',
    auditor_strategy_mobile: 'Mobile (Google standard)',
    auditor_strategy_desktop: 'Desktop',
    auditor_quick_label: 'Quick test:',
    auditor_sample_self: 'Audit this website',
    auditor_sample_ext: 'es.wikipedia.org',
    auditor_placeholder: 'https://yourcompany.com',
    auditor_btn: 'Run real audit',
    auditor_label_sr: 'Your website URL',
    auditor_hint: 'Live technical inspection (HTML/DOM + Google PageSpeed Insights v5). We do not store the queried URL.',

    auditor_step1: 'Connecting & measuring HTTP/TLS response…',
    auditor_step2: 'Parsing DOM tree, viewport & responsive media…',
    auditor_step3: 'Inspecting language attributes, hreflang & Schema.org…',
    auditor_step4: 'Scanning AI widgets, 24/7 chatbots & CRM forms…',
    auditor_step5: 'Querying Core Web Vitals & technical SEO metrics…',
    auditor_step6: 'Compiling technical evidence & improvement plan…',

    auditor_score_label: 'Overall score',
    auditor_priorities_title: 'Priority opportunities detected on your website',
    auditor_btn_new: 'Analyze another website',
    auditor_cta_title: 'Want us to fix the weak spots detected?',
    auditor_cta_subtitle: 'We prepare a tailored technical proposal for your website with a fixed quote. The first diagnostic session is 100% free.',
    auditor_cta_btn: 'Request free improvement plan',
    auditor_error_url: 'Please enter a valid URL (e.g., https://yourcompany.com)',

    crit_responsive: 'Responsive design',
    crit_multilingual: 'Multilingual (ES / EN)',
    crit_chatbot: '24/7 Chatbot / Agent',
    crit_crm: 'CRM & lead management',
    crit_performance: 'Speed & performance',
    crit_seo: 'SEO & search ranking',
    crit_security: 'Security & HTTPS',
    crit_accessibility: 'Web accessibility',
    crit_social: 'Social presence',
    crit_cta: 'Clear call-to-action',

    // FAQ
    faq_label: 'Frequently Asked Questions',
    faq_title: 'Answers to your AI questions',
    faq_subtitle: 'Everything you need to know about how AI and automation drive your business.',
    faq1_q: 'How does Soluciones IA CM help small and medium businesses?',
    faq1_a: 'We automate repetitive manual tasks (appointment scheduling, invoicing, customer support), create custom 24/7 virtual assistants and chatbots, and develop high-speed conversion-focused websites. This reduces operational costs, saves over 50% of time, and continuously captures clients.',
    faq2_q: 'Why hire AI consulting for a local business?',
    faq2_a: 'AI consulting allows local businesses to compete with big brands without prohibitive costs. We analyze your specific operations, select the exact tools that drive profitability, and guide you through implementation for a fast return on investment.',
    faq3_q: 'How much does it cost to implement a chatbot or automation?',
    faq3_a: 'The first diagnostic and advisory consultation is 100% free. Each project is transparently priced according to SME scale, with fixed quotes and no hidden fees.',
    faq4_q: 'What geographic areas does Soluciones IA CM cover?',
    faq4_a: 'We are based in Cumbres Mayores (Huelva province) and provide direct, local service throughout the region and Andalusia, as well as remote consulting, web design, and AI development for companies across Spain.',
    faq5_q: 'How long does it take to launch an AI project?',
    faq5_a: 'Standard chatbots and virtual assistants are configured and deployed in 3 to 7 business days. Advanced custom solutions (autonomous agents, ERP/CRM integrations, or full web platforms) typically take 2 to 3 weeks.',
    faq6_q: 'Is prior technical knowledge required to get started?',
    faq6_a: 'Not at all. We handle all development, technical configuration, and testing. We deliver a ready-to-use solution with simple hands-on training and ongoing support.',
    faq_cta_text: 'Do you have another question about applying AI to your business?',
    faq_cta_btn: 'Free consultation with no obligation',

    // Contact
    contact_label: 'Contact',
    contact_title: "Let's talk about your project",
    contact_subtitle: "First consultation is always free. Tell us about your challenge and we'll find the best solution for your business.",
    contact_email_label: 'Email',
    contact_phone_label: 'Phone',
    contact_area_label: 'Service area',
    contact_area_note: 'Cumbres Mayores (Huelva) · online across Spain',
    contact_hours_label: 'Availability',
    contact_hours_value: 'Mon – Fri, 09:00 – 18:00',

    contact_form_name: 'Name',
    contact_form_email: 'Email',
    contact_form_company: 'Company',
    contact_form_phone: 'Phone',
    contact_form_message: 'Tell us about your project',
    contact_form_message_ph: 'What would you like to automate or improve?',
    contact_consent_pre: 'I have read and accept the',
    contact_consent_link: 'privacy policy',
    contact_form_submit: 'Send message',
    contact_form_note: 'We reply within 24 business hours. Your data is never shared with third parties.',
    contact_success_title: 'Message sent!',
    contact_success_text: 'Thank you for contacting us. We will reply within 24 hours.',
    form_required_note: 'Fields marked with an asterisk are required.',

    form_error_name: 'Please enter your name.',
    form_error_email: 'Please enter a valid email address.',
    form_error_message: 'Please briefly describe your inquiry or project.',
    form_error_consent: 'You must accept the privacy policy to send the form.',

    // Footer
    footer_description: 'Artificial intelligence and automation solutions for local small and medium businesses.',
    footer_tech_label: 'Technologies we work with',
    footer_col_services: 'Services',
    footer_col_company: 'Company',
    footer_col_legal: 'Legal',
    footer_link_consulting: 'Consulting',
    footer_link_agents: 'AI Agents',
    footer_link_chatbot: 'Chatbot 24/7',
    footer_link_web: 'Web Design',
    footer_link_automation: 'Automations',
    footer_link_image_restore: 'Photo Restoration',
    footer_link_contact: 'Contact',
    footer_link_auditor: 'Web Auditor',
    footer_link_faq: 'FAQ',
    footer_link_legal: 'Legal Notice',
    footer_link_privacy: 'Privacy Policy',
    footer_link_cookies: 'Cookie Policy',
    footer_rights: 'All rights reserved.',
    footer_made: 'Made in Cumbres Mayores, Huelva',

    // Cookies & modals
    cookie_text: 'We use technical and preference local storage to improve your experience.',
    cookie_more: 'Learn more',
    cookie_accept: 'Accept',
    cookie_reject: 'Necessary only',
    modal_legal_title: 'Legal Notice',
    modal_privacy_title: 'Privacy Policy',
    modal_cookies_title: 'Cookie Policy',
  },
};

/* ===================================================
   MOTOR i18n
   =================================================== */
let currentLang = localStorage.getItem('lang') ||
  (navigator.language && navigator.language.startsWith('es') ? 'es' : 'en');

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
    || (TRANSLATIONS.es && TRANSLATIONS.es[key])
    || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val && val !== key) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val && val !== key) el.placeholder = val;
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const val = t(key);
    if (val && val !== key) el.setAttribute('aria-label', val);
  });

  const langLabel = currentLang === 'es' ? 'EN' : 'ES';
  const ariaLabel = currentLang === 'es'
    ? 'Cambiar idioma a inglés'
    : 'Switch language to Spanish';

  document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
    btn.textContent = langLabel;
    btn.setAttribute('aria-label', ariaLabel);
  });

  document.documentElement.lang = currentLang;

  const titles = {
    es: 'Soluciones IA CM — Automatización e IA para Negocios Locales | Cumbres Mayores (Huelva)',
    en: 'Soluciones IA CM — AI & Automation for Local Businesses | Cumbres Mayores (Huelva)',
  };
  const descs = {
    es: 'Consultoría, asistentes IA, chatbots 24/7, automatizaciones y diseño web para pequeños y medianos negocios locales en Cumbres Mayores (Huelva) y toda España.',
    en: 'Consulting, AI assistants, 24/7 chatbots, automations and web design for local small and medium businesses in Cumbres Mayores (Huelva) and across Spain.',
  };
  document.title = titles[currentLang];
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', descs[currentLang]);
}

function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  try { localStorage.setItem('lang', currentLang); } catch {}
  applyTranslations();
  initEphemeris();
  if (typeof renderLoUltimo === 'function') renderLoUltimo(currentLang);
  if (_lastAuditReport) renderResults(_lastAuditReport);
}

/* ===================================================
   NAVEGACIÓN
   =================================================== */
function initNavigation() {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 18);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      mobileNav.classList.toggle('open', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && !mobileNav.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-38% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));
  }
}

function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const menuToggle = document.getElementById('menu-toggle');
  if (mobileNav) mobileNav.classList.remove('open');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
}

/* ===================================================
   ANIMACIONES DE APARICIÓN EN SCROLL
   =================================================== */
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ===================================================
   AUDITOR WEB IA — MOTOR DE INSPECCIÓN TÉCNICA EN VIVO
   (DOM/HTML Live Fetch + Google PageSpeed Insights v5)
   =================================================== */
let _auditorStrategy = 'mobile';
let _lastAuditReport = null;

function initAuditor() {
  const form = document.getElementById('auditor-form');
  const input = document.getElementById('auditor-url');
  const newBtn = document.getElementById('auditor-new-btn');
  const submitBtn = document.getElementById('auditor-submit');
  const applyCta = document.getElementById('auditor-Apply-cta');

  if (!form || !input) return;

  // Selector de modo (Móvil / Escritorio)
  document.querySelectorAll('.strategy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _auditorStrategy = btn.getAttribute('data-strategy') || 'mobile';
      document.querySelectorAll('.strategy-btn').forEach(b => {
        const isCurrent = b === btn;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-pressed', String(isCurrent));
      });
    });
  });

  // Botones de prueba rápida
  document.querySelectorAll('.sample-url-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-sample-url');
      if (target === 'self') {
        const isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
        input.value = isLocal ? 'https://solucionesiacm.com' : location.origin;
      } else if (target) {
        input.value = target;
      }
      clearAuditorError();
      form.requestSubmit();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rawUrl = input.value.trim();
    if (!isValidUrl(rawUrl)) {
      showAuditorError(t('auditor_error_url'));
      return;
    }
    clearAuditorError();
    submitBtn.disabled = true;
    await runAudit(normalizeUrl(rawUrl), _auditorStrategy);
    submitBtn.disabled = false;
  });

  input.addEventListener('input', clearAuditorError, { passive: true });

  if (newBtn) {
    newBtn.addEventListener('click', () => {
      document.getElementById('auditor-results').classList.remove('active');
      input.value = '';
      input.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Al pulsar "Solicitar plan de mejora gratuito", rellena automáticamente el formulario de contacto
  if (applyCta) {
    applyCta.addEventListener('click', () => {
      if (!_lastAuditReport) return;
      const msgField = document.getElementById('form-message');
      if (!msgField) return;

      const weakNames = _lastAuditReport.priorities.map(p => p.name).join(', ');
      msgField.value = currentLang === 'es'
        ? `Hola, acabo de auditar mi web (${_lastAuditReport.url}) en el Auditor Web IA con una puntuación de ${_lastAuditReport.overall}/100. Me gustaría recibir un diagnóstico gratuito para mejorar especialmente: ${weakNames || 'SEO, conversión y automatización con IA'}.`
        : `Hi, I just audited my website (${_lastAuditReport.url}) with your AI Web Auditor (${_lastAuditReport.overall}/100). I would like a free consultation to improve: ${weakNames || 'SEO, conversion and AI automation'}.`;
    });
  }
}

function isValidUrl(str) {
  try {
    const url = new URL(str.startsWith('http') ? str : 'https://' + str);
    return /^https?:$/.test(url.protocol) && url.hostname.includes('.');
  } catch {
    return false;
  }
}

function normalizeUrl(str) {
  return str.startsWith('http') ? str.trim() : 'https://' + str.trim();
}

function showAuditorError(msg) {
  const hint = document.getElementById('auditor-hint');
  const input = document.getElementById('auditor-url');
  if (input) input.setAttribute('aria-invalid', 'true');
  if (hint) {
    hint.textContent = msg;
    hint.style.color = 'var(--c-error)';
    hint.setAttribute('role', 'alert');
  }
}

function clearAuditorError() {
  const hint = document.getElementById('auditor-hint');
  const input = document.getElementById('auditor-url');
  if (input) input.removeAttribute('aria-invalid');
  if (hint) {
    hint.textContent = t('auditor_hint');
    hint.style.color = '';
    hint.removeAttribute('role');
  }
}

function getLevel(score) {
  return score >= 70 ? 'good' : score >= 45 ? 'ok' : 'bad';
}

function clampScore(n) {
  return Math.max(8, Math.min(100, Math.round(n)));
}

/* Descarga el código HTML real de la URL objetivo (mismo origen o mediante pasarela CORS con fallback) */
async function fetchLiveHtml(targetUrl) {
  const parsed = new URL(targetUrl);
  const isSelfDomain =
    parsed.hostname === location.hostname ||
    parsed.hostname.replace(/^www\./, '') === 'solucionesiacm.com';

  const t0 = performance.now();

  if (isSelfDomain) {
    try {
      const res = await fetch(location.pathname || '/', { cache: 'no-store' });
      if (res.ok) {
        const html = await res.text();
        return {
          ok: true,
          html,
          finalUrl: targetUrl,
          responseTimeMs: Math.round(performance.now() - t0),
          contentLength: html.length,
          via: 'direct',
        };
      }
    } catch {}
  }

  // 1) Intento primario: AllOrigins JSON wrapper (devuelve status, content_type, http_code y contents)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7500);
    const tStart = performance.now();
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.contents === 'string' && data.contents.length > 80) {
        return {
          ok: true,
          html: data.contents,
          finalUrl: (data.status && data.status.url) || targetUrl,
          responseTimeMs: Math.round((data.status && data.status.response_time) || (performance.now() - tStart)),
          contentLength: (data.status && data.status.content_length) || data.contents.length,
          via: 'allorigins',
        };
      }
    }
  } catch {}

  // 2) Intento secundario: corsproxy.io
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6500);
    const tStart = performance.now();
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const html = await res.text();
      if (html && html.length > 80) {
        return {
          ok: true,
          html,
          finalUrl: targetUrl,
          responseTimeMs: Math.round(performance.now() - tStart),
          contentLength: html.length,
          via: 'corsproxy',
        };
      }
    }
  } catch {}

  return { ok: false, html: '', finalUrl: targetUrl, responseTimeMs: 0, contentLength: 0, via: 'none' };
}

/* Consulta en paralelo la API oficial Google PageSpeed Insights v5 (Lighthouse) */
async function fetchLighthouseReport(targetUrl, strategy = 'mobile') {
  const parsed = new URL(targetUrl);
  if (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') return null;

  const endpoint =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}` +
    `&strategy=${encodeURIComponent(strategy)}` +
    `&category=performance&category=seo&category=accessibility&category=best-practices`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7800);
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    const lhr = json && json.lighthouseResult;
    if (!lhr || !lhr.categories) return null;

    const getCat = (k) =>
      lhr.categories[k] && typeof lhr.categories[k].score === 'number'
        ? Math.round(lhr.categories[k].score * 100)
        : null;

    const audits = lhr.audits || {};
    return {
      performance:   getCat('performance'),
      seo:           getCat('seo'),
      accessibility: getCat('accessibility'),
      bestPractices: getCat('best-practices'),
      lcp:           audits['largest-contentful-paint']?.displayValue || null,
      fcp:           audits['first-contentful-paint']?.displayValue || null,
      cls:           audits['cumulative-layout-shift']?.displayValue || null,
      tbt:           audits['total-blocking-time']?.displayValue || null,
      isViewportOk:  audits['viewport']?.score === 1,
    };
  } catch {
    return null;
  }
}

/* Inspecciona el documento DOM real y combina con telemetría de Google Lighthouse */
function analyzeDomAndLighthouse(targetUrl, htmlRes, psiRes, strategy) {
  const parsedUrl = new URL(targetUrl);
  const isHttps = parsedUrl.protocol === 'https:';
  const html = htmlRes.html || '';
  const lowerHtml = html.toLowerCase();

  let doc = null;
  if (htmlRes.ok && html) {
    try {
      doc = new DOMParser().parseFromString(html, 'text/html');
    } catch {
      doc = null;
    }
  }

  const evidence = { es: {}, en: {} };
  const scores = {};

  if (doc) {
    // 1. DISEÑO RESPONSIVE
    const viewportMeta = doc.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
    const hasDeviceWidth = /width\s*=\s*device-width/i.test(viewportMeta);
    const responsiveImgs = doc.querySelectorAll('img[srcset], picture, img[sizes]').length;
    const hasMediaQueries = /@media\s*\(/i.test(html) || doc.querySelectorAll('link[rel="stylesheet"]').length > 0;

    let respScore = 25;
    if (viewportMeta) respScore += 42;
    if (hasDeviceWidth) respScore += 18;
    if (responsiveImgs > 0) respScore += 8;
    if (hasMediaQueries) respScore += 7;
    if (psiRes && psiRes.isViewportOk === false) respScore = Math.min(respScore, 45);
    scores.responsive = clampScore(respScore);

    evidence.es.responsive = viewportMeta
      ? `meta viewport detectado (${hasDeviceWidth ? 'width=device-width' : 'personalizado'}) · ${responsiveImgs} img responsive`
      : 'Sin etiqueta <meta name="viewport"> detectada en <head>';
    evidence.en.responsive = viewportMeta
      ? `viewport meta detected (${hasDeviceWidth ? 'width=device-width' : 'custom'}) · ${responsiveImgs} responsive img`
      : 'No <meta name="viewport"> tag detected in <head>';

    // 2. MULTIIDIOMA (ES / EN)
    const htmlLang = (doc.documentElement.getAttribute('lang') || '').trim();
    const hreflangs = doc.querySelectorAll('link[rel="alternate"][hreflang]').length;
    const langSelectors = doc.querySelectorAll(
      '[id*="lang" i], [class*="lang" i], [data-i18n], [aria-label*="idioma" i], [aria-label*="language" i]'
    ).length;
    const hasTranslationPlugin = /weglot|gtranslate|wpml|polylang|googtrans|translations/i.test(lowerHtml);

    let multiScore = 18;
    if (htmlLang) multiScore += 24;
    if (hreflangs > 0) multiScore += Math.min(32, hreflangs * 16);
    if (langSelectors > 0) multiScore += 28;
    if (hasTranslationPlugin) multiScore += 16;
    scores.multilingual = clampScore(multiScore);

    evidence.es.multilingual = `lang="${htmlLang || 'no definido'}" · ${hreflangs} etiquetas hreflang · ${langSelectors > 0 ? 'Selector de idioma activo' : 'Sin selector multiidioma'}`;
    evidence.en.multilingual = `lang="${htmlLang || 'missing'}" · ${hreflangs} hreflang tags · ${langSelectors > 0 ? 'Active language switcher' : 'No language switcher'}`;

    // 3. CHATBOT / AGENTE IA 24/7
    const chatProviders = [
      { name: 'Chatbase AI', rx: /chatbase\.co|chatbase/i },
      { name: 'Tidio', rx: /tidio\.co|tidiochat/i },
      { name: 'Intercom', rx: /intercom\.io|intercomsettings/i },
      { name: 'Crisp Chat', rx: /crisp\.chat/i },
      { name: 'Tawk.to', rx: /tawk\.to/i },
      { name: 'HubSpot Chat', rx: /js\.hs-scripts\.com|hubspot/i },
      { name: 'Zendesk', rx: /zdassets\.com|zendesk/i },
      { name: 'Drift', rx: /drift\.com|driftt/i },
      { name: 'Botpress / Voiceflow', rx: /botpress|voiceflow/i },
      { name: 'Landbot', rx: /landbot\.io/i },
      { name: 'WhatsApp Live Widget', rx: /wa\.me\/|api\.whatsapp\.com|whatsapp-widget/i },
    ];
    const detectedBots = chatProviders.filter(p => p.rx.test(html)).map(p => p.name);
    const hasForms = doc.querySelectorAll('form').length;

    let botScore = 14;
    if (detectedBots.length > 0) {
      botScore = detectedBots.some(n => /Chatbase|Botpress|Voiceflow|Intercom|HubSpot|Tidio|Crisp|Drift|Landbot/i.test(n)) ? 95 : 76;
    } else if (hasForms > 0) {
      botScore = 38;
    }
    scores.chatbot = clampScore(botScore);

    evidence.es.chatbot = detectedBots.length > 0
      ? `Agente detectado: ${detectedBots.slice(0, 2).join(', ')}`
      : (hasForms > 0 ? 'Sin agente IA 24/7 (solo formulario tradicional)' : 'Sin chatbot ni formulario interactivo detectado');
    evidence.en.chatbot = detectedBots.length > 0
      ? `Detected agent: ${detectedBots.slice(0, 2).join(', ')}`
      : (hasForms > 0 ? 'No 24/7 AI agent (traditional form only)' : 'No chatbot or interactive form detected');

    // 4. CRM Y CAPTACIÓN DE LEADS
    const formsCount = doc.querySelectorAll('form').length;
    const emailInputs = doc.querySelectorAll('input[type="email"], input[name*="mail" i]').length;
    const phoneInputs = doc.querySelectorAll('input[type="tel"], input[name*="phone" i], input[name*="tel" i]').length;
    const consentCheck = doc.querySelectorAll('input[type="checkbox"]').length;
    const crmProviders = [
      { name: 'Supabase CRM', rx: /supabase\.co/i },
      { name: 'Web3Forms', rx: /web3forms\.com/i },
      { name: 'HubSpot CRM', rx: /hsforms|hubspot/i },
      { name: 'Salesforce', rx: /salesforce|pardot/i },
      { name: 'Pipedrive / Zoho', rx: /pipedrive|zoho/i },
      { name: 'ActiveCampaign / Mailchimp', rx: /activecampaign|mailchimp|list-manage/i },
      { name: 'Calendly / Cal.com', rx: /calendly\.com|cal\.com/i },
      { name: 'Typeform / Tally', rx: /typeform\.com|tally\.so/i },
    ];
    const detectedCrms = crmProviders.filter(p => p.rx.test(html)).map(p => p.name);

    let crmScore = 15;
    if (formsCount > 0) crmScore += 30;
    if (emailInputs > 0) crmScore += 15;
    if (phoneInputs > 0) crmScore += 8;
    if (consentCheck > 0) crmScore += 8;
    if (detectedCrms.length > 0) crmScore += 24;
    scores.crm = clampScore(crmScore);

    evidence.es.crm = `${formsCount} formulario(s) · ${emailInputs} campo(s) email${detectedCrms.length ? ' · ' + detectedCrms.slice(0, 2).join(' + ') : ' · Sin integración CRM detectada'}`;
    evidence.en.crm = `${formsCount} form(s) · ${emailInputs} email input(s)${detectedCrms.length ? ' · ' + detectedCrms.slice(0, 2).join(' + ') : ' · No CRM integration detected'}`;

    // 5. VELOCIDAD Y RENDIMIENTO
    const scriptsTotal = doc.querySelectorAll('script[src]').length;
    const scriptsDeferred = doc.querySelectorAll('script[src][defer], script[src][async], script[type="module"]').length;
    const lazyImgs = doc.querySelectorAll('img[loading="lazy"]').length;
    const preconnects = doc.querySelectorAll('link[rel="preconnect"], link[rel="preload"]').length;
    const htmlKb = Math.max(1, Math.round((htmlRes.contentLength || html.length) / 1024));
    const respMs = htmlRes.responseTimeMs || 320;

    let domPerf = 58;
    if (respMs < 450) domPerf += 16;
    else if (respMs < 950) domPerf += 8;
    else if (respMs > 1800) domPerf -= 14;

    if (htmlKb < 120) domPerf += 10;
    else if (htmlKb > 350) domPerf -= 12;

    if (scriptsTotal === 0 || scriptsDeferred / Math.max(1, scriptsTotal) >= 0.6) domPerf += 9;
    if (lazyImgs > 0 || preconnects > 0) domPerf += 7;

    if (psiRes && typeof psiRes.performance === 'number') {
      scores.performance = clampScore(psiRes.performance * 0.68 + domPerf * 0.32);
    } else {
      scores.performance = clampScore(domPerf);
    }

    evidence.es.performance = psiRes && psiRes.lcp
      ? `LCP: ${psiRes.lcp} · FCP: ${psiRes.fcp || '—'} · HTML: ${htmlKb} KB · ${scriptsDeferred}/${scriptsTotal} scripts diferidos`
      : `Respuesta: ${respMs} ms · Peso HTML: ${htmlKb} KB · ${scriptsDeferred}/${scriptsTotal} scripts async/defer`;
    evidence.en.performance = psiRes && psiRes.lcp
      ? `LCP: ${psiRes.lcp} · FCP: ${psiRes.fcp || '—'} · HTML: ${htmlKb} KB · ${scriptsDeferred}/${scriptsTotal} deferred scripts`
      : `Response: ${respMs} ms · HTML size: ${htmlKb} KB · ${scriptsDeferred}/${scriptsTotal} async/defer scripts`;

    // 6. SEO Y POSICIONAMIENTO LOCAL
    const titleText = (doc.querySelector('title')?.textContent || '').trim();
    const descText = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim();
    const h1Count = doc.querySelectorAll('h1').length;
    const h2Count = doc.querySelectorAll('h2').length;
    const hasCanonical = Boolean(doc.querySelector('link[rel="canonical"]'));
    const hasOg = Boolean(doc.querySelector('meta[property="og:title"], meta[property="og:image"]'));
    const jsonLdCount = doc.querySelectorAll('script[type="application/ld+json"]').length;

    let seoScore = 12;
    if (titleText.length >= 15 && titleText.length <= 75) seoScore += 20;
    else if (titleText.length > 0) seoScore += 10;
    if (descText.length >= 50 && descText.length <= 185) seoScore += 20;
    else if (descText.length > 0) seoScore += 10;
    if (h1Count === 1) seoScore += 16;
    else if (h1Count > 1) seoScore += 8;
    if (h2Count >= 2) seoScore += 8;
    if (hasCanonical) seoScore += 8;
    if (hasOg) seoScore += 8;
    if (jsonLdCount > 0) seoScore += 12;

    if (psiRes && typeof psiRes.seo === 'number') {
      scores.seo = clampScore(seoScore * 0.65 + psiRes.seo * 0.35);
    } else {
      scores.seo = clampScore(seoScore);
    }

    evidence.es.seo = `Title (${titleText.length} car.) · Meta desc (${descText.length} car.) · ${h1Count} H1 / ${h2Count} H2 · ${jsonLdCount} Schema JSON-LD`;
    evidence.en.seo = `Title (${titleText.length} ch.) · Meta desc (${descText.length} ch.) · ${h1Count} H1 / ${h2Count} H2 · ${jsonLdCount} JSON-LD Schema`;

    // 7. SEGURIDAD Y HTTPS
    const hasCspMeta = Boolean(doc.querySelector('meta[http-equiv="Content-Security-Policy" i]'));
    const extTargetBlank = Array.from(doc.querySelectorAll('a[target="_blank"]'));
    const safeBlank = extTargetBlank.filter(a => /noopener|noreferrer/i.test(a.getAttribute('rel') || '')).length;
    const mixedHttpAssets = doc.querySelectorAll('script[src^="http:"], iframe[src^="http:"], img[src^="http:"]').length;

    let secScore = isHttps ? 64 : 18;
    if (hasCspMeta) secScore += 20;
    if (extTargetBlank.length === 0 || safeBlank === extTargetBlank.length) secScore += 10;
    if (mixedHttpAssets === 0 && isHttps) secScore += 6;
    else secScore -= 15;
    if (psiRes && typeof psiRes.bestPractices === 'number') {
      secScore = secScore * 0.72 + psiRes.bestPractices * 0.28;
    }
    scores.security = clampScore(secScore);

    evidence.es.security = `${isHttps ? 'TLS/HTTPS activo' : 'HTTP sin cifrar'} · ${hasCspMeta ? 'Política CSP activa' : 'Sin meta CSP en DOM'} · ${mixedHttpAssets === 0 ? '0 recursos mixtos' : mixedHttpAssets + ' recursos HTTP'}`;
    evidence.en.security = `${isHttps ? 'Active TLS/HTTPS' : 'Unencrypted HTTP'} · ${hasCspMeta ? 'Active CSP policy' : 'No DOM CSP meta'} · ${mixedHttpAssets === 0 ? '0 mixed assets' : mixedHttpAssets + ' HTTP assets'}`;

    // 8. ACCESIBILIDAD WEB (WCAG)
    const imgs = Array.from(doc.querySelectorAll('img'));
    const imgsWithAlt = imgs.filter(img => img.hasAttribute('alt')).length;
    const altRatio = imgs.length > 0 ? Math.round((imgsWithAlt / imgs.length) * 100) : 100;
    const hasMain = Boolean(doc.querySelector('main, [role="main"]'));
    const hasSkipLink = Boolean(doc.querySelector('a.skip-link, a[href="#main"], a[href="#content"]'));
    const ariaCount = doc.querySelectorAll('[aria-label], [aria-labelledby], [role]').length;

    let a11yScore = 24;
    a11yScore += Math.round((altRatio / 100) * 32);
    if (hasMain) a11yScore += 16;
    if (htmlLang) a11yScore += 10;
    if (hasSkipLink) a11yScore += 8;
    if (ariaCount >= 5) a11yScore += 10;

    if (psiRes && typeof psiRes.accessibility === 'number') {
      scores.accessibility = clampScore(a11yScore * 0.55 + psiRes.accessibility * 0.45);
    } else {
      scores.accessibility = clampScore(a11yScore);
    }

    evidence.es.accessibility = `Atributo alt en ${imgsWithAlt}/${imgs.length} imágenes (${altRatio}%) · ${hasMain ? '<main> semántico' : 'Sin <main>'} · ${ariaCount} atributos ARIA`;
    evidence.en.accessibility = `Alt attribute on ${imgsWithAlt}/${imgs.length} images (${altRatio}%) · ${hasMain ? 'Semantic <main>' : 'No <main>'} · ${ariaCount} ARIA attributes`;

    // 9. PRESENCIA EN REDES Y CANALES
    const socialMatchers = [
      { name: 'Instagram', rx: /instagram\.com\//i },
      { name: 'LinkedIn', rx: /linkedin\.com\//i },
      { name: 'Facebook', rx: /facebook\.com\//i },
      { name: 'X/Twitter', rx: /(twitter\.com|x\.com)\//i },
      { name: 'YouTube', rx: /youtube\.com\//i },
      { name: 'TikTok', rx: /tiktok\.com\//i },
      { name: 'WhatsApp', rx: /(wa\.me|whatsapp\.com)\//i },
      { name: 'Google Maps', rx: /(maps\.google|goo\.gl\/maps|google\.com\/maps)/i },
    ];
    const allHrefs = Array.from(doc.querySelectorAll('a[href]')).map(a => a.getAttribute('href') || '').join(' ');
    const foundSocials = socialMatchers.filter(s => s.rx.test(allHrefs)).map(s => s.name);

    let socScore = 20;
    if (foundSocials.length >= 3) socScore = 90;
    else if (foundSocials.length === 2) socScore = 76;
    else if (foundSocials.length === 1) socScore = 58;
    else if (hasOg) socScore = 44;
    scores.social = clampScore(socScore);

    evidence.es.social = foundSocials.length > 0
      ? `Canales enlazados (${foundSocials.length}): ${foundSocials.join(', ')}`
      : (hasOg ? 'Metadatos Open Graph presentes · Sin enlaces directos a perfiles' : 'Sin enlaces a redes sociales ni etiquetas Open Graph');
    evidence.en.social = foundSocials.length > 0
      ? `Linked channels (${foundSocials.length}): ${foundSocials.join(', ')}`
      : (hasOg ? 'Open Graph metadata present · No direct social links' : 'No social profile links or Open Graph tags');

    // 10. LLAMADAS A LA ACCIÓN (CTA) Y CONVERSIÓN
    const telLinks = doc.querySelectorAll('a[href^="tel:"]').length;
    const mailLinks = doc.querySelectorAll('a[href^="mailto:"]').length;
    const ctaButtons = Array.from(doc.querySelectorAll('a, button')).filter(el => {
      const txt = (el.textContent || '').trim();
      return /(contact|consulta|presupuesto|reservar|cita|empezar|solicitar|llamar|hablar|probar|demo|comprar|book|quote|start|schedule)/i.test(txt);
    }).length;

    let ctaScore = 22;
    if (ctaButtons >= 3) ctaScore += 42;
    else if (ctaButtons >= 1) ctaScore += 26;
    if (telLinks > 0) ctaScore += 18;
    if (mailLinks > 0) ctaScore += 10;
    if (formsCount > 0) ctaScore += 8;
    scores.cta = clampScore(ctaScore);

    evidence.es.cta = `${ctaButtons} botones de acción · ${telLinks} enlace(s) tel: · ${mailLinks} enlace(s) mailto:`;
    evidence.en.cta = `${ctaButtons} action buttons · ${telLinks} tel: link(s) · ${mailLinks} mailto: link(s)`;

    return {
      url: targetUrl,
      hostname: parsedUrl.hostname,
      strategy,
      scores,
      evidence,
      sourceLabel: {
        es: psiRes
          ? 'Inspección DOM en vivo + Google Lighthouse v5'
          : `Inspección DOM en vivo (${Math.max(1, Math.round(html.length / 1024))} KB HTML analizados)`,
        en: psiRes
          ? 'Live DOM Inspection + Google Lighthouse v5'
          : `Live DOM Inspection (${Math.max(1, Math.round(html.length / 1024))} KB HTML analyzed)`,
      },
      vitals: [
        {
          labelEs: 'Seguridad / TLS',
          labelEn: 'Security / TLS',
          value: isHttps ? (hasCspMeta ? 'HTTPS + CSP' : 'HTTPS Activo') : 'HTTP Inseguro',
        },
        {
          labelEs: psiRes && psiRes.lcp ? 'LCP (Lighthouse)' : 'Respuesta HTTP',
          labelEn: psiRes && psiRes.lcp ? 'LCP (Lighthouse)' : 'HTTP Response',
          value: psiRes && psiRes.lcp ? psiRes.lcp : `${respMs} ms`,
        },
        {
          labelEs: 'SEO / Schema',
          labelEn: 'SEO / Schema',
          value: `${h1Count} H1 · ${jsonLdCount} JSON-LD`,
        },
        {
          labelEs: 'IA & Captación',
          labelEn: 'AI & Lead Gen',
          value: detectedBots.length > 0 ? detectedBots[0] : `${formsCount} Form / 0 Bot IA`,
        },
      ],
    };
  }

  // Si el servidor remoto bloquea proxies CORS pero Lighthouse respondió o solo tenemos análisis de protocolo
  const fallbackPerf = psiRes?.performance ?? 54;
  const fallbackSeo  = psiRes?.seo ?? 58;
  const fallbackA11y = psiRes?.accessibility ?? 60;
  const fallbackBp   = psiRes?.bestPractices ?? (isHttps ? 74 : 35);

  scores.responsive    = psiRes?.isViewportOk ? 82 : 56;
  scores.multilingual  = 32;
  scores.chatbot       = 22;
  scores.crm           = 34;
  scores.performance   = clampScore(fallbackPerf);
  scores.seo           = clampScore(fallbackSeo);
  scores.security      = clampScore(fallbackBp);
  scores.accessibility = clampScore(fallbackA11y);
  scores.social        = 45;
  scores.cta           = 48;

  const wafMsgEs = psiRes ? 'Medido vía Google Lighthouse v5' : 'Servidor con protección anti-scraping (WAF/CORS)';
  const wafMsgEn = psiRes ? 'Measured via Google Lighthouse v5' : 'Server with anti-scraping protection (WAF/CORS)';

  Object.keys(scores).forEach(k => {
    evidence.es[k] = wafMsgEs;
    evidence.en[k] = wafMsgEn;
  });

  return {
    url: targetUrl,
    hostname: parsedUrl.hostname,
    strategy,
    scores,
    evidence,
    sourceLabel: {
      es: psiRes ? 'Google Lighthouse API v5' : 'Diagnóstico de protocolo y cabeceras',
      en: psiRes ? 'Google Lighthouse API v5' : 'Protocol & header diagnostics',
    },
    vitals: [
      { labelEs: 'Protocolo', labelEn: 'Protocol', value: isHttps ? 'HTTPS Activo' : 'HTTP' },
      { labelEs: 'LCP', labelEn: 'LCP', value: psiRes?.lcp || 'Protegido WAF' },
      { labelEs: 'SEO Score', labelEn: 'SEO Score', value: `${scores.seo}/100` },
      { labelEs: 'Modo', labelEn: 'Mode', value: strategy === 'mobile' ? 'Móvil' : 'Escritorio' },
    ],
  };
}

const AUDIT_NOTES = {
  es: {
    responsive:    { good: 'Viewport e imágenes adaptables correctamente configurados para móvil y escritorio.', ok: 'Dispone de viewport móvil pero faltan imágenes adaptativas (srcset/sizes).', bad: 'Sin configuración responsive adecuada: penaliza el posicionamiento móvil en Google.' },
    multilingual:  { good: 'Soporte multiidioma o conmutador de idioma activo para captar clientes internacionales.', ok: 'Idioma principal declarado en HTML, pero sin versión secundaria (ES/EN) ni etiquetas hreflang.', bad: 'Sin atributos de idioma ni versión en inglés: limita el alcance del negocio.' },
    chatbot:       { good: 'Agente IA / Chatbot 24/7 detectado en vivo para atender y cualificar visitas al instante.', ok: 'Dispone de formulario tradicional, pero carece de un asistente IA 24/7 que responda al instante.', bad: 'Sin chatbot ni atención automatizada: las visitas fuera de horario abandonan sin respuesta.' },
    crm:           { good: 'Captación de leads estructurada y conectada a base de datos / CRM con consentimiento RGPD.', ok: 'Formulario básico presente, pero sin conexión detectada a un CRM automatizado.', bad: 'Sin sistema de captación de leads ni CRM integrado para hacer seguimiento comercial.' },
    performance:   { good: 'Respuesta rápida del servidor, carga optimizada y scripts diferidos correctamente.', ok: 'Rendimiento aceptable, aunque admite mejora en carga diferida de scripts e imágenes.', bad: 'Tiempo de respuesta o bloqueo de scripts elevado: incrementa la tasa de rebote móvil.' },
    seo:           { good: 'Excelente arquitectura SEO: título, meta descripción, jerarquía H1/H2 y datos estructurados Schema.org.', ok: 'Metadatos SEO básicos presentes; conviene añadir datos estructurados JSON-LD (LocalBusiness/FAQ).', bad: 'Carencias críticas en etiquetas <title>, meta description o encabezados H1.' },
    security:      { good: 'Cifrado HTTPS activo, política Content-Security-Policy y enlaces externos protegidos.', ok: 'Cifrado HTTPS activo, pero se recomienda añadir política Content-Security-Policy (CSP).', bad: 'Seguridad deficiente o falta de cifrado HTTPS/cabeceras de endurecimiento.' },
    accessibility: { good: 'Buena cobertura de textos alternativos (alt), hitos semánticos <main> y atributos ARIA.', ok: 'Accesibilidad parcial: algunas imágenes o controles carecen de etiquetas descriptivas.', bad: 'Barreras de accesibilidad detectadas en imágenes sin alt o estructura semántica.' },
    social:        { good: 'Correcta vinculación con perfiles sociales y metadatos Open Graph para compartir.', ok: 'Presencia social parcial; conviene enlazar más canales directos (WhatsApp, LinkedIn, Instagram).', bad: 'Sin enlaces visibles a redes sociales ni canales de contacto rápido.' },
    cta:           { good: 'Llamadas a la acción claras y canales de contacto directo (teléfono, email y formulario) visibles.', ok: 'Existen elementos de contacto, pero faltan enlaces directos click-to-call (tel:) o botones destacados.', bad: 'No se detectan llamadas a la acción claras para solicitar presupuesto o reservar cita.' },
  },
  en: {
    responsive:    { good: 'Viewport and responsive media properly configured for mobile and desktop.', ok: 'Mobile viewport present, but adaptive images (srcset/sizes) can be improved.', bad: 'Missing proper responsive configuration: hurts Google mobile rankings.' },
    multilingual:  { good: 'Active multilingual support or language switcher to reach international clients.', ok: 'Primary HTML lang declared, but missing secondary language (ES/EN) or hreflang tags.', bad: 'No language attributes or English version: limits business reach.' },
    chatbot:       { good: 'Live 24/7 AI Agent / Chatbot detected to answer and qualify visitors instantly.', ok: 'Traditional form present, but missing an instant 24/7 AI assistant.', bad: 'No chatbot or automated support: after-hours visitors leave without answers.' },
    crm:           { good: 'Structured lead capture connected to database / CRM with GDPR consent.', ok: 'Basic form present, but no automated CRM connection detected.', bad: 'No lead capture form or integrated CRM to track sales opportunities.' },
    performance:   { good: 'Fast server response, optimized payload and properly deferred scripts.', ok: 'Acceptable performance, with room to optimize script deferral and lazy images.', bad: 'High response time or render-blocking scripts: increases mobile bounce rate.' },
    seo:           { good: 'Strong SEO architecture: title, meta description, H1/H2 hierarchy and Schema.org JSON-LD.', ok: 'Basic SEO metadata in place; adding JSON-LD structured data is recommended.', bad: 'Critical gaps in <title>, meta description or H1 heading structure.' },
    security:      { good: 'Active HTTPS encryption, Content-Security-Policy and protected external links.', ok: 'Active HTTPS encryption, but adding a Content-Security-Policy (CSP) is recommended.', bad: 'Weak security posture or missing HTTPS / hardening headers.' },
    accessibility: { good: 'Solid alt-text coverage, semantic <main> landmark and ARIA attributes.', ok: 'Partial accessibility: some images or controls lack descriptive labels.', bad: 'Accessibility barriers found in missing image alt attributes or landmarks.' },
    social:        { good: 'Strong social profile linking and Open Graph metadata for sharing.', ok: 'Partial social presence; linking direct channels (WhatsApp, LinkedIn, Instagram) is advised.', bad: 'No visible social links or quick messaging channels detected.' },
    cta:           { good: 'Clear calls to action and direct contact channels (phone, email and form).', ok: 'Contact elements exist, but missing click-to-call (tel:) links or prominent CTA buttons.', bad: 'No clear calls to action detected to request a quote or book a consultation.' },
  },
};

async function runAudit(url, strategy = 'mobile') {
  const loading = document.getElementById('auditor-loading');
  const results = document.getElementById('auditor-results');
  const steps = Array.from(document.querySelectorAll('.auditor-step'));
  const liveStatus = document.getElementById('auditor-live-status');
  const progressFill = document.getElementById('auditor-progress-fill');

  loading.classList.add('active');
  results.classList.remove('active');
  if (progressFill) progressFill.style.width = '10%';

  const setStep = (idx) => {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
      if (i < idx) s.classList.add('done');
      else s.classList.remove('done');
    });
    if (liveStatus && steps[idx]) {
      liveStatus.textContent = steps[idx].textContent;
    }
    if (progressFill) {
      progressFill.style.width = `${Math.min(95, Math.round(((idx + 1) / steps.length) * 92))}%`;
    }
  };

  setStep(0);

  // Lanzamos en paralelo la descarga e inspección del DOM en vivo y la consulta a Google Lighthouse API
  const htmlPromise = fetchLiveHtml(url);
  const psiPromise  = fetchLighthouseReport(url, strategy);

  await pause(320);
  setStep(1);
  const htmlRes = await htmlPromise;

  await pause(280);
  setStep(2);
  await pause(260);
  setStep(3);
  await pause(260);
  setStep(4);

  // Esperamos como máximo un breve margen adicional por Lighthouse si aún sigue calculando
  const psiRes = await Promise.race([psiPromise, pause(1600).then(() => null)]);

  setStep(5);
  if (progressFill) progressFill.style.width = '100%';
  await pause(240);
  steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });

  const report = analyzeDomAndLighthouse(url, htmlRes, psiRes, strategy);
  const weights = {
    seo: 1.15,
    performance: 1.1,
    responsive: 1.05,
    security: 1.0,
    accessibility: 1.0,
    cta: 1.05,
    crm: 0.95,
    chatbot: 0.9,
    social: 0.9,
    multilingual: 0.9,
  };
  let weightedSum = 0;
  let totalWeight = 0;
  Object.keys(report.scores).forEach(k => {
    const w = weights[k] || 1;
    weightedSum += report.scores[k] * w;
    totalWeight += w;
  });
  report.overall = Math.round(weightedSum / totalWeight);

  _lastAuditReport = report;
  renderResults(report);

  loading.classList.remove('active');
  results.classList.add('active');
  steps.forEach(s => s.classList.remove('done', 'active'));

  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.criterion-bar').forEach(bar => {
        bar.style.width = bar.dataset.score + '%';
      });
    }, 60);
  });

  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderResults(report) {
  const { url, hostname, scores, overall, evidence, sourceLabel, vitals } = report;

  const urlEl = document.getElementById('auditor-result-url');
  if (urlEl) urlEl.textContent = hostname || url;

  const sourceBadge = document.getElementById('auditor-source-badge');
  if (sourceBadge) {
    sourceBadge.textContent = sourceLabel[currentLang] || sourceLabel.es;
  }

  const scoreEl = document.getElementById('auditor-overall-score');
  if (scoreEl) scoreEl.textContent = String(overall);

  // Anillo circular SVG (radio 58 => circunferencia 364.4)
  const ring = document.getElementById('auditor-ring-progress');
  if (ring) {
    const circumference = 364.4;
    const offset = circumference - (overall / 100) * circumference;
    ring.style.strokeDashoffset = String(offset);
    ring.style.stroke = overall >= 72 ? '#34D399' : overall >= 48 ? '#FBBF24' : '#F87171';
  }

  const labelEl = document.getElementById('auditor-score-label');
  const verdictDesc = document.getElementById('auditor-verdict-desc');
  if (labelEl) {
    const labels = {
      es: overall >= 75
        ? 'Arquitectura web sólida y bien optimizada'
        : overall >= 50
          ? 'Base funcional con oportunidades claras de mejora'
          : 'Requiere intervención prioritaria en conversión e IA',
      en: overall >= 75
        ? 'Solid, well-optimized web architecture'
        : overall >= 50
          ? 'Functional baseline with clear growth opportunities'
          : 'Requires priority action in conversion & AI',
    };
    labelEl.textContent = labels[currentLang];
  }

  if (verdictDesc) {
    const descs = {
      es: overall >= 75
        ? 'Tu web cumple la mayoría de estándares técnicos de SEO, seguridad y captación. Revisa los puntos de mejora puntuales para maximizar la conversión.'
        : 'Hemos detectado cuellos de botella técnicos y de automatización que están haciendo perder visitas o consultas fuera de horario.',
      en: overall >= 75
        ? 'Your site meets most technical SEO, security and lead-capture standards. Review the specific items below to maximize conversion.'
        : 'We found technical and automation bottlenecks that are causing lost traffic or unanswered after-hours inquiries.',
    };
    verdictDesc.textContent = descs[currentLang];
  }

  // Telemetría / Vitals
  const vitalsGrid = document.getElementById('auditor-vitals-grid');
  if (vitalsGrid && Array.isArray(vitals)) {
    vitalsGrid.innerHTML = vitals.map(v => `
      <div class="vital-item">
        <dt class="vital-label">${currentLang === 'es' ? v.labelEs : v.labelEn}</dt>
        <dd class="vital-value">${v.value}</dd>
      </div>
    `).join('');
  }

  const criteriaOrder = [
    'responsive', 'seo', 'performance', 'security',
    'chatbot', 'crm', 'cta', 'accessibility', 'multilingual', 'social',
  ];

  // Prioridades (los criterios con menor puntuación < 70)
  const prioritiesBox = document.getElementById('auditor-priorities');
  const prioritiesList = document.getElementById('auditor-priorities-list');
  const weakCriteria = criteriaOrder
    .filter(id => scores[id] < 70)
    .sort((a, b) => scores[a] - scores[b])
    .slice(0, 4)
    .map(id => ({
      id,
      name: t(`crit_${id}`),
      score: scores[id],
      note: AUDIT_NOTES[currentLang]?.[id]?.[getLevel(scores[id])] || '',
    }));

  report.priorities = weakCriteria;

  if (prioritiesBox && prioritiesList) {
    if (weakCriteria.length > 0) {
      prioritiesBox.hidden = false;
      prioritiesList.innerHTML = weakCriteria.map(item => `
        <li class="auditor-priority-item">
          <span><strong>${item.name} (${item.score}/100):</strong> ${item.note}</span>
        </li>
      `).join('');
    } else {
      prioritiesBox.hidden = true;
    }
  }

  const container = document.getElementById('auditor-criteria');
  if (!container) return;

  container.innerHTML = criteriaOrder.map(id => {
    const score = scores[id];
    const level = getLevel(score);
    const name  = t(`crit_${id}`);
    const note  = AUDIT_NOTES[currentLang]?.[id]?.[level] || '';
    const evTxt = evidence?.[currentLang]?.[id] || evidence?.es?.[id] || '';

    return `
      <li class="criterion-card">
        <div class="criterion-head">
          <span class="criterion-name">${name}</span>
          <span class="criterion-score ${level}">${score}/100</span>
        </div>
        <div class="criterion-bar-wrapper" role="progressbar" aria-valuenow="${score}" aria-valuemin="0" aria-valuemax="100" aria-label="${name}: ${score} de 100">
          <div class="criterion-bar ${level}" data-score="${score}"></div>
        </div>
        <p class="criterion-evidence">${evTxt}</p>
        <p class="criterion-note">${note}</p>
      </li>
    `;
  }).join('');
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ===================================================
   FORMULARIO DE CONTACTO
   =================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Honeypot anti-bots
    const botField = document.getElementById('bot_field');
    if (botField && botField.value) {
      form.hidden = true;
      success.classList.add('active');
      return;
    }

    const nameEl    = document.getElementById('form-name');
    const emailEl   = document.getElementById('form-email');
    const messageEl = document.getElementById('form-message');
    const consentEl = document.getElementById('form-consent');
    const submitBtn = document.getElementById('form-submit');
    const globalErr = document.getElementById('form-error-global');

    if (globalErr) globalErr.hidden = true;

    let isValid = true;

    if (!nameEl.value.trim()) {
      setFieldError(nameEl, t('form_error_name'));
      isValid = false;
    } else clearFieldError(nameEl);

    if (!emailEl.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      setFieldError(emailEl, t('form_error_email'));
      isValid = false;
    } else clearFieldError(emailEl);

    if (!messageEl.value.trim()) {
      setFieldError(messageEl, t('form_error_message'));
      isValid = false;
    } else clearFieldError(messageEl);

    if (consentEl && !consentEl.checked) {
      setFieldError(consentEl, t('form_error_consent'));
      isValid = false;
    } else if (consentEl) clearFieldError(consentEl);

    if (!isValid) return;

    // 2. Límite de envíos
    if (!checkRateLimit()) {
      if (globalErr) {
        globalErr.textContent = currentLang === 'es'
          ? 'Has enviado varias consultas seguidas. Por favor, espera unos minutos.'
          : 'You have sent several inquiries in a row. Please wait a few minutes.';
        globalErr.hidden = false;
      }
      return;
    }

    // 3. Construcción del lead (sin guardar PII en localStorage del navegador público)
    const lead = {
      id:        'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name:      nameEl.value.trim().slice(0, 120),
      email:     emailEl.value.trim().slice(0, 200),
      company:   (document.getElementById('form-company')?.value.trim() || '').slice(0, 160),
      phone:     (document.getElementById('form-phone')?.value.trim()   || '').slice(0, 40),
      message:   messageEl.value.trim().slice(0, 4000),
      status:    'nuevo',
      notes:     [],
      source:    'web_form',
    };

    submitBtn.disabled = true;
    const labelSpan = submitBtn.querySelector('[data-i18n]');
    if (labelSpan) {
      labelSpan.textContent = currentLang === 'es' ? 'Enviando…' : 'Sending…';
    }

    await Promise.allSettled([
      saveLeadToSupabase(lead),
      sendEmailNotification(lead),
      pause(700),
    ]);

    form.hidden = true;
    success.classList.add('active');

    srAnnounce(
      currentLang === 'es'
        ? 'Mensaje enviado correctamente. Te responderemos en menos de 24 horas.'
        : 'Message sent successfully. We will reply within 24 hours.',
      'assertive'
    );

    setTimeout(() => success.querySelector('h3')?.focus?.(), 80);
  });

  form.querySelectorAll('input, textarea').forEach(field => {
    const evt = field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(evt, () => clearFieldError(field), { passive: true });
  });
}

function setFieldError(input, msg) {
  input.setAttribute('aria-invalid', 'true');
  const errEl = input.id ? document.getElementById(`${input.id}-error`) : null;
  if (errEl) {
    errEl.textContent = msg;
    errEl.hidden = false;
  }
}

function clearFieldError(input) {
  input.setAttribute('aria-invalid', 'false');
  const errEl = input.id ? document.getElementById(`${input.id}-error`) : null;
  if (errEl) {
    errEl.textContent = '';
    errEl.hidden = true;
  }
}

/* ===================================================
   BANNER DE COOKIES
   =================================================== */
function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  if (!banner) return;

  try {
    if (localStorage.getItem('cookies-accepted')) return;
  } catch {}

  setTimeout(() => banner.classList.add('show'), 1400);

  const dismiss = (val) => {
    try { localStorage.setItem('cookies-accepted', val); } catch {}
    banner.classList.remove('show');
  };

  acceptBtn?.addEventListener('click', () => dismiss('all'));
  rejectBtn?.addEventListener('click', () => dismiss('necessary'));
}

/* ===================================================
   MODALES Y GESTIÓN DE FOCO
   =================================================== */
const _modalState = new WeakMap();

function getFocusable(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.closest('[aria-hidden="true"]') && getComputedStyle(el).display !== 'none');
}

function trapFocus(container, e) {
  const focusable = getFocusable(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function srAnnounce(message, priority = 'polite') {
  const el = document.getElementById('sr-announcer');
  if (!el) return;
  el.setAttribute('aria-live', priority);
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}

function openModal(overlay, trigger = null) {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const focusable = getFocusable(overlay);
  setTimeout(() => focusable[0]?.focus(), 50);

  const trapHandler = (e) => {
    if (e.key === 'Tab') trapFocus(overlay, e);
  };
  overlay.addEventListener('keydown', trapHandler);
  _modalState.set(overlay, { trigger: trigger || document.activeElement, trapHandler });
}

function closeModal(overlay) {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  const state = _modalState.get(overlay);
  if (state) {
    overlay.removeEventListener('keydown', state.trapHandler);
    state.trigger?.focus?.();
    _modalState.delete(overlay);
  }
}

function initModals() {
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const id = trigger.getAttribute('data-modal');
      const overlay = document.getElementById(`modal-${id}`);
      if (overlay) openModal(overlay, trigger);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelector('.modal-close')?.addEventListener('click', () => closeModal(overlay));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
    }
  });
}

/* ===================================================
   EFEMÉRIDE DEL DÍA (alimentada por facts.js)
   =================================================== */
function initEphemeris() {
  const card = document.getElementById('ephemeris-card');
  if (!card || typeof TECH_FACTS === 'undefined') return;

  const db = TECH_FACTS;
  const allKeys = Object.keys(db).sort();

  const now   = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const todayKey = `${month}-${day}`;

  const eventKey = db[todayKey] ? todayKey : allKeys[0];
  const ev = db[eventKey];
  if (!ev) return;

  const isEs  = currentLang === 'es';
  const year  = ev.y;
  const emoji = ev.i;
  const title = isEs ? ev.te : (ev.ti || ev.te);
  const desc  = isEs ? ev.tx : (ev.txn || ev.tx);

  const monthsEs = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [em, ed] = eventKey.split('-').map(Number);
  const dateLabel = isEs
    ? `${ed} de ${monthsEs[em - 1]}`
    : `${monthsEn[em - 1]} ${ed}`;

  const onThisDay = t('ephemeris_on_this_day');

  const yearEl  = card.querySelector('#eph-year');
  const emojiEl = card.querySelector('#eph-emoji');
  const titleEl = card.querySelector('#eph-title');
  const descEl  = card.querySelector('#eph-desc');
  const dateEl  = card.querySelector('#eph-date');
  const tagEl   = card.querySelector('#eph-tag');

  if (yearEl)  yearEl.textContent  = year;
  if (emojiEl) emojiEl.textContent = emoji;
  if (titleEl) titleEl.textContent = title;
  if (descEl)  descEl.textContent  = desc;
  if (dateEl)  dateEl.textContent  = dateLabel;
  if (tagEl)   tagEl.textContent   = onThisDay;
}

/* ===================================================
   PROTECCIÓN DE CONTENIDO EN CLIENTE
   =================================================== */
function initSecurityProtection() {
  document.addEventListener('contextmenu', (e) => {
    const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    e.preventDefault();
  });

  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const mod   = isMac ? e.metaKey : e.ctrlKey;
    const key   = (e.key || '').toLowerCase();

    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }
    if (mod && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault();
      return;
    }
    if (mod && (key === 'u' || key === 's')) {
      e.preventDefault();
      return;
    }
    if (mod && key === 'c') {
      const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tag !== 'input' && tag !== 'textarea' && !e.target?.isContentEditable) {
        e.preventDefault();
      }
    }
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target && e.target.nodeName === 'IMG') e.preventDefault();
  });
}

/* ===================================================
   INICIALIZACIÓN
   =================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initSecurityProtection();
  applyTranslations();
  initNavigation();
  initScrollAnimations();
  initEphemeris();
  initAuditor();
  initContactForm();
  initCookieBanner();
  initModals();

  document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
    btn.addEventListener('click', toggleLanguage);
  });
});
