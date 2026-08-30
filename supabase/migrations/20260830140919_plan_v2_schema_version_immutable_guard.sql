create or replace function public.el8_guard_plan_schema_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.schema_version is distinct from old.schema_version then
    raise exception 'Plan schema_version is immutable';
  end if;
  return new;
end
$$;

revoke execute on function public.el8_guard_plan_schema_version() from public, anon, authenticated;

drop trigger if exists el8_guard_plan_schema_version on public.el8_plans;
create trigger el8_guard_plan_schema_version
before update on public.el8_plans
for each row execute function public.el8_guard_plan_schema_version();

drop policy if exists "members update own plans" on public.el8_plans;
create policy "members update own plans"
on public.el8_plans
for update
to authenticated
using ((select auth.uid()) = user_id and is_test = false)
with check (
  (select auth.uid()) = user_id
  and is_test = false
  and (schema_version is null or schema_version = '2.0.0')
);
