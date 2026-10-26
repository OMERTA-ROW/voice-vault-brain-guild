create type public.app_role as enum ('owner','admin','member','tester');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role public.app_role not null,
  created_at timestamptz not null default now()
);
create unique index one_owner on public.user_roles ((role)) where role = 'owner';
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.current_role_of(_uid uuid) returns public.app_role
language sql stable security definer set search_path = public
as $$ select role from public.user_roles where user_id = _uid $$;

create policy "read own role" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "managers read all roles" on public.user_roles for select to authenticated
  using (public.current_role_of(auth.uid()) in ('owner','admin'));

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null check (role <> 'owner'),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid,
  revoked_at timestamptz,
  created_by uuid not null,
  created_at timestamptz not null default now()
);
grant select on public.invitations to authenticated;
grant all on public.invitations to service_role;
alter table public.invitations enable row level security;
create policy "managers read invites" on public.invitations for select to authenticated
  using (public.current_role_of(auth.uid()) in ('owner','admin'));

create table public.private_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.private_notes to authenticated;
grant all on public.private_notes to service_role;
alter table public.private_notes enable row level security;
create policy "own notes read" on public.private_notes for select to authenticated using (user_id = auth.uid());
create policy "own notes insert" on public.private_notes for insert to authenticated
  with check (user_id = auth.uid() and public.current_role_of(auth.uid()) is not null);
create policy "own notes delete" on public.private_notes for delete to authenticated using (user_id = auth.uid());