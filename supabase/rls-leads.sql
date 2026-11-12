-- =====================================================================
-- Soluciones IA CM — Políticas de seguridad (RLS) para la tabla "leads"
-- =====================================================================
-- Corrige el hallazgo W-03 de la auditoría: con la "anon key" pública
-- cualquier visitante podía leer, editar o borrar los leads si la tabla
-- no tenía RLS con políticas restrictivas.
--
-- Regla final:
--   · Cualquiera (rol "anon", el formulario público) puede INSERTAR un
--     lead nuevo, y nada más: no puede leer, editar ni borrar.
--   · Solo un usuario autenticado en Supabase Auth (tú, el admin del
--     CRM) puede leer, editar y borrar leads.
--
-- CÓMO EJECUTARLO
--   1. Entra en tu proyecto de Supabase → SQL Editor.
--   2. Pega este archivo completo y pulsa "Run".
--   3. Repite el bloque "DESPUÉS DE EJECUTAR ESTO" de más abajo para
--      crear tu usuario administrador.
-- =====================================================================

-- 1) Activar Row Level Security en la tabla
alter table public.leads enable row level security;

-- 2) Limpiar políticas antiguas (si existieran) para evitar duplicados
drop policy if exists "Anon can insert leads"        on public.leads;
drop policy if exists "Authenticated can read leads"  on public.leads;
drop policy if exists "Authenticated can update leads" on public.leads;
drop policy if exists "Authenticated can delete leads" on public.leads;
drop policy if exists "Anon can read leads"           on public.leads; -- por si existía una política insegura previa

-- 3) El formulario público (clave anónima) solo puede CREAR leads
create policy "Anon can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- 4) Solo un usuario autenticado (tú) puede leer leads
create policy "Authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);

-- 5) Solo un usuario autenticado puede actualizar leads (cambiar estado, notas...)
create policy "Authenticated can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

-- 6) Solo un usuario autenticado puede borrar leads
create policy "Authenticated can delete leads"
  on public.leads
  for delete
  to authenticated
  using (true);

-- =====================================================================
-- DESPUÉS DE EJECUTAR ESTO — crear tu usuario administrador
-- =====================================================================
-- Ve a Authentication → Users → "Add user" (NO "Invite" si no quieres
-- depender del email) y crea un usuario con:
--   · Tu email real
--   · La contraseña fuerte que te he generado en el chat
--   · Marca "Auto Confirm User" para no depender del correo de confirmación
--
-- Después, en Authentication → Settings → asegúrate de que:
--   · "Allow new users to sign up" está DESACTIVADO
--     (así nadie puede crearse una cuenta nueva y entrar al CRM)
--   · El proveedor "Email" está activado (para el login y el
--     "¿olvidaste tu contraseña?")
-- =====================================================================
