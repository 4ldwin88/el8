alter table public.el8_member_state drop constraint if exists el8_member_state_schema_version_check;
alter table public.el8_member_state add constraint el8_member_state_schema_version_check check (
  schema_version = '3.0.0'
  and state->>'schemaVersion' = schema_version
  and nullif(state->>'revision','')::integer = revision
  and state->>'memberId' = user_id::text
);
