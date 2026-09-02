-- G-02 internal human QA persistence v3.
-- QA/simulation data remains isolated from canonical member evidence while using
-- the same versioned Intelligence output contracts.

alter table public.el8_intelligence_test_sessions
  add column if not exists qa_environment text not null default 'internal_human_qa',
  add column if not exists simulation boolean not null default true,
  add column if not exists telemetry_schema_version text not null default '1.0.0',
  add column if not exists engine_candidate_sha text,
  add column if not exists deployment_id text;

alter table public.el8_intelligence_test_sessions
  drop constraint if exists el8_intelligence_test_sessions_status_check;
alter table public.el8_intelligence_test_sessions
  add constraint el8_intelligence_test_sessions_status_check
  check (status in ('started','discovery','priorities','focus','plan','completed','telemetry_failed'));

alter table public.el8_intelligence_test_sessions
  drop constraint if exists el8_intelligence_test_sessions_qa_environment_check;
alter table public.el8_intelligence_test_sessions
  add constraint el8_intelligence_test_sessions_qa_environment_check
  check (qa_environment in ('internal_human_qa','automated_qa','external_test'));

create index if not exists el8_intelligence_test_sessions_environment_started_idx
  on public.el8_intelligence_test_sessions (qa_environment, started_at desc);
create index if not exists el8_intelligence_test_events_session_created_idx
  on public.el8_intelligence_test_events (session_id, created_at);
create index if not exists el8_intelligence_test_notes_session_created_idx
  on public.el8_intelligence_test_notes (session_id, created_at);

create or replace function public.el8_intelligence_test_start(p_session jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_enabled boolean;
  v_environment text := coalesce(p_session->>'qa_environment','internal_human_qa');
begin
  select enabled into v_enabled from public.el8_intelligence_test_config where singleton=true;
  if coalesce(v_enabled,false) is not true then raise exception 'Intelligence Test is currently paused'; end if;
  v_id := (p_session->>'id')::uuid;
  if v_id is null then raise exception 'Session id required'; end if;
  if v_environment not in ('internal_human_qa','automated_qa','external_test') then raise exception 'Invalid QA environment'; end if;
  if coalesce((p_session->>'simulation')::boolean,true) is not true then raise exception 'Intelligence Test sessions must be simulation data'; end if;

  insert into public.el8_intelligence_test_sessions(
    id,test_version,build_version,engine_version,tester_mode,status,last_stage,client_meta,
    qa_environment,simulation,telemetry_schema_version,engine_candidate_sha,deployment_id
  ) values (
    v_id,
    left(coalesce(p_session->>'test_version','unknown'),64),
    left(coalesce(p_session->>'build_version',''),128),
    coalesce(p_session->'engine_version','{}'::jsonb),
    case when p_session->>'tester_mode' in ('self','roleplay','prefer_not_to_say') then p_session->>'tester_mode' else 'prefer_not_to_say' end,
    'started','introduction',coalesce(p_session->'client_meta','{}'::jsonb),
    v_environment,true,left(coalesce(p_session->>'telemetry_schema_version','1.0.0'),32),
    nullif(left(coalesce(p_session->>'engine_candidate_sha',''),64),''),
    nullif(left(coalesce(p_session->>'deployment_id',''),128),'')
  )
  on conflict(id) do nothing;
  return v_id;
end
$$;

create or replace function public.el8_intelligence_test_complete(p_result jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := (p_result->>'session_id')::uuid;
  v_elapsed bigint := greatest(coalesce((p_result->>'elapsed_ms')::bigint,0),0);
  v_meta jsonb := coalesce(p_result->'version_meta','{}'::jsonb);
begin
  if not exists(select 1 from public.el8_intelligence_test_sessions where id=v_id) then raise exception 'Unknown test session'; end if;
  if coalesce((p_result->>'simulation')::boolean,true) is not true then raise exception 'QA result must be simulation data'; end if;

  insert into public.el8_intelligence_test_results(
    session_id,baseline,discovery,recommended_priorities,confirmed_priorities,proposed_plan,
    priority_accuracy,survey,version_meta,elapsed_ms,discovery_opening_snapshot,member_state,
    canonical_plan,selection_evidence,activation_evidence,outcome_evidence,accelerated_review
  ) values (
    v_id,'{}'::jsonb,coalesce(p_result->'discovery','{}'::jsonb),
    coalesce(p_result->'recommended_priorities','[]'::jsonb),coalesce(p_result->'confirmed_priorities','[]'::jsonb),
    coalesce(p_result->'proposed_plan','{}'::jsonb),
    case when (p_result->>'priority_accuracy')::int between 1 and 5 then (p_result->>'priority_accuracy')::int else null end,
    coalesce(p_result->'survey','{}'::jsonb),v_meta,v_elapsed,
    coalesce(p_result->'discovery_opening_snapshot','{}'::jsonb),coalesce(p_result->'member_state','{}'::jsonb),
    coalesce(p_result->'canonical_plan','{}'::jsonb),coalesce(p_result->'selection_evidence','{}'::jsonb),
    coalesce(p_result->'activation_evidence','{}'::jsonb),coalesce(p_result->'outcome_evidence','{}'::jsonb),
    coalesce(p_result->'accelerated_review','{}'::jsonb)
  ) on conflict(session_id) do update set
    discovery=excluded.discovery,recommended_priorities=excluded.recommended_priorities,
    confirmed_priorities=excluded.confirmed_priorities,proposed_plan=excluded.proposed_plan,
    priority_accuracy=excluded.priority_accuracy,survey=excluded.survey,version_meta=excluded.version_meta,
    elapsed_ms=excluded.elapsed_ms,discovery_opening_snapshot=excluded.discovery_opening_snapshot,
    member_state=excluded.member_state,canonical_plan=excluded.canonical_plan,
    selection_evidence=excluded.selection_evidence,activation_evidence=excluded.activation_evidence,
    outcome_evidence=excluded.outcome_evidence,accelerated_review=excluded.accelerated_review,submitted_at=now();

  update public.el8_intelligence_test_sessions
  set status='completed',last_stage='completed',completed_at=now(),elapsed_ms=v_elapsed,updated_at=now()
  where id=v_id;
  return true;
end
$$;

revoke execute on function public.el8_intelligence_test_start(jsonb) from public, anon;
revoke execute on function public.el8_intelligence_test_event(jsonb) from public, anon;
revoke execute on function public.el8_intelligence_test_note(jsonb) from public, anon;
revoke execute on function public.el8_intelligence_test_complete(jsonb) from public, anon;
