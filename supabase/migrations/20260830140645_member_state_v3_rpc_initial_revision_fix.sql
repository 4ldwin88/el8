create or replace function public.save_el8_member_state(
  expected_revision integer,
  next_state jsonb
)
returns public.el8_member_state
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  next_revision integer;
  saved public.el8_member_state;
begin
  if uid is null then
    raise exception 'authentication required';
  end if;
  if next_state is null or next_state->>'schemaVersion' <> '3.0.0' then
    raise exception 'canonical Member State schema 3.0.0 required';
  end if;
  if next_state->>'memberId' is distinct from uid::text then
    raise exception 'Member State memberId does not match authenticated user';
  end if;
  next_revision := nullif(next_state->>'revision','')::integer;

  if expected_revision = -1 then
    if next_revision <> 0 then
      raise exception 'initial Member State revision must be 0';
    end if;
    insert into public.el8_member_state(user_id,schema_version,revision,state,updated_at)
    values(uid,'3.0.0',0,next_state,now())
    on conflict (user_id) do nothing
    returning * into saved;
  else
    if next_revision is null or next_revision <> expected_revision + 1 then
      raise exception 'invalid Member State revision transition';
    end if;
    update public.el8_member_state
    set schema_version='3.0.0',revision=next_revision,state=next_state,updated_at=now()
    where user_id=uid and revision=expected_revision
    returning * into saved;
  end if;

  if saved.user_id is null then
    raise exception 'Member State revision conflict';
  end if;
  return saved;
end
$$;
revoke execute on function public.save_el8_member_state(integer,jsonb) from public, anon;
grant execute on function public.save_el8_member_state(integer,jsonb) to authenticated;
