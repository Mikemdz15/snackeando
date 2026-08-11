-- =======================================================
-- SCRIPT DE BASE DE DATOS: CONTROL DE USUARIOS (SNACKEANDO)
-- =======================================================
-- Ejecuta este script en el editor SQL de tu panel de Supabase
-- para crear la tabla de control de accesos e iniciar sesión.

-- 1. Crear la tabla de usuarios
create table if not exists public.snackeando_users (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique not null,
    password text not null,
    role text default 'Lector' not null
);

-- 2. Deshabilitar RLS
alter table public.snackeando_users disable row level security;

-- 3. Insertar usuario administrador por defecto
insert into public.snackeando_users (username, password, role)
values ('Miguel Mendez', '123456', 'Administrador')
on conflict (username) do update 
set password = '123456', role = 'Administrador';

-- 4. Insertar un lector por defecto de prueba
insert into public.snackeando_users (username, password, role)
values ('Invitado', 'socio123', 'Lector')
on conflict (username) do nothing;
