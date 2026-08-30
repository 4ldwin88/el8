-- Canonical Plan v2 lifecycle: proposed plans become active only through an explicit
-- authenticated activation function. Historical schema_version NULL rows retain their
-- existing lifecycle semantics.

create or replace function public.activate_el8_plan_v2(p_plan_id uuid)
returns public.el8_plans
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan public.el8_plans;
begin
  select * into v_plan
  from public.el8_plans
  where id = p_plan_id
    and user_id = (select auth.uid())
    and schema_version = '2.0.0';

  if not found then
    raise exception 'Canonical Plan v2 not found for authenticated member';
  end if;

  if v_plan.status = 'active' then
    return v_plan;
  end if;

  if v_plan.status <> 'proposed' then
    raise exception 'Canonical Plan v2 must be proposed before activation';
  end if;

  update public.el8_plans
  set status = 'replaced', ended_at = coalesce(ended_at, now()), updated_at = now()
  where user_id = (select auth.uid())
    and status = 'active'
    and id <> p_plan_id;

  update public.el8_plans
  set status = 'active', updated_at = now()
  where id = p_plan_id
  returning * into v_plan;

  return v_plan;
end;
$$;

revoke all on function public.activate_el8_plan_v2(uuid) from public;
revoke all on function public.activate_el8_plan_v2(uuid) from anon;
grant execute on function public.activate_el8_plan_v2(uuid) to authenticated;
grant execute on function public.activate_el8_plan_v2(uuid) to service_role;
