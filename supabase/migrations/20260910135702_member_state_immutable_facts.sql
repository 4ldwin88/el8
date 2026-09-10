-- Preserve accepted evidence through the existing single Member State writer.
-- Corrections must add linked records, never erase or rewrite accepted facts.
begin;
do $migration$
declare definition text;
begin
 if (select count(*) from pg_proc where pronamespace='public'::regnamespace and proname='save_el8_member_state')<>1 then
  raise exception 'unexpected Member State writer overload';
 end if;
 select pg_get_functiondef(p.oid) into definition from pg_proc p
 where p.oid='public.save_el8_member_state(integer,jsonb)'::regprocedure
 and p.proowner='postgres'::regrole;
 if definition is null or md5(definition)<>'8e2adf43dde72965099dc52a21b2e5e8' then
  raise exception 'unexpected Member State writer definition';
 end if;
 if exists(select 1 from public.el8_member_state where state ? 'facts'
   and jsonb_typeof(state->'facts') is distinct from 'object') then
  raise exception 'existing Member State facts require explicit remediation';
 end if;
 definition:=replace(definition,
  '  -- The table constraint owns envelope validation',
  $guard$  if next_state ? 'facts' and jsonb_typeof(next_state->'facts') is distinct from 'object' then
    raise exception 'Member State facts must be an object' using errcode = '23514';
  end if;

  -- The table constraint owns envelope validation$guard$);
 definition:=replace(definition,
  'where user_id = uid and revision = expected_revision',
  $guard$where user_id = uid and revision = expected_revision
      and not exists (
        select 1 from jsonb_each(coalesce(el8_member_state.state->'facts','{}'::jsonb)) as accepted
        where (next_state->'facts'->accepted.key) is distinct from accepted.value
      )$guard$);
 execute definition;
end $migration$;
commit;
