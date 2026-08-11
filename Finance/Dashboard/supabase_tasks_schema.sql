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
    is_completed boolean default false not null
);

-- 2. Deshabilitar RLS para permitir operaciones públicas sin autenticación
-- Esto permite que cualquier lector autorizado con tu enlace de Vercel
-- pueda agregar, editar o marcar como resueltos los pendientes.
alter table public.snackeando_tasks disable row level security;
