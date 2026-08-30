drop policy if exists "Members can update own canonical state" on public.el8_member_state;
create policy "Members can update own canonical state"
on public.el8_member_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and schema_version = '3.0.0'
  and state->>'schemaVersion' = '3.0.0'
  and nullif(state->>'revision','')::integer = revision
  and state->>'memberId' = user_id::text
);
