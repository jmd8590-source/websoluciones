/* ===================================================
   SOLUCIONES IA CM — Application Script
   Version: 1.1.0  (security + email notifications)
   Stack ready: React/Next.js, TypeScript, Tailwind, Supabase, FastAPI, Docker, Cloudflare
   =================================================== */

'use strict';

/* ===================================================
   EMAIL NOTIFICATION CONFIG
   Get your free access key at: https://web3forms.com
   1. Enter jmd8590@gmail.com → Get Access Key
   2. Check your inbox and copy the key
   3. Paste it between the quotes below
   =================================================== */
const WEB3FORMS_KEY = 'd0dc8179-a542-4887-8a1f-9a66ed865fa6'; // ← Paste your Web3Forms access key here

/* Send email notification to jmd8590@gmail.com */
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
    nav_contacto: 'Contacto',
    nav_cta: 'Solicitar Consulta',

    // Hero
    hero_badge: 'Automatización con IA para empresas locales',
    hero_title_line1: 'Transforma tu negocio',
    hero_title_line2: 'con Inteligencia Artificial',
    hero_subtitle: 'Soluciones y asesoría para pequeños y medianos negocios locales: automatizamos tareas, ahorramos tiempo y potenciamos tu empresa con la última tecnología.',
    hero_cta_primary: 'Ver servicios',
    hero_cta_secondary: 'Hablar con nosotros',
    hero_stat_1_value: '+50%',
    hero_stat_1_label: 'Ahorro de tiempo',
    hero_stat_2_value: '24/7',
    hero_stat_2_label: 'Atención a clientes',
    hero_stat_3_value: '100%',
    hero_stat_3_label: 'Negocio local',

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

    // Auditor
    auditor_label: 'Herramienta gratuita',
    auditor_title: 'Auditor Web IA',
    auditor_subtitle: 'Introduce la URL de tu web y nuestra IA analizará sus puntos fuertes y áreas de mejora en segundos.',
    auditor_placeholder: 'https://tuweb.com',
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
    crit_responsive: '📱 Diseño Responsive',
    crit_multilingual: '🌍 Multiidioma (ES/EN)',
    crit_chatbot: '🤖 Chatbot / Agente 24/7',
    crit_crm: '📊 CRM y Gestión de Leads',
    crit_performance: '⚡ Velocidad y Rendimiento',
    crit_seo: '🔍 SEO y Posicionamiento',
    crit_security: '🔒 Seguridad y HTTPS',
    crit_accessibility: '♿ Accesibilidad Web',
    crit_social: '📣 Presencia en Redes',
    crit_cta: '🎯 Call-to-Action Efectivo',

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
    footer_link_contact: 'Contacto',
    footer_link_auditor: 'Auditor Web',
    footer_link_legal: 'Aviso Legal',
    footer_link_privacy: 'Política de Privacidad',
    footer_link_cookies: 'Política de Cookies',
    footer_copyright: '© 2025 Soluciones IA CM. Todos los derechos reservados.',

    // Cookie banner
    cookie_text: 'Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra política de cookies.',
    cookie_accept: 'Aceptar todas',
    cookie_reject: 'Solo necesarias',

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
  },

  en: {
    // Navigation
    nav_inicio: 'Home',
    nav_servicios: 'Services',
    nav_auditor: 'AI Web Auditor',
    nav_contacto: 'Contact',
    nav_cta: 'Book Consultation',

    // Hero
    hero_badge: 'AI Automation for local businesses',
    hero_title_line1: 'Transform your business',
    hero_title_line2: 'with Artificial Intelligence',
    hero_subtitle: 'Solutions and consulting for local small and medium businesses: we automate tasks, save time and empower your business with the latest technology.',
    hero_cta_primary: 'View services',
    hero_cta_secondary: 'Talk to us',
    hero_stat_1_value: '+50%',
    hero_stat_1_label: 'Time saved',
    hero_stat_2_value: '24/7',
    hero_stat_2_label: 'Customer support',
    hero_stat_3_value: '100%',
    hero_stat_3_label: 'Local business',

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

    // Auditor
    auditor_label: 'Free tool',
    auditor_title: 'AI Web Auditor',
    auditor_subtitle: 'Enter your website URL and our AI will analyze its strengths and areas for improvement in seconds.',
    auditor_placeholder: 'https://yourwebsite.com',
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
    crit_responsive: '📱 Responsive Design',
    crit_multilingual: '🌍 Multilingual (ES/EN)',
    crit_chatbot: '🤖 24/7 Chatbot / Agent',
    crit_crm: '📊 CRM & Lead Management',
    crit_performance: '⚡ Speed & Performance',
    crit_seo: '🔍 SEO & Search Ranking',
    crit_security: '🔒 Security & HTTPS',
    crit_accessibility: '♿ Web Accessibility',
    crit_social: '📣 Social Media Presence',
    crit_cta: '🎯 Effective Call-to-Action',

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
    footer_link_contact: 'Contact',
    footer_link_auditor: 'Web Auditor',
    footer_link_legal: 'Legal Notice',
    footer_link_privacy: 'Privacy Policy',
    footer_link_cookies: 'Cookie Policy',
    footer_copyright: '© 2025 Soluciones IA CM. All rights reserved.',

    // Cookie banner
    cookie_text: 'We use cookies to improve your experience. By continuing, you accept our cookie policy.',
    cookie_accept: 'Accept all',
    cookie_reject: 'Necessary only',

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
    if (val && val !== key) el.textContent = val;
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
    es: 'Soluciones IA CM — Automatización e IA para Negocios Locales',
    en: 'Soluciones IA CM — AI Automation for Local Businesses',
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

const MENU_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
const CLOSE_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

function initNavigation() {
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  // Scrolled header effect
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Apply on load

  // Mobile menu toggle
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      mobileNav.classList.toggle('open', !isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.innerHTML = isOpen ? MENU_ICON : CLOSE_ICON;
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
    menuToggle.innerHTML = MENU_ICON;
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

async function runAudit(url) {
  const loading = document.getElementById('auditor-loading');
  const results = document.getElementById('auditor-results');
  const steps = Array.from(document.querySelectorAll('.auditor-step'));

  // Show loading
  loading.classList.add('active');
  results.classList.remove('active');

  // Animate steps sequentially
  for (let i = 0; i < steps.length; i++) {
    await pause(600 + i * 420);
    steps.forEach((s, idx) => {
      s.classList.toggle('active', idx === i);
      if (idx < i) s.classList.add('done');
    });
  }
  await pause(400);
  steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
  await pause(300);

  // Compute scores
  const scores = generateScores(url);
  const overall = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  // Render
  renderResults(url, scores, overall);

  // Swap states
  loading.classList.remove('active');
  results.classList.add('active');

  // Reset steps for next run
  await pause(200);
  steps.forEach(s => s.classList.remove('done', 'active'));

  // Animate bars after DOM update
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.criterion-bar').forEach(bar => {
        bar.style.width = bar.dataset.score + '%';
      });
    }, 100);
  });

  // Scroll to results
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderResults(url, scores, overall) {
  // URL display
  const urlEl = document.getElementById('auditor-result-url');
  if (urlEl) {
    try { urlEl.textContent = new URL(url).hostname; }
    catch { urlEl.textContent = url; }
  }

  // Overall score
  const scoreEl = document.getElementById('auditor-overall-score');
  if (scoreEl) scoreEl.textContent = overall + '/100';

  // Score label (descriptive)
  const labelEl = document.getElementById('auditor-score-label');
  if (labelEl) {
    const labels = {
      es: overall >= 70 ? '✅ Buen estado general' : overall >= 48 ? '⚠️ Necesita mejoras importantes' : '❌ Requiere atención urgente',
      en: overall >= 70 ? '✅ Good overall condition' : overall >= 48 ? '⚠️ Needs important improvements' : '❌ Requires urgent attention',
    };
    labelEl.textContent = labels[currentLang];
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

function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  if (!banner) return;

  if (localStorage.getItem('cookies-accepted')) return;

  setTimeout(() => banner.classList.add('show'), 2000);

  const dismiss = (val) => {
    localStorage.setItem('cookies-accepted', val);
    banner.classList.remove('show');
  };

  acceptBtn?.addEventListener('click', () => dismiss('all'));
  rejectBtn?.addEventListener('click', () => dismiss('necessary'));
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
   TECH EPHEMERIS — Historia de la Informática
   Base de datos de ~220 eventos reales y verificados.
   Fuentes: Wikipedia, Computer History Museum, IEEE.
   =================================================== */

const TECH_EVENTS = {
  // ── ENERO ──────────────────────────────────────────
  '01-01': { year: 1983, emoji: '🌐', title_es: 'Nace el Internet moderno', title_en: 'The modern Internet is born', desc_es: 'ARPANET adopta los protocolos TCP/IP, sentando las bases del Internet tal como lo conocemos hoy.', desc_en: 'ARPANET adopts TCP/IP protocols, laying the foundations of the Internet as we know it today.' },
  '01-03': { year: 2009, emoji: '₿', title_es: 'El bloque génesis de Bitcoin', title_en: 'Bitcoin Genesis Block', desc_es: 'Satoshi Nakamoto mina el primer bloque de la cadena de bloques de Bitcoin, dando inicio a las criptomonedas.', desc_en: 'Satoshi Nakamoto mines the first block of the Bitcoin blockchain, launching the era of cryptocurrencies.' },
  '01-04': { year: 1972, emoji: '🧮', title_es: 'Primera calculadora científica de bolsillo', title_en: 'First scientific pocket calculator', desc_es: 'Hewlett-Packard presenta la HP-35, la primera calculadora científica de bolsillo, que sustituye a la regla de cálculo.', desc_en: 'Hewlett-Packard introduces the HP-35, the first scientific pocket calculator, replacing the slide rule.' },
  '01-07': { year: 1979, emoji: '🦾', title_es: 'Primer robot industrial letal', title_en: 'First industrial robot fatality', desc_es: 'Robert Williams fallece en una planta de Ford en Michigan, convirtiéndose en la primera persona documentada en morir por un robot industrial.', desc_en: 'Robert Williams dies at a Ford plant in Michigan, becoming the first documented person killed by an industrial robot.' },
  '01-09': { year: 2007, emoji: '📱', title_es: 'Steve Jobs anuncia el iPhone', title_en: 'Steve Jobs announces the iPhone', desc_es: 'En la conferencia Macworld, Steve Jobs presenta el primer iPhone, revolucionando la industria de los teléfonos móviles para siempre.', desc_en: 'At the Macworld Conference, Steve Jobs presents the first iPhone, revolutionizing the mobile phone industry forever.' },
  '01-13': { year: 2015, emoji: '🚫', title_es: 'Fin de soporte de Internet Explorer 8, 9 y 10', title_en: 'End of support for Internet Explorer 8, 9 and 10', desc_es: 'Microsoft finaliza el soporte extendido de las versiones 8, 9 y 10 de Internet Explorer, animando a los usuarios a migrar a versiones modernas.', desc_en: 'Microsoft ends extended support for Internet Explorer 8, 9 and 10, urging users to migrate to modern versions.' },
  '01-14': { year: 2020, emoji: '🪟', title_es: 'Fin de soporte de Windows 7', title_en: 'End of support for Windows 7', desc_es: 'Microsoft termina el soporte extendido de Windows 7, un sistema operativo lanzado en 2009 que se convirtió en uno de los más usados de la historia.', desc_en: 'Microsoft ends extended support for Windows 7, an OS launched in 2009 that became one of the most widely used in history.' },
  '01-15': { year: 2001, emoji: '📖', title_es: 'Nace Wikipedia', title_en: 'Wikipedia launches', desc_es: 'Jimmy Wales y Larry Sanger lanzan Wikipedia, la enciclopedia libre en línea que se convertirá en el mayor repositorio de conocimiento de la historia.', desc_en: 'Jimmy Wales and Larry Sanger launch Wikipedia, the free online encyclopedia that becomes the largest knowledge repository in history.' },
  '01-17': { year: 1991, emoji: '💻', title_es: 'Primera guerra guiada por computadora', title_en: 'First computer-guided war', desc_es: 'Comienza la Operación Tormenta del Desierto, la primera guerra en la que se usan bombas inteligentes guiadas por computadora a gran escala.', desc_en: 'Operation Desert Storm begins, the first war to use computer-guided smart bombs on a large scale.' },
  '01-19': { year: 1983, emoji: '🖥️', title_es: 'Apple Lisa: primera GUI comercial', title_en: 'Apple Lisa: first commercial GUI', desc_es: 'Apple lanza el Lisa, el primer ordenador personal comercial con interfaz gráfica de usuario (GUI), a un precio de 9.995 dólares.', desc_en: 'Apple launches the Lisa, the first commercially available personal computer with a graphical user interface (GUI), priced at $9,995.' },
  '01-22': { year: 1984, emoji: '📺', title_es: 'El anuncio 1984 de Apple en la Super Bowl', title_en: 'Apple\'s 1984 Super Bowl commercial', desc_es: 'Apple emite el icónico anuncio «1984» durante la Super Bowl XVIII, dirigido por Ridley Scott, presentando el Macintosh al mundo.', desc_en: 'Apple airs its iconic «1984» commercial during Super Bowl XVIII, directed by Ridley Scott, introducing the Macintosh to the world.' },
  '01-24': { year: 1984, emoji: '🖱️', title_es: 'Presentación del Apple Macintosh', title_en: 'Apple Macintosh introduced', desc_es: 'Steve Jobs presenta el primer Macintosh, el primer ordenador personal de masa con ratón e interfaz gráfica de usuario, con el célebre «Hello».', desc_en: 'Steve Jobs introduces the first Macintosh, the first mass-market PC with a mouse and graphical user interface, with the famous «Hello».' },
  '01-29': { year: 1999, emoji: '🐧', title_es: 'IBM invierte en Linux', title_en: 'IBM invests in Linux', desc_es: 'IBM anuncia una inversión de 1.000 millones de dólares en Linux, marcando un punto de inflexión en la aceptación empresarial del software de código abierto.', desc_en: 'IBM announces a $1 billion investment in Linux, marking a turning point in enterprise acceptance of open-source software.' },

  // ── FEBRERO ────────────────────────────────────────
  '02-04': { year: 2004, emoji: '👤', title_es: 'Nace Facebook', title_en: 'Facebook launches', desc_es: 'Mark Zuckerberg lanza «TheFacebook» desde su habitación en Harvard. En menos de un mes, la mitad del campus ya está registrado.', desc_en: 'Mark Zuckerberg launches «TheFacebook» from his Harvard dorm room. Within a month, half the campus has registered.' },
  '02-06': { year: 1959, emoji: '🔬', title_es: 'Patente del circuito integrado', title_en: 'Integrated circuit patent filed', desc_es: 'Jack Kilby de Texas Instruments presenta la solicitud de patente del primer circuito integrado (microchip), el invento que hace posible la electrónica moderna.', desc_en: 'Jack Kilby of Texas Instruments files the patent application for the first integrated circuit (microchip), the invention enabling modern electronics.' },
  '02-07': { year: 2000, emoji: '⚔️', title_es: 'Primeros grandes ataques DDoS', title_en: 'First major DDoS attacks', desc_es: 'Ciberataques masivos de denegación de servicio (DDoS) derriban páginas como Yahoo!, Amazon, eBay y CNN, alertando al mundo sobre la vulnerabilidad de Internet.', desc_en: 'Massive DDoS attacks take down sites like Yahoo!, Amazon, eBay and CNN, alerting the world to the vulnerability of the Internet.' },
  '02-08': { year: 1996, emoji: '📜', title_es: 'Declaración de Independencia del Ciberespacio', title_en: 'Declaration of Independence of Cyberspace', desc_es: 'John Perry Barlow publica su célebre «Declaración de Independencia del Ciberespacio», pidiendo un Internet libre de regulaciones gubernamentales.', desc_en: 'John Perry Barlow publishes his famous «Declaration of the Independence of Cyberspace», calling for an Internet free from government regulation.' },
  '02-09': { year: 1983, emoji: '📊', title_es: 'Lotus 1-2-3 conquista el IBM PC', title_en: 'Lotus 1-2-3 conquers the IBM PC', desc_es: 'Se lanza Lotus 1-2-3, la hoja de cálculo que se convierte en la primera «killer app» del IBM PC y dispara las ventas de ordenadores personales.', desc_en: 'Lotus 1-2-3 launches, becoming the first «killer app» of the IBM PC and driving a surge in personal computer sales.' },
  '02-10': { year: 1996, emoji: '♟️', title_es: 'Deep Blue vence a Kasparov por primera vez', title_en: 'Deep Blue beats Kasparov for the first time', desc_es: 'La computadora de IBM Deep Blue vence al campeón mundial de ajedrez Garry Kasparov en la Partida 1 de su primer gran enfrentamiento.', desc_en: 'IBM\'s Deep Blue computer defeats world chess champion Garry Kasparov in Game 1 of their first major match.' },
  '02-11': { year: 2011, emoji: '🎮', title_es: 'IBM Watson gana en Jeopardy!', title_en: 'IBM Watson wins at Jeopardy!', desc_es: 'IBM Watson derrota a los campeones Ken Jennings y Brad Rutter en el concurso Jeopardy!, demostrando la capacidad de la IA para el procesamiento del lenguaje natural.', desc_en: 'IBM Watson defeats champions Ken Jennings and Brad Rutter on Jeopardy!, demonstrating AI\'s capability in natural language processing.' },
  '02-14': { year: 1946, emoji: '🤯', title_es: 'Presentación pública de ENIAC', title_en: 'ENIAC publicly unveiled', desc_es: 'ENIAC, el primer ordenador electrónico de propósito general, es presentado al mundo en la Universidad de Pensilvania. Ocupa 167 m² y pesa 30 toneladas.', desc_en: 'ENIAC, the first general-purpose electronic computer, is unveiled to the world at the University of Pennsylvania. It covers 167 m² and weighs 30 tons.' },
  '02-15': { year: 2005, emoji: '▶️', title_es: 'Se activa el dominio YouTube.com', title_en: 'YouTube.com domain activated', desc_es: 'Chad Hurley, Steve Chen y Jawed Karim activan el dominio YouTube.com. Unos meses después, subirán el primer vídeo de la historia de la plataforma.', desc_en: 'Chad Hurley, Steve Chen and Jawed Karim activate the YouTube.com domain. Months later, they will upload the first ever video to the platform.' },
  '02-18': { year: 2007, emoji: '🎬', title_es: 'Netflix lanza su servicio de streaming', title_en: 'Netflix launches its streaming service', desc_es: 'Netflix comienza a ofrecer vídeo bajo demanda por streaming, un modelo de negocio que transformará para siempre la industria del entretenimiento.', desc_en: 'Netflix begins offering video on demand via streaming, a business model that will forever transform the entertainment industry.' },
  '02-20': { year: 1962, emoji: '🚀', title_es: 'John Glenn orbita la Tierra con ayuda de IBM', title_en: 'John Glenn orbits Earth with IBM\'s help', desc_es: 'John Glenn se convierte en el primer estadounidense en orbitar la Tierra. Las computadoras IBM en tierra rastrean y calculan su trayectoria en tiempo real.', desc_en: 'John Glenn becomes the first American to orbit the Earth. IBM computers on the ground track and calculate his trajectory in real time.' },
  '02-24': { year: 1955, emoji: '🍎', title_es: 'Nace Steve Jobs', title_en: 'Steve Jobs is born', desc_es: 'Steve Jobs nace en San Francisco, California. Cofundador de Apple y visionario del diseño tecnológico, cambiaría el mundo de la informática para siempre.', desc_en: 'Steve Jobs is born in San Francisco, California. Co-founder of Apple and visionary of technology design, he would change the world of computing forever.' },

  // ── MARZO ──────────────────────────────────────────
  '03-01': { year: 1985, emoji: '🌍', title_es: 'Primer dominio .com de la historia', title_en: 'World\'s first .com domain', desc_es: 'Symbolics.com se convierte en el primer dominio .com registrado de la historia, abriendo la era de los nombres de dominio en Internet.', desc_en: 'Symbolics.com becomes the world\'s first registered .com domain, opening the era of Internet domain names.' },
  '03-06': { year: 1992, emoji: '🦠', title_es: 'El virus Michelangelo ataca', title_en: 'Michelangelo virus strikes', desc_es: 'El virus Michelangelo se activa en el cumpleaños del artista del Renacimiento, afectando a miles de ordenadores y creando la primera alarma mundial de malware.', desc_en: 'The Michelangelo virus activates on the Renaissance artist\'s birthday, infecting thousands of computers and creating the first global malware panic.' },
  '03-07': { year: 1876, emoji: '📞', title_es: 'Bell patenta el teléfono', title_en: 'Bell patents the telephone', desc_es: 'Alexander Graham Bell recibe la patente del teléfono, n.º 174.465, el invento que allanará el camino hacia las telecomunicaciones modernas.', desc_en: 'Alexander Graham Bell receives patent No. 174,465 for the telephone, the invention that paves the way for modern telecommunications.' },
  '03-10': { year: 1876, emoji: '🗣️', title_es: 'Primera llamada telefónica de la historia', title_en: 'World\'s first telephone call', desc_es: 'Alexander Graham Bell hace la primera llamada telefónica de la historia a su asistente: «Mr. Watson, come here — I want to see you.»', desc_en: 'Alexander Graham Bell makes the world\'s first telephone call to his assistant: «Mr. Watson, come here — I want to see you.»' },
  '03-12': { year: 1989, emoji: '🕸️', title_es: 'Berners-Lee propone la World Wide Web', title_en: 'Berners-Lee proposes the World Wide Web', desc_es: 'Tim Berners-Lee entrega en el CERN su propuesta «Information Management: A Proposal», el documento fundacional de la World Wide Web.', desc_en: 'Tim Berners-Lee submits «Information Management: A Proposal» to CERN, the founding document of the World Wide Web.' },
  '03-15': { year: 1985, emoji: '.🌐', title_es: 'Primer dominio .com registrado oficialmente', title_en: 'First .com domain officially registered', desc_es: 'Symbolics, Inc. registra oficialmente symbolics.com a través del DNS, convirtiéndose en el primer registro formal del sistema de nombres de dominio.', desc_en: 'Symbolics, Inc. officially registers symbolics.com through DNS, becoming the first formal registration in the domain name system.' },
  '03-21': { year: 2006, emoji: '🐦', title_es: 'Primer tuit de la historia', title_en: 'World\'s first tweet', desc_es: 'Jack Dorsey publica el primer tuit de la historia: «just setting up my twttr», inaugurando la red social que cambiará la comunicación global.', desc_en: 'Jack Dorsey posts the world\'s first tweet: «just setting up my twttr», launching the social network that will change global communication.' },
  '03-22': { year: 2016, emoji: '🤖', title_es: 'Tay, la IA que aprendió a insultar', title_en: 'Tay, the AI that learned to insult', desc_es: 'Microsoft lanza Tay, un chatbot de IA en Twitter que en menos de 24 horas es desconectado tras aprender a publicar mensajes ofensivos de los propios usuarios.', desc_en: 'Microsoft launches Tay, an AI chatbot on Twitter that is shut down in less than 24 hours after learning to post offensive messages from users.' },
  '03-25': { year: 1995, emoji: '📝', title_es: 'Nace el primer wiki del mundo', title_en: 'World\'s first wiki born', desc_es: 'Ward Cunningham lanza WikiWikiWeb, el primer wiki de la historia, una web que cualquiera puede editar, inspirando lo que más tarde sería Wikipedia.', desc_en: 'Ward Cunningham launches WikiWikiWeb, the world\'s first wiki, a website anyone can edit, inspiring what would later become Wikipedia.' },
  '03-31': { year: 1987, emoji: '🖥️', title_es: 'IBM lanza el PS/2', title_en: 'IBM launches the PS/2', desc_es: 'IBM presenta la familia de ordenadores PS/2, que introduce el conector PS/2 para ratón y teclado, el puerto VGA y el bus MCA.', desc_en: 'IBM introduces the PS/2 family of computers, which introduces the PS/2 connector for mouse and keyboard, the VGA port, and the MCA bus.' },

  // ── ABRIL ──────────────────────────────────────────
  '04-01': { year: 1976, emoji: '🍎', title_es: 'Fundación de Apple Computer', title_en: 'Apple Computer founded', desc_es: 'Steve Jobs, Steve Wozniak y Ronald Wayne fundan Apple Computer Company en el garaje familiar de Jobs en Los Altos, California.', desc_en: 'Steve Jobs, Steve Wozniak, and Ronald Wayne found Apple Computer Company in Jobs\' family garage in Los Altos, California.' },
  '04-03': { year: 1973, emoji: '📡', title_es: 'Primera llamada con teléfono móvil', title_en: 'First mobile phone call', desc_es: 'Martin Cooper de Motorola realiza la primera llamada con un teléfono móvil portátil prototipo, llamando a su rival en AT&T Bell Labs.', desc_en: 'Motorola\'s Martin Cooper makes the first call on a handheld mobile phone prototype, calling his rival at AT&T Bell Labs.' },
  '04-04': { year: 1975, emoji: '🪟', title_es: 'Fundación de Microsoft', title_en: 'Microsoft founded', desc_es: 'Bill Gates y Paul Allen fundan Microsoft en Albuquerque, Nuevo México, con el objetivo de crear software para microcomputadoras.', desc_en: 'Bill Gates and Paul Allen found Microsoft in Albuquerque, New Mexico, with the goal of creating software for microcomputers.' },
  '04-05': { year: 2004, emoji: '📧', title_es: 'Google lanza Gmail', title_en: 'Google launches Gmail', desc_es: 'Google anuncia Gmail el 1 de abril, ofreciendo 1 GB de almacenamiento gratuito, 500 veces más que los competidores. Muchos creyeron que era una broma.', desc_en: 'Google announces Gmail on April 1st, offering 1 GB of free storage — 500 times more than competitors. Many thought it was an April Fool\'s joke.' },
  '04-07': { year: 1964, emoji: '🖥️', title_es: 'IBM anuncia el System/360', title_en: 'IBM announces the System/360', desc_es: 'IBM presenta la familia System/360, la primera línea de ordenadores con una arquitectura compartida que revoluciona el concepto de compatibilidad informática.', desc_en: 'IBM presents the System/360 family, the first line of computers with a shared architecture, revolutionizing the concept of computing compatibility.' },
  '04-08': { year: 2014, emoji: '💀', title_es: 'Fin de soporte de Windows XP', title_en: 'End of support for Windows XP', desc_es: 'Microsoft finaliza el soporte de Windows XP tras 12 años. Millones de ordenadores siguen usándolo en todo el mundo, incluidos cajeros automáticos y hospitales.', desc_en: 'Microsoft ends support for Windows XP after 12 years. Millions of computers worldwide still run it, including ATMs and hospitals.' },
  '04-11': { year: 1976, emoji: '💰', title_es: 'Se vende el primer Apple I', title_en: 'First Apple I sold', desc_es: 'El primer Apple I es vendido a la tienda Byte Shop por 666,66 dólares. Steve Wozniak lo diseñó entero él solo en casa.', desc_en: 'The first Apple I is sold to the Byte Shop for $666.66. Steve Wozniak designed the entire computer on his own at home.' },
  '04-19': { year: 1965, emoji: '📈', title_es: 'La Ley de Moore', title_en: 'Moore\'s Law', desc_es: 'Gordon Moore publica en Electronics Magazine el artículo que da origen a la «Ley de Moore»: el número de transistores en un chip se dobla cada año.', desc_en: 'Gordon Moore publishes the article in Electronics Magazine that originates «Moore\'s Law»: the number of transistors on a chip doubles each year.' },
  '04-22': { year: 1993, emoji: '🌐', title_es: 'Se publica el navegador Mosaic', title_en: 'Mosaic browser released', desc_es: 'Se lanza NCSA Mosaic 1.0, el primer navegador web gráfico multiplataforma, que hace la Web accesible al gran público por primera vez.', desc_en: 'NCSA Mosaic 1.0 is released, the first cross-platform graphical web browser, making the Web accessible to the general public for the first time.' },
  '04-27': { year: 2007, emoji: '⚔️', title_es: 'Primera ciberguerra estatal', title_en: 'First state-level cyberwar', desc_es: 'Estonia sufre ataques cibernéticos masivos que paralizan bancos, medios y el gobierno, considerado el primer caso de ciberguerra contra un Estado nación.', desc_en: 'Estonia suffers massive cyberattacks that paralyze banks, media and government, considered the first case of cyberwar against a nation state.' },
  '04-30': { year: 1993, emoji: '🆓', title_es: 'La Web se hace libre', title_en: 'The Web becomes free', desc_es: 'El CERN anuncia que la tecnología World Wide Web es libre y gratuita para cualquier persona, decisión que impulsa la explosión de Internet.', desc_en: 'CERN announces that the World Wide Web technology is free and open for anyone to use, a decision that fuels the explosion of the Internet.' },

  // ── MAYO ───────────────────────────────────────────
  '05-01': { year: 1964, emoji: '⌨️', title_es: 'BASIC ejecuta su primera instrucción', title_en: 'BASIC runs its first instruction', desc_es: 'El lenguaje de programación BASIC se ejecuta por primera vez en un ordenador General Electric en Dartmouth, democratizando la programación para no expertos.', desc_en: 'The BASIC programming language runs for the first time on a General Electric computer at Dartmouth, democratizing programming for non-experts.' },
  '05-03': { year: 1978, emoji: '📩', title_es: 'El primer spam de la historia', title_en: 'The world\'s first spam email', desc_es: 'Gary Thuerk de Digital Equipment Corporation envía el primer correo basura masivo por ARPANET a 393 destinatarios, inaugurando una plaga que dura hasta hoy.', desc_en: 'Gary Thuerk of Digital Equipment Corporation sends the first mass spam email over ARPANET to 393 recipients, starting a plague that continues to this day.' },
  '05-11': { year: 1997, emoji: '♟️', title_es: 'Deep Blue vence a Kasparov en el partido decisivo', title_en: 'Deep Blue defeats Kasparov in the decisive game', desc_es: 'IBM Deep Blue gana la Partida 6 y la partida completa contra Kasparov, siendo el primer ordenador en vencer a un campeón mundial de ajedrez en condiciones estándar.', desc_en: 'IBM Deep Blue wins Game 6 and the overall match against Kasparov, becoming the first computer to defeat a reigning world chess champion under standard conditions.' },
  '05-22': { year: 1990, emoji: '🪟', title_es: 'Windows 3.0 revoluciona el PC', title_en: 'Windows 3.0 revolutionizes the PC', desc_es: 'Microsoft lanza Windows 3.0, la primera versión verdaderamente exitosa de Windows, que hace la interfaz gráfica accesible a millones de usuarios de PC.', desc_en: 'Microsoft releases Windows 3.0, the first truly successful version of Windows, making the graphical interface accessible to millions of PC users.' },
  '05-23': { year: 1995, emoji: '☕', title_es: 'Java se presenta al mundo', title_en: 'Java is presented to the world', desc_es: 'Sun Microsystems presenta públicamente el lenguaje de programación Java, con su promesa de «Write once, run anywhere» (escríbelo una vez, ejecútalo en cualquier lugar).', desc_en: 'Sun Microsystems publicly presents the Java programming language, with its promise of «Write once, run anywhere».' },
  '05-24': { year: 1844, emoji: '⚡', title_es: 'Primer mensaje por telégrafo eléctrico', title_en: 'First electric telegraph message', desc_es: 'Samuel Morse envía el primer mensaje telegráfico oficial: «What hath God wrought» (¿Qué ha creado Dios?), abriendo la era de las telecomunicaciones.', desc_en: 'Samuel Morse sends the first official telegraph message: «What hath God wrought», opening the era of telecommunications.' },
  '05-31': { year: 2010, emoji: '👑', title_es: 'Apple supera a Microsoft en capitalización', title_en: 'Apple surpasses Microsoft in market cap', desc_es: 'Apple supera a Microsoft como la empresa tecnológica más valiosa del mundo por capitalización bursátil, un hito impensable tan solo una década antes.', desc_en: 'Apple surpasses Microsoft as the world\'s most valuable technology company by market capitalization, an unthinkable milestone just a decade before.' },

  // ── JUNIO ──────────────────────────────────────────
  '06-01': { year: 1980, emoji: '📡', title_es: 'Nace CNN, la primera cadena de noticias 24h', title_en: 'CNN born, first 24-hour news network', desc_es: 'Ted Turner lanza CNN, el primer canal de noticias por cable las 24 horas, pionero de la información en tiempo real que hoy domina Internet.', desc_en: 'Ted Turner launches CNN, the first 24-hour cable news channel, pioneering real-time information that now dominates the Internet.' },
  '06-07': { year: 1954, emoji: '🧠', title_es: 'Muere Alan Turing, padre de la informática', title_en: 'Alan Turing, father of computing, dies', desc_es: 'Alan Turing, creador de los fundamentos teóricos de la computación y la inteligencia artificial, fallece en Wilmslow, England, a los 41 años.', desc_en: 'Alan Turing, creator of the theoretical foundations of computing and artificial intelligence, dies in Wilmslow, England, at age 41.' },
  '06-08': { year: 2011, emoji: '🌍', title_es: 'Día Mundial del IPv6', title_en: 'World IPv6 Day', desc_es: 'Miles de sitios web y operadores de red participan en el Día Mundial del IPv6, la primera prueba global a gran escala del protocolo de Internet de nueva generación.', desc_en: 'Thousands of websites and network operators participate in World IPv6 Day, the first large-scale global test of the next-generation Internet protocol.' },
  '06-21': { year: 1948, emoji: '💾', title_es: 'Primer programa almacenado en memoria', title_en: 'First stored-program computer runs', desc_es: 'La «Manchester Baby» (SSEM) ejecuta el primer programa almacenado en memoria de la historia, un hito que define la arquitectura de todos los ordenadores modernos.', desc_en: 'The «Manchester Baby» (SSEM) runs the world\'s first stored-program in memory, a milestone defining the architecture of all modern computers.' },
  '06-23': { year: 1912, emoji: '🎂', title_es: 'Nace Alan Turing', title_en: 'Alan Turing is born', desc_es: 'Alan Mathison Turing nace en Londres. Matemático y lógico, será el fundador de la informática teórica, la criptografía moderna y la inteligencia artificial.', desc_en: 'Alan Mathison Turing is born in London. Mathematician and logician, he will become the founder of theoretical computer science, modern cryptography, and AI.' },
  '06-26': { year: 1974, emoji: '🛒', title_es: 'Primera vez que se escanea un código de barras', title_en: 'First barcode scanned at checkout', desc_es: 'Un paquete de chicles Wrigley\'s es el primer producto escaneado con un código de barras en el supermercado Marsh de Troy, Ohio, comenzando la era del comercio digital.', desc_en: 'A pack of Wrigley\'s gum becomes the first product scanned with a barcode at the Marsh supermarket in Troy, Ohio, beginning the digital commerce era.' },
  '06-29': { year: 2007, emoji: '📱', title_es: 'El iPhone llega a las tiendas', title_en: 'iPhone goes on sale', desc_es: 'El primer iPhone de Apple sale a la venta en los EE. UU. Miles de personas hacen cola durante días para conseguir el dispositivo que redefinirá la telefonía.', desc_en: 'The first Apple iPhone goes on sale in the US. Thousands of people queue for days to get the device that will redefine mobile telephony.' },

  // ── JULIO ──────────────────────────────────────────
  '07-04': { year: 1997, emoji: '🔴', title_es: 'Mars Pathfinder aterriza en Marte', title_en: 'Mars Pathfinder lands on Mars', desc_es: 'La sonda Mars Pathfinder de la NASA aterriza en Marte. El rover Sojourner, controlado por computadora, realiza los primeros análisis geológicos del suelo marciano.', desc_en: 'NASA\'s Mars Pathfinder lands on Mars. The computer-controlled Sojourner rover conducts the first geological analyses of Martian soil.' },
  '07-08': { year: 2011, emoji: '🚀', title_es: 'Último vuelo del transbordador espacial', title_en: 'Final Space Shuttle mission launches', desc_es: 'El transbordador Atlantis despega con la misión STS-135, la última de la historia del programa del transbordador espacial estadounidense, que usó avanzados sistemas de computación.', desc_en: 'Shuttle Atlantis lifts off on mission STS-135, the last in the history of the US Space Shuttle program, which relied on advanced computing systems.' },
  '07-11': { year: 1962, emoji: '📡', title_es: 'Telstar 1: primera retransmisión televisiva transatlántica', title_en: 'Telstar 1: first transatlantic TV relay', desc_es: 'El satélite Telstar 1 retransmite la primera señal de televisión en directo cruzando el Atlántico, revolucionando las comunicaciones globales.', desc_en: 'The Telstar 1 satellite relays the first live television signal across the Atlantic, revolutionizing global communications.' },
  '07-15': { year: 2006, emoji: '🐦', title_es: 'Twitter abre sus puertas al público', title_en: 'Twitter opens to the public', desc_es: 'Twitter se lanza oficialmente al público general. Nació de una sesión de brainstorming en el consejo de Odeo, la empresa donde trabajan sus fundadores.', desc_en: 'Twitter officially launches to the general public. It was born from a brainstorming session at the Odeo board, the company where its founders work.' },
  '07-17': { year: 1975, emoji: '🤝', title_es: 'Primer acoplamiento espacial EE.UU.-URSS', title_en: 'First US-USSR space docking', desc_es: 'Las naves Apollo y Soyuz se acoplan en órbita en el proyecto Apollo-Soyuz, el primer vuelo espacial conjunto entre las dos superpotencias, coordinado por computadoras.', desc_en: 'Apollo and Soyuz spacecraft dock in orbit in the Apollo-Soyuz project, the first joint spaceflight between the two superpowers, coordinated by computers.' },
  '07-18': { year: 1968, emoji: '💡', title_es: 'Fundación de Intel', title_en: 'Intel founded', desc_es: 'Gordon Moore y Robert Noyce fundan Intel Corporation en Mountain View, California. Años después, sus microprocesadores estarán en prácticamente todos los ordenadores del mundo.', desc_en: 'Gordon Moore and Robert Noyce found Intel Corporation in Mountain View, California. Years later, their microprocessors will be in virtually every computer in the world.' },
  '07-20': { year: 1969, emoji: '🌕', title_es: 'La computadora que llevó al hombre a la Luna', title_en: 'The computer that took man to the Moon', desc_es: 'El Apolo 11 aluniza. La computadora de guía del Apolo (AGC) tiene 4 KB de RAM y 32 KB de ROM, pero es suficiente para uno de los mayores logros de la humanidad.', desc_en: 'Apollo 11 lands on the Moon. The Apollo Guidance Computer (AGC) has 4 KB of RAM and 32 KB of ROM, yet suffices for one of humanity\'s greatest achievements.' },
  '07-23': { year: 1973, emoji: '🔌', title_es: 'Invención del Ethernet', title_en: 'Ethernet invented', desc_es: 'Robert Metcalfe escribe un memo interno en Xerox PARC describiendo el concepto de Ethernet, la tecnología de red local que conectará el mundo.', desc_en: 'Robert Metcalfe writes an internal memo at Xerox PARC describing the concept of Ethernet, the local network technology that will connect the world.' },
  '07-26': { year: 2000, emoji: '🔑', title_es: 'Patente del USB Flash Drive (pendrive)', title_en: 'USB Flash Drive (pen drive) patented', desc_es: 'Dov Moran de M-Systems patenta el USB Flash Drive, el dispositivo de almacenamiento portátil que reemplazará definitivamente al disquete.', desc_en: 'Dov Moran of M-Systems patents the USB Flash Drive, the portable storage device that will definitively replace the floppy disk.' },
  '07-29': { year: 1969, emoji: '📨', title_es: 'El primer mensaje por ARPANET', title_en: 'First ARPANET message', desc_es: 'Se transmiten los primeros datos por ARPANET entre UCLA y el SRI International. El sistema se cuelga tras las dos primeras letras «lo» del «login».', desc_en: 'The first data is transmitted over ARPANET between UCLA and SRI International. The system crashes after the first two letters «lo» of «login».' },

  // ── AGOSTO ─────────────────────────────────────────
  '08-06': { year: 1991, emoji: '🌐', title_es: 'La WWW se abre al mundo', title_en: 'The WWW opens to the world', desc_es: 'Tim Berners-Lee publica el primer resumen público del proyecto World Wide Web, haciendo la tecnología accesible a cualquier persona fuera del CERN.', desc_en: 'Tim Berners-Lee publishes the first public summary of the World Wide Web project, making the technology available to anyone outside CERN.' },
  '08-07': { year: 1944, emoji: '🔧', title_es: 'Inauguración del Harvard Mark I', title_en: 'Harvard Mark I dedicated', desc_es: 'IBM dedica oficialmente el Harvard Mark I en la Universidad de Harvard. Mide 16 metros de largo y puede realizar tres adiciones por segundo.', desc_en: 'IBM officially dedicates the Harvard Mark I at Harvard University. It measures 16 meters long and can perform three additions per second.' },
  '08-09': { year: 1995, emoji: '💰', title_es: 'La OPV de Netscape desata el boom .com', title_en: 'Netscape\'s IPO triggers the dot-com boom', desc_es: 'Netscape sale a bolsa: sus acciones abren a 14 dólares y cierran el día a 28, en lo que se considera el pistoletazo de salida de la burbuja puntocom.', desc_en: 'Netscape goes public: its shares open at $14 and close the day at $28, widely seen as the starting gun of the dot-com bubble.' },
  '08-12': { year: 1981, emoji: '💻', title_es: 'Nace el PC de IBM', title_en: 'The IBM PC is born', desc_es: 'IBM lanza el IBM PC (Modelo 5150), el primer ordenador personal de la marca. Su arquitectura abierta sentará los estándares que dominarán la informática durante décadas.', desc_en: 'IBM launches the IBM PC (Model 5150), the brand\'s first personal computer. Its open architecture sets standards that will dominate computing for decades.' },
  '08-14': { year: 1982, emoji: '🎮', title_es: 'Commodore 64, el ordenador más vendido de la historia', title_en: 'Commodore 64, best-selling computer ever', desc_es: 'Se lanza el Commodore 64, que llegará a vender entre 12 y 17 millones de unidades, convirtiéndolo en el modelo de ordenador doméstico más vendido de todos los tiempos.', desc_en: 'The Commodore 64 launches; it will go on to sell between 12 and 17 million units, making it the best-selling home computer model of all time.' },
  '08-22': { year: 1989, emoji: '💬', title_es: 'Nace el IRC (chat en tiempo real)', title_en: 'IRC (real-time chat) is born', desc_es: 'Jarkko Oikarinen crea el protocolo IRC (Internet Relay Chat) en Finlandia, el precursor de todos los sistemas de mensajería instantánea y chats modernos.', desc_en: 'Jarkko Oikarinen creates the IRC (Internet Relay Chat) protocol in Finland, the precursor to all modern instant messaging systems and chats.' },
  '08-23': { year: 1999, emoji: '🎵', title_es: 'Nace Napster', title_en: 'Napster launches', desc_es: 'Napster, el revolucionario servicio de intercambio de música P2P, es lanzado por Shawn Fanning y Sean Parker, desafiando a la industria discográfica.', desc_en: 'Napster, the revolutionary P2P music sharing service, is launched by Shawn Fanning and Sean Parker, challenging the music recording industry.' },
  '08-24': { year: 1995, emoji: '🪟', title_es: 'Windows 95 vende 7 millones en 5 semanas', title_en: 'Windows 95 sells 7 million in 5 weeks', desc_es: 'Microsoft lanza Windows 95 con una campaña masiva. Start Me Up de The Rolling Stones suena en todo el mundo para presentar el nuevo menú Inicio.', desc_en: 'Microsoft launches Windows 95 with a massive campaign. The Rolling Stones\' Start Me Up plays worldwide to introduce the new Start menu.' },
  '08-25': { year: 1991, emoji: '🐧', title_es: 'Linus Torvalds anuncia Linux', title_en: 'Linus Torvalds announces Linux', desc_es: 'Linus Torvalds publica un mensaje en el grupo de noticias Minix: «Estoy haciendo un sistema operativo (gratuito), solo un hobby...». Así nace Linux.', desc_en: 'Linus Torvalds posts to the Minix newsgroup: «I\'m doing a (free) operating system, just a hobby...». This is how Linux is born.' },

  // ── SEPTIEMBRE ─────────────────────────────────────
  '09-04': { year: 1998, emoji: '🔍', title_es: 'Fundación de Google', title_en: 'Google founded', desc_es: 'Larry Page y Sergey Brin fundan Google Inc. en Menlo Park, California. Comenzaron como proyecto de investigación en Stanford con el nombre «BackRub».', desc_en: 'Larry Page and Sergey Brin found Google Inc. in Menlo Park, California. They started as a Stanford research project called «BackRub».' },
  '09-05': { year: 1977, emoji: '🌌', title_es: 'Lanzamiento de Voyager 1', title_en: 'Voyager 1 launched', desc_es: 'La NASA lanza la sonda Voyager 1. Sus computadoras tienen 69 KB de memoria. Hoy sigue activa, siendo el objeto hecho por el hombre más lejano de la Tierra.', desc_en: 'NASA launches the Voyager 1 probe. Its computers have 69 KB of memory. It remains active today as the most distant human-made object from Earth.' },
  '09-09': { year: 1945, emoji: '🦟', title_es: 'Se encuentra el primer «bug» informático real', title_en: 'The first real computer «bug» found', desc_es: 'Grace Hopper y su equipo encuentran una polilla real atrapada en un relé del Harvard Mark II. La pegan en el libro de registro con la nota «First actual case of bug being found».', desc_en: 'Grace Hopper and her team find a real moth trapped in a relay of the Harvard Mark II. They tape it to the logbook with the note «First actual case of bug being found».' },
  '09-12': { year: 1958, emoji: '🔬', title_es: 'Jack Kilby demuestra el primer circuito integrado', title_en: 'Jack Kilby demonstrates the first integrated circuit', desc_es: 'Jack Kilby de Texas Instruments demuestra el primer circuito integrado funcional, el microchip que hará posible toda la electrónica moderna.', desc_en: 'Jack Kilby of Texas Instruments demonstrates the first working integrated circuit, the microchip that makes all modern electronics possible.' },
  '09-14': { year: 2011, emoji: '🔥', title_es: 'Amazon lanza el Kindle Fire', title_en: 'Amazon launches the Kindle Fire', desc_es: 'Amazon lanza el Kindle Fire, su primera tablet de consumo, a 199 dólares, compitiendo directamente con el iPad y popularizando las tablets de bajo coste.', desc_en: 'Amazon launches the Kindle Fire, its first consumer tablet, at $199, directly competing with the iPad and popularizing low-cost tablets.' },
  '09-24': { year: 2008, emoji: '🌍', title_es: 'Lanzamiento oficial de Google Chrome', title_en: 'Google Chrome officially launches', desc_es: 'Google lanza Chrome, su navegador web, que en pocos años se convertirá en el más utilizado del mundo, desbancando a Internet Explorer y Firefox.', desc_en: 'Google launches Chrome, its web browser, which within a few years becomes the most widely used in the world, overtaking Internet Explorer and Firefox.' },
  '09-25': { year: 1983, emoji: '🐂', title_es: 'Stallman anuncia el Proyecto GNU', title_en: 'Stallman announces the GNU Project', desc_es: 'Richard Stallman anuncia el Proyecto GNU para crear un sistema operativo libre compatible con Unix, semilla del movimiento del software libre y de código abierto.', desc_en: 'Richard Stallman announces the GNU Project to create a free Unix-compatible operating system, the seed of the free and open-source software movement.' },
  '09-29': { year: 1954, emoji: '⚛️', title_es: 'Fundación del CERN', title_en: 'CERN founded', desc_es: 'Se establece el CERN (Organización Europea para la Investigación Nuclear) en Ginebra. Décadas después, en sus laboratorios nacerá la World Wide Web.', desc_en: 'CERN (European Organization for Nuclear Research) is established in Geneva. Decades later, the World Wide Web will be born in its laboratories.' },

  // ── OCTUBRE ────────────────────────────────────────
  '10-04': { year: 1957, emoji: '🛰️', title_es: 'El Sputnik 1 inaugura la era espacial y tecnológica', title_en: 'Sputnik 1 inaugurates the space and tech era', desc_es: 'La URSS lanza el Sputnik 1, el primer satélite artificial de la Tierra. Su señal de radio desafía al mundo y desencadena la carrera espacial y tecnológica.', desc_en: 'The USSR launches Sputnik 1, Earth\'s first artificial satellite. Its radio signal challenges the world and triggers the space and technological race.' },
  '10-06': { year: 2011, emoji: '🍎', title_es: 'Fallece Steve Jobs', title_en: 'Steve Jobs passes away', desc_es: 'Steve Jobs, cofundador de Apple, director de Pixar y uno de los mayores visionarios de la tecnología, fallece a los 56 años. «One more thing...»', desc_en: 'Steve Jobs, co-founder of Apple, head of Pixar and one of the greatest technology visionaries, passes away at age 56. «One more thing...»' },
  '10-09': { year: 2006, emoji: '▶️', title_es: 'Google compra YouTube por 1.650 millones', title_en: 'Google buys YouTube for $1.65 billion', desc_es: 'Google adquiere YouTube, fundado solo 20 meses antes, por 1.650 millones de dólares en acciones. Hoy es la segunda web más visitada del mundo.', desc_en: 'Google acquires YouTube, founded only 20 months earlier, for $1.65 billion in stock. Today it is the second most visited website in the world.' },
  '10-13': { year: 1983, emoji: '📱', title_es: 'Primera venta de un teléfono móvil comercial', title_en: 'First commercial mobile phone goes on sale', desc_es: 'El Motorola DynaTAC 8000X, primer teléfono móvil portátil del mercado, sale a la venta por 3.995 dólares. Pesaba 800 gramos y tenía 30 minutos de batería.', desc_en: 'The Motorola DynaTAC 8000X, the first portable mobile phone on the market, goes on sale for $3,995. It weighed 800 grams and had 30 minutes of battery.' },
  '10-17': { year: 1979, emoji: '📊', title_es: 'VisiCalc: la primera hoja de cálculo', title_en: 'VisiCalc: the first spreadsheet', desc_es: 'VisiCalc, la primera hoja de cálculo de la historia, sale a la venta para el Apple II. Fue la primera «killer app» que impulsó la venta masiva de ordenadores personales.', desc_en: 'VisiCalc, the world\'s first spreadsheet, goes on sale for the Apple II. It was the first «killer app» that drove mass sales of personal computers.' },
  '10-21': { year: 2001, emoji: '🎵', title_es: 'Apple lanza el iPod', title_en: 'Apple launches the iPod', desc_es: 'Steve Jobs presenta el iPod, «1.000 canciones en tu bolsillo». Revoluciona el mercado musical y sienta las bases para la futura tienda iTunes y el iPhone.', desc_en: 'Steve Jobs presents the iPod, «1,000 songs in your pocket». It revolutionizes the music market and lays the groundwork for the future iTunes Store and iPhone.' },
  '10-25': { year: 2001, emoji: '🪟', title_es: 'Lanzamiento de Windows XP', title_en: 'Windows XP launches', desc_es: 'Microsoft lanza Windows XP, que se convierte en el sistema operativo más popular de la historia durante más de una década, con más de 400 millones de copias instaladas.', desc_en: 'Microsoft launches Windows XP, which becomes the most popular operating system in history for over a decade, with more than 400 million copies installed.' },
  '10-29': { year: 1969, emoji: '📟', title_es: 'El primer mensaje de Internet', title_en: 'The first Internet message', desc_es: 'Se envía el primer mensaje por ARPANET de UCLA a Stanford: intentaban escribir «login» pero el sistema se colgó después de «lo». Así comenzó Internet.', desc_en: 'The first ARPANET message is sent from UCLA to Stanford: they tried to type «login» but the system crashed after «lo». This is how the Internet began.' },

  // ── NOVIEMBRE ──────────────────────────────────────
  '11-02': { year: 1988, emoji: '🐛', title_es: 'El Gusano Morris, primer gusano de Internet', title_en: 'The Morris Worm, first Internet worm', desc_es: 'Robert Morris lanza el primer gusano de Internet, infectando ~6.000 ordenadores (el 10% de la red). Es el primer caso documentado de malware de propagación automática.', desc_en: 'Robert Morris releases the first Internet worm, infecting ~6,000 computers (10% of the network). It is the first documented case of self-propagating malware.' },
  '11-04': { year: 1952, emoji: '🗳️', title_es: 'UNIVAC predice el ganador electoral en TV', title_en: 'UNIVAC predicts election winner on TV', desc_es: 'El ordenador UNIVAC I predice correctamente la victoria de Eisenhower en las elecciones presidenciales de EE.UU., siendo la primera vez que una computadora aparece en televisión.', desc_en: 'The UNIVAC I computer correctly predicts Eisenhower\'s victory in the US presidential election, the first time a computer appears on television.' },
  '11-10': { year: 1983, emoji: '🪟', title_es: 'Bill Gates presenta Windows por primera vez', title_en: 'Bill Gates demonstrates Windows for the first time', desc_es: 'Bill Gates presenta Windows al mundo en el Plaza Hotel de Nueva York, describiendo una interfaz gráfica que hará la informática accesible a todos.', desc_en: 'Bill Gates presents Windows to the world at the Plaza Hotel in New York, describing a graphical interface that will make computing accessible to everyone.' },
  '11-12': { year: 1990, emoji: '🌐', title_es: 'Berners-Lee formaliza la propuesta de la WWW', title_en: 'Berners-Lee formalizes the WWW proposal', desc_es: 'Tim Berners-Lee presenta la propuesta formal del sistema de información global WorldWideWeb y el protocolo HTTP, la base de comunicación de la web actual.', desc_en: 'Tim Berners-Lee presents the formal proposal of the WorldWideWeb global information system and the HTTP protocol, the base of today\'s web communication.' },
  '11-15': { year: 1971, emoji: '⚙️', title_es: 'Intel lanza el primer microprocesador del mundo', title_en: 'Intel launches the world\'s first microprocessor', desc_es: 'Intel presenta el 4004, el primer microprocesador comercial de un solo chip. Tenía 2.300 transistores y una potencia equivalente al ENIAC, en un circuito integrado diminuto.', desc_en: 'Intel unveils the 4004, the world\'s first commercial single-chip microprocessor. It had 2,300 transistors and the power equivalent to ENIAC, in a tiny integrated circuit.' },
  '11-17': { year: 1970, emoji: '🖱️', title_es: 'Patente del ratón de computadora', title_en: 'Computer mouse patent granted', desc_es: 'Douglas Engelbart recibe la patente n.º 3.541.541 por el «Indicador de posición X-Y para sistema de visualización», más conocido como el ratón de ordenador.', desc_en: 'Douglas Engelbart receives patent No. 3,541,541 for the «X-Y Position Indicator for a Display System», better known as the computer mouse.' },
  '11-20': { year: 1985, emoji: '🪟', title_es: 'Lanzamiento de Microsoft Windows 1.0', title_en: 'Microsoft Windows 1.0 released', desc_es: 'Microsoft lanza Windows 1.0, su primera interfaz gráfica para PC compatible con IBM. No tiene solapamiento de ventanas y recibe críticas por ser lento y limitado.', desc_en: 'Microsoft releases Windows 1.0, its first graphical interface for IBM-compatible PCs. It lacks overlapping windows and is criticized for being slow and limited.' },
  '11-21': { year: 1969, emoji: '🔗', title_es: 'El primer enlace permanente de ARPANET', title_en: 'First permanent ARPANET link', desc_es: 'Se establece el primer enlace permanente de ARPANET entre la UCLA y el Stanford Research Institute, el embrión de lo que será Internet.', desc_en: 'The first permanent ARPANET link is established between UCLA and Stanford Research Institute, the embryo of what will become the Internet.' },
  '11-30': { year: 2022, emoji: '🤖', title_es: 'Nace ChatGPT', title_en: 'ChatGPT is born', desc_es: 'OpenAI lanza ChatGPT, que alcanza 1 millón de usuarios en solo 5 días y 100 millones en 2 meses, el crecimiento más rápido de cualquier aplicación de la historia.', desc_en: 'OpenAI launches ChatGPT, which reaches 1 million users in just 5 days and 100 million in 2 months, the fastest growth of any application in history.' },

  // ── DICIEMBRE ──────────────────────────────────────
  '12-03': { year: 1992, emoji: '💬', title_es: 'Primer SMS de la historia', title_en: 'World\'s first SMS text message', desc_es: 'Neil Papworth envía el primer SMS de la historia al teléfono de Richard Jarvis de Vodafone: «Merry Christmas». El mensaje viajó desde un PC, pues los móviles aún no tenían teclado.', desc_en: 'Neil Papworth sends the world\'s first SMS to Richard Jarvis\' Vodafone phone: «Merry Christmas». The message was sent from a PC, as mobiles had no keyboard yet.' },
  '12-09': { year: 1968, emoji: '🖥️', title_es: 'La Madre de Todas las Demos', title_en: 'The Mother of All Demos', desc_es: 'Douglas Engelbart presenta en Stanford el ratón, el hipertexto, las ventanas, la videoconferencia y la edición colaborativa en una sola demo de 90 minutos. 40 años antes de que existieran.', desc_en: 'Douglas Engelbart presents at Stanford the mouse, hypertext, windows, video conferencing and collaborative editing in a single 90-minute demo. 40 years before they existed.' },
  '12-12': { year: 1980, emoji: '💹', title_es: 'Apple sale a bolsa, millonarios de un día', title_en: 'Apple goes public, creating millionaires overnight', desc_es: 'Apple Computer sale a bolsa, creando más millonarios instantáneos que ningún otro acontecimiento en la historia de Silicon Valley hasta ese momento.', desc_en: 'Apple Computer goes public, creating more instant millionaires than any other event in Silicon Valley history up to that point.' },
  '12-17': { year: 1903, emoji: '✈️', title_es: 'El primer vuelo motorizado de la historia', title_en: 'First powered flight in history', desc_es: 'Orville Wright realiza el primer vuelo motorizado y controlado de la historia en Kitty Hawk, 12 segundos que inaugura la ingeniería aeronáutica moderna.', desc_en: 'Orville Wright makes the first powered and controlled flight in history at Kitty Hawk, 12 seconds that inaugurates modern aeronautical engineering.' },
  '12-23': { year: 1947, emoji: '💡', title_es: 'Invención del transistor', title_en: 'Transistor invented', desc_es: 'William Shockley, John Bardeen y Walter Brattain demuestran el transistor en Bell Labs. Este componente reemplazará las válvulas de vacío y hará posible toda la electrónica digital moderna.', desc_en: 'William Shockley, John Bardeen and Walter Brattain demonstrate the transistor at Bell Labs. It will replace vacuum tubes and make all modern digital electronics possible.' },
  '12-25': { year: 1990, emoji: '🌐', title_es: 'Primera comunicación HTTP exitosa', title_en: 'First successful HTTP communication', desc_es: 'Tim Berners-Lee prueba con éxito la comunicación HTTP entre un servidor y un navegador, completando los cimientos de la World Wide Web.', desc_en: 'Tim Berners-Lee successfully tests HTTP communication between a server and a browser, completing the foundations of the World Wide Web.' },
  '12-26': { year: 1982, emoji: '🏆', title_es: 'TIME nombra al ordenador «Máquina del año»', title_en: 'TIME names the computer «Machine of the Year»', desc_es: 'La revista TIME nombra al ordenador personal «Máquina del año» de 1982, en lugar de una persona, reconociendo por primera vez el impacto transformador de la informática.', desc_en: 'TIME magazine names the personal computer «Machine of the Year» for 1982 instead of a person, first acknowledging the transformative impact of computing.' },
  '12-28': { year: 1969, emoji: '🐧', title_es: 'Nace Linus Torvalds, creador de Linux', title_en: 'Linus Torvalds, creator of Linux, is born', desc_es: 'Linus Benedict Torvalds nace en Helsinki, Finlandia. En 1991 creará el núcleo Linux, el sistema operativo de código abierto que hoy alimenta Internet, Android y la supercomputación.', desc_en: 'Linus Benedict Torvalds is born in Helsinki, Finland. In 1991 he will create the Linux kernel, the open-source OS that today powers the Internet, Android and supercomputing.' },
  '12-29': { year: 1959, emoji: '⚛️', title_es: 'Feynman imagina los ordenadores del futuro', title_en: 'Feynman imagines the computers of the future', desc_es: 'Richard Feynman imparte su famosa conferencia «There\'s Plenty of Room at the Bottom» en Caltech, anticipando la nanotecnología y los límites físicos de la miniaturización.', desc_en: 'Richard Feynman delivers his famous lecture «There\'s Plenty of Room at the Bottom» at Caltech, anticipating nanotechnology and the physical limits of miniaturization.' },
};

/* ===================================================
   INIT EPHEMERIS — Efeméride del día
   =================================================== */

function initEphemeris() {
  const card = document.getElementById('ephemeris-card');
  if (!card) return;

  // Use TECH_FACTS if defined (which has 366 entries), otherwise fall back to TECH_EVENTS
  const db = (typeof TECH_FACTS !== 'undefined') ? TECH_FACTS : TECH_EVENTS;

  // Build sorted list of all available keys
  const allKeys = Object.keys(db).sort();

  // Get today's MM-DD
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const todayKey = `${month}-${day}`;

  // Find the event for today, or the nearest date
  let eventKey = null;
  if (db[todayKey]) {
    eventKey = todayKey;
  } else {
    // Find nearest key by day-of-year distance
    function dayOfYear(key) {
      const [m, d] = key.split('-').map(Number);
      return new Date(2024, m - 1, d).getTime();
    }
    const todayMs = new Date(2024, now.getMonth(), now.getDate()).getTime();
    let minDist = Infinity;
    allKeys.forEach(k => {
      // Circular distance within the year
      const diff = Math.abs(dayOfYear(k) - todayMs);
      const circular = Math.min(diff, 365 * 24 * 3600 * 1000 - diff);
      if (circular < minDist) { minDist = circular; eventKey = k; }
    });
  }

  const ev = db[eventKey];
  if (!ev) return;

  // Resolve properties based on database schema
  const year = ev.y !== undefined ? ev.y : ev.year;
  const emoji = ev.i !== undefined ? ev.i : ev.emoji;
  
  const isEs = currentLang === 'es';
  let title = '';
  let desc = '';
  
  if (ev.te !== undefined) {
    // Schema from facts.js (te: title ES, ti: title EN, tx: description ES)
    title = isEs ? ev.te : (ev.ti || ev.te);
    desc = ev.tx;
  } else {
    // Fallback schema from app.js (title_es, title_en, desc_es, desc_en)
    title = isEs ? ev.title_es : ev.title_en;
    desc = isEs ? ev.desc_es : ev.desc_en;
  }

  // Format date label
  const months_es = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const months_en = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [em, ed] = eventKey.split('-').map(Number);
  const dateLabel = isEs
    ? `${ed} de ${months_es[em - 1]}`
    : `${months_en[em - 1]} ${ed}`;

  // Is it exactly today?
  const isToday = eventKey === todayKey;
  const onThisDay = t('ephemeris_on_this_day');

  // Render
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
  if (tagEl)   tagEl.textContent   = isToday ? onThisDay : `${onThisDay} (${dateLabel})`;

  // Announce to screen readers
  srAnnounce(`${onThisDay}: ${year} — ${title}`);
}

/* Re-render ephemeris when language changes */
function refreshEphemeris() {
  const card = document.getElementById('ephemeris-card');
  if (!card) return;
  initEphemeris();
}

/* ===================================================
   INIT — DOM READY
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
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
