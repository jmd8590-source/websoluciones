-- =====================================================================
-- Soluciones IA CM — Esquema y Políticas RLS para la tabla "leads"
-- =====================================================================
-- CÓMO EJECUTARLO EN SUPABASE:
--   1. Si tu proyecto gratuito de Supabase está en pausa por inactividad,
--      entra en https://supabase.com/dashboard y pulsa "Restore project".
--   2. Abre "SQL Editor" → pega este script completo → pulsa "Run".
-- =====================================================================

-- 0) Crear la tabla public.leads si no existiera y asegurar todas las columnas
create table if not exists public.leads (
  id          text primary key,
  "createdAt" text not null default (now()::text),
  "updatedAt" text not null default (now()::text),
  name        text not null,
  email       text not null,
  company     text default '',
  phone       text default '',
  message     text default '',
  status      text not null default 'nuevo',
  notes       jsonb not null default '[]'::jsonb,
  source      text not null default 'web_form'
);

-- 1) Activar Row Level Security en la tabla
alter table public.leads enable row level security;

-- 2) Limpiar políticas previas para evitar duplicados
drop policy if exists "Anon can insert leads"          on public.leads;
drop policy if exists "Authenticated can read leads"    on public.leads;
drop policy if exists "Authenticated can update leads"  on public.leads;
drop policy if exists "Authenticated can delete leads"  on public.leads;
drop policy if exists "Anon can read leads"             on public.leads;
drop policy if exists "CRM verifier can manage leads"   on public.leads;

-- 3) El formulario público de la web puede INSERTAR nuevos leads
create policy "Anon can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- 4) Usuarios autenticados con Supabase Auth JWT o con cabecera X-CRM-Verifier verificada
--    pueden leer, actualizar y eliminar leads desde el panel CRM
create policy "CRM verifier can manage leads"
  on public.leads
  for all
  to anon, authenticated
  using (
    auth.role() = 'authenticated'
    or coalesce(
      (current_setting('request.headers', true)::json ->> 'x-crm-verifier'),
      ''
    ) in (
      '86db5081bae28e9e6ca5d2d1c25c78dee8fb2d06d0d65b0c42d46dbe8e6e2f7a',
      'cdb73a3d84e29cef0b3b4fb064463aaa910201de9eb546c61fd0b89a8175701a'
    )
  )
  with check (
    auth.role() = 'authenticated'
    or coalesce(
      (current_setting('request.headers', true)::json ->> 'x-crm-verifier'),
      ''
    ) in (
      '86db5081bae28e9e6ca5d2d1c25c78dee8fb2d06d0d65b0c42d46dbe8e6e2f7a',
      'cdb73a3d84e29cef0b3b4fb064463aaa910201de9eb546c61fd0b89a8175701a'
    )
  );
