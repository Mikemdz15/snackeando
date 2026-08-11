-- =======================================================
-- SCRIPT DE BASE DE DATOS: PASOS A SEGUIR (SNACKEANDO)
-- =======================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase
-- para crear la tabla de pendientes compartida en la nube.

-- 1. Crear la tabla de tareas y comentarios
create table if not exists public.snackeando_tasks (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    task_desc text not null,
    progress_comment text default '',
    progress_comment_by text,
    is_completed boolean default false not null
);

-- 2. Deshabilitar RLS para permitir operaciones públicas
alter table public.snackeando_tasks disable row level security;

-- 3. Crear políticas públicas de respaldo por si Supabase fuerza RLS activo
drop policy if exists "Permitir select publica tasks" on public.snackeando_tasks;
create policy "Permitir select publica tasks" on public.snackeando_tasks for select using (true);

drop policy if exists "Permitir insert publica tasks" on public.snackeando_tasks;
create policy "Permitir insert publica tasks" on public.snackeando_tasks for insert with check (true);

drop policy if exists "Permitir update publica tasks" on public.snackeando_tasks;
create policy "Permitir update publica tasks" on public.snackeando_tasks for update using (true) with check (true);

drop policy if exists "Permitir delete publica tasks" on public.snackeando_tasks;
create policy "Permitir delete publica tasks" on public.snackeando_tasks for delete using (true);
