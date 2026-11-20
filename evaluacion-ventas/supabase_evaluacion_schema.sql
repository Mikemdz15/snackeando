-- =====================================================================
-- SCRIPT DE BASE DE DATOS: EVALUACIÓN DE TALENTO COMERCIAL (SNACKEANDO)
-- =====================================================================
-- Ejecuta este script una sola vez en el SQL Editor de tu panel de Supabase
-- (Proyecto: tjoawvfzipnfmgqokdrk) para habilitar el portal de evaluaciones,
-- control de vigencia de candidatos, auditoría forense y expedientes con CV.

-- 1. Tabla de Candidatos y Accesos Temporales
create table if not exists public.snackeando_eval_candidates (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    username text unique not null,
    password text not null,
    full_name text not null,
    email text,
    phone text,
    role_applied text default 'Ejecutivo Comercial B2B' not null,
    expires_at timestamp with time zone not null,
    duration_minutes integer default 20 not null,
    status text default 'Pendiente' not null, -- 'Pendiente', 'En Progreso', 'Completado'
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    cv_filename text,
    cv_text text
);

alter table public.snackeando_eval_candidates disable row level security;

drop policy if exists "Permitir select publica eval_candidates" on public.snackeando_eval_candidates;
create policy "Permitir select publica eval_candidates" on public.snackeando_eval_candidates for select using (true);

drop policy if exists "Permitir insert publica eval_candidates" on public.snackeando_eval_candidates;
create policy "Permitir insert publica eval_candidates" on public.snackeando_eval_candidates for insert with check (true);

drop policy if exists "Permitir update publica eval_candidates" on public.snackeando_eval_candidates;
create policy "Permitir update publica eval_candidates" on public.snackeando_eval_candidates for update using (true) with check (true);

drop policy if exists "Permitir delete publica eval_candidates" on public.snackeando_eval_candidates;
create policy "Permitir delete publica eval_candidates" on public.snackeando_eval_candidates for delete using (true);

-- 2. Tabla de Respuestas, Auditoría de Tiempos y Análisis Clínico
create table if not exists public.snackeando_eval_submissions (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    candidate_id uuid references public.snackeando_eval_candidates(id) on delete cascade,
    candidate_username text not null,
    answers jsonb not null default '{}'::jsonb,
    telemetry jsonb not null default '{}'::jsonb,
    audit_diagnosis jsonb not null default '{}'::jsonb,
    scores jsonb not null default '{}'::jsonb,
    clinical_analysis jsonb default '{}'::jsonb,
    interview_rubric jsonb default '{}'::jsonb,
    admin_notes text default ''
);

alter table public.snackeando_eval_submissions disable row level security;

drop policy if exists "Permitir select publica eval_submissions" on public.snackeando_eval_submissions;
create policy "Permitir select publica eval_submissions" on public.snackeando_eval_submissions for select using (true);

drop policy if exists "Permitir insert publica eval_submissions" on public.snackeando_eval_submissions;
create policy "Permitir insert publica eval_submissions" on public.snackeando_eval_submissions for insert with check (true);

drop policy if exists "Permitir update publica eval_submissions" on public.snackeando_eval_submissions;
create policy "Permitir update publica eval_submissions" on public.snackeando_eval_submissions for update using (true) with check (true);

drop policy if exists "Permitir delete publica eval_submissions" on public.snackeando_eval_submissions;
create policy "Permitir delete publica eval_submissions" on public.snackeando_eval_submissions for delete using (true);

-- 3. Candidato de prueba inicial (vigencia 7 días desde la creación)
insert into public.snackeando_eval_candidates (
    username, password, full_name, email, phone, role_applied, expires_at, duration_minutes, status
) values (
    'demo.candidato',
    'SNK2026',
    'Candidato Demo (Prueba Interna)',
    'demo@snackeando.mx',
    '5500000000',
    'Ejecutivo Comercial B2B',
    timezone('utc'::text, now()) + interval '7 days',
    20,
    'Pendiente'
)
on conflict (username) do nothing;
