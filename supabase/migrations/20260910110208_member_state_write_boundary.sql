-- Run G: ordinary Member State writes have one compare-and-swap owner.
-- Forward migration only. Not applied to the live project by this benchmark.
-- See docs/remediation/run-g-decision.md for authority, scope and release blockers.
begin;

-- Validation is intentionally fail-closed. PostgreSQL CHECK accepts NULL unless
-- IS TRUE is explicit. JSON equality also rejects numeric strings/coerced IDs.
alter table public.el8_member_state
  drop constraint el8_member_state_schema_version_check;
alter table public.el8_member_state
  add constraint el8_member_state_schema_version_check check ((
    jsonb_typeof(state) = 'object'
    and schema_version = '3.0.0'
    and state->'schemaVersion' = to_jsonb(schema_version)
    and state->'memberId' = to_jsonb(user_id::text)
    and state->'revision' = to_jsonb(revision)
  ) is true);

-- No CASCADE: an unexpected dependency requires reconciliation, not silent removal.
drop function if exists public.save_el8_member_state(bigint, jsonb);

-- Dedicated non-API implementation namespace. Fail if already present rather than
-- modifying an uninspected schema. The public invoker facade preserves the current
-- API signature; this is the only body that writes the aggregate for members.
create schema el8_member_state_private;
revoke all on schema el8_member_state_private from public, anon;
grant usage on schema el8_member_state_private to authenticated, service_role;

create function el8_member_state_private.save_member_state(
  expected_revision integer, next_state jsonb
) returns public.el8_member_state
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  next_revision integer;
  saved public.el8_member_state;
begin
  if uid is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if expected_revision is null or expected_revision < -1
     or expected_revision = 2147483647 then
    raise exception 'invalid expected Member State revision' using errcode = '22023';
  end if;
  next_revision := expected_revision + 1;
  if jsonb_typeof(next_state) is distinct from 'object'
     or next_state->'schemaVersion' is distinct from to_jsonb('3.0.0'::text)
     or next_state->'revision' is distinct from to_jsonb(next_revision) then
    raise exception 'invalid Member State storage envelope' using errcode = '22023';
  end if;
  if next_state->'memberId' is distinct from to_jsonb(uid::text) then
    raise exception 'Member State memberId does not match authenticated user'
      using errcode = '42501';
  end if;

  -- Definer execution does not rely on RLS: both operations explicitly bind the
  -- owner to the authenticated principal, never to caller-supplied row criteria.
  if expected_revision = -1 then
    insert into public.el8_member_state(user_id, schema_version, revision, state)
    values (uid, '3.0.0', next_revision, next_state)
    on conflict (user_id) do nothing
    returning * into saved;
  else
    update public.el8_member_state
      set revision = next_revision, state = next_state, updated_at = now()
      where user_id = uid and revision = expected_revision
      returning * into saved;
  end if;
  if saved.user_id is null then
    raise exception 'Member State revision conflict' using errcode = '40001';
  end if;
  return saved;
end
$$;

revoke all on function el8_member_state_private.save_member_state(integer, jsonb)
  from public, anon;
grant execute on function el8_member_state_private.save_member_state(integer, jsonb)
  to authenticated, service_role;

create or replace function public.save_el8_member_state(
  expected_revision integer, next_state jsonb
) returns public.el8_member_state
language sql
security invoker
set search_path = ''
as $$
  select el8_member_state_private.save_member_state(expected_revision, next_state)
$$;
revoke all on function public.save_el8_member_state(integer, jsonb) from public, anon;
grant execute on function public.save_el8_member_state(integer, jsonb)
  to authenticated, service_role;

-- Table and column privileges are independent: close both ordinary write paths.
revoke insert, update, delete, truncate, references, trigger
  on public.el8_member_state from public, anon, authenticated;
do $$
declare
  col record;
begin
  for col in select attname from pg_catalog.pg_attribute
    where attrelid = 'public.el8_member_state'::regclass
      and attnum > 0 and not attisdropped
  loop
    execute format(
      'revoke insert (%I), update (%I), references (%I) on public.el8_member_state from public, anon, authenticated',
      col.attname, col.attname, col.attname
    );
  end loop;
end
$$;

-- Retire both known historical spellings, leaving the current SELECT policy intact.
drop policy if exists "Members can create own canonical state" on public.el8_member_state;
drop policy if exists "Members can update own canonical state" on public.el8_member_state;
drop policy if exists "members create own canonical state" on public.el8_member_state;
drop policy if exists "members update own canonical state" on public.el8_member_state;

commit;
