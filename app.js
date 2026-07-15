/* ===================================================
   SOLUCIONES IA CM — Application Script
   Version: 1.0.0
   Stack ready: React/Next.js, TypeScript, Tailwind, Supabase, FastAPI, Docker, Cloudflare
   =================================================== */

'use strict';

/* ===================================================
   TRANSLATIONS — i18n
   =================================================== */

const TRANSLATIONS = {
  es: {
    // Navigation
    nav_inicio:    'Inicio',
    nav_servicios: 'Servicios',
    nav_auditor:   'Auditor Web IA',
    nav_contacto:  'Contacto',
    nav_cta:       'Solicitar Consulta',

    // Hero
    hero_badge:        'Automatización con IA para empresas locales',
    hero_title_line1:  'Transforma tu negocio',
    hero_title_line2:  'con Inteligencia Artificial',
    hero_subtitle:     'Soluciones y asesoría para pequeños y medianos negocios locales: automatizamos tareas, ahorramos tiempo y potenciamos tu empresa con la última tecnología.',
    hero_cta_primary:  'Ver servicios',
    hero_cta_secondary:'Hablar con nosotros',
    hero_stat_1_value: '+50%',
    hero_stat_1_label: 'Ahorro de tiempo',
    hero_stat_2_value: '24/7',
    hero_stat_2_label: 'Atención a clientes',
    hero_stat_3_value: '100%',
    hero_stat_3_label: 'Negocio local',

    // Services
    services_label:    'Nuestros servicios',
    services_title:    'Todo lo que necesita tu negocio',
    services_subtitle: 'Un ecosistema completo de soluciones de IA y automatización diseñado para hacer crecer tu empresa local.',

    svc1_title: 'Consultoría Estratégica',
    svc1_desc:  'Analizamos las necesidades reales de tu empresa y diseñamos un plan de acción personalizado para optimizar tiempo y recursos.',
    svc2_title: 'Asistentes IA Personalizados',
    svc2_desc:  'Desarrollamos asistentes de inteligencia artificial adaptados a tu sector y flujo de trabajo, disponibles las 24 horas.',
    svc3_title: 'Agentes IA Autónomos',
    svc3_desc:  'Creamos agentes que ejecutan tareas complejas de forma autónoma: responder emails, gestionar citas, procesar pedidos y más.',
    svc4_title: 'Chatbot 24/7 Empresarial',
    svc4_desc:  'Chatbot inteligente que responde preguntas sobre tu empresa a cualquier hora, sin perder ningún cliente potencial.',
    svc5_title: 'Página Web Corporativa',
    svc5_desc:  'Diseño y desarrollo de sitios web profesionales, modernos, rápidos y optimizados para SEO y conversión.',
    svc6_title: 'Landing Pages de Alto Impacto',
    svc6_desc:  'Páginas de aterrizaje diseñadas para convertir visitantes en clientes, con diseño premium y optimización continua.',
    svc7_title: 'Automatización de Procesos',
    svc7_desc:  'Automatizamos tareas repetitivas: facturación, seguimiento de clientes, publicaciones en redes, notificaciones y mucho más.',
    svc8_title: 'Bases de Datos y CRM',
    svc8_desc:  'Diseño e implementación de bases de datos y sistemas CRM para gestionar clientes, leads y datos empresariales de forma eficiente.',
    svc9_title: 'Orientación Tecnológica',
    svc9_desc:  'Te guiamos en la selección de las herramientas tecnológicas más adecuadas para tu negocio, sin tecnicismos innecesarios.',

    // Auditor
    auditor_label:    'Herramienta gratuita',
    auditor_title:    'Auditor Web IA',
    auditor_subtitle: 'Introduce la URL de tu web y nuestra IA analizará sus puntos fuertes y áreas de mejora en segundos.',
    auditor_placeholder: 'https://tuweb.com',
    auditor_btn:      'Analizar web',
    auditor_label_sr: 'URL de tu sitio web',

    auditor_step1: 'Accediendo a la página web...',
    auditor_step2: 'Analizando diseño responsive...',
    auditor_step3: 'Evaluando idiomas disponibles...',
    auditor_step4: 'Comprobando agentes y chatbots...',
    auditor_step5: 'Analizando SEO y rendimiento...',
    auditor_step6: 'Generando informe completo...',

    auditor_score_label: 'Puntuación global',
    auditor_btn_new:     'Analizar otra web',
    auditor_cta_title:   '¿Quieres mejorar estos resultados?',
    auditor_cta_subtitle:'Nuestro equipo puede ayudarte a implementar todas las mejoras. Primera consulta gratuita.',
    auditor_cta_btn:     'Solicitar consulta gratuita',
    auditor_error_url:   'Por favor, introduce una URL válida (ej: https://tuweb.com)',

    // Criteria names
    crit_responsive:    '📱 Diseño Responsive',
    crit_multilingual:  '🌍 Multiidioma (ES/EN)',
    crit_chatbot:       '🤖 Chatbot / Agente 24/7',
    crit_crm:           '📊 CRM y Gestión de Leads',
    crit_performance:   '⚡ Velocidad y Rendimiento',
    crit_seo:           '🔍 SEO y Posicionamiento',
    crit_security:      '🔒 Seguridad y HTTPS',
    crit_accessibility: '♿ Accesibilidad Web',
    crit_social:        '📣 Presencia en Redes',
    crit_cta:           '🎯 Call-to-Action Efectivo',

    // Contact
    contact_label:       'Contacto',
    contact_title:       'Hablemos de tu proyecto',
    contact_subtitle:    'Primera consulta siempre gratuita. Cuéntanos tu reto y encontraremos la mejor solución para tu negocio.',
    contact_email_label: 'Email',
    contact_phone_label: 'Teléfono',
    contact_area_label:  'Área de servicio',
    contact_area_note:   'Servicio online en toda España',
    contact_hours_label: 'Disponibilidad',
    contact_hours_value: 'Lun – Vie, 9:00 – 20:00',

    contact_form_name:    'Nombre',
    contact_form_email:   'Email',
    contact_form_company: 'Empresa',
    contact_form_phone:   'Teléfono',
    contact_form_message: 'Cuéntanos tu proyecto',
    contact_form_submit:  'Enviar mensaje',
    contact_success_title:'¡Mensaje enviado!',
    contact_success_text: 'Gracias por contactarnos. Te responderemos en menos de 24 horas.',

    // Footer
    footer_description: 'Soluciones de inteligencia artificial y automatización para pequeños y medianos negocios locales.',
    footer_tech_label:  'Arquitectura tecnológica',
    footer_col_services:'Servicios',
    footer_col_company: 'Empresa',
    footer_col_legal:   'Legal',

    footer_link_consulting: 'Consultoría',
    footer_link_agents:     'Agentes IA',
    footer_link_chatbot:    'Chatbot 24/7',
    footer_link_web:        'Diseño Web',
    footer_link_automation: 'Automatizaciones',
    footer_link_contact:    'Contacto',
    footer_link_auditor:    'Auditor Web',
    footer_link_legal:      'Aviso Legal',
    footer_link_privacy:    'Política de Privacidad',
    footer_link_cookies:    'Política de Cookies',
    footer_copyright:       '© 2025 Soluciones IA CM. Todos los derechos reservados.',

    // Cookie banner
    cookie_text:   'Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra política de cookies.',
    cookie_accept: 'Aceptar todas',
    cookie_reject: 'Solo necesarias',

    // Modals
    modal_legal_title:   'Aviso Legal',
    modal_privacy_title: 'Política de Privacidad',
    modal_cookies_title: 'Política de Cookies',

    // Form errors
    form_error_name:    'Por favor, introduce tu nombre',
    form_error_email:   'Por favor, introduce un email válido',
    form_error_message: 'Por favor, escribe tu mensaje o consulta',
  },

  en: {
    // Navigation
    nav_inicio:    'Home',
    nav_servicios: 'Services',
    nav_auditor:   'AI Web Auditor',
    nav_contacto:  'Contact',
    nav_cta:       'Book Consultation',

    // Hero
    hero_badge:        'AI Automation for local businesses',
    hero_title_line1:  'Transform your business',
    hero_title_line2:  'with Artificial Intelligence',
    hero_subtitle:     'Solutions and consulting for local small and medium businesses: we automate tasks, save time and empower your business with the latest technology.',
    hero_cta_primary:  'View services',
    hero_cta_secondary:'Talk to us',
    hero_stat_1_value: '+50%',
    hero_stat_1_label: 'Time saved',
    hero_stat_2_value: '24/7',
    hero_stat_2_label: 'Customer support',
    hero_stat_3_value: '100%',
    hero_stat_3_label: 'Local business',

    // Services
    services_label:    'Our services',
    services_title:    'Everything your business needs',
    services_subtitle: 'A complete ecosystem of AI and automation solutions designed to grow your local business.',

    svc1_title: 'Strategic Consulting',
    svc1_desc:  'We analyze the real needs of your business and design a personalized action plan to optimize time and resources.',
    svc2_title: 'Custom AI Assistants',
    svc2_desc:  'We develop artificial intelligence assistants adapted to your sector and workflow, available 24 hours a day.',
    svc3_title: 'Autonomous AI Agents',
    svc3_desc:  'We create agents that autonomously handle complex tasks: reply to emails, manage appointments, process orders and more.',
    svc4_title: '24/7 Business Chatbot',
    svc4_desc:  'Smart chatbot that answers questions about your company at any time, without losing any potential client.',
    svc5_title: 'Corporate Website',
    svc5_desc:  'Design and development of professional, modern, fast websites optimized for SEO and conversion.',
    svc6_title: 'High-Impact Landing Pages',
    svc6_desc:  'Landing pages designed to convert visitors into customers, with premium design and continuous optimization.',
    svc7_title: 'Process Automation',
    svc7_desc:  'We automate repetitive tasks: invoicing, customer follow-up, social media posts, notifications and much more.',
    svc8_title: 'Databases & CRM',
    svc8_desc:  'Design and implementation of databases and CRM systems to manage customers, leads and business data efficiently.',
    svc9_title: 'Technology Guidance',
    svc9_desc:  'We guide you in selecting the most suitable technological tools for your business, without unnecessary jargon.',

    // Auditor
    auditor_label:    'Free tool',
    auditor_title:    'AI Web Auditor',
    auditor_subtitle: 'Enter your website URL and our AI will analyze its strengths and areas for improvement in seconds.',
    auditor_placeholder: 'https://yourwebsite.com',
    auditor_btn:      'Analyze website',
    auditor_label_sr: 'Your website URL',

    auditor_step1: 'Accessing the website...',
    auditor_step2: 'Analyzing responsive design...',
    auditor_step3: 'Evaluating available languages...',
    auditor_step4: 'Checking agents and chatbots...',
    auditor_step5: 'Analyzing SEO and performance...',
    auditor_step6: 'Generating complete report...',

    auditor_score_label: 'Overall score',
    auditor_btn_new:     'Analyze another website',
    auditor_cta_title:   'Want to improve these results?',
    auditor_cta_subtitle:'Our team can help you implement all the necessary improvements. First consultation is free.',
    auditor_cta_btn:     'Request free consultation',
    auditor_error_url:   'Please enter a valid URL (e.g., https://yourwebsite.com)',

    // Criteria names
    crit_responsive:    '📱 Responsive Design',
    crit_multilingual:  '🌍 Multilingual (ES/EN)',
    crit_chatbot:       '🤖 24/7 Chatbot / Agent',
    crit_crm:           '📊 CRM & Lead Management',
    crit_performance:   '⚡ Speed & Performance',
    crit_seo:           '🔍 SEO & Search Ranking',
    crit_security:      '🔒 Security & HTTPS',
    crit_accessibility: '♿ Web Accessibility',
    crit_social:        '📣 Social Media Presence',
    crit_cta:           '🎯 Effective Call-to-Action',

    // Contact
    contact_label:       'Contact',
    contact_title:       "Let's talk about your project",
    contact_subtitle:    "First consultation is always free. Tell us about your challenge and we'll find the best solution for your business.",
    contact_email_label: 'Email',
    contact_phone_label: 'Phone',
    contact_area_label:  'Service area',
    contact_area_note:   'Online service throughout Spain',
    contact_hours_label: 'Availability',
    contact_hours_value: 'Mon – Fri, 9:00 – 20:00',

    contact_form_name:    'Name',
    contact_form_email:   'Email',
    contact_form_company: 'Company',
    contact_form_phone:   'Phone',
    contact_form_message: 'Tell us about your project',
    contact_form_submit:  'Send message',
    contact_success_title:'Message sent!',
    contact_success_text: 'Thank you for contacting us. We will reply within 24 hours.',

    // Footer
    footer_description: 'Artificial intelligence and automation solutions for local small and medium businesses.',
    footer_tech_label:  'Technology architecture',
    footer_col_services:'Services',
    footer_col_company: 'Company',
    footer_col_legal:   'Legal',

    footer_link_consulting: 'Consulting',
    footer_link_agents:     'AI Agents',
    footer_link_chatbot:    'Chatbot 24/7',
    footer_link_web:        'Web Design',
    footer_link_automation: 'Automations',
    footer_link_contact:    'Contact',
    footer_link_auditor:    'Web Auditor',
    footer_link_legal:      'Legal Notice',
    footer_link_privacy:    'Privacy Policy',
    footer_link_cookies:    'Cookie Policy',
    footer_copyright:       '© 2025 Soluciones IA CM. All rights reserved.',

    // Cookie banner
    cookie_text:   'We use cookies to improve your experience. By continuing, you accept our cookie policy.',
    cookie_accept: 'Accept all',
    cookie_reject: 'Necessary only',

    // Modals
    modal_legal_title:   'Legal Notice',
    modal_privacy_title: 'Privacy Policy',
    modal_cookies_title: 'Cookie Policy',

    // Form errors
    form_error_name:    'Please enter your name',
    form_error_email:   'Please enter a valid email address',
    form_error_message: 'Please enter your message or inquiry',
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
  const header     = document.getElementById('header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav  = document.getElementById('mobile-nav');

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
  const sections  = Array.from(document.querySelectorAll('section[id]'));
  const navLinks  = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));
  }
}

function closeMobileMenu() {
  const mobileNav  = document.getElementById('mobile-nav');
  const menuToggle = document.getElementById('menu-toggle');
  if (mobileNav)  { mobileNav.classList.remove('open'); }
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
  const form      = document.getElementById('auditor-form');
  const input     = document.getElementById('auditor-url');
  const newBtn    = document.getElementById('auditor-new-btn');
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
    multilingual: r(2,  0, 28),
    chatbot:      r(3,  0, 18),
    crm:          r(4,  0, 22),
    // Typically mixed:
    responsive:   r(1, 42, 92),
    performance:  r(5, 28, 78),
    seo:          r(6, 18, 72),
    accessibility:r(8, 16, 68),
    cta:          r(10,28, 78),
    // Usually better:
    security:     r(7, 52, 96),
    social:       r(9, 18, 75),
  };
}

function getLevel(score) {
  return score >= 70 ? 'good' : score >= 38 ? 'ok' : 'bad';
}

const AUDIT_NOTES = {
  es: {
    responsive:    { good: 'Tu web se adapta correctamente a todos los dispositivos.',        ok: 'Algunos elementos no se visualizan bien en pantallas pequeñas.',           bad: 'Tu web no está optimizada para móviles, lo que penaliza en Google y aleja clientes.' },
    multilingual:  { good: 'Tu web ofrece contenido en varios idiomas.',                     ok: 'Hay algo de contenido traducido, pero está incompleto.',                    bad: 'Tu web solo está en un idioma. Ofrecer inglés puede multiplicar tu alcance y atraer clientes internacionales.' },
    chatbot:       { good: 'Tienes un sistema de atención automatizada 24/7 activo.',        ok: 'Hay un formulario de contacto, pero sin respuesta inmediata.',             bad: 'No se detectó chatbot ni agente IA. Cada cliente que no recibe respuesta inmediata puede marcharse a la competencia.' },
    crm:           { good: 'Tienes un CRM integrado para gestionar leads.',                  ok: 'Hay captación básica de datos, pero sin gestión estructurada.',            bad: 'No se detectó CRM. Sin seguimiento de leads no podrás crecer de forma sostenida.' },
    performance:   { good: 'La velocidad de carga es excelente.',                           ok: 'La web carga en tiempo aceptable pero hay margen de mejora.',              bad: 'La web carga lentamente. Esto aumenta la tasa de abandono y penaliza en los resultados de búsqueda.' },
    seo:           { good: 'El SEO está bien trabajado con buena estructura.',              ok: 'Hay optimizaciones básicas de SEO, pero se pueden mejorar.',              bad: 'El SEO es deficiente. Tu web tiene dificultades para aparecer en Google.' },
    security:      { good: 'La web usa HTTPS y cuenta con medidas de seguridad.',           ok: 'Hay HTTPS pero faltan cabeceras de seguridad recomendadas.',               bad: 'Se detectaron problemas de seguridad que pueden ahuyentar usuarios y penalizar en SEO.' },
    accessibility: { good: 'La accesibilidad cumple los estándares WCAG.',                  ok: 'La accesibilidad es básica pero hay elementos mejorables.',                bad: 'La web tiene barreras de accesibilidad que excluyen a una parte significativa de usuarios.' },
    social:        { good: 'Tienes buena presencia y enlaces a redes sociales.',            ok: 'Hay alguna red social vinculada, pero la presencia es mejorable.',        bad: 'No se detectó presencia en redes sociales, esenciales para la visibilidad local.' },
    cta:           { good: 'Los call-to-action son claros, visibles y efectivos.',           ok: 'Hay CTAs pero podrían ser más prominentes y estratégicos.',               bad: 'No se detectaron call-to-action claros. Los visitantes no saben qué acción tomar.' },
  },
  en: {
    responsive:    { good: 'Your website adapts correctly to all devices.',                  ok: 'Some elements do not display well on small screens.',                      bad: 'Your website is not mobile-optimized, penalizing Google rankings and losing customers.' },
    multilingual:  { good: 'Your website offers content in multiple languages.',             ok: 'Some content is translated but it is incomplete.',                         bad: 'Your website is only in one language. Adding English could multiply your reach significantly.' },
    chatbot:       { good: 'You have an active 24/7 automated support system.',             ok: 'There is a contact form, but without immediate response.',                 bad: 'No chatbot or AI agent detected. Customers who don\'t get instant responses may go to competitors.' },
    crm:           { good: 'You have an integrated CRM for lead management.',               ok: 'There is basic data collection but no structured management.',             bad: 'No CRM detected. Without lead tracking, sustainable growth is very difficult.' },
    performance:   { good: 'Page load speed is excellent.',                                 ok: 'Load time is acceptable but there is room for improvement.',               bad: 'The website loads slowly, increasing bounce rate and penalizing search rankings.' },
    seo:           { good: 'SEO is well implemented with good structure.',                  ok: 'There are basic SEO optimizations but they can be improved.',             bad: 'SEO is poor. Your website struggles to appear in search results.' },
    security:      { good: 'The website uses HTTPS and has security measures.',             ok: 'HTTPS is present but recommended security headers are missing.',           bad: 'Security issues detected that may deter users and penalize search rankings.' },
    accessibility: { good: 'Accessibility meets WCAG standards.',                           ok: 'Basic accessibility is present but some elements can be improved.',       bad: 'The website has accessibility barriers that exclude a significant portion of users.' },
    social:        { good: 'You have good social media presence and links.',                ok: 'Some social networks are linked but presence can be improved.',           bad: 'No social media presence detected, essential for local visibility.' },
    cta:           { good: 'Call-to-actions are clear, visible and effective.',             ok: 'There are CTAs but they could be more prominent and strategic.',           bad: 'No clear call-to-actions detected. Visitors don\'t know what action to take.' },
  },
};

async function runAudit(url) {
  const loading = document.getElementById('auditor-loading');
  const results = document.getElementById('auditor-results');
  const steps   = Array.from(document.querySelectorAll('.auditor-step'));

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
  const scores  = generateScores(url);
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
    const name  = t(`crit_${id}`);
    const note  = AUDIT_NOTES[currentLang]?.[id]?.[level] || '';

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
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl    = document.getElementById('form-name');
    const emailEl   = document.getElementById('form-email');
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

    // Simulate submission
    submitBtn.disabled = true;
    const originalText = submitBtn.querySelector('[data-i18n]')?.textContent;
    if (submitBtn.querySelector('[data-i18n]')) {
      submitBtn.querySelector('[data-i18n]').textContent =
        currentLang === 'es' ? 'Enviando...' : 'Sending...';
    }

    await pause(1800);

    form.style.display = 'none';
    success.classList.add('active');
  });

  // Clear errors on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => clearFieldError(field), { passive: true });
  });
}

function setFieldError(input, msg) {
  input.style.borderColor = 'var(--c-error)';
  input.setAttribute('aria-invalid', 'true');
  const parent = input.parentElement;
  let err = parent.querySelector('.field-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'field-error';
    err.style.cssText = 'color:var(--c-error);font-size:var(--fs-xs);margin-top:4px;';
    err.setAttribute('role', 'alert');
    parent.appendChild(err);
  }
  err.textContent = msg;
}

function clearFieldError(input) {
  input.style.borderColor = '';
  input.removeAttribute('aria-invalid');
  input.parentElement.querySelector('.field-error')?.remove();
}

/* ===================================================
   COOKIE BANNER
   =================================================== */

function initCookieBanner() {
  const banner    = document.getElementById('cookie-banner');
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
  // Open triggers
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const id      = trigger.getAttribute('data-modal');
      const overlay = document.getElementById(`modal-${id}`);
      if (!overlay) return;
      openModal(overlay);
    });
  });

  // Close on backdrop / close button / ESC
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

function openModal(overlay) {
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Focus first focusable element in modal
  const focusable = overlay.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
  setTimeout(() => focusable?.focus(), 50);
}

function closeModal(overlay) {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
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
   INIT — DOM READY
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  initNavigation();
  initScrollAnimations();
  initAuditor();
  initContactForm();
  initCookieBanner();
  initModals();
  initLangToggle();
});
