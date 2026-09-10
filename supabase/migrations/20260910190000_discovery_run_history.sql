-- Current working Discovery runs are versioned source/progress records.
-- This command does not promote a baseline, Focus, Plan or condition conclusion.
begin;
do $preflight$
begin
 if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname in ('el8_discovery_runs','el8_discovery_run_revisions'))
 or exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname in ('el8_valid_discovery_run_record','save_el8_discovery_run')) then
  raise exception 'unexpected Discovery run baseline objects';
 end if;
end $preflight$;

create function public.el8_valid_discovery_run_record(payload jsonb) returns boolean
language plpgsql immutable set search_path=pg_catalog as $validator$
declare s jsonb; key text; observation jsonb;
begin
 if jsonb_typeof(payload) is distinct from 'object' then return false; end if;
 if (select count(*) from jsonb_object_keys(payload))<>4
 or payload->>'format' is distinct from 'el8.discovery-run.v1'
 or jsonb_typeof(payload->'contractFingerprint') is distinct from 'string'
 or (payload->>'contractFingerprint') !~ '^[a-f0-9]{64}$'
 or jsonb_typeof(payload->'runId') is distinct from 'string'
 or (payload->>'runId') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
 then return false; end if;
 s:=payload->'session';
 if jsonb_typeof(s) is distinct from 'object' or s ? 'questionBank'
 or s->>'runId' is distinct from payload->>'runId' then return false; end if;
 foreach key in array array['observationLog','constructIds','asked','questionTimings','unresolvedRequirements'] loop
  if jsonb_typeof(s->key) is distinct from 'array' then return false; end if;
 end loop;
 foreach key in array array['facts','resolutionStates','baselineCoverage','driverSelections','severityResponses','relationshipEvidence','safetyContextualSignals'] loop
  if jsonb_typeof(s->key) is distinct from 'object' then return false; end if;
 end loop;
 if jsonb_typeof(s->'phase') is distinct from 'string'
 or jsonb_typeof(s->'assessmentStart') is distinct from 'number'
 or jsonb_typeof(s->'questionsAsked') is distinct from 'number'
 or (s->>'questionsAsked') !~ '^(0|[1-9][0-9]*)$' then return false; end if;
 for observation in select value from jsonb_array_elements(s->'observationLog') loop
  if jsonb_typeof(observation) is distinct from 'object'
  or jsonb_typeof(observation->'id') is distinct from 'string' or length(observation->>'id')=0
  or jsonb_typeof(observation->'questionId') is distinct from 'string' or length(observation->>'questionId')=0
  or jsonb_typeof(observation->'timestamp') is distinct from 'number' then return false; end if;
 end loop;
 return true;
end $validator$;
alter function public.el8_valid_discovery_run_record(jsonb) owner to postgres;

create table public.el8_discovery_runs (
 run_id uuid primary key,
 user_id uuid not null references auth.users(id),
 revision integer not null check(revision>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(run_id,user_id)
);
create index el8_discovery_runs_owner on public.el8_discovery_runs(user_id);
create table public.el8_discovery_run_revisions (
 run_id uuid not null,
 user_id uuid not null,
 revision integer not null check(revision>=0),
 request_id uuid not null,
 record jsonb not null check(public.el8_valid_discovery_run_record(record)),
 recorded_at timestamptz not null default now(),
 primary key(run_id,revision),
 unique(user_id,request_id),
 foreign key(run_id,user_id) references public.el8_discovery_runs(run_id,user_id),
 check((record->>'runId')::uuid=run_id)
);
alter table public.el8_discovery_runs owner to postgres;
alter table public.el8_discovery_run_revisions owner to postgres;
alter table public.el8_discovery_runs enable row level security;
alter table public.el8_discovery_run_revisions enable row level security;
create policy discovery_runs_read_own on public.el8_discovery_runs for select to authenticated using((select auth.uid())=user_id);
create policy discovery_run_revisions_read_own on public.el8_discovery_run_revisions for select to authenticated using((select auth.uid())=user_id);
revoke all on public.el8_discovery_runs,public.el8_discovery_run_revisions from public,anon,authenticated;
grant select on public.el8_discovery_runs,public.el8_discovery_run_revisions to authenticated;
-- Privileged maintenance is separate from the ordinary run command.
grant all on public.el8_discovery_runs,public.el8_discovery_run_revisions to service_role;

create function public.save_el8_discovery_run(run_id uuid,expected_revision integer,request_id uuid,run_record jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $writer$
declare uid uuid:=auth.uid(); head public.el8_discovery_runs%rowtype;
 accepted public.el8_discovery_run_revisions%rowtype; prior_record jsonb;
 inserted integer:=0; next_revision integer;
begin
 if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if run_id is null or request_id is null or expected_revision is null or expected_revision < -1
 or expected_revision=2147483647 then raise exception 'invalid Discovery run command' using errcode='22023'; end if;
 if not public.el8_valid_discovery_run_record(run_record)
 or (run_record->>'runId')::uuid is distinct from run_id then
  raise exception 'invalid Discovery run record or identity' using errcode='23514';
 end if;
 if expected_revision=-1 then
  insert into public.el8_discovery_runs as r(run_id,user_id,revision)
   values(save_el8_discovery_run.run_id,uid,0) on conflict do nothing;
  get diagnostics inserted=row_count;
 end if;
 select r.* into head from public.el8_discovery_runs r
  where r.run_id=save_el8_discovery_run.run_id for update;
 if not found then raise exception 'Discovery revision conflict' using errcode='PT409'; end if;
 if head.user_id<>uid then raise exception 'Discovery ownership not authorized' using errcode='42501'; end if;
 -- Check after acquiring the run lock: a concurrent identical request may have
 -- committed while this transaction waited. An old retry returns its old receipt.
 select v.* into accepted from public.el8_discovery_run_revisions v
  where v.user_id=uid and v.request_id=save_el8_discovery_run.request_id;
 if found then
  if accepted.run_id<>run_id or accepted.revision<>expected_revision+1 or accepted.record is distinct from run_record then
   raise exception 'Discovery request ID conflict' using errcode='PT409';
  end if;
  return to_jsonb(accepted);
 end if;
 if inserted=0 and head.revision<>expected_revision then
  raise exception 'Discovery revision conflict' using errcode='PT409';
 end if;
 if inserted=0 then
  select v.record into prior_record from public.el8_discovery_run_revisions v
   where v.run_id=head.run_id and v.revision=head.revision;
  if not found then raise exception 'Discovery history invariant violated' using errcode='23514'; end if;
  if prior_record->>'contractFingerprint' is distinct from run_record->>'contractFingerprint' then
   raise exception 'Discovery contract change requires explicit migration or a new run' using errcode='23514';
  end if;
  if exists(select 1 from jsonb_array_elements(prior_record#>'{session,observationLog}') with ordinality as o(value,n)
    where (run_record#>'{session,observationLog}'->((o.n-1)::integer)) is distinct from o.value) then
   raise exception 'accepted Discovery observations are immutable ordered history' using errcode='23514';
  end if;
 end if;
 next_revision:=expected_revision+1;
 insert into public.el8_discovery_run_revisions(run_id,user_id,revision,request_id,record)
  values(save_el8_discovery_run.run_id,uid,next_revision,save_el8_discovery_run.request_id,run_record)
  returning * into accepted;
 update public.el8_discovery_runs as r set revision=next_revision,updated_at=now() where r.run_id=head.run_id;
 return to_jsonb(accepted);
end $writer$;
alter function public.save_el8_discovery_run(uuid,integer,uuid,jsonb) owner to postgres;
revoke all on function public.save_el8_discovery_run(uuid,integer,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.save_el8_discovery_run(uuid,integer,uuid,jsonb) to authenticated;
revoke all on function public.el8_valid_discovery_run_record(jsonb) from public,anon,authenticated;
grant execute on function public.el8_valid_discovery_run_record(jsonb) to service_role;
do $privileges$
declare table_name text;
begin
 foreach table_name in array array['public.el8_discovery_runs','public.el8_discovery_run_revisions'] loop
  if has_table_privilege('authenticated',table_name,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
   or has_any_column_privilege('authenticated',table_name,'INSERT,UPDATE,REFERENCES')
   or has_table_privilege('anon',table_name,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
   or has_any_column_privilege('anon',table_name,'SELECT,INSERT,UPDATE,REFERENCES') then
   raise exception 'unexpected inherited Discovery run table privilege';
  end if;
 end loop;
 if has_function_privilege('anon','public.save_el8_discovery_run(uuid,integer,uuid,jsonb)','EXECUTE') then
  raise exception 'unexpected inherited Discovery run function privilege';
 end if;
end $privileges$;
commit;
