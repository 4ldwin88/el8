-- Synthetic structural checkpoint from Run F read-only catalog inspection.
-- No live member rows, auth records, or credentials. Not a production bootstrap.
create table public.el8_member_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision integer not null default 0 check (revision >= 0),
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  schema_version text not null default '3.0.0'
);
alter table public.el8_member_state enable row level security;
create policy "Members can read own canonical state"
  on public.el8_member_state for select to authenticated
  using ((select auth.uid()) = user_id);
grant select, insert, update on public.el8_member_state to authenticated;
grant all on public.el8_member_state to service_role;
-- The repository's v3 migrations supply the inspected RPC, write policies,
-- constraint and revision trigger; the tests read those files rather than copy them.
