/* ===================================================
   Chatbase — carga diferida del widget de chat
   (externalizado para no necesitar 'unsafe-inline' en la CSP)
   =================================================== */
(function () {
  'use strict';
  if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
    window.chatbase = (...args) => {
      if (!window.chatbase.q) window.chatbase.q = [];
      window.chatbase.q.push(args);
    };
    window.chatbase = new Proxy(window.chatbase, {
      get(target, prop) {
        if (prop === 'q') return target.q;
        return (...args) => target(prop, ...args);
      },
    });
  }

  const load = () => {
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.id = 'DlYvDU3Ab08HmFUV5mS7K';
    script.domain = 'www.chatbase.co';
    document.body.appendChild(script);
  };

  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load);
})();

