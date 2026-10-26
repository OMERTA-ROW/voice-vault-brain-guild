# Real owner accounts & tester invitations — setup (NOT yet applied)

Status: this project has **no backend**. Nothing below has been run. Real logins,
invitations and the admin screen stay blocked until the owner completes these steps.

## Why it is blocked
Real accounts need server-side storage and server-enforced rules. Turning on
Lovable Cloud creates a new backend for this project; the request said not to
change external services now, so it was not enabled.

## Owner activation steps
1. In chat, ask: "Enable Lovable Cloud for Cyber Race and apply the owner access migration."
   (This creates a backend used only by this project; it does not touch CyberLink Social or other apps.)
2. Sign up in the app with your own email and confirm it from your inbox (verified email).
3. Promote yourself to owner from the Cloud database SQL editor — the only trusted bootstrap:
   `select public.bootstrap_owner('<your-verified-email>');`
   It refuses if an owner already exists or the email is not confirmed. No first-visitor owner.
4. Open /admin to create single-use tester invitations (copy the link yourself; no emails are sent).

## Schema (to apply as a migration after step 1)
```sql
create type public.app_role as enum ('owner','admin','member','tester');
create table public.orgs (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());
create table public.memberships (
  org_id uuid references public.orgs(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade,
  role public.app_role not null, primary key (org_id, user_id));
create table public.invitations (
  id uuid primary key default gen_random_uuid(), org_id uuid references public.orgs(id) on delete cascade not null,
  email text not null, role public.app_role not null check (role <> 'owner'),
  token_hash text not null unique, expires_at timestamptz not null,
  used_at timestamptz, used_by uuid references auth.users(id), revoked_at timestamptz,
  created_by uuid references auth.users(id) not null, created_at timestamptz default now());
grant select on public.orgs, public.memberships to authenticated;
grant select, insert, update on public.invitations to authenticated;
grant all on public.orgs, public.memberships, public.invitations to service_role;
alter table public.orgs enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

create function public.org_role(_org uuid, _uid uuid) returns public.app_role
  language sql stable security definer set search_path = public
  as $$ select role from memberships where org_id=_org and user_id=_uid $$;

create policy "members read own org" on public.orgs for select to authenticated using (public.org_role(id, auth.uid()) is not null);
create policy "members read org members" on public.memberships for select to authenticated using (public.org_role(org_id, auth.uid()) is not null);
create policy "managers read invites" on public.invitations for select to authenticated using (public.org_role(org_id, auth.uid()) in ('owner','admin'));
create policy "managers create invites" on public.invitations for insert to authenticated
  with check (created_by = auth.uid() and (public.org_role(org_id, auth.uid()) = 'owner' or (public.org_role(org_id, auth.uid()) = 'admin' and role in ('member','tester'))));
create policy "managers revoke invites" on public.invitations for update to authenticated using (public.org_role(org_id, auth.uid()) in ('owner','admin'));
-- Role changes and invite acceptance go through server functions that re-check
-- src/lib/access.ts rules, then write with the admin client. No client writes to memberships.

create function public.bootstrap_owner(_email text) returns void language plpgsql security definer set search_path = public as $$
declare u uuid; o uuid;
begin
  if exists (select 1 from memberships where role='owner') then raise exception 'owner already exists'; end if;
  select id into u from auth.users where lower(email)=lower(_email) and email_confirmed_at is not null;
  if u is null then raise exception 'no verified account for that email'; end if;
  insert into orgs(name) values ('Cyber Race') returning id into o;
  insert into memberships values (o, u, 'owner');
end $$;
revoke execute on function public.bootstrap_owner(text) from public, anon, authenticated;
```

## Provider limits & costs
- The app sets **no cap** on invitation count.
- Lovable Cloud usage is billed against your workspace plan; check Settings → Cloud for current limits.
- Built-in auth emails (confirm / reset) are rate-limited by the provider; a custom email domain raises that. No purchases were made.

## Stays simulated even with real accounts
Payments, medical, remote shell, data selling, smart home and external service integrations remain labeled demo.
Demo data stays in this browser only and is never mixed with real account data.
