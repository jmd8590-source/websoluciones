// Configuración plana de ESLint (v9). Solo detecta errores reales de
// JavaScript (variables no definidas, sintaxis inválida, etc.) en los
// scripts de la web; no impone un estilo de código concreto.
export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'assets/vendor/**', 'data/efemerides.js'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        history: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        escape: 'readonly',
        unescape: 'readonly',
        BroadcastChannel: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Proxy: 'readonly',
        WeakMap: 'readonly',
        IntersectionObserver: 'readonly',
        getComputedStyle: 'readonly',
        supabase: 'readonly',
        AbortController: 'readonly',
        performance: 'readonly',
        DOMParser: 'readonly',
        TextEncoder: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-redeclare': 'error',
      'no-dupe-keys': 'error',
      'no-const-assign': 'error',
    },
  },
  {
    // app.js consume globals que declaran facts.js y lo-ultimo.js (scripts clásicos)
    files: ['app.js'],
    languageOptions: {
      globals: { TECH_FACTS: 'readonly', renderLoUltimo: 'readonly' },
    },
  },
  {
    files: ['build/**/*.mjs', 'playwright.config.js', 'tests/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly', __dirname: 'readonly' },
    },
  },
  {
    // Cloudflare Pages Functions y Worker entrypoint: módulos ES con globals del runtime Workers
    files: ['functions/**/*.js', 'worker.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        caches: 'readonly',
        TextDecoder: 'readonly',
        AbortController: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
];
