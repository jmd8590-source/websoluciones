/* ===================================================
   SOLUCIONES IA CM — Configuración pública

   IMPORTANTE: todo lo que hay aquí es PÚBLICO por diseño.
   - SUPABASE_ANON_KEY es la clave "anon/publishable": solo
     permite lo que autorizan las políticas RLS de la base de
     datos (enviar un lead mediante la función submit_lead).
   - WEB3FORMS_KEY es una clave de envío pública.
   NUNCA pongas aquí la clave "service_role" ni contraseñas.
   =================================================== */
'use strict';

window.SIACM_CONFIG = Object.freeze({
  SUPABASE_URL:      'https://qotpnbshccwyrledrorl.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdHBuYnNoY2N3eXJsZWRyb3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NjM0MjcsImV4cCI6MjEwMjAzOTQyN30.ToLVuYZiEq4hNOTn2JcxU5GaaODFQIQ0zu2uE34QQ2M',
  WEB3FORMS_KEY:     'd0dc8179-a542-4887-8a1f-9a66ed865fa6',
});

