drop policy if exists "members insert own plans" on public.el8_plans;
create policy "members insert own plans"
on public.el8_plans
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and is_test = false
  and schema_version = '2.0.0'
);

drop policy if exists "members update own plans" on public.el8_plans;
create policy "members update own plans"
on public.el8_plans
for update
to authenticated
using ((select auth.uid()) = user_id and is_test = false)
with check (
  (select auth.uid()) = user_id
  and is_test = false
  and schema_version = '2.0.0'
);
