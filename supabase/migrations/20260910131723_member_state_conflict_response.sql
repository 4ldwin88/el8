-- Forward correction of the API error contract after isolated PostgREST rehearsal.
-- A stale revision is a business conflict, not a retryable serialization failure.
-- PT409 maps explicitly to HTTP 409; no table, privilege or CAS semantics change.
begin;
do $migration$
declare definition text;
begin
 if (select count(*) from pg_proc where pronamespace='public'::regnamespace and proname='save_el8_member_state')<>1 then
  raise exception 'unexpected Member State writer overload';
 end if;
 select pg_get_functiondef(p.oid) into definition from pg_proc p
 where p.oid='public.save_el8_member_state(integer,jsonb)'::regprocedure
 and p.proowner='postgres'::regrole;
 -- Observed from the exact F writer after staging replay on PostgreSQL 17.6.
 -- Refuse drift rather than rewriting an unknown function body.
 if definition is null or md5(definition)<>'22e62a9e9575d1cb093ef9f66f300a97' then
  raise exception 'unexpected Member State writer definition';
 end if;
 execute replace(definition, 'errcode = ''40001''', 'errcode = ''PT409''');
end $migration$;
commit;
