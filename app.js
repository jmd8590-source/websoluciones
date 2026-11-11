/* ===================================================
   SOLUCIONES IA CM — Application Script
   Version: 2.0.0
   Stack: HTML5, CSS3, JavaScript (vanilla), Supabase, Cloudflare Pages
   =================================================== */
/* global TECH_FACTS, renderLoUltimo */
'use strict';

/* ===================================================
   EMAIL NOTIFICATION CONFIG
   Get your free access key at: https://web3forms.com
   1. Enter jemendo90@gmail.com → Get Access Key
   2. Check your inbox and copy the key
   3. Paste it between the quotes below
   =================================================== */
const WEB3FORMS_KEY = 'd0dc8179-a542-4887-8a1f-9a66ed865fa6'; // ← Paste your Web3Forms access key here

/* ===================================================
   SUPABASE DATABASE CONFIG
   =================================================== */
const SUPABASE_URL = 'https://qotpnbshccwyrledrorl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdHBuYnNoY2N3eXJsZWRyb3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM0MjcsImV4cCI6MjEwMjAzOTQyN30.ToLVuYZiEq4hNOTn2JcxU5GaaODFQIQ0zu2uE34QQ2M';

/* Send email notification to jemendo90@gmail.com */
async function sendEmailNotification(lead) {
  if (!WEB3FORMS_KEY) return; // Not configured yet
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
          '\ud83d\udccb NUEVA CONSULTA DESDE LA WEB',
          '',
          `\ud83d\udc64 Nombre:    ${lead.name}`,
          `\ud83d\udce7 Email:     ${lead.email}`,
          `\ud83c\udfe2 Empresa:   ${lead.company || 'No indicada'}`,
          `\ud83d\udcde Tel\u00e9fono:  ${lead.phone || 'No indicado'}`,
          '',
          '\ud83d\udcac Mensaje:',
          lead.message,
          '',
          `\ud83d\udd50 Recibido: ${new Date().toLocaleString('es-ES')}`,
        ].join('\n'),
      }),
    });
  } catch {
    // Email failed silently — lead is already saved in CRM
  }
}

/* Save lead to Supabase database */
async function saveLeadToSupabase(lead) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(lead)
    });
  } catch (err) {
    console.error('Error saving lead to Supabase:', err);
  }
}

/* Rate limiting: max 3 submissions per hour per browser */
function checkRateLimit() {
  const key = 'siacm_form_rl';
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  let data;
  try { data = JSON.parse(localStorage.getItem(key) || 'null'); } catch { data = null; }
  if (!data || now - data.start > hour) {
    localStorage.setItem(key, JSON.stringify({ count: 1, start: now }));
    return true;
  }
  if (data.count >= 3) return false;
  localStorage.setItem(key, JSON.stringify({ count: data.count + 1, start: data.start }));
  return true;
}

/* ===================================================
   TRANSLATIONS — i18n
   =================================================== */

const TRANSLATIONS = {
  es: {
    // Navigation
    nav_inicio: 'Inicio',
    nav_servicios: 'Servicios',
    nav_auditor: 'Auditor Web IA',
    nav_faq: 'FAQ',
    nav_contacto: 'Contacto',
    nav_cta: 'Solicitar Consulta',

    // Hero
    hero_badge: 'Consultoría de IA en Cumbres Mayores, Huelva',
    hero_title_line1: 'Que tu negocio',
    hero_title_line2: 'conteste, venda y se organice solo',
    hero_subtitle: 'Consultoría práctica de inteligencia artificial para negocios de la Sierra de Huelva: automatizamos tareas repetitivas, respondemos a tus clientes y te devolvemos las horas que hoy pierdes en gestiones.',
    hero_cta_primary: 'Ver servicios',
    hero_cta_secondary: 'Hablar con nosotros',
    hero_stat_1_value: 'Gratuita',
    hero_stat_1_label: 'Primera consulta, sin compromiso',
    hero_stat_2_value: '< 24h',
    hero_stat_2_label: 'Tiempo de respuesta',
    hero_stat_3_value: 'Directo',
    hero_stat_3_label: 'Trato local, sin intermediarios',

    // Services
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
    svc6_desc: 'Páginas de aterrizaje diseñadas para convertir visitantes en clientes, con diseño premium y optimización continua.',
    svc7_title: 'Automatización de Procesos',
    svc7_desc: 'Automatizamos tareas repetitivas: facturación, seguimiento de clientes, publicaciones en redes, notificaciones y mucho más.',
    svc8_title: 'Bases de Datos y CRM',
    svc8_desc: 'Diseño e implementación de bases de datos y sistemas CRM para gestionar clientes, leads y datos empresariales de forma eficiente.',
    svc9_title: 'Orientación Tecnológica',
    svc9_desc: 'Te guiamos en la selección de las herramientas tecnológicas más adecuadas para tu negocio, sin tecnicismos innecesarios.',
    svc10_title: 'Restauración de Imágenes Antiguas',
    svc10_desc: 'Recuperamos y mejoramos fotografías antiguas y en blanco y negro mediante IA: eliminamos deterioros, restauramos detalles y añadimos color con resultados asombrosos.',
    svc11_title: 'Diseño de aplicaciones a medida',
    svc11_desc: 'Se crean aplicaciones a medida en función de las necesidades del negocio, atendiendo a las necesidades que el cliente indique.',

    // Auditor
    auditor_label: 'Herramienta insignia · gratuita',
    auditor_title: 'Auditor Web IA',
    auditor_subtitle: 'Pega la URL de tu negocio y analizamos en vivo su diseño, velocidad, SEO, seguridad y accesibilidad: un informe real, no una estimación genérica.',
    auditor_placeholder: 'https://tunegocio.com',
    auditor_btn: 'Analizar web',
    auditor_label_sr: 'URL de tu sitio web',

    auditor_step1: 'Accediendo a la página web...',
    auditor_step2: 'Analizando diseño responsive...',
    auditor_step3: 'Evaluando idiomas disponibles...',
    auditor_step4: 'Comprobando agentes y chatbots...',
    auditor_step5: 'Analizando SEO y rendimiento...',
    auditor_step6: 'Generando informe completo...',

    auditor_score_label: 'Puntuación global',
    auditor_btn_new: 'Analizar otra web',
    auditor_cta_title: '¿Quieres mejorar estos resultados?',
    auditor_cta_subtitle: 'Nuestro equipo puede ayudarte a implementar todas las mejoras. Primera consulta gratuita.',
    auditor_cta_btn: 'Solicitar consulta gratuita',
    auditor_error_url: 'Por favor, introduce una URL válida (ej: https://tuweb.com)',

    // Criteria names
    crit_responsive: 'Diseño responsive',
    crit_multilingual: 'Multiidioma (ES/EN)',
    crit_chatbot: 'Chatbot / agente 24h',
    crit_crm: 'CRM y gestión de leads',
    crit_performance: 'Velocidad y rendimiento',
    crit_seo: 'SEO y posicionamiento',
    crit_security: 'Seguridad y HTTPS',
    crit_accessibility: 'Accesibilidad web',
    crit_social: 'Presencia en redes',
    crit_cta: 'Llamada a la acción efectiva',

    // Contact
    contact_label: 'Contacto',
    contact_title: 'Hablemos de tu proyecto',
    contact_subtitle: 'Primera consulta siempre gratuita. Cuéntanos tu reto y encontraremos la mejor solución para tu negocio.',
    contact_email_label: 'Email',
    contact_phone_label: 'Teléfono',
    contact_area_label: 'Área de servicio',
    contact_area_note: 'Servicio online en toda España',
    contact_hours_label: 'Disponibilidad',
    contact_hours_value: 'Lun – Vie, 09:00 – 18:00',

    contact_form_name: 'Nombre',
    contact_form_email: 'Email',
    contact_form_company: 'Empresa',
    contact_form_phone: 'Teléfono',
    contact_form_message: 'Cuéntanos tu proyecto',
    contact_form_submit: 'Enviar mensaje',
    contact_success_title: '¡Mensaje enviado!',
    contact_success_text: 'Gracias por contactarnos. Te responderemos en menos de 24 horas.',

    // Footer
    footer_description: 'Soluciones de inteligencia artificial y automatización para pequeños y medianos negocios locales.',
    footer_tech_label: 'Arquitectura tecnológica',
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
    footer_copyright: '© {year} Soluciones IA CM. Todos los derechos reservados.',

    // FAQ (GEO & AI Search)
    faq_label: 'Preguntas frecuentes',
    faq_title: 'Resolvemos tus dudas sobre IA',
    faq_subtitle: 'Todo lo que necesitas saber sobre cómo la inteligencia artificial y la automatización impulsan tu empresa.',
    faq1_q: '¿Cómo ayuda Soluciones IA CM a una pequeña o mediana empresa?',
    faq1_a: 'Automatizamos tareas manuales repetitivas (gestión de citas, facturación, atención al cliente), creamos asistentes virtuales y chatbots 24/7 personalizados, y desarrollamos páginas web rápidas orientadas a conversión. Esto permite reducir costes operativos, ahorrar tiempo y captar clientes de manera continua.',
    faq2_q: '¿Por qué contratar consultoría de IA para un negocio local?',
    faq2_a: 'La consultoría de IA permite a los negocios locales competir con grandes marcas sin costes prohibitivos. Analizamos tu operativa concreta, seleccionamos las herramientas exactas que te aportan rentabilidad y te acompañamos en la puesta en marcha con un retorno de inversión rápido.',
    faq3_q: '¿Cuánto cuesta implementar un chatbot o una automatización?',
    faq3_a: 'La primera consulta de diagnóstico y asesoramiento es 100% gratuita. Cada proyecto se cotiza de forma transparente y adaptada a la escala de una PYME, con presupuestos cerrados y sin cuotas ocultas.',
    faq4_q: '¿Qué ámbito geográfico cubre Soluciones IA CM?',
    faq4_a: 'Tenemos sede en Cumbres Mayores (provincia de Huelva) y prestamos servicio directo y cercano en toda la comarca y Andalucía, además de ofrecer consultoría, diseño web y desarrollos de IA en modalidad online para empresas de toda España.',
    faq5_q: '¿Cuánto tiempo toma la puesta en marcha de un proyecto de IA?',
    faq5_a: 'Los chatbots y asistentes virtuales estándar se configuran y despliegan en 3 a 7 días hábiles. Soluciones a medida más avanzadas (agentes autónomos, integraciones con ERP/CRM o plataformas web completas) suelen tomar entre 2 y 3 semanas.',
    faq6_q: '¿Se requieren conocimientos técnicos previos para empezar?',
    faq6_a: 'Para nada. Nosotros nos encargamos de todo el desarrollo, configuración técnica y pruebas. Te entregamos la solución lista para usar, con una formación práctica muy sencilla y soporte continuo.',
    faq_cta_text: '¿Tienes otra pregunta sobre cómo aplicar IA a tu negocio?',
    faq_cta_btn: 'Consulta gratuita sin compromiso',

    // Cookie banner
    cookie_text: 'Usamos cookies técnicas, necesarias para que la web funcione, y cookies del asistente de chat, opcionales. Tú decides cuáles permites.',
    cookie_accept: 'Aceptar todo',
    cookie_reject: 'Rechazar',
    cookie_settings: 'Configurar',
    cookie_prefs_title: 'Preferencias de cookies',
    cookie_pref_necessary_name: 'Cookies técnicas',
    cookie_pref_necessary_desc: 'Imprescindibles para que la web funcione correctamente. Siempre activas.',
    cookie_pref_chat_name: 'Asistente de chat (Chatbase)',
    cookie_pref_chat_desc: 'Activa el chat de atención al cliente. Si lo rechazas, el widget de chat no se carga.',
    cookie_prefs_save: 'Guardar preferencias',

    // Modals
    modal_legal_title: 'Aviso Legal',
    modal_privacy_title: 'Política de Privacidad',
    modal_cookies_title: 'Política de Cookies',

    // Form errors
    form_error_name: 'Por favor, introduce tu nombre',
    form_error_email: 'Por favor, introduce un email válido',
    form_error_message: 'Por favor, escribe tu mensaje o consulta',

    // Ephemeris section
    ephemeris_label: 'Historia de la Informática',
    ephemeris_title: 'Hoy en la Historia Tech',
    ephemeris_subtitle: 'Un hecho real de la historia de la informática para cada día del año.',
    ephemeris_on_this_day: 'Un día como hoy',
    ephemeris_year_prefix: 'Año',
    ephemeris_source: 'Dato histórico verificado',

    // Lo Último section
    nav_lo_ultimo: 'Lo Último',
    lo_ultimo_label: 'Actualidad',
    lo_ultimo_title: 'Lo Último en IA',
    lo_ultimo_subtitle: 'Las novedades más relevantes del mes en inteligencia artificial: modelos, herramientas, aprendizaje y comunidad.',
    lo_ultimo_updated: 'Actualizado: Julio 2026',
    lo_ultimo_verified: 'Fuentes verificadas',
    lo_ultimo_cat_news: 'Noticias del mes',
    lo_ultimo_cat_tools: 'Herramientas nuevas',
    lo_ultimo_cat_learn: 'Aprendizaje y comunidad',
  },

  en: {
    // Navigation
    nav_inicio: 'Home',
    nav_servicios: 'Services',
    nav_auditor: 'AI Web Auditor',
    nav_faq: 'FAQ',
    nav_contacto: 'Contact',
    nav_cta: 'Book Consultation',

    // Hero
    hero_badge: 'AI consulting in Cumbres Mayores, Huelva',
    hero_title_line1: 'Let your business',
    hero_title_line2: 'answer, sell and organise itself',
    hero_subtitle: 'Practical AI consulting for businesses in the Sierra de Huelva: we automate repetitive tasks, respond to your customers and give you back the hours you lose on admin today.',
    hero_cta_primary: 'View services',
    hero_cta_secondary: 'Talk to us',
    hero_stat_1_value: 'Free',
    hero_stat_1_label: 'First consultation, no obligation',
    hero_stat_2_value: '< 24h',
    hero_stat_2_label: 'Response time',
    hero_stat_3_value: 'Direct',
    hero_stat_3_label: 'Local service, no middlemen',

    // Services
    services_label: 'Our services',
    services_title: 'Everything your business needs',
    services_subtitle: 'A complete ecosystem of AI and automation solutions designed to grow your local business.',

    svc1_title: 'Strategic Consulting',
    svc1_desc: 'We analyze the real needs of your business and design a personalized action plan to optimize time and resources.',
    svc2_title: 'Custom AI Assistants',
    svc2_desc: 'We develop artificial intelligence assistants adapted to your sector and workflow, available 24 hours a day.',
    svc3_title: 'Autonomous AI Agents',
    svc3_desc: 'We create agents that autonomously handle complex tasks: reply to emails, manage appointments, process orders and more.',
    svc4_title: '24/7 Business Chatbot',
    svc4_desc: 'Smart chatbot that answers questions about your company at any time, without losing any potential client.',
    svc5_title: 'Corporate Website',
    svc5_desc: 'Design and development of professional, modern, fast websites optimized for SEO and conversion.',
    svc6_title: 'High-Impact Landing Pages',
    svc6_desc: 'Landing pages designed to convert visitors into customers, with premium design and continuous optimization.',
    svc7_title: 'Process Automation',
    svc7_desc: 'We automate repetitive tasks: invoicing, customer follow-up, social media posts, notifications and much more.',
    svc8_title: 'Databases & CRM',
    svc8_desc: 'Design and implementation of databases and CRM systems to manage customers, leads and business data efficiently.',
    svc9_title: 'Technology Guidance',
    svc9_desc: 'We guide you in selecting the most suitable technological tools for your business, without unnecessary jargon.',
    svc10_title: 'Old Photo Restoration',
    svc10_desc: 'We recover and enhance old and black-and-white photographs using AI: we remove damage, restore details and add color with amazing results.',
    svc11_title: 'Custom Application Design',
    svc11_desc: 'Custom applications are created based on business needs, tailored to the specific requirements the client indicates.',

    // Auditor
    auditor_label: 'Flagship tool · free',
    auditor_title: 'AI Web Auditor',
    auditor_subtitle: 'Paste your business URL and we analyze its design, speed, SEO, security and accessibility live: a real report, not a generic estimate.',
    auditor_placeholder: 'https://yourbusiness.com',
    auditor_btn: 'Analyze website',
    auditor_label_sr: 'Your website URL',

    auditor_step1: 'Accessing the website...',
    auditor_step2: 'Analyzing responsive design...',
    auditor_step3: 'Evaluating available languages...',
    auditor_step4: 'Checking agents and chatbots...',
    auditor_step5: 'Analyzing SEO and performance...',
    auditor_step6: 'Generating complete report...',

    auditor_score_label: 'Overall score',
    auditor_btn_new: 'Analyze another website',
    auditor_cta_title: 'Want to improve these results?',
    auditor_cta_subtitle: 'Our team can help you implement all the necessary improvements. First consultation is free.',
    auditor_cta_btn: 'Request free consultation',
    auditor_error_url: 'Please enter a valid URL (e.g., https://yourwebsite.com)',

    // Criteria names
    crit_responsive: 'Responsive design',
    crit_multilingual: 'Multilingual (ES/EN)',
    crit_chatbot: '24/7 Chatbot / Agent',
    crit_crm: 'CRM & lead management',
    crit_performance: 'Speed & performance',
    crit_seo: 'SEO & search ranking',
    crit_security: 'Security & HTTPS',
    crit_accessibility: 'Web accessibility',
    crit_social: 'Social media presence',
    crit_cta: 'Effective call-to-action',

    // Contact
    contact_label: 'Contact',
    contact_title: "Let's talk about your project",
    contact_subtitle: "First consultation is always free. Tell us about your challenge and we'll find the best solution for your business.",
    contact_email_label: 'Email',
    contact_phone_label: 'Phone',
    contact_area_label: 'Service area',
    contact_area_note: 'Online service throughout Spain',
    contact_hours_label: 'Availability',
    contact_hours_value: 'Mon – Fri, 09:00 – 18:00',

    contact_form_name: 'Name',
    contact_form_email: 'Email',
    contact_form_company: 'Company',
    contact_form_phone: 'Phone',
    contact_form_message: 'Tell us about your project',
    contact_form_submit: 'Send message',
    contact_success_title: 'Message sent!',
    contact_success_text: 'Thank you for contacting us. We will reply within 24 hours.',

    // Footer
    footer_description: 'Artificial intelligence and automation solutions for local small and medium businesses.',
    footer_tech_label: 'Technology architecture',
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
    footer_copyright: '© {year} Soluciones IA CM. All rights reserved.',

    // FAQ (GEO & AI Search)
    faq_label: 'Frequently Asked Questions',
    faq_title: 'Answers to your AI questions',
    faq_subtitle: 'Everything you need to know about how AI and automation drive your business.',
    faq1_q: 'How does Soluciones IA CM help small and medium businesses?',
    faq1_a: 'We automate repetitive manual tasks (appointment scheduling, invoicing, customer support), create custom 24/7 virtual assistants and chatbots, and develop high-speed conversion-focused websites. This reduces operational costs, saves time, and continuously captures clients.',
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

    // Cookie banner
    cookie_text: 'We use technical cookies, required for the site to work, and optional chat-assistant cookies. You choose which ones you allow.',
    cookie_accept: 'Accept all',
    cookie_reject: 'Reject',
    cookie_settings: 'Customise',
    cookie_prefs_title: 'Cookie preferences',
    cookie_pref_necessary_name: 'Technical cookies',
    cookie_pref_necessary_desc: 'Required for the site to work correctly. Always active.',
    cookie_pref_chat_name: 'Chat assistant (Chatbase)',
    cookie_pref_chat_desc: 'Enables the customer chat widget. If you decline, the chat widget is never loaded.',
    cookie_prefs_save: 'Save preferences',

    // Modals
    modal_legal_title: 'Legal Notice',
    modal_privacy_title: 'Privacy Policy',
    modal_cookies_title: 'Cookie Policy',

    // Form errors
    form_error_name: 'Please enter your name',
    form_error_email: 'Please enter a valid email address',
    form_error_message: 'Please enter your message or inquiry',

    // Ephemeris section
    ephemeris_label: 'Computing History',
    ephemeris_title: 'Today in Tech History',
    ephemeris_subtitle: 'A real fact from the history of computing for every day of the year.',
    ephemeris_on_this_day: 'On this day',
    ephemeris_year_prefix: 'Year',
    ephemeris_source: 'Verified historical fact',

    // Lo Último section
    nav_lo_ultimo: "What's New",
    lo_ultimo_label: 'Latest News',
    lo_ultimo_title: "What's New in AI",
    lo_ultimo_subtitle: 'The most relevant AI developments this month: models, tools, learning and community.',
    lo_ultimo_updated: 'Updated: July 2026',
    lo_ultimo_verified: 'Verified sources',
    lo_ultimo_cat_news: 'This month\'s news',
    lo_ultimo_cat_tools: 'New tools',
    lo_ultimo_cat_learn: 'Learning & community',
  },
};

/* ===================================================
   i18n ENGINE
   =================================================== */

let currentLang = localStorage.getItem('lang') ||
  (navigator.language && navigator.language.startsWith('es') ? 'es' : 'en');

function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
    || (TRANSLATIONS.es && TRANSLATIONS.es[key])
    || key;
}

function applyTranslations() {
  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val && val !== key) el.textContent = val.replace('{year}', new Date().getFullYear());
  });

  // Translate placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val && val !== key) el.placeholder = val;
  });

  // Translate aria-label attributes
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const val = t(key);
    if (val && val !== key) el.setAttribute('aria-label', val);
  });

  // Update language toggle buttons
  const langLabel = currentLang === 'es' ? 'EN' : 'ES';
  document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
    if (btn) btn.textContent = langLabel;
  });

  // Update html lang attribute
  document.documentElement.lang = currentLang;

  // Update page title and meta description
  const titles = {
    es: 'Soluciones IA CM — Consultoría de IA en Cumbres Mayores, Huelva',
    en: 'Soluciones IA CM — AI Consulting in Cumbres Mayores, Huelva',
  };
  const descs = {
    es: 'Consultoría, asistentes IA, chatbots 24/7, automatizaciones y diseño web para pequeños y medianos negocios locales.',
    en: 'Consulting, AI assistants, 24/7 chatbots, automations and web design for local small and medium businesses.',
  };
  document.title = titles[currentLang];
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', descs[currentLang]);
}

function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  localStorage.setItem('lang', currentLang);
  applyTranslations();
  refreshEphemeris();
  // Re-renderizar Lo Último en el idioma seleccionado
  if (typeof renderLoUltimo === 'function') renderLoUltimo(currentLang);

  // Update lang toggle aria-label
  const ariaLabel = currentLang === 'es'
    ? 'Cambiar idioma a inglés'
    : 'Switch language to Spanish';
  document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
    if (btn) btn.setAttribute('aria-label', ariaLabel);
  });
}

/* ===================================================
   NAVIGATION
   =================================================== */

function initNavigation() {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  // Scrolled header effect
  const progressBar = document.getElementById('scroll-progress');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      progressBar.style.width = pct + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll(); // Apply on load

  // Mobile menu toggle
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      mobileNav.classList.toggle('open', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
      // El icono (hamburguesa ↔ aspa) lo intercambia el CSS según
      // aria-expanded: nunca se reemplaza el contenido del botón aquí,
      // para no desprender el nodo que originó este mismo evento.
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && !mobileNav.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // Active nav link on scroll
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            // aria-current for screen readers (WCAG 4.1.2)
            if (isActive) {
              link.setAttribute('aria-current', 'page');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));
  }
}

function closeMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const menuToggle = document.getElementById('menu-toggle');
  if (mobileNav) { mobileNav.classList.remove('open'); }
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  }
}

/* ===================================================
   SCROLL ANIMATIONS
   =================================================== */

function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all elements
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
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ===================================================
   AI WEB AUDITOR
   =================================================== */

function initAuditor() {
  const form = document.getElementById('auditor-form');
  const input = document.getElementById('auditor-url');
  const newBtn = document.getElementById('auditor-new-btn');
  const submitBtn = document.getElementById('auditor-submit');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawUrl = input.value.trim();
    if (!isValidUrl(rawUrl)) {
      showInputError(input, t('auditor_error_url'));
      return;
    }

    clearInputError(input);
    submitBtn.disabled = true;

    await runAudit(normalizeUrl(rawUrl));

    submitBtn.disabled = false;
  });

  if (newBtn) {
    newBtn.addEventListener('click', () => {
      document.getElementById('auditor-results').classList.remove('active');
      input.value = '';
      input.focus();
      // Scroll back to form
      document.getElementById('auditor-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function isValidUrl(str) {
  try {
    const url = new URL(str.startsWith('http') ? str : 'https://' + str);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}

function normalizeUrl(str) {
  return str.startsWith('http') ? str : 'https://' + str;
}

function showInputError(input, msg) {
  input.style.borderColor = 'var(--c-error)';
  input.setAttribute('aria-invalid', 'true');
  let err = input.closest('.auditor-input-wrapper')?.querySelector('.input-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'input-error';
    err.style.cssText = 'color:var(--c-error);font-size:var(--fs-xs);margin-top:6px;padding-left:4px;';
    err.setAttribute('role', 'alert');
    input.closest('.auditor-input-wrapper')?.appendChild(err);
  }
  err.textContent = msg;
}

function clearInputError(input) {
  input.style.borderColor = '';
  input.removeAttribute('aria-invalid');
  input.closest('.auditor-input-wrapper')?.querySelector('.input-error')?.remove();
}

/* Seeded pseudo-random number generator (LCG) for consistent scores per URL */
function seededRand(seed, n) {
  const a = 1664525, c = 1013904223, m = 0x100000000;
  return (Math.abs((seed * a + n * c) % m)) / m;
}

function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

function generateScores(url) {
  const seed = hashStr(url.toLowerCase());
  const r = (n, min, max) => Math.round(min + seededRand(seed, n) * (max - min));

  return {
    // Small biz usually weak on these:
    multilingual: r(2, 0, 28),
    chatbot: r(3, 0, 18),
    crm: r(4, 0, 22),
    // Typically mixed:
    responsive: r(1, 42, 92),
    performance: r(5, 28, 78),
    seo: r(6, 18, 72),
    accessibility: r(8, 16, 68),
    cta: r(10, 28, 78),
    // Usually better:
    security: r(7, 52, 96),
    social: r(9, 18, 75),
  };
}

function getLevel(score) {
  return score >= 70 ? 'good' : score >= 38 ? 'ok' : 'bad';
}

const AUDIT_NOTES = {
  es: {
    responsive: { good: 'Tu web se adapta correctamente a todos los dispositivos.', ok: 'Algunos elementos no se visualizan bien en pantallas pequeñas.', bad: 'Tu web no está optimizada para móviles, lo que penaliza en Google y aleja clientes.' },
    multilingual: { good: 'Tu web ofrece contenido en varios idiomas.', ok: 'Hay algo de contenido traducido, pero está incompleto.', bad: 'Tu web solo está en un idioma. Ofrecer inglés puede multiplicar tu alcance y atraer clientes internacionales.' },
    chatbot: { good: 'Tienes un sistema de atención automatizada 24/7 activo.', ok: 'Hay un formulario de contacto, pero sin respuesta inmediata.', bad: 'No se detectó chatbot ni agente IA. Cada cliente que no recibe respuesta inmediata puede marcharse a la competencia.' },
    crm: { good: 'Tienes un CRM integrado para gestionar leads.', ok: 'Hay captación básica de datos, pero sin gestión estructurada.', bad: 'No se detectó CRM. Sin seguimiento de leads no podrás crecer de forma sostenida.' },
    performance: { good: 'La velocidad de carga es excelente.', ok: 'La web carga en tiempo aceptable pero hay margen de mejora.', bad: 'La web carga lentamente. Esto aumenta la tasa de abandono y penaliza en los resultados de búsqueda.' },
    seo: { good: 'El SEO está bien trabajado con buena estructura.', ok: 'Hay optimizaciones básicas de SEO, pero se pueden mejorar.', bad: 'El SEO es deficiente. Tu web tiene dificultades para aparecer en Google.' },
    security: { good: 'La web usa HTTPS y cuenta con medidas de seguridad.', ok: 'Hay HTTPS pero faltan cabeceras de seguridad recomendadas.', bad: 'Se detectaron problemas de seguridad que pueden ahuyentar usuarios y penalizar en SEO.' },
    accessibility: { good: 'La accesibilidad cumple los estándares WCAG.', ok: 'La accesibilidad es básica pero hay elementos mejorables.', bad: 'La web tiene barreras de accesibilidad que excluyen a una parte significativa de usuarios.' },
    social: { good: 'Tienes buena presencia y enlaces a redes sociales.', ok: 'Hay alguna red social vinculada, pero la presencia es mejorable.', bad: 'No se detectó presencia en redes sociales, esenciales para la visibilidad local.' },
    cta: { good: 'Los call-to-action son claros, visibles y efectivos.', ok: 'Hay CTAs pero podrían ser más prominentes y estratégicos.', bad: 'No se detectaron call-to-action claros. Los visitantes no saben qué acción tomar.' },
  },
  en: {
    responsive: { good: 'Your website adapts correctly to all devices.', ok: 'Some elements do not display well on small screens.', bad: 'Your website is not mobile-optimized, penalizing Google rankings and losing customers.' },
    multilingual: { good: 'Your website offers content in multiple languages.', ok: 'Some content is translated but it is incomplete.', bad: 'Your website is only in one language. Adding English could multiply your reach significantly.' },
    chatbot: { good: 'You have an active 24/7 automated support system.', ok: 'There is a contact form, but without immediate response.', bad: 'No chatbot or AI agent detected. Customers who don\'t get instant responses may go to competitors.' },
    crm: { good: 'You have an integrated CRM for lead management.', ok: 'There is basic data collection but no structured management.', bad: 'No CRM detected. Without lead tracking, sustainable growth is very difficult.' },
    performance: { good: 'Page load speed is excellent.', ok: 'Load time is acceptable but there is room for improvement.', bad: 'The website loads slowly, increasing bounce rate and penalizing search rankings.' },
    seo: { good: 'SEO is well implemented with good structure.', ok: 'There are basic SEO optimizations but they can be improved.', bad: 'SEO is poor. Your website struggles to appear in search results.' },
    security: { good: 'The website uses HTTPS and has security measures.', ok: 'HTTPS is present but recommended security headers are missing.', bad: 'Security issues detected that may deter users and penalize search rankings.' },
    accessibility: { good: 'Accessibility meets WCAG standards.', ok: 'Basic accessibility is present but some elements can be improved.', bad: 'The website has accessibility barriers that exclude a significant portion of users.' },
    social: { good: 'You have good social media presence and links.', ok: 'Some social networks are linked but presence can be improved.', bad: 'No social media presence detected, essential for local visibility.' },
    cta: { good: 'Call-to-actions are clear, visible and effective.', ok: 'There are CTAs but they could be more prominent and strategic.', bad: 'No clear call-to-actions detected. Visitors don\'t know what action to take.' },
  },
};

/**
 * Pide el análisis real al servidor (Cloudflare Pages Function).
 * Nunca falla silenciosamente: si no hay respuesta válida, lanza para
 * que runAudit() recurra al resultado de ejemplo y lo diga claramente.
 */
async function fetchLiveAudit(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 11000);
  try {
    const res = await fetch(`/api/audit?url=${encodeURIComponent(url)}`, { signal: controller.signal });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.message || 'audit_failed');
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function runAudit(url) {
  const loading = document.getElementById('auditor-loading');
  const results = document.getElementById('auditor-results');
  const steps = Array.from(document.querySelectorAll('.auditor-step'));

  loading.classList.add('active');
  results.classList.remove('active');
  steps.forEach(s => s.classList.remove('done', 'active'));

  // El análisis real corre en paralelo a la animación de pasos, no en serie:
  // así no esperamos más de lo necesario ni se queda corta si el sitio tarda.
  const livePromise = fetchLiveAudit(url).catch(() => null);

  for (let i = 0; i < steps.length; i++) {
    steps.forEach((s, idx) => {
      s.classList.toggle('active', idx === i);
      if (idx < i) s.classList.add('done');
    });
    await pause(i < steps.length - 1 ? 520 : 150);
  }
  steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });

  // Si el análisis real aún no ha terminado, esperamos un poco más (con límite)
  const live = await Promise.race([livePromise, pause(9000).then(() => null)]);

  let scores, overall, isLive;
  if (live) {
    scores = live.scores;
    overall = live.overall;
    isLive = true;
  } else {
    scores = generateScores(url);
    overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
    isLive = false;
  }

  renderResults(url, scores, overall, isLive);

  loading.classList.remove('active');
  results.classList.add('active');
  await pause(200);
  steps.forEach(s => s.classList.remove('done', 'active'));

  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.criterion-bar').forEach(bar => {
        bar.style.width = bar.dataset.score + '%';
      });
    }, 100);
  });

  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Cuenta de 0 hasta `target` en `durationMs`, con una curva de deceleración */
function animateCountUp(el, target, durationMs = 1100) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + '/100';
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderResults(url, scores, overall, isLive) {
  // URL display
  const urlEl = document.getElementById('auditor-result-url');
  if (urlEl) {
    try { urlEl.textContent = new URL(url).hostname; }
    catch { urlEl.textContent = url; }
  }

  // Overall score (con animación de recuento)
  const scoreEl = document.getElementById('auditor-overall-score');
  if (scoreEl) animateCountUp(scoreEl, overall);

  // Score label (descriptive)
  const labelEl = document.getElementById('auditor-score-heading');
  if (labelEl) {
    const labels = {
      es: overall >= 70 ? 'Buen estado general' : overall >= 48 ? 'Necesita mejoras importantes' : 'Requiere atención urgente',
      en: overall >= 70 ? 'Good overall condition' : overall >= 48 ? 'Needs important improvements' : 'Requires urgent attention',
    };
    labelEl.textContent = labels[currentLang];
  }

  // Fuente del resultado: honestidad ante todo — nunca disfrazamos un
  // resultado de ejemplo como si fuera un análisis real.
  const sourceEl = document.getElementById('auditor-score-source');
  if (sourceEl) {
    const sourceLabels = {
      es: isLive
        ? 'Análisis en vivo de esta URL'
        : 'Resultado de ejemplo — no hemos podido analizar esa web ahora mismo',
      en: isLive
        ? 'Live analysis of this URL'
        : 'Example result — we could not analyze that site right now',
    };
    sourceEl.textContent = sourceLabels[currentLang];
    sourceEl.classList.toggle('is-demo', !isLive);
  }

  // Render criteria cards
  const container = document.getElementById('auditor-criteria');
  if (!container) return;

  const criteriaOrder = [
    'responsive', 'multilingual', 'chatbot', 'crm',
    'performance', 'seo', 'security', 'accessibility', 'social', 'cta',
  ];

  container.innerHTML = criteriaOrder.map(id => {
    const score = scores[id];
    const level = getLevel(score);
    const name = t(`crit_${id}`);
    const note = AUDIT_NOTES[currentLang]?.[id]?.[level] || '';

    return `
      <div class="criterion-card" role="listitem">
        <div class="criterion-info">
          <div class="criterion-name">${name}</div>
          <div class="criterion-bar-wrapper" role="progressbar" aria-valuenow="${score}" aria-valuemin="0" aria-valuemax="100" aria-label="${score}/100">
            <div class="criterion-bar ${level}" data-score="${score}" style="width:0%"></div>
          </div>
          <div class="criterion-score">${score}/100</div>
          ${note ? `<div class="criterion-note">${note}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ===================================================
   CONTACT FORM
   =================================================== */

function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. HONEYPOT CHECK — if filled, it's a bot. Silently pretend success.
    const botField = document.getElementById('bot_field');
    if (botField && botField.value) {
      form.style.display = 'none';
      success.classList.add('active');
      return;
    }

    // 2. RATE LIMIT CHECK
    if (!checkRateLimit()) {
      const errMsg = currentLang === 'es'
        ? 'Has enviado demasiados mensajes. Inténtalo en unos minutos.'
        : 'Too many submissions. Please try again in a few minutes.';
      const submitBtn = document.getElementById('form-submit');
      const existing = form.querySelector('.rate-limit-error');
      if (!existing) {
        const p = document.createElement('p');
        p.className = 'rate-limit-error';
        p.style.cssText = 'color:var(--c-error);font-size:var(--fs-sm);margin-top:8px;text-align:center;';
        p.setAttribute('role', 'alert');
        p.textContent = errMsg;
        submitBtn.after(p);
      }
      return;
    }

    const nameEl = document.getElementById('form-name');
    const emailEl = document.getElementById('form-email');
    const messageEl = document.getElementById('form-message');
    const submitBtn = document.getElementById('form-submit');

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

    if (!isValid) return;

    // 3. BUILD LEAD OBJECT
    const lead = {
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      company: document.getElementById('form-company')?.value.trim() || '',
      phone: document.getElementById('form-phone')?.value.trim() || '',
      message: messageEl.value.trim(),
      status: 'nuevo',
      notes: [],
      source: 'web_form',
    };

    // 4. SAVE TO CRM (localStorage)
    const existingLeads = JSON.parse(localStorage.getItem('siacm_leads') || '[]');
    existingLeads.unshift(lead);
    localStorage.setItem('siacm_leads', JSON.stringify(existingLeads));

    // SAVE TO SUPABASE (non-blocking, fails silently)
    saveLeadToSupabase(lead).catch(() => { });

    // 5. SEND EMAIL NOTIFICATION (non-blocking, fails silently)
    sendEmailNotification(lead).catch(() => { });

    // 6. UI — show loading state
    submitBtn.disabled = true;
    if (submitBtn.querySelector('[data-i18n]')) {
      submitBtn.querySelector('[data-i18n]').textContent =
        currentLang === 'es' ? 'Enviando...' : 'Sending...';
    }

    await pause(1400);

    form.style.display = 'none';
    success.classList.add('active');

    // Announce success to screen readers
    const successMsg = currentLang === 'es'
      ? 'Mensaje enviado correctamente. Te contactaremos en menos de 24 horas.'
      : 'Message sent successfully. We will contact you within 24 hours.';
    srAnnounce(successMsg, 'assertive');

    // Move focus to success message (keyboard users)
    setTimeout(() => success.querySelector('h3')?.focus?.(), 100);
  });

  // Clear errors on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => clearFieldError(field), { passive: true });
  });
}

function setFieldError(input, msg) {
  input.classList.add('input-error');
  input.setAttribute('aria-invalid', 'true');

  // Try to find the dedicated error element by ID convention first
  const errId = input.id ? `${input.id}-error` : null;
  let err = errId ? document.getElementById(errId) : null;

  if (err) {
    // Use the pre-existing error element (linked via aria-describedby)
    err.textContent = msg;
    err.style.display = 'flex';
  } else {
    // Fallback: create inline error element
    const parent = input.parentElement;
    err = parent.querySelector('.field-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.setAttribute('role', 'alert');
      err.setAttribute('aria-live', 'assertive');
      parent.appendChild(err);
    }
    err.textContent = msg;
    err.style.display = 'flex';
  }
}

function clearFieldError(input) {
  input.classList.remove('input-error');
  input.setAttribute('aria-invalid', 'false');

  const errId = input.id ? `${input.id}-error` : null;
  const errEl = errId ? document.getElementById(errId) : null;
  if (errEl) {
    errEl.textContent = '';
    errEl.style.display = 'none';
    return;
  }

  // Fallback: inline error element
  const inlineErr = input.parentElement?.querySelector('.field-error');
  if (inlineErr) { inlineErr.textContent = ''; inlineErr.style.display = 'none'; }
}


/* ===================================================
   COOKIE BANNER
   =================================================== */

const COOKIE_PREFS_KEY = 'siacm_cookie_prefs';

/** Loads the Chatbase widget script — only ever called after real consent */
function loadChatbaseWidget() {
  if (document.getElementById('chatbase-embed-script')) return; // already loaded
  window.chatbase = (...args) => {
    if (!window.chatbase.q) window.chatbase.q = [];
    window.chatbase.q.push(args);
  };
  window.chatbase = new Proxy(window.chatbase, {
    get(target, prop) {
      if (prop === 'q') return target.q;
      return (...args) => target(prop, ...args);
    }
  });
  const script = document.createElement('script');
  script.id = 'chatbase-embed-script';
  script.src = 'https://www.chatbase.co/embed.min.js';
  script.setAttribute('chatbotId', 'DlYvDU3Ab08HmFUV5mS7K');
  script.domain = 'www.chatbase.co';
  document.body.appendChild(script);
}

function getCookiePrefs() {
  try { return JSON.parse(localStorage.getItem(COOKIE_PREFS_KEY) || 'null'); } catch { return null; }
}

function applyCookiePrefs(prefs) {
  localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
  if (prefs.chat) loadChatbaseWidget();
}

function initCookieBanner() {
  const banner   = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  const settingsBtn = document.getElementById('cookie-settings');
  const prefsModal  = document.getElementById('cookie-prefs-modal');
  const prefsChat   = document.getElementById('cookie-pref-chat');
  const prefsSaveBtn = document.getElementById('cookie-prefs-save');
  const prefsCloseBtn = document.getElementById('cookie-prefs-close');
  if (!banner) return;

  const existing = getCookiePrefs();
  if (existing) {
    // Ya hay una decisión previa: respetarla (y cargar el chat si se aceptó)
    if (existing.chat) loadChatbaseWidget();
    return;
  }

  setTimeout(() => banner.classList.add('show'), 1500);

  const dismiss = () => banner.classList.remove('show');

  acceptBtn?.addEventListener('click', () => {
    applyCookiePrefs({ necessary: true, chat: true });
    dismiss();
  });

  rejectBtn?.addEventListener('click', () => {
    applyCookiePrefs({ necessary: true, chat: false });
    dismiss();
  });

  settingsBtn?.addEventListener('click', () => {
    if (prefsModal) {
      prefsModal.classList.add('open');
      prefsModal.setAttribute('aria-hidden', 'false');
    }
  });

  prefsCloseBtn?.addEventListener('click', () => {
    prefsModal?.classList.remove('open');
    prefsModal?.setAttribute('aria-hidden', 'true');
  });

  prefsSaveBtn?.addEventListener('click', () => {
    applyCookiePrefs({ necessary: true, chat: !!prefsChat?.checked });
    prefsModal?.classList.remove('open');
    prefsModal?.setAttribute('aria-hidden', 'true');
    dismiss();
  });
}

/* ===================================================
   MODALS
   =================================================== */

function initModals() {
  // Open triggers — store the trigger element for focus restoration
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const id = trigger.getAttribute('data-modal');
      const overlay = document.getElementById(`modal-${id}`);
      if (!overlay) return;
      openModal(overlay, trigger);  // pass trigger for focus restore
    });
  });

  // Close on backdrop / close button
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelector('.modal-close')?.addEventListener('click', () => closeModal(overlay));
  });

  // ESC key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
    }
  });
}

/* ===================================================
   ACCESSIBILITY — FOCUS MANAGEMENT
   =================================================== */

/** Returns all focusable elements within a container */
function getFocusable(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), ' +
    'select:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable]'
  )).filter(el => !el.closest('[aria-hidden="true"]') && getComputedStyle(el).display !== 'none');
}

/** Trap keyboard focus inside a container (e.g. open modal) */
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

/** Announce a message to screen readers via the live region */
function srAnnounce(message, priority = 'polite') {
  const el = document.getElementById('sr-announcer');
  if (!el) return;
  el.setAttribute('aria-live', priority);
  // Clear then set — forces re-announcement even for identical text
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}

// Map overlay → {trigger, trapHandler} for cleanup
const _modalState = new WeakMap();

function openModal(overlay, trigger = null) {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus first focusable element
  const focusable = getFocusable(overlay);
  const firstFocusable = focusable[0];
  setTimeout(() => firstFocusable?.focus(), 60);

  // Focus trap handler
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

  // Remove focus trap
  const state = _modalState.get(overlay);
  if (state) {
    overlay.removeEventListener('keydown', state.trapHandler);
    // Return focus to trigger
    state.trigger?.focus?.();
    _modalState.delete(overlay);
  }
}

/* ===================================================
   LANGUAGE TOGGLE EVENT BINDING
   =================================================== */

function initLangToggle() {
  document.querySelectorAll('#lang-toggle, #lang-toggle-mobile').forEach(btn => {
    btn.addEventListener('click', toggleLanguage);
  });
}

/* ===================================================
   INIT EPHEMERIS — Efeméride del día
   =================================================== =
   Pide solo el hecho de hoy a /api/efemeride (Cloudflare Pages Function)
   en vez de cargar los 366 del año (~125 KB) en cada visita. Si esa
   función no está disponible (p. ej. en una vista previa local sin
   Functions), carga facts.js bajo demanda como alternativa, así la
   sección nunca se queda vacía. */

let _ephemerisEvent = null; // cacheado tras la primera carga, para refreshEphemeris()

function loadFactsScriptFallback() {
  return new Promise((resolve, reject) => {
    if (typeof TECH_FACTS !== 'undefined') { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'facts.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('facts.js no disponible'));
    document.body.appendChild(script);
  });
}

async function fetchTodayEvent() {
  try {
    const res = await fetch('/api/efemeride');
    if (!res.ok) throw new Error('api_unavailable');
    return await res.json();
  } catch {
    // Alternativa: cargar el archivo completo y elegir el día localmente
    await loadFactsScriptFallback();
    const db = TECH_FACTS;
    const now = new Date();
    const todayKey = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let key = todayKey;
    if (!db[key]) {
      const dayOfYear = k => { const [m, d] = k.split('-').map(Number); return new Date(2024, m - 1, d).getTime(); };
      const todayMs = dayOfYear(todayKey);
      let minDist = Infinity;
      Object.keys(db).forEach(k => {
        const diff = Math.abs(dayOfYear(k) - todayMs);
        const circular = Math.min(diff, 365 * 86400000 - diff);
        if (circular < minDist) { minDist = circular; key = k; }
      });
    }
    return { key, isToday: key === todayKey, ...db[key] };
  }
}

function renderEphemerisEvent(ev) {
  const card = document.getElementById('ephemeris-card');
  if (!card || !ev) return;

  const isEs = currentLang === 'es';
  const title = isEs ? ev.te : (ev.ti || ev.te);
  const desc = isEs ? ev.tx : (ev.txn || ev.tx);

  const months_es = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const months_en = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [em, ed] = ev.key.split('-').map(Number);
  const dateLabel = isEs ? `${ed} de ${months_es[em - 1]}` : `${months_en[em - 1]} ${ed}`;
  const onThisDay = t('ephemeris_on_this_day');

  const yearEl  = card.querySelector('#eph-year');
  const titleEl = card.querySelector('#eph-title');
  const descEl  = card.querySelector('#eph-desc');
  const dateEl  = card.querySelector('#eph-date');
  const tagEl   = card.querySelector('#eph-tag');

  if (yearEl)  yearEl.textContent  = ev.y;
  if (titleEl) titleEl.textContent = title;
  if (descEl)  descEl.textContent  = desc;
  if (dateEl)  dateEl.textContent  = dateLabel;
  if (tagEl)   tagEl.textContent   = ev.isToday ? onThisDay : `${onThisDay} (${dateLabel})`;

  srAnnounce(`${onThisDay}: ${ev.y} — ${title}`);
}

async function initEphemeris() {
  const card = document.getElementById('ephemeris-card');
  if (!card) return;
  _ephemerisEvent = await fetchTodayEvent();
  renderEphemerisEvent(_ephemerisEvent);
}

/* Re-render ephemeris when language changes (sin volver a pedir el dato) */
function refreshEphemeris() {
  if (_ephemerisEvent) renderEphemerisEvent(_ephemerisEvent);
}

/* ===================================================
   SECURITY & CODE / CONTENT PROTECTION
   =================================================== */
function initSecurityProtection() {
  // Deshabilitar menú contextual (clic derecho)
  document.addEventListener('contextmenu', (e) => {
    // Permitir clic derecho solo en campos de formulario (inputs/textareas)
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
      return;
    }
    e.preventDefault();
  }, false);

  // Bloquear atajos habituales para inspeccionar y copiar código
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // F12 (DevTools)
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Consola), Ctrl+Shift+C (Inspeccionar elemento)
    if (ctrlOrCmd && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (Ver código fuente)
    if (ctrlOrCmd && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (Guardar página)
    if (ctrlOrCmd && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      return false;
    }

    // Ctrl+C (Copiar) fuera de inputs
    if (ctrlOrCmd && (e.key === 'c' || e.key === 'C')) {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
        e.preventDefault();
        return false;
      }
    }
  }, false);

  // Evitar arrastre de imágenes
  document.addEventListener('dragstart', (e) => {
    if (e.target.nodeName === 'IMG') {
      e.preventDefault();
    }
  }, false);
}

/* ===================================================
   INIT — DOM READY
   =================================================== */

/* ===================================================
   THEME — Modo claro / oscuro
   =================================================== */
const THEME_KEY = 'siacm_theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  });
}

function initThemeToggle() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* storage blocked */ }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked */ }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSecurityProtection();
  applyTranslations();
  initNavigation();
  initScrollAnimations();
  initEphemeris();
  initAuditor();
  initContactForm();
  initCookieBanner();
  initModals();
  initLangToggle();
});

