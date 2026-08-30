drop policy if exists "Members can create own canonical state" on public.el8_member_state;
create policy "Members can create own canonical state"
on public.el8_member_state
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and schema_version = '3.0.0'
  and revision = 0
  and state->>'schemaVersion' = '3.0.0'
  and nullif(state->>'revision','')::integer = 0
  and state->>'memberId' = user_id::text
);
