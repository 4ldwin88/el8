create or replace function public.el8_guard_member_state_revision()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Member State user_id is immutable';
  end if;
  if new.schema_version is distinct from old.schema_version then
    raise exception 'Member State schema_version is immutable';
  end if;
  if new.revision <> old.revision + 1 then
    raise exception 'Member State revision must increment by exactly one';
  end if;
  return new;
end
$$;
revoke execute on function public.el8_guard_member_state_revision() from public, anon, authenticated;
drop trigger if exists el8_guard_member_state_revision on public.el8_member_state;
create trigger el8_guard_member_state_revision
before update on public.el8_member_state
for each row execute function public.el8_guard_member_state_revision();
