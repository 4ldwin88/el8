create or replace function public.el8_canonical_action_ids_valid(actions jsonb)
returns boolean
language sql
immutable
security invoker
set search_path=''
as $$
 select jsonb_typeof(actions)='array'
    and jsonb_array_length(actions)>0
    and not exists (
      select 1 from jsonb_array_elements(actions) a
      where jsonb_typeof(a) <> 'object'
         or coalesce(a->>'actionId','') !~ '^(PHY|EMT|SOC|OCC|FIN|ENV|INT|SPT|XDM)-A[0-9]{2}$'
    );
$$;
revoke all on function public.el8_canonical_action_ids_valid(jsonb) from public, anon, authenticated;
grant execute on function public.el8_canonical_action_ids_valid(jsonb) to service_role;
alter table public.el8_plans drop constraint if exists el8_plans_v2_canonical_action_ids;
alter table public.el8_plans add constraint el8_plans_v2_canonical_action_ids check (schema_version is distinct from '2.0.0' or public.el8_canonical_action_ids_valid(canonical_actions));
