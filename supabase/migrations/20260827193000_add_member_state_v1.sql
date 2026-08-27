create table if not exists public.el8_member_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version text not null,
  revision bigint not null default 0 check (revision >= 0),
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint el8_member_state_schema_v1 check (schema_version = '1.0.0'),
  constraint el8_member_state_payload_object check (jsonb_typeof(state) = 'object'),
  constraint el8_member_state_revision_matches check ((state->>'revision')::bigint = revision),
  constraint el8_member_state_schema_matches check (state->>'schemaVersion' = schema_version)
);

alter table public.el8_member_state enable row level security;

create policy "members read own canonical state"
  on public.el8_member_state for select to authenticated
  using (auth.uid() = user_id);

create policy "members create own canonical state"
  on public.el8_member_state for insert to authenticated
  with check (auth.uid() = user_id);

create policy "members update own canonical state"
  on public.el8_member_state for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.save_el8_member_state(
  expected_revision bigint,
  next_state jsonb
) returns public.el8_member_state
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  next_revision bigint;
  next_schema text;
  saved public.el8_member_state;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if jsonb_typeof(next_state) <> 'object' then raise exception 'member state must be an object'; end if;
  next_schema := next_state->>'schemaVersion';
  next_revision := (next_state->>'revision')::bigint;
  if next_schema <> '1.0.0' then raise exception 'unsupported member state schema: %', next_schema; end if;
  if next_revision <= expected_revision then raise exception 'revision must advance'; end if;

  update public.el8_member_state
     set schema_version = next_schema,
         revision = next_revision,
         state = next_state,
         updated_at = now()
   where user_id = uid and revision = expected_revision
   returning * into saved;

  if found then return saved; end if;

  if expected_revision = -1 and next_revision = 0 then
    insert into public.el8_member_state(user_id,schema_version,revision,state)
    values(uid,next_schema,next_revision,next_state)
    returning * into saved;
    return saved;
  end if;

  raise exception 'member state revision conflict';
end;
$$;

grant execute on function public.save_el8_member_state(bigint,jsonb) to authenticated;
