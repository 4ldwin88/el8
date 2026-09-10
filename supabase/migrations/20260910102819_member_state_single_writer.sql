-- Repository-only candidate. See docs/remediation/member-state-write-boundary.md.
-- No historical payload is repaired: invalid existing envelopes abort this transaction.
begin;

-- The v1 constraint/overload survive the repository's old Member State migration
-- chain, but are absent from the inspected live v3 checkpoint. Neither is a
-- current writer contract. RESTRICT deliberately blocks unknown dependencies.
drop function if exists public.save_el8_member_state(bigint, jsonb) restrict;
alter table public.el8_member_state
  drop constraint if exists el8_member_state_schema_v1;
-- Consolidate older envelope checks into the one strict constraint below.
-- In particular, legacy text-to-bigint casts are not a second validation owner.
alter table public.el8_member_state
  drop constraint if exists el8_member_state_revision_matches,
  drop constraint if exists el8_member_state_schema_matches,
  drop constraint if exists el8_member_state_payload_object,
  drop constraint if exists el8_member_state_state_check;
alter table public.el8_member_state
  drop constraint if exists el8_member_state_schema_version_check;
alter table public.el8_member_state
  add constraint el8_member_state_schema_version_check check ((
    schema_version = '3.0.0'
    and revision between 0 and 2147483647
    and jsonb_typeof(state) = 'object'
    and state->'schemaVersion' = to_jsonb(schema_version)
    and state->'memberId' = to_jsonb(user_id::text)
    and state->'revision' = to_jsonb(revision)
  ) is true);

-- SELECT remains governed by existing own-member RLS. Remove every write policy,
-- including the differently capitalized historical copies; do not leave aliases.
do $$
declare
  policy record;
  col record;
begin
  for policy in select polname from pg_policy
    where polrelid = 'public.el8_member_state'::regclass and polcmd <> 'r'
  loop
    execute format('drop policy %I on public.el8_member_state', policy.polname);
  end loop;
  -- Table revocation alone does not remove independently granted column rights.
  for col in select attname from pg_attribute
    where attrelid = 'public.el8_member_state'::regclass
      and attnum > 0 and not attisdropped
  loop
    execute format(
      'revoke all privileges (%I) on public.el8_member_state from public, anon, authenticated',
      col.attname
    );
  end loop;
end
$$;
alter table public.el8_member_state enable row level security;
revoke all privileges on public.el8_member_state from public, anon, authenticated;
grant select on public.el8_member_state to authenticated;

-- This is intentionally a narrow trusted writer, not a generic database proxy.
-- Elevation is required because members no longer have table write privileges.
-- The authenticated principal is the only target identity. Qualified objects and
-- an empty search_path prevent caller-created objects from redirecting writes.
create or replace function public.save_el8_member_state(
  expected_revision integer,
  next_state jsonb
) returns public.el8_member_state
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  saved public.el8_member_state;
begin
  if uid is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if expected_revision is null or expected_revision < -1
     or expected_revision >= 2147483647 then
    raise exception 'invalid expected Member State revision' using errcode = '22023';
  end if;

  -- The table constraint owns envelope validation, including authenticated
  -- ownership and exact revision agreement. Never coerce or normalize payloads.
  if expected_revision = -1 then
    insert into public.el8_member_state(user_id, schema_version, revision, state)
    values (uid, '3.0.0', 0, next_state)
    on conflict (user_id) do nothing
    returning * into saved;
  else
    update public.el8_member_state
    set schema_version = '3.0.0', revision = expected_revision + 1,
        state = next_state, updated_at = now()
    where user_id = uid and revision = expected_revision
    returning * into saved;
  end if;

  if saved.user_id is null then
    raise exception 'Member State revision conflict' using errcode = '40001';
  end if;
  return saved;
end
$$;
alter function public.save_el8_member_state(integer, jsonb) owner to postgres;
revoke all on function public.save_el8_member_state(integer, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.save_el8_member_state(integer, jsonb)
  to authenticated, service_role;

-- Fail closed if an uninspected overload or inherited client write grant survives.
do $$
begin
  if (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = 'save_el8_member_state') <> 1 then
    raise exception 'unexpected Member State RPC overload';
  end if;
  if has_table_privilege('authenticated', 'public.el8_member_state', 'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER')
     or has_any_column_privilege('authenticated', 'public.el8_member_state', 'INSERT,UPDATE')
     or has_table_privilege('anon', 'public.el8_member_state', 'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER')
     or has_any_column_privilege('anon', 'public.el8_member_state', 'INSERT,UPDATE') then
    raise exception 'unexpected inherited Member State write privilege';
  end if;
end
$$;
commit;
