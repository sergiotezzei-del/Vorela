-- Aplicada exclusivamente no projeto Supabase Vorela (kbcudgsoyftcibdqsplp).
-- Nenhum usuario recebe permissao de administrador automaticamente.
create table if not exists public.vorela_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.vorela_admins enable row level security;

revoke all on table public.vorela_admins from public, anon, authenticated;
grant select on table public.vorela_admins to authenticated;

drop policy if exists "vorela_admins_read_self" on public.vorela_admins;
create policy "vorela_admins_read_self"
  on public.vorela_admins
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.vorela_admins is
  'Vorela: vinculo administrativo criado apenas por operador de banco autorizado; nenhum auto-cadastro.';
