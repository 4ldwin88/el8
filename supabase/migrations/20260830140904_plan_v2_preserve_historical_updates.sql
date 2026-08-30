drop policy if exists "members update own plans" on public.el8_plans;
create policy "members update own plans"
on public.el8_plans
for update
to authenticated
using ((select auth.uid()) = user_id and is_test = false)
with check (
  (select auth.uid()) = user_id
  and is_test = false
  and schema_version is not distinct from (
    select existing.schema_version
    from public.el8_plans existing
    where existing.id = el8_plans.id
  )
);
