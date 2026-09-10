-- Observed EL8 public-schema checkpoint, captured 2026-09-10.
-- Evidence of deployed structure, NOT product authority or an applied historical migration.
-- Synthetic, empty disposable environments only. No data, secrets, cron or Edge deployment.
-- Requires independent Supabase platform Auth/roles/extensions. See README.md.

begin;

do $$ begin if current_setting('el8.bootstrap_disposable',true) is distinct from 'yes' then raise exception 'disposable bootstrap authorization required'; end if; if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relkind in ('r','p','v','m','S')) or exists(select 1 from pg_proc p where p.pronamespace='public'::regnamespace and not exists(select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e')) then raise exception 'checkpoint requires an empty public schema'; end if; end $$;

set local search_path=public,extensions;

set local check_function_bodies=false;

create sequence public."el8_member_seq" as bigint increment by 1 minvalue 1 maxvalue 9223372036854775807 start with 1 cache 1 no cycle;

create table public."discovery_human_test_reports" (
  "id" uuid default gen_random_uuid() not null,
  "created_at" timestamp with time zone default now() not null,
  "test_name" text not null,
  "test_version" text not null,
  "assessment_version" text,
  "phase" text,
  "display_questions_shown" integer,
  "questions_asked" integer,
  "tester_notes" jsonb default '[]'::jsonb not null,
  "focus_feedback" jsonb default '[]'::jsonb not null,
  "overall_notes" text,
  "selected_actions" jsonb default '[]'::jsonb not null,
  "report" jsonb not null
);

alter table public."discovery_human_test_reports" owner to "postgres";

alter table public."discovery_human_test_reports" enable row level security;

create table public."el8_adaptation_decisions" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "from_direction" text not null,
  "recommended_direction" text not null,
  "reason" text,
  "member_response" text,
  "applied_direction" text,
  "prompted_at" timestamp with time zone,
  "responded_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_adaptation_decisions" owner to "postgres";

alter table public."el8_adaptation_decisions" enable row level security;

create table public."el8_admin_audit" (
  "audit_id" uuid default gen_random_uuid() not null,
  "admin_user_id" uuid not null,
  "target_user_id" uuid,
  "action" text not null,
  "reason" text,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_admin_audit" owner to "postgres";

alter table public."el8_admin_audit" enable row level security;

create table public."el8_admins" (
  "user_id" uuid not null,
  "role" text default 'founder_admin'::text not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_admins" owner to "postgres";

alter table public."el8_admins" enable row level security;

create table public."el8_ai_usage" (
  "usage_id" uuid default gen_random_uuid() not null,
  "submission_id" uuid,
  "user_id" uuid not null,
  "member_code" text,
  "operation_type" text not null,
  "model" text not null,
  "input_tokens" integer,
  "output_tokens" integer,
  "total_tokens" integer,
  "estimated_cost_usd" numeric(12,8),
  "usage_payload" jsonb,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_ai_usage" owner to "postgres";

alter table public."el8_ai_usage" enable row level security;

create table public."el8_assessment_sessions" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "module_id" text not null,
  "module_version" text not null,
  "module_type" text not null,
  "status" text default 'in_progress'::text not null,
  "trigger_type" text,
  "trigger_context" jsonb default '{}'::jsonb not null,
  "responses" jsonb default '{}'::jsonb not null,
  "derived_outputs" jsonb default '{}'::jsonb not null,
  "safety_flags" jsonb default '[]'::jsonb not null,
  "evidence_context" jsonb default '{}'::jsonb not null,
  "local_timezone" text default 'America/Toronto'::text not null,
  "started_at" timestamp with time zone default now() not null,
  "submitted_at" timestamp with time zone,
  "updated_at" timestamp with time zone default now() not null,
  "active_duration_seconds" integer,
  "interaction_count" integer,
  "background_duration_seconds" integer
);

alter table public."el8_assessment_sessions" owner to "postgres";

alter table public."el8_assessment_sessions" enable row level security;

create table public."el8_checkin_followups" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "source_checkin_id" uuid,
  "source_question_id" text,
  "source_dimension" text,
  "source_summary" text,
  "followup_kind" text not null,
  "prompt" text not null,
  "response_type" text not null,
  "options" jsonb,
  "signal_map" jsonb default '{}'::jsonb not null,
  "priority" smallint default 50 not null,
  "status" text default 'pending'::text not null,
  "due_on" date,
  "expires_on" date,
  "presented_at" timestamp with time zone,
  "answered_at" timestamp with time zone,
  "answer" jsonb,
  "safety_relevant" boolean default false not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_checkin_followups" owner to "postgres";

alter table public."el8_checkin_followups" enable row level security;

create table public."el8_checkin_question_bank" (
  "question_key" text not null,
  "version" integer default 1 not null,
  "question_kind" text not null,
  "prompt_template" text not null,
  "response_type" text not null,
  "options" jsonb,
  "primary_dimensions" text[] default '{}'::text[] not null,
  "signal_map" jsonb default '{}'::jsonb not null,
  "followup_rules" jsonb default '[]'::jsonb not null,
  "safety_rules" jsonb default '[]'::jsonb not null,
  "active" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "schedule_rule" jsonb default '{}'::jsonb not null,
  "min_member_day" integer,
  "max_member_day" integer,
  "cadence_days" integer,
  "suppress_if_recent_days" integer,
  "information_value" smallint default 50 not null,
  "burden_cost" smallint default 20 not null,
  "causal_followup_key" text,
  "trajectory_followup_enabled" boolean default false not null,
  "actionability" smallint default 3 not null,
  "dependencies" jsonb default '[]'::jsonb not null,
  "stale_after_days" integer,
  "options_source" text,
  "question_purpose" text default 'checkin'::text not null,
  "source_ref" text,
  "eligibility_triggers" jsonb default '[]'::jsonb not null
);

alter table public."el8_checkin_question_bank" owner to "postgres";

alter table public."el8_checkin_question_bank" enable row level security;

create table public."el8_checkin_signals" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "checkin_id" uuid,
  "source_type" text not null,
  "source_key" text,
  "dimension" text,
  "related_dimensions" text[] default '{}'::text[] not null,
  "signal_type" text not null,
  "direction" smallint,
  "severity" smallint default 0 not null,
  "confidence" numeric(4,3) default 0.700 not null,
  "information_value" smallint default 50 not null,
  "safety_relevant" boolean default false not null,
  "payload" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_checkin_signals" owner to "postgres";

alter table public."el8_checkin_signals" enable row level security;

create table public."el8_daily_checkins" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "local_date" date not null,
  "local_timezone" text default 'America/Toronto'::text not null,
  "employment_action" text,
  "debt_status" text,
  "eating_status" text,
  "movement" text,
  "manageability" text,
  "member_note" text,
  "submitted_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "started_at" timestamp with time zone,
  "active_duration_seconds" integer,
  "interaction_count" integer,
  "focus_dimensions" jsonb default '[]'::jsonb not null,
  "question_set" jsonb default '[]'::jsonb not null,
  "answers" jsonb default '{}'::jsonb not null,
  "system_feedback" jsonb default '{}'::jsonb not null,
  "adaptation_snapshot" jsonb default '{}'::jsonb not null,
  "scheduled_question_keys" jsonb default '[]'::jsonb not null
);

alter table public."el8_daily_checkins" owner to "postgres";

alter table public."el8_daily_checkins" enable row level security;

create table public."el8_emotional_deepenings" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "baseline_completed_at" timestamp with time zone not null,
  "payload" jsonb default '{}'::jsonb not null,
  "pattern" text,
  "severity" text,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_emotional_deepenings" owner to "postgres";

alter table public."el8_emotional_deepenings" enable row level security;

create table public."el8_entries" (
  "entry_id" text not null,
  "member_id" text not null,
  "record_type" text not null,
  "submission_id" text,
  "payload" jsonb not null,
  "payload_hash" text not null,
  "source" text not null,
  "confirmation_status" text default 'confirmed'::text not null,
  "evidence_confidence" text,
  "coverage" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "deleted_at" timestamp with time zone
);

alter table public."el8_entries" owner to "postgres";

alter table public."el8_entries" enable row level security;

create table public."el8_entry_revisions" (
  "revision_id" uuid default gen_random_uuid() not null,
  "entry_id" text not null,
  "prior_payload" jsonb not null,
  "prior_payload_hash" text not null,
  "changed_at" timestamp with time zone default now() not null,
  "change_reason" text,
  "changed_by" text
);

alter table public."el8_entry_revisions" owner to "postgres";

alter table public."el8_entry_revisions" enable row level security;

create table public."el8_focus_clarifications" (
  "clarification_id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "baseline_completed_at" timestamp with time zone,
  "tied_dimensions" text[] not null,
  "selected_focus" text,
  "answers" jsonb default '{}'::jsonb not null,
  "status" text default 'completed'::text not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_focus_clarifications" owner to "postgres";

alter table public."el8_focus_clarifications" enable row level security;

create table public."el8_intelligence_test_config" (
  "singleton" boolean default true not null,
  "enabled" boolean default true not null,
  "test_version" text default '0.1.0'::text not null,
  "message" text,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_intelligence_test_config" owner to "postgres";

alter table public."el8_intelligence_test_config" enable row level security;

create table public."el8_intelligence_test_events" (
  "id" bigint generated always as identity (sequence name public."el8_intelligence_test_events_id_seq" start with 1 increment by 1 minvalue 1 maxvalue 9223372036854775807 cache 1 no cycle) not null,
  "session_id" uuid not null,
  "sequence" integer not null,
  "event_type" text not null,
  "stage" text,
  "screen_id" text,
  "question_id" text,
  "elapsed_ms" bigint,
  "payload" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_intelligence_test_events" owner to "postgres";

alter table public."el8_intelligence_test_events" enable row level security;

create table public."el8_intelligence_test_notes" (
  "id" bigint generated always as identity (sequence name public."el8_intelligence_test_notes_id_seq" start with 1 increment by 1 minvalue 1 maxvalue 9223372036854775807 cache 1 no cycle) not null,
  "session_id" uuid not null,
  "stage" text,
  "screen_id" text,
  "question_id" text,
  "elapsed_ms" bigint,
  "note_text" text not null,
  "version_meta" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_intelligence_test_notes" owner to "postgres";

alter table public."el8_intelligence_test_notes" enable row level security;

create table public."el8_intelligence_test_results" (
  "session_id" uuid not null,
  "baseline" jsonb default '{}'::jsonb not null,
  "discovery" jsonb default '{}'::jsonb not null,
  "recommended_priorities" jsonb default '[]'::jsonb not null,
  "confirmed_priorities" jsonb default '[]'::jsonb not null,
  "proposed_plan" jsonb default '{}'::jsonb not null,
  "priority_accuracy" smallint,
  "survey" jsonb default '{}'::jsonb not null,
  "version_meta" jsonb default '{}'::jsonb not null,
  "elapsed_ms" bigint,
  "submitted_at" timestamp with time zone default now() not null,
  "discovery_opening_snapshot" jsonb default '{}'::jsonb not null,
  "member_state" jsonb default '{}'::jsonb not null,
  "canonical_plan" jsonb default '{}'::jsonb not null,
  "selection_evidence" jsonb default '{}'::jsonb not null,
  "activation_evidence" jsonb default '{}'::jsonb not null,
  "outcome_evidence" jsonb default '{}'::jsonb not null,
  "accelerated_review" jsonb default '{}'::jsonb not null
);

alter table public."el8_intelligence_test_results" owner to "postgres";

alter table public."el8_intelligence_test_results" enable row level security;

create table public."el8_intelligence_test_sessions" (
  "id" uuid not null,
  "test_version" text not null,
  "build_version" text,
  "engine_version" jsonb default '{}'::jsonb not null,
  "tester_mode" text,
  "status" text default 'started'::text not null,
  "started_at" timestamp with time zone default now() not null,
  "completed_at" timestamp with time zone,
  "last_stage" text,
  "elapsed_ms" bigint,
  "client_meta" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "qa_environment" text default 'internal_human_qa'::text not null,
  "simulation" boolean default true not null,
  "telemetry_schema_version" text default '1.0.0'::text not null,
  "engine_candidate_sha" text,
  "deployment_id" text
);

alter table public."el8_intelligence_test_sessions" owner to "postgres";

alter table public."el8_intelligence_test_sessions" enable row level security;

create table public."el8_member_activity" (
  "user_id" uuid not null,
  "member_code" text,
  "last_login_at" timestamp with time zone,
  "last_meaningful_activity_at" timestamp with time zone,
  "last_checkin_at" timestamp with time zone,
  "last_log_at" timestamp with time zone,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_member_activity" owner to "postgres";

alter table public."el8_member_activity" enable row level security;

create table public."el8_member_load_state" (
  "user_id" uuid not null,
  "member_code" text,
  "load_level" text default 'normal'::text not null,
  "last_manageability" text,
  "friction_score" smallint,
  "question_budget_hint" integer,
  "intervention_budget_hint" integer,
  "reason" text,
  "updated_at" timestamp with time zone default now() not null,
  "adaptation_direction" text default 'hold'::text not null,
  "recommended_direction" text,
  "recommendation_reason" text,
  "recommendation_at" timestamp with time zone,
  "member_response" text,
  "member_response_at" timestamp with time zone,
  "ask_again_after" timestamp with time zone
);

alter table public."el8_member_load_state" owner to "postgres";

alter table public."el8_member_load_state" enable row level security;

create table public."el8_member_state" (
  "user_id" uuid not null,
  "revision" integer default 0 not null,
  "state" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "schema_version" text default '3.0.0'::text not null
);

alter table public."el8_member_state" owner to "postgres";

alter table public."el8_member_state" enable row level security;

create table public."el8_module_assignments" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "module_id" text not null,
  "module_version" text not null,
  "module_type" text not null,
  "assignment_status" text default 'recommended'::text not null,
  "priority" integer default 100 not null,
  "reason" text,
  "trigger_type" text,
  "trigger_context" jsonb default '{}'::jsonb not null,
  "available_at" timestamp with time zone default now() not null,
  "due_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_module_assignments" owner to "postgres";

alter table public."el8_module_assignments" enable row level security;

create table public."el8_onboarding_runs" (
  "run_id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "module_version" text not null,
  "payload" jsonb not null,
  "elapsed_seconds" integer,
  "completed_at" timestamp with time zone default now() not null
);

alter table public."el8_onboarding_runs" owner to "postgres";

alter table public."el8_onboarding_runs" enable row level security;

create table public."el8_plan_checkins" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "plan_id" uuid not null,
  "adherence" text not null,
  "burden" text not null,
  "signal" text not null,
  "measure_note" text,
  "member_note" text,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_plan_checkins" owner to "postgres";

alter table public."el8_plan_checkins" enable row level security;

create table public."el8_plan_reassessments" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "plan_id" uuid not null,
  "kind" text not null,
  "status" text default 'open'::text not null,
  "reason" text,
  "evidence_session_ids" jsonb default '[]'::jsonb not null,
  "requested_dimension" text,
  "responses" jsonb default '{}'::jsonb not null,
  "derived_outputs" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "completed_at" timestamp with time zone,
  "resulting_plan_id" uuid
);

alter table public."el8_plan_reassessments" owner to "postgres";

alter table public."el8_plan_reassessments" enable row level security;

create table public."el8_plan_reviews" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "plan_id" uuid not null,
  "outcome" text not null,
  "adherence" text not null,
  "burden" text not null,
  "usefulness" text not null,
  "priority_shift" text default 'no'::text not null,
  "proposed_dimension" text,
  "recommendation" text not null,
  "rationale" text not null,
  "created_at" timestamp with time zone default now() not null,
  "checkin_context" jsonb default '{}'::jsonb not null,
  "applied_at" timestamp with time zone,
  "resulting_plan_id" uuid,
  "adaptation" jsonb default '{}'::jsonb not null,
  "capacity_signal" jsonb default '{}'::jsonb not null,
  "is_test" boolean default false not null
);

alter table public."el8_plan_reviews" owner to "postgres";

alter table public."el8_plan_reviews" enable row level security;

create table public."el8_plans" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "baseline_completed_at" timestamp with time zone,
  "dimension" text,
  "source" text,
  "primary_action" text,
  "supporting_action" text,
  "measure" text,
  "review_days" integer,
  "rationale" text,
  "status" text default 'active'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "supporting_dimension" text,
  "actions" jsonb,
  "generated_from" jsonb,
  "updated_at" timestamp with time zone default now() not null,
  "parent_plan_id" uuid,
  "version" integer default 1 not null,
  "ended_at" timestamp with time zone,
  "adjustment_reason" text,
  "focus_dimensions" jsonb,
  "interventions" jsonb,
  "capacity" jsonb,
  "plan_objective" text,
  "is_test" boolean default false not null,
  "schema_version" text,
  "focus_ids" jsonb,
  "canonical_actions" jsonb,
  "governed_actions" jsonb
);

alter table public."el8_plans" owner to "postgres";

alter table public."el8_plans" enable row level security;

create table public."el8_profiles" (
  "user_id" uuid not null,
  "member_code" text not null,
  "display_name" text,
  "onboarding_status" text default 'not_started'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "account_status" text default 'active'::text not null,
  "timezone" text default 'UTC'::text not null,
  "birthdate" date,
  "sex" text,
  "measurement_system" text,
  "locale" text default 'en-CA'::text,
  "appearance" text default 'light'::text not null,
  "hydration_target_ml" integer default 3000 not null,
  "country" text,
  "reminder_preference" text default 'helpful'::text not null
);

alter table public."el8_profiles" owner to "postgres";

alter table public."el8_profiles" enable row level security;

create table public."el8_qa_accelerated_checkins" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "qa_session_id" uuid not null,
  "qa_cycle" integer not null,
  "interval_seconds" integer default 120 not null,
  "answers" jsonb default '{}'::jsonb not null,
  "intelligence_shadow" jsonb,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_qa_accelerated_checkins" owner to "postgres";

alter table public."el8_qa_accelerated_checkins" enable row level security;

create table public."el8_qa_events" (
  "id" bigint generated by default as identity (sequence name public."el8_qa_events_id_seq" start with 1 increment by 1 minvalue 1 maxvalue 9223372036854775807 cache 1 no cycle) not null,
  "run_id" uuid not null,
  "user_id" uuid not null,
  "occurred_at" timestamp with time zone default now() not null,
  "event_type" text not null,
  "step" text,
  "payload" jsonb default '{}'::jsonb not null
);

alter table public."el8_qa_events" owner to "postgres";

alter table public."el8_qa_events" enable row level security;

create table public."el8_qa_feedback" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "page" text,
  "feedback_type" text default 'general'::text not null,
  "feedback" text not null,
  "context" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_qa_feedback" owner to "postgres";

alter table public."el8_qa_feedback" enable row level security;

create table public."el8_qa_runs" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "started_at" timestamp with time zone default now() not null,
  "completed_at" timestamp with time zone,
  "status" text default 'active'::text not null,
  "app_commit" text,
  "context" jsonb default '{}'::jsonb not null
);

alter table public."el8_qa_runs" owner to "postgres";

alter table public."el8_qa_runs" enable row level security;

create table public."el8_question_experiment_variants" (
  "experiment_key" text not null,
  "question_key" text not null,
  "variant_label" text not null,
  "allocation_weight" numeric(8,4) default 1 not null,
  "active" boolean default true not null
);

alter table public."el8_question_experiment_variants" owner to "postgres";

alter table public."el8_question_experiment_variants" enable row level security;

create table public."el8_question_experiments" (
  "experiment_key" text not null,
  "name" text not null,
  "family_key" text not null,
  "status" text default 'draft'::text not null,
  "max_experimental_questions_per_checkin" smallint default 1 not null,
  "allocation_rule" jsonb default '{"method": "balanced_rotation"}'::jsonb not null,
  "eligibility_rule" jsonb default '{}'::jsonb not null,
  "priority" smallint default 10 not null,
  "starts_at" timestamp with time zone,
  "ends_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_question_experiments" owner to "postgres";

alter table public."el8_question_experiments" enable row level security;

create table public."el8_question_exposures" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "checkin_id" uuid,
  "experiment_key" text,
  "question_key" text not null,
  "variant_label" text,
  "offered_at" timestamp with time zone default now() not null,
  "answered_at" timestamp with time zone,
  "skipped_at" timestamp with time zone,
  "abandoned" boolean default false not null,
  "response" jsonb,
  "active_duration_seconds" integer,
  "followup_needed" boolean,
  "action_changed" boolean,
  "resolved_dimensions" text[] default '{}'::text[] not null,
  "clarity_rating" smallint,
  "usefulness_rating" smallint,
  "friction_rating" smallint,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_question_exposures" owner to "postgres";

alter table public."el8_question_exposures" enable row level security;

create table public."el8_question_matrix" (
  "question_key" text not null,
  "version" integer default 1 not null,
  "validation_state" text default 'qa'::text not null,
  "question_family" text not null,
  "prompt" text not null,
  "response_type" text default 'single_choice'::text not null,
  "options" jsonb default '[]'::jsonb not null,
  "primary_signal" text not null,
  "secondary_signals" text[] default '{}'::text[] not null,
  "primary_dimension" text not null,
  "affected_dimensions" text[] default '{}'::text[] not null,
  "hypotheses_discriminated" jsonb default '[]'::jsonb not null,
  "answer_signal_map" jsonb default '{}'::jsonb not null,
  "temporal_window" text,
  "trigger_conditions" jsonb default '{}'::jsonb not null,
  "contraindications" jsonb default '{}'::jsonb not null,
  "expected_information_gain" smallint default 3 not null,
  "actionability" smallint default 3 not null,
  "burden" smallint default 1 not null,
  "sensitivity" smallint default 1 not null,
  "redundancy_family" text,
  "minimum_repeat_interval_hours" integer default 24 not null,
  "intervention_implications" jsonb default '[]'::jsonb not null,
  "evidence_strength" text default 'research_grounded'::text not null,
  "evidence_sources" jsonb default '[]'::jsonb not null,
  "qa_only" boolean default true not null,
  "active" boolean default true not null,
  "notes" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_question_matrix" owner to "postgres";

alter table public."el8_question_matrix" enable row level security;

create table public."el8_quick_logs" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "local_date" date not null,
  "logged_at" timestamp with time zone default now() not null,
  "measure" text not null,
  "value" numeric,
  "unit" text,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);

alter table public."el8_quick_logs" owner to "postgres";

alter table public."el8_quick_logs" enable row level security;

create table public."el8_safety_events" (
  "event_id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "module_version" text not null,
  "provisional_level" integer not null,
  "trigger_items" jsonb not null,
  "safety_answers" jsonb not null,
  "elapsed_seconds" integer,
  "disposition" text default 'open'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "is_simulation" boolean default false not null
);

alter table public."el8_safety_events" owner to "postgres";

alter table public."el8_safety_events" enable row level security;

create table public."el8_safety_reconciliations" (
  "reconciliation_id" uuid default gen_random_uuid() not null,
  "event_id" uuid not null,
  "user_id" uuid not null,
  "reconciliation_type" text not null,
  "current_danger" text,
  "external_support" text,
  "wants_resume" boolean,
  "member_note" text,
  "status" text default 'pending'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "resolved_at" timestamp with time zone
);

alter table public."el8_safety_reconciliations" owner to "postgres";

alter table public."el8_safety_reconciliations" enable row level security;

create table public."el8_signals" (
  "signal_key" text not null,
  "dimension" text not null,
  "signal_name" text not null,
  "definition" text not null,
  "active" boolean default true not null,
  "version" integer default 1 not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_signals" owner to "postgres";

alter table public."el8_signals" enable row level security;

create table public."el8_submissions" (
  "submission_id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text not null,
  "input_type" text not null,
  "original_text" text,
  "transcript" text,
  "media_path" text,
  "media_kind" text,
  "keep_original" boolean default false not null,
  "processing_status" text default 'submitted'::text not null,
  "interpretation" jsonb,
  "member_correction" jsonb,
  "confirmed_at" timestamp with time zone,
  "media_delete_after" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);

alter table public."el8_submissions" owner to "postgres";

alter table public."el8_submissions" enable row level security;

create table public."el8_weekly_checkins" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "member_code" text,
  "week_start" date not null,
  "week_end" date not null,
  "local_timezone" text default 'America/Toronto'::text not null,
  "overall_week" text not null,
  "progress" text,
  "friction" text,
  "plan_adjustment" text,
  "member_note" text,
  "active_signals" jsonb default '{}'::jsonb not null,
  "weekly_context" jsonb default '{}'::jsonb not null,
  "submitted_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "started_at" timestamp with time zone,
  "active_duration_seconds" integer,
  "interaction_count" integer
);

alter table public."el8_weekly_checkins" owner to "postgres";

alter table public."el8_weekly_checkins" enable row level security;

CREATE OR REPLACE FUNCTION public.activate_el8_plan_v2(p_plan_id uuid)
 RETURNS el8_plans
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_plan public.el8_plans;
begin
  select * into v_plan
  from public.el8_plans
  where id = p_plan_id
    and user_id = (select auth.uid())
    and schema_version = '2.0.0';

  if not found then
    raise exception 'Canonical Plan v2 not found for authenticated member';
  end if;

  if v_plan.status = 'active' then
    return v_plan;
  end if;

  if v_plan.status <> 'proposed' then
    raise exception 'Canonical Plan v2 must be proposed before activation';
  end if;

  update public.el8_plans
  set status = 'replaced', ended_at = coalesce(ended_at, now()), updated_at = now()
  where user_id = (select auth.uid())
    and status = 'active'
    and id <> p_plan_id;

  update public.el8_plans
  set status = 'active', updated_at = now()
  where id = p_plan_id
  returning * into v_plan;

  return v_plan;
end;
$function$;

alter function public.activate_el8_plan_v2(uuid) owner to "postgres";

CREATE OR REPLACE FUNCTION public.activate_el8_plan_v3(p_plan_id uuid)
 RETURNS el8_plans
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_plan public.el8_plans;
begin
  select * into v_plan
  from public.el8_plans
  where id = p_plan_id
    and user_id = (select auth.uid())
    and schema_version = '3.0.0';

  if not found then
    raise exception 'Plan v3 not found for authenticated member';
  end if;
  if v_plan.status = 'active' then return v_plan; end if;
  if v_plan.status <> 'proposed' then
    raise exception 'Plan v3 must be proposed before activation';
  end if;

  update public.el8_plans
  set status = 'replaced', ended_at = coalesce(ended_at, now()), updated_at = now()
  where user_id = (select auth.uid())
    and status = 'active'
    and id <> p_plan_id;

  update public.el8_plans
  set status = 'active', updated_at = now()
  where id = p_plan_id
  returning * into v_plan;
  return v_plan;
end;
$function$;

alter function public.activate_el8_plan_v3(uuid) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_account_purge_active()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$ select current_setting('el8.account_purge', true) = 'on' $function$;

alter function public.el8_account_purge_active() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_admin_delete_test_account(p_user_id uuid, p_confirmation text, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_code text;
begin
  if not public.el8_is_admin() then raise exception 'Admin access required'; end if;
  if p_user_id=auth.uid() then raise exception 'Admin cannot delete own account'; end if;
  select member_code into v_code from public.el8_profiles where user_id=p_user_id;
  if v_code is null then raise exception 'Member not found'; end if;
  if p_confirmation <> v_code then raise exception 'Type the member code to confirm deletion'; end if;
  insert into public.el8_admin_audit(admin_user_id,target_user_id,action,reason,metadata) values(auth.uid(),p_user_id,'delete_test_account',nullif(trim(p_reason),''),jsonb_build_object('member_code',v_code));
  delete from auth.users where id=p_user_id;
  return jsonb_build_object('status','deleted','member_code',v_code);
end;$function$;

alter function public.el8_admin_delete_test_account(uuid,text,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_admin_get_member(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v jsonb;
begin
  if not public.el8_is_admin() then raise exception 'Admin access required'; end if;
  select jsonb_build_object(
    'profile',jsonb_build_object('user_id',p.user_id,'member_code',p.member_code,'onboarding_status',p.onboarding_status,'account_status',p.account_status,'created_at',p.created_at),
    'email',u.email,
    'latest_safety',(select to_jsonb(e) from public.el8_safety_events e where e.user_id=p.user_id order by e.created_at desc limit 1),
    'pending_reconciliation',(select to_jsonb(r) from public.el8_safety_reconciliations r join public.el8_safety_events e on e.event_id=r.event_id where e.user_id=p.user_id and r.status='pending' order by r.created_at desc limit 1)
  ) into v from public.el8_profiles p join auth.users u on u.id=p.user_id where p.user_id=p_user_id;
  if v is null then raise exception 'Member not found'; end if;
  return v;
end;$function$;

alter function public.el8_admin_get_member(uuid) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_admin_list_members()
 RETURNS TABLE(user_id uuid, member_code text, email text, onboarding_status text, account_status text, created_at timestamp with time zone, safety_level integer, safety_disposition text, pending_reconciliation boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select p.user_id,p.member_code,u.email,p.onboarding_status,p.account_status,p.created_at,
    se.provisional_level,se.disposition,
    exists(select 1 from public.el8_safety_reconciliations r where r.event_id=se.event_id and r.status='pending')
  from public.el8_profiles p
  join auth.users u on u.id=p.user_id
  left join lateral (
    select e.event_id,e.provisional_level,e.disposition from public.el8_safety_events e
    where e.user_id=p.user_id order by e.created_at desc limit 1
  ) se on true
  where public.el8_is_admin()
  order by p.created_at asc;
$function$;

alter function public.el8_admin_list_members() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_admin_reset_onboarding(p_user_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not public.el8_is_admin() then raise exception 'Admin access required'; end if;
  if exists(select 1 from public.el8_safety_events where user_id=p_user_id and disposition='open') then raise exception 'Open safety event must be resolved before onboarding reset'; end if;
  update public.el8_profiles set onboarding_status='not_started',updated_at=now() where user_id=p_user_id;
  if not found then raise exception 'Member not found'; end if;
  insert into public.el8_admin_audit(admin_user_id,target_user_id,action,reason) values(auth.uid(),p_user_id,'reset_onboarding',nullif(trim(p_reason),''));
  return jsonb_build_object('status','ok');
end;$function$;

alter function public.el8_admin_reset_onboarding(uuid,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_admin_resolve_safety(p_event_id uuid, p_resolution text, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_event public.el8_safety_events%rowtype;
begin
  if not public.el8_is_admin() then raise exception 'Admin access required'; end if;
  if p_resolution not in ('resumed','remains_paused','transferred') then raise exception 'Invalid safety resolution'; end if;
  if nullif(trim(p_reason),'') is null then raise exception 'Reason is required'; end if;
  select * into v_event from public.el8_safety_events where event_id=p_event_id for update;
  if not found then raise exception 'Safety event not found'; end if;
  if v_event.disposition<>'open' then raise exception 'Safety event is already closed or transferred'; end if;
  if p_resolution='resumed' then
    update public.el8_safety_events set disposition='closed' where event_id=p_event_id;
    update public.el8_safety_reconciliations set status='resumed',resolved_at=now() where event_id=p_event_id and status='pending';
    update public.el8_profiles set onboarding_status='not_started',account_status='active',updated_at=now() where user_id=v_event.user_id;
  elsif p_resolution='transferred' then
    update public.el8_safety_events set disposition='transferred' where event_id=p_event_id;
    update public.el8_safety_reconciliations set status='transferred',resolved_at=now() where event_id=p_event_id and status='pending';
  else
    update public.el8_safety_reconciliations set status='remains_paused',resolved_at=now() where event_id=p_event_id and status='pending';
  end if;
  insert into public.el8_admin_audit(admin_user_id,target_user_id,action,reason,metadata) values(auth.uid(),v_event.user_id,'resolve_safety',trim(p_reason),jsonb_build_object('event_id',p_event_id,'resolution',p_resolution));
  return jsonb_build_object('status','ok','resolution',p_resolution);
end;$function$;

alter function public.el8_admin_resolve_safety(uuid,text,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_admin_set_account_status(p_user_id uuid, p_status text, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_code text;
begin
  if not public.el8_is_admin() then raise exception 'Admin access required'; end if;
  if p_status not in ('active','admin_paused','deactivated') then raise exception 'Invalid account status'; end if;
  if p_user_id=auth.uid() and p_status<>'active' then raise exception 'Admin cannot pause or deactivate own account'; end if;
  update public.el8_profiles set account_status=p_status,updated_at=now() where user_id=p_user_id returning member_code into v_code;
  if v_code is null then raise exception 'Member not found'; end if;
  insert into public.el8_admin_audit(admin_user_id,target_user_id,action,reason,metadata) values(auth.uid(),p_user_id,'set_account_status',nullif(trim(p_reason),''),jsonb_build_object('status',p_status,'member_code',v_code));
  return jsonb_build_object('status','ok','account_status',p_status,'member_code',v_code);
end;$function$;

alter function public.el8_admin_set_account_status(uuid,text,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_canonical_action_ids_valid(actions jsonb)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
 select jsonb_typeof(actions)='array'
    and jsonb_array_length(actions)>0
    and not exists (
      select 1 from jsonb_array_elements(actions) a
      where jsonb_typeof(a) <> 'object'
         or coalesce(a->>'actionId','') !~ '^(PHY|EMT|SOC|OCC|FIN|ENV|INT|SPT|XDM)-A[0-9]{2}$'
    );
$function$;

alter function public.el8_canonical_action_ids_valid(jsonb) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_correct_entry(p_entry_id text, p_expected_payload_hash text, p_new_payload jsonb, p_change_reason text, p_changed_by text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_existing public.el8_entries%rowtype; v_new_hash text:=md5(p_new_payload::text); v_member_code text;
begin
 select member_code into v_member_code from public.el8_profiles where user_id=auth.uid();
 if v_member_code is null then raise exception 'authenticated member profile required' using errcode='42501'; end if;
 select * into v_existing from public.el8_entries where entry_id=p_entry_id and member_id=v_member_code and deleted_at is null for update;
 if not found then return jsonb_build_object('status','not_found','entry_id',p_entry_id); end if;
 if v_existing.payload_hash<>p_expected_payload_hash then return jsonb_build_object('status','stale_conflict','entry_id',p_entry_id,'stored_payload_hash',v_existing.payload_hash,'expected_payload_hash',p_expected_payload_hash); end if;
 insert into public.el8_entry_revisions(entry_id,prior_payload,prior_payload_hash,change_reason,changed_by) values(p_entry_id,v_existing.payload,v_existing.payload_hash,coalesce(nullif(trim(p_change_reason),''),'member correction'),v_member_code);
 update public.el8_entries set payload=p_new_payload,payload_hash=v_new_hash,confirmation_status='corrected',updated_at=now() where entry_id=p_entry_id and member_id=v_member_code and deleted_at is null;
 return jsonb_build_object('status','corrected','entry_id',p_entry_id,'previous_payload_hash',v_existing.payload_hash,'new_payload_hash',v_new_hash);
end $function$;

alter function public.el8_correct_entry(text,text,jsonb,text,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_create_once(p_entry_id text, p_member_id text, p_record_type text, p_submission_id text, p_payload jsonb, p_source text, p_confirmation_status text DEFAULT 'confirmed'::text, p_evidence_confidence text DEFAULT NULL::text, p_coverage text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_hash text := md5(p_payload::text);
  v_existing public.el8_entries%rowtype;
  v_inserted boolean := false;
begin
  insert into public.el8_entries(entry_id,member_id,record_type,submission_id,payload,payload_hash,source,confirmation_status,evidence_confidence,coverage)
  values (p_entry_id,p_member_id,p_record_type,p_submission_id,p_payload,v_hash,p_source,p_confirmation_status,p_evidence_confidence,p_coverage)
  on conflict (entry_id) do nothing;
  get diagnostics v_inserted = row_count;

  select * into v_existing from public.el8_entries where entry_id=p_entry_id;
  if not found then raise exception 'persistence verification failed'; end if;

  if v_existing.payload_hash = v_hash and v_existing.member_id=p_member_id and v_existing.record_type=p_record_type then
    return jsonb_build_object('status', case when v_inserted then 'created' else 'duplicate_safe' end, 'entry_id', p_entry_id, 'payload_hash', v_hash);
  end if;

  return jsonb_build_object('status','conflict','entry_id',p_entry_id,'stored_payload_hash',v_existing.payload_hash,'attempted_payload_hash',v_hash);
end;
$function$;

alter function public.el8_create_once(text,text,text,text,jsonb,text,text,text,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_days_between(a timestamp with time zone, b timestamp with time zone)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$ select greatest(0,floor(extract(epoch from (b-a))/86400)::int) $function$;

alter function public.el8_days_between(timestamp with time zone,timestamp with time zone) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_enforce_plan_evidence_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare p_user uuid; p_status text; begin select user_id,status into p_user,p_status from public.el8_plans where id=new.plan_id; if p_user is null then raise exception 'Referenced plan does not exist'; end if; if new.user_id<>p_user then raise exception 'Evidence user must match plan owner'; end if; if tg_table_name='el8_plan_checkins' and tg_op='INSERT' and p_status<>'active' then raise exception 'Check-ins can only be added to the current active plan version'; end if; return new; end $function$;

alter function public.el8_enforce_plan_evidence_integrity() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_append_only_record()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() and tg_op='DELETE' then return old; end if;
  raise exception '% records are append-only',tg_table_name using errcode='55000';
end; $function$;

alter function public.el8_guard_append_only_record() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_entry_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() then return old; end if;
  raise exception 'canonical entries cannot be deleted' using errcode='55000';
end; $function$;

alter function public.el8_guard_entry_delete() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_entry_identity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
 if new.id is distinct from old.id or new.member_id is distinct from old.member_id or new.created_at is distinct from old.created_at then
   raise exception 'entry identity fields are immutable' using errcode='55000';
 end if;
 return new;
end $function$;

alter function public.el8_guard_entry_identity() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_entry_revisions_append_only()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() and tg_op='DELETE' then return old; end if;
  raise exception 'entry revisions are append-only' using errcode='55000';
end; $function$;

alter function public.el8_guard_entry_revisions_append_only() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_immutable_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() then return old; end if;
  if tg_table_name = 'el8_daily_checkins' and old.member_code = 'T0006' and current_setting('el8.qa_reset', true) = 'on' then return old; end if;
  raise exception 'Submitted history is immutable';
end; $function$;

alter function public.el8_guard_immutable_history() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_member_state_revision()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$;

alter function public.el8_guard_member_state_revision() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_module_assignment_identity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ begin if new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.member_code is distinct from old.member_code or new.module_id is distinct from old.module_id or new.module_version is distinct from old.module_version or new.module_type is distinct from old.module_type or new.created_at is distinct from old.created_at then raise exception 'module assignment identity fields are immutable' using errcode='55000'; end if; return new; end $function$;

alter function public.el8_guard_module_assignment_identity() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_plan_identity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ begin if new.id is distinct from old.id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at or new.baseline_completed_at is distinct from old.baseline_completed_at then raise exception 'plan identity fields are immutable' using errcode='55000'; end if; return new; end $function$;

alter function public.el8_guard_plan_identity() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_plan_review_immutable()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() and tg_op='DELETE' then return old; end if;
  if tg_op='DELETE' then raise exception '% records are append-only',tg_table_name using errcode='55000'; end if;
  if old.applied_at is null and new.applied_at is not null
     and new.id is not distinct from old.id and new.user_id is not distinct from old.user_id
     and new.plan_id is not distinct from old.plan_id and new.outcome is not distinct from old.outcome
     and new.adherence is not distinct from old.adherence and new.burden is not distinct from old.burden
     and new.usefulness is not distinct from old.usefulness and new.priority_shift is not distinct from old.priority_shift
     and new.proposed_dimension is not distinct from old.proposed_dimension and new.recommendation is not distinct from old.recommendation
     and new.rationale is not distinct from old.rationale and new.checkin_context is not distinct from old.checkin_context
     and new.created_at is not distinct from old.created_at then return new; end if;
  raise exception '% records are immutable after creation except one-time apply metadata',tg_table_name using errcode='55000';
end; $function$;

alter function public.el8_guard_plan_review_immutable() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_plan_schema_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if new.schema_version is distinct from old.schema_version then
    raise exception 'Plan schema_version is immutable';
  end if;
  return new;
end
$function$;

alter function public.el8_guard_plan_schema_version() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_profile_system_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
 if new.user_id is distinct from old.user_id or new.member_code is distinct from old.member_code or new.created_at is distinct from old.created_at then
   raise exception 'profile identity fields cannot be changed' using errcode='55000';
 end if;
 if current_user <> 'postgres' and (new.account_status is distinct from old.account_status) then
   raise exception 'profile account status cannot be changed directly' using errcode='55000';
 end if;
 if current_user <> 'postgres' and new.onboarding_status is distinct from old.onboarding_status then
   if not (old.onboarding_status <> 'completed' and new.onboarding_status = 'completed' and new.account_status = 'active' and exists (select 1 from public.el8_assessment_sessions s where s.user_id=new.user_id and s.module_type='universal_baseline' and s.status='completed')) then
     raise exception 'profile onboarding status transition not allowed' using errcode='55000';
   end if;
 end if;
 return new;
end $function$;

alter function public.el8_guard_profile_system_fields() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_reassessment_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ begin
 if current_user in ('postgres','service_role') then return new; end if;
 if auth.uid() is null or auth.uid()<>old.user_id then raise exception 'not authorized'; end if;
 if old.status<>'open' or new.status<>'completed' then raise exception 'invalid reassessment transition'; end if;
 if new.id<>old.id or new.user_id<>old.user_id or new.plan_id<>old.plan_id or new.kind<>old.kind or new.created_at<>old.created_at or new.reason is distinct from old.reason or new.evidence_session_ids is distinct from old.evidence_session_ids or new.requested_dimension is distinct from old.requested_dimension then raise exception 'reassessment identity is immutable'; end if;
 if new.completed_at is null or new.resulting_plan_id is null then raise exception 'completed reassessment requires resulting plan'; end if;
 return new; end $function$;

alter function public.el8_guard_reassessment_update() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_safety_event_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() then return old; end if;
  raise exception 'safety events cannot be deleted' using errcode='55000';
end; $function$;

alter function public.el8_guard_safety_event_delete() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_safety_event_member_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
 if new.event_id is distinct from old.event_id or new.user_id is distinct from old.user_id or new.created_at is distinct from old.created_at then
   raise exception 'safety event identity is immutable' using errcode='55000';
 end if;
 return new;
end $function$;

alter function public.el8_guard_safety_event_member_fields() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_safety_reconciliation_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() then return old; end if;
  raise exception 'safety reconciliation records cannot be deleted' using errcode='55000';
end; $function$;

alter function public.el8_guard_safety_reconciliation_delete() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_safety_reconciliation_identity()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ begin if new.reconciliation_id is distinct from old.reconciliation_id or new.event_id is distinct from old.event_id or new.user_id is distinct from old.user_id or new.reconciliation_type is distinct from old.reconciliation_type or new.created_at is distinct from old.created_at then raise exception 'safety reconciliation identity is immutable' using errcode='55000'; end if; return new; end $function$;

alter function public.el8_guard_safety_reconciliation_identity() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_guard_submission_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if public.el8_account_purge_active() then return old; end if;
  raise exception 'submission records cannot be deleted' using errcode='55000';
end; $function$;

alter function public.el8_guard_submission_delete() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.el8_profiles(user_id, member_code, display_name)
  values (new.id, public.el8_make_member_code(), coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (user_id) do nothing;
  return new;
end;$function$;

alter function public.el8_handle_new_user() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_intelligence_test_complete(p_result jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare v_id uuid := (p_result->>'session_id')::uuid; v_elapsed bigint := greatest(coalesce((p_result->>'elapsed_ms')::bigint,0),0); v_meta jsonb := coalesce(p_result->'version_meta','{}'::jsonb); begin if not exists(select 1 from public.el8_intelligence_test_sessions where id=v_id) then raise exception 'Unknown test session'; end if; if coalesce((p_result->>'simulation')::boolean,true) is not true then raise exception 'QA result must be simulation data'; end if; insert into public.el8_intelligence_test_results(session_id,baseline,discovery,recommended_priorities,confirmed_priorities,proposed_plan,priority_accuracy,survey,version_meta,elapsed_ms,discovery_opening_snapshot,member_state,canonical_plan,selection_evidence,activation_evidence,outcome_evidence,accelerated_review) values(v_id,'{}'::jsonb,coalesce(p_result->'discovery','{}'::jsonb),coalesce(p_result->'recommended_priorities','[]'::jsonb),coalesce(p_result->'confirmed_priorities','[]'::jsonb),coalesce(p_result->'proposed_plan','{}'::jsonb),case when (p_result->>'priority_accuracy')::int between 1 and 5 then (p_result->>'priority_accuracy')::int else null end,coalesce(p_result->'survey','{}'::jsonb),v_meta,v_elapsed,coalesce(p_result->'discovery_opening_snapshot','{}'::jsonb),coalesce(p_result->'member_state','{}'::jsonb),coalesce(p_result->'canonical_plan','{}'::jsonb),coalesce(p_result->'selection_evidence','{}'::jsonb),coalesce(p_result->'activation_evidence','{}'::jsonb),coalesce(p_result->'outcome_evidence','{}'::jsonb),coalesce(p_result->'accelerated_review','{}'::jsonb)) on conflict(session_id) do update set discovery=excluded.discovery,recommended_priorities=excluded.recommended_priorities,confirmed_priorities=excluded.confirmed_priorities,proposed_plan=excluded.proposed_plan,priority_accuracy=excluded.priority_accuracy,survey=excluded.survey,version_meta=excluded.version_meta,elapsed_ms=excluded.elapsed_ms,discovery_opening_snapshot=excluded.discovery_opening_snapshot,member_state=excluded.member_state,canonical_plan=excluded.canonical_plan,selection_evidence=excluded.selection_evidence,activation_evidence=excluded.activation_evidence,outcome_evidence=excluded.outcome_evidence,accelerated_review=excluded.accelerated_review,submitted_at=now(); update public.el8_intelligence_test_sessions set status='completed',last_stage='completed',completed_at=now(),elapsed_ms=v_elapsed,updated_at=now() where id=v_id; return true; end $function$;

alter function public.el8_intelligence_test_complete(jsonb) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_intelligence_test_config()
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 select jsonb_build_object('enabled',enabled,'test_version',test_version,'message',message)
 from public.el8_intelligence_test_config where singleton=true;
$function$;

alter function public.el8_intelligence_test_config() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_intelligence_test_event(p_event jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid := (p_event->>'session_id')::uuid; v_seq int := (p_event->>'sequence')::int;
begin
 if not exists(select 1 from public.el8_intelligence_test_sessions where id=v_id) then raise exception 'Unknown test session'; end if;
 insert into public.el8_intelligence_test_events(session_id,sequence,event_type,stage,screen_id,question_id,elapsed_ms,payload)
 values(v_id,v_seq,left(coalesce(p_event->>'event_type','event'),80),left(p_event->>'stage',80),left(p_event->>'screen_id',120),left(p_event->>'question_id',120),greatest(coalesce((p_event->>'elapsed_ms')::bigint,0),0),coalesce(p_event->'payload','{}'::jsonb))
 on conflict(session_id,sequence) do nothing;
 update public.el8_intelligence_test_sessions set last_stage=left(p_event->>'stage',80),elapsed_ms=greatest(coalesce((p_event->>'elapsed_ms')::bigint,0),0),updated_at=now() where id=v_id;
 return true;
end$function$;

alter function public.el8_intelligence_test_event(jsonb) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_intelligence_test_note(p_note jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_id uuid := (p_note->>'session_id')::uuid; v_text text := btrim(coalesce(p_note->>'note_text',''));
begin
 if char_length(v_text)=0 then return true; end if;
 if char_length(v_text)>4000 then raise exception 'Tester note too long'; end if;
 if not exists(select 1 from public.el8_intelligence_test_sessions where id=v_id) then raise exception 'Unknown test session'; end if;
 insert into public.el8_intelligence_test_notes(session_id,stage,screen_id,question_id,elapsed_ms,note_text,version_meta)
 values(v_id,left(p_note->>'stage',80),left(p_note->>'screen_id',120),left(p_note->>'question_id',120),greatest(coalesce((p_note->>'elapsed_ms')::bigint,0),0),v_text,coalesce(p_note->'version_meta','{}'::jsonb));
 return true;
end$function$;

alter function public.el8_intelligence_test_note(jsonb) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_intelligence_test_start(p_session jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ declare v_id uuid; v_enabled boolean; v_environment text := coalesce(p_session->>'qa_environment','internal_human_qa'); begin select enabled into v_enabled from public.el8_intelligence_test_config where singleton=true; if coalesce(v_enabled,false) is not true then raise exception 'Intelligence Test is currently paused'; end if; v_id := (p_session->>'id')::uuid; if v_id is null then raise exception 'Session id required'; end if; if v_environment not in ('internal_human_qa','automated_qa','external_test') then raise exception 'Invalid QA environment'; end if; if coalesce((p_session->>'simulation')::boolean,true) is not true then raise exception 'Intelligence Test sessions must be simulation data'; end if; insert into public.el8_intelligence_test_sessions(id,test_version,build_version,engine_version,tester_mode,status,last_stage,client_meta,qa_environment,simulation,telemetry_schema_version,engine_candidate_sha,deployment_id) values(v_id,left(coalesce(p_session->>'test_version','unknown'),64),left(coalesce(p_session->>'build_version',''),128),coalesce(p_session->'engine_version','{}'::jsonb),case when p_session->>'tester_mode' in ('self','roleplay','prefer_not_to_say') then p_session->>'tester_mode' else 'prefer_not_to_say' end,'started','introduction',coalesce(p_session->'client_meta','{}'::jsonb),v_environment,true,left(coalesce(p_session->>'telemetry_schema_version','1.0.0'),32),nullif(left(coalesce(p_session->>'engine_candidate_sha',''),64),''),nullif(left(coalesce(p_session->>'deployment_id',''),128),'')) on conflict(id) do nothing; return v_id; end $function$;

alter function public.el8_intelligence_test_start(jsonb) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists(select 1 from public.el8_admins where user_id=auth.uid());
$function$;

alter function public.el8_is_admin() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_make_member_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  return 'T' || lpad(nextval('public.el8_member_seq')::text, 4, '0');
end;$function$;

alter function public.el8_make_member_code() owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_purge_account(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare v_member_code text;
begin
  select member_code into v_member_code from public.el8_profiles where user_id=target_user_id;
  if v_member_code = 'T0001' then raise exception 'T0001 is protected from account purge'; end if;
  if not exists(select 1 from auth.users where id=target_user_id) then raise exception 'Auth user not found'; end if;
  perform set_config('el8.account_purge','on',true);
  delete from auth.users where id=target_user_id;
  perform set_config('el8.account_purge','off',true);
end; $function$;

alter function public.el8_purge_account(uuid) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_request_safety_reconciliation(p_event_id uuid, p_current_danger text, p_external_support text, p_wants_resume boolean, p_member_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_event public.el8_safety_events%rowtype;
  v_id uuid;
begin
  select * into v_event
  from public.el8_safety_events
  where event_id=p_event_id and user_id=auth.uid();

  if not found then raise exception 'Safety event not found'; end if;
  if v_event.disposition <> 'open' then
    return jsonb_build_object('status','already_closed');
  end if;

  select reconciliation_id into v_id
  from public.el8_safety_reconciliations
  where event_id=p_event_id
    and user_id=auth.uid()
    and reconciliation_type='member_request'
    and status='pending'
  order by created_at asc
  limit 1;

  if v_id is not null then
    return jsonb_build_object('status','already_pending','reconciliation_id',v_id);
  end if;

  insert into public.el8_safety_reconciliations(
    event_id,user_id,reconciliation_type,current_danger,external_support,wants_resume,member_note,status
  ) values(
    p_event_id,auth.uid(),'member_request',p_current_danger,p_external_support,p_wants_resume,nullif(trim(p_member_note),''),'pending'
  )
  on conflict (event_id) where reconciliation_type='member_request' and status='pending'
  do nothing
  returning reconciliation_id into v_id;

  if v_id is null then
    select reconciliation_id into v_id
    from public.el8_safety_reconciliations
    where event_id=p_event_id
      and user_id=auth.uid()
      and reconciliation_type='member_request'
      and status='pending'
    order by created_at asc
    limit 1;
    return jsonb_build_object('status','already_pending','reconciliation_id',v_id);
  end if;

  return jsonb_build_object('status','pending','reconciliation_id',v_id);
end;
$function$;

alter function public.el8_request_safety_reconciliation(uuid,text,text,boolean,text) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_review_is_test(r el8_plan_reviews)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$ select coalesce(r.is_test,false) or coalesce(r.checkin_context->>'qa','false')='true' or coalesce(r.rationale,'') like 'QA-V2-%' or exists(select 1 from public.el8_plans p where p.id=r.plan_id and p.is_test=true) $function$;

alter function public.el8_review_is_test(el8_plan_reviews) owner to "postgres";

CREATE OR REPLACE FUNCTION public.el8_validate_plan_v3()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  if new.schema_version is distinct from '3.0.0' then
    return new;
  end if;

  if new.focus_ids is null or jsonb_typeof(new.focus_ids) <> 'array' then
    raise exception 'Plan v3 requires focus_ids array';
  end if;
  if new.governed_actions is null or jsonb_typeof(new.governed_actions) <> 'array' then
    raise exception 'Plan v3 requires governed_actions array';
  end if;
  if new.status not in ('proposed','active','replaced','ended','blocked','no_plan','deepen') then
    raise exception 'Invalid Plan v3 status: %', new.status;
  end if;
  if exists (
    select 1 from jsonb_array_elements(new.governed_actions) a
    where jsonb_typeof(a) <> 'object'
       or coalesce(a->>'actionId','') !~ '^[A-Z]{3}-A[0-9]{2}$'
  ) then
    raise exception 'Plan v3 governed_actions contain invalid Action instance';
  end if;
  if new.status in ('proposed','active') and jsonb_array_length(new.focus_ids) = 0 then
    raise exception 'Proposed or active Plan v3 requires member-confirmed Focus';
  end if;
  return new;
end;
$function$;

alter function public.el8_validate_plan_v3() owner to "postgres";

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

alter function public.rls_auto_enable() owner to "postgres";

CREATE OR REPLACE FUNCTION public.save_el8_member_state(expected_revision integer, next_state jsonb)
 RETURNS el8_member_state
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$;

alter function public.save_el8_member_state(integer,jsonb) owner to "postgres";

alter table public."discovery_human_test_reports" add constraint "discovery_human_test_reports_pkey" PRIMARY KEY (id);

alter table public."el8_adaptation_decisions" add constraint "el8_adaptation_decisions_pkey" PRIMARY KEY (id);

alter table public."el8_admin_audit" add constraint "el8_admin_audit_pkey" PRIMARY KEY (audit_id);

alter table public."el8_admins" add constraint "el8_admins_pkey" PRIMARY KEY (user_id);

alter table public."el8_ai_usage" add constraint "el8_ai_usage_pkey" PRIMARY KEY (usage_id);

alter table public."el8_assessment_sessions" add constraint "el8_assessment_sessions_pkey" PRIMARY KEY (id);

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_pkey" PRIMARY KEY (id);

alter table public."el8_checkin_question_bank" add constraint "el8_checkin_question_bank_pkey" PRIMARY KEY (question_key);

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_pkey" PRIMARY KEY (id);

alter table public."el8_daily_checkins" add constraint "el8_daily_checkins_pkey" PRIMARY KEY (id);

alter table public."el8_emotional_deepenings" add constraint "el8_emotional_deepenings_pkey" PRIMARY KEY (id);

alter table public."el8_entries" add constraint "el8_entries_pkey" PRIMARY KEY (entry_id);

alter table public."el8_entry_revisions" add constraint "el8_entry_revisions_pkey" PRIMARY KEY (revision_id);

alter table public."el8_focus_clarifications" add constraint "el8_focus_clarifications_pkey" PRIMARY KEY (clarification_id);

alter table public."el8_intelligence_test_config" add constraint "el8_intelligence_test_config_pkey" PRIMARY KEY (singleton);

alter table public."el8_intelligence_test_events" add constraint "el8_intelligence_test_events_pkey" PRIMARY KEY (id);

alter table public."el8_intelligence_test_notes" add constraint "el8_intelligence_test_notes_pkey" PRIMARY KEY (id);

alter table public."el8_intelligence_test_results" add constraint "el8_intelligence_test_results_pkey" PRIMARY KEY (session_id);

alter table public."el8_intelligence_test_sessions" add constraint "el8_intelligence_test_sessions_pkey" PRIMARY KEY (id);

alter table public."el8_member_activity" add constraint "el8_member_activity_pkey" PRIMARY KEY (user_id);

alter table public."el8_member_load_state" add constraint "el8_member_load_state_pkey" PRIMARY KEY (user_id);

alter table public."el8_member_state" add constraint "el8_member_state_pkey" PRIMARY KEY (user_id);

alter table public."el8_module_assignments" add constraint "el8_module_assignments_pkey" PRIMARY KEY (id);

alter table public."el8_onboarding_runs" add constraint "el8_onboarding_runs_pkey" PRIMARY KEY (run_id);

alter table public."el8_plan_checkins" add constraint "el8_plan_checkins_pkey" PRIMARY KEY (id);

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_pkey" PRIMARY KEY (id);

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_pkey" PRIMARY KEY (id);

alter table public."el8_plans" add constraint "el8_plans_pkey" PRIMARY KEY (id);

alter table public."el8_profiles" add constraint "el8_profiles_pkey" PRIMARY KEY (user_id);

alter table public."el8_qa_accelerated_checkins" add constraint "el8_qa_accelerated_checkins_pkey" PRIMARY KEY (id);

alter table public."el8_qa_events" add constraint "el8_qa_events_pkey" PRIMARY KEY (id);

alter table public."el8_qa_feedback" add constraint "el8_qa_feedback_pkey" PRIMARY KEY (id);

alter table public."el8_qa_runs" add constraint "el8_qa_runs_pkey" PRIMARY KEY (id);

alter table public."el8_question_experiment_variants" add constraint "el8_question_experiment_variants_pkey" PRIMARY KEY (experiment_key, question_key);

alter table public."el8_question_experiments" add constraint "el8_question_experiments_pkey" PRIMARY KEY (experiment_key);

alter table public."el8_question_exposures" add constraint "el8_question_exposures_pkey" PRIMARY KEY (id);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_pkey" PRIMARY KEY (question_key);

alter table public."el8_quick_logs" add constraint "el8_quick_logs_pkey" PRIMARY KEY (id);

alter table public."el8_safety_events" add constraint "el8_safety_events_pkey" PRIMARY KEY (event_id);

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_pkey" PRIMARY KEY (reconciliation_id);

alter table public."el8_signals" add constraint "el8_signals_pkey" PRIMARY KEY (signal_key);

alter table public."el8_submissions" add constraint "el8_submissions_pkey" PRIMARY KEY (submission_id);

alter table public."el8_weekly_checkins" add constraint "el8_weekly_checkins_pkey" PRIMARY KEY (id);

alter table public."el8_daily_checkins" add constraint "el8_daily_checkins_user_id_local_date_key" UNIQUE (user_id, local_date);

alter table public."el8_intelligence_test_events" add constraint "el8_intelligence_test_events_session_id_sequence_key" UNIQUE (session_id, sequence);

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_one_open" UNIQUE NULLS NOT DISTINCT (user_id, plan_id, status);

alter table public."el8_profiles" add constraint "el8_profiles_member_code_key" UNIQUE (member_code);

alter table public."el8_weekly_checkins" add constraint "el8_weekly_checkins_user_id_week_start_key" UNIQUE (user_id, week_start);

alter table public."el8_adaptation_decisions" add constraint "el8_adaptation_decisions_applied_direction_check" CHECK (applied_direction IS NULL OR (applied_direction = ANY (ARRAY['reduce'::text, 'hold'::text, 'expand'::text, 'flagged'::text])));

alter table public."el8_adaptation_decisions" add constraint "el8_adaptation_decisions_from_direction_check" CHECK (from_direction = ANY (ARRAY['reduce'::text, 'hold'::text, 'expand'::text, 'flagged'::text]));

alter table public."el8_adaptation_decisions" add constraint "el8_adaptation_decisions_member_response_check" CHECK (member_response IS NULL OR (member_response = ANY (ARRAY['accepted'::text, 'keep_same'::text, 'unsure'::text, 'snoozed'::text])));

alter table public."el8_adaptation_decisions" add constraint "el8_adaptation_decisions_recommended_direction_check" CHECK (recommended_direction = ANY (ARRAY['reduce'::text, 'hold'::text, 'expand'::text, 'flagged'::text]));

alter table public."el8_admins" add constraint "el8_admins_role_check" CHECK (role = ANY (ARRAY['founder_admin'::text, 'admin'::text, 'safety_reviewer'::text]));

alter table public."el8_assessment_sessions" add constraint "el8_assessment_active_duration_nonnegative" CHECK (active_duration_seconds IS NULL OR active_duration_seconds >= 0);

alter table public."el8_assessment_sessions" add constraint "el8_assessment_background_duration_nonnegative" CHECK (background_duration_seconds IS NULL OR background_duration_seconds >= 0);

alter table public."el8_assessment_sessions" add constraint "el8_assessment_sessions_status_check" CHECK (status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'paused'::text, 'abandoned'::text]));

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_followup_kind_check" CHECK (followup_kind = ANY (ARRAY['trajectory'::text, 'cause'::text, 'clarification'::text, 'safety_clarification'::text]));

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_priority_check" CHECK (priority >= 0 AND priority <= 100);

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_response_type_check" CHECK (response_type = ANY (ARRAY['ordered_scale'::text, 'single_choice'::text, 'multi_choice'::text, 'text'::text]));

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'presented'::text, 'answered'::text, 'resolved'::text, 'expired'::text, 'escalated'::text]));

alter table public."el8_checkin_question_bank" add constraint "el8_checkin_question_bank_actionability_check" CHECK (actionability >= 1 AND actionability <= 5);

alter table public."el8_checkin_question_bank" add constraint "el8_checkin_question_bank_question_kind_check" CHECK (question_kind = ANY (ARRAY['normal'::text, 'trajectory'::text, 'cause'::text, 'clarification'::text, 'safety_clarification'::text]));

alter table public."el8_checkin_question_bank" add constraint "el8_checkin_question_bank_response_type_check" CHECK (response_type = ANY (ARRAY['ordered_scale'::text, 'single_choice'::text, 'multi_choice'::text, 'text'::text, 'dynamic_dimension_choice'::text]));

alter table public."el8_checkin_question_bank" add constraint "el8_checkin_question_bank_stale_after_days_check" CHECK (stale_after_days IS NULL OR stale_after_days >= 0);

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_confidence_check" CHECK (confidence >= 0::numeric AND confidence <= 1::numeric);

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_direction_check" CHECK (direction >= '-2'::integer AND direction <= 2);

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_information_value_check" CHECK (information_value >= 0 AND information_value <= 100);

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_severity_check" CHECK (severity >= 0 AND severity <= 4);

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_source_type_check" CHECK (source_type = ANY (ARRAY['question'::text, 'followup'::text, 'system'::text, 'safety'::text]));

alter table public."el8_daily_checkins" add constraint "el8_daily_active_duration_nonnegative" CHECK (active_duration_seconds IS NULL OR active_duration_seconds >= 0);

alter table public."el8_daily_checkins" add constraint "el8_daily_checkins_debt_status_check" CHECK (debt_status IS NULL OR (debt_status = ANY (ARRAY['better'::text, 'unchanged'::text, 'worse'::text])));

alter table public."el8_daily_checkins" add constraint "el8_daily_checkins_eating_status_check" CHECK (eating_status IS NULL OR (eating_status = ANY (ARRAY['on_plan'::text, 'partly_on_plan'::text, 'off_plan'::text])));

alter table public."el8_daily_checkins" add constraint "el8_daily_checkins_manageability_check" CHECK (manageability IS NULL OR (manageability = ANY (ARRAY['easy'::text, 'manageable'::text, 'difficult'::text, 'too_much'::text, 'unsure'::text])));

alter table public."el8_entries" add constraint "el8_entries_confidence_chk" CHECK (evidence_confidence IS NULL OR (evidence_confidence = ANY (ARRAY['Low'::text, 'Moderate'::text, 'High'::text])));

alter table public."el8_entries" add constraint "el8_entries_coverage_chk" CHECK (coverage IS NULL OR (coverage = ANY (ARRAY['No data'::text, 'Partial'::text, 'Complete'::text])));

alter table public."el8_focus_clarifications" add constraint "el8_focus_clarifications_status_check" CHECK (status = ANY (ARRAY['completed'::text, 'still_ambiguous'::text]));

alter table public."el8_intelligence_test_config" add constraint "el8_intelligence_test_config_singleton_check" CHECK (singleton);

alter table public."el8_intelligence_test_events" add constraint "el8_intelligence_test_events_elapsed_ms_check" CHECK (elapsed_ms IS NULL OR elapsed_ms >= 0);

alter table public."el8_intelligence_test_events" add constraint "el8_intelligence_test_events_sequence_check" CHECK (sequence >= 0);

alter table public."el8_intelligence_test_notes" add constraint "el8_intelligence_test_notes_elapsed_ms_check" CHECK (elapsed_ms IS NULL OR elapsed_ms >= 0);

alter table public."el8_intelligence_test_notes" add constraint "el8_intelligence_test_notes_note_text_check" CHECK (char_length(note_text) >= 1 AND char_length(note_text) <= 4000);

alter table public."el8_intelligence_test_results" add constraint "el8_intelligence_test_results_elapsed_ms_check" CHECK (elapsed_ms IS NULL OR elapsed_ms >= 0);

alter table public."el8_intelligence_test_results" add constraint "el8_intelligence_test_results_priority_accuracy_check" CHECK (priority_accuracy >= 1 AND priority_accuracy <= 5);

alter table public."el8_intelligence_test_sessions" add constraint "el8_intelligence_test_sessions_elapsed_ms_check" CHECK (elapsed_ms IS NULL OR elapsed_ms >= 0);

alter table public."el8_intelligence_test_sessions" add constraint "el8_intelligence_test_sessions_qa_environment_check" CHECK (qa_environment = ANY (ARRAY['internal_human_qa'::text, 'automated_qa'::text, 'external_test'::text]));

alter table public."el8_intelligence_test_sessions" add constraint "el8_intelligence_test_sessions_status_check" CHECK (status = ANY (ARRAY['started'::text, 'discovery'::text, 'priorities'::text, 'focus'::text, 'plan'::text, 'completed'::text, 'telemetry_failed'::text]));

alter table public."el8_intelligence_test_sessions" add constraint "el8_intelligence_test_sessions_tester_mode_check" CHECK (tester_mode = ANY (ARRAY['self'::text, 'roleplay'::text, 'prefer_not_to_say'::text]));

alter table public."el8_member_load_state" add constraint "el8_member_load_state_adaptation_direction_check" CHECK (adaptation_direction = ANY (ARRAY['reduce'::text, 'hold'::text, 'expand'::text, 'flagged'::text]));

alter table public."el8_member_load_state" add constraint "el8_member_load_state_load_level_check" CHECK (load_level = ANY (ARRAY['minimal'::text, 'reduced'::text, 'normal'::text, 'expanded'::text]));

alter table public."el8_member_load_state" add constraint "el8_member_load_state_member_response_check" CHECK (member_response IS NULL OR (member_response = ANY (ARRAY['accepted'::text, 'keep_same'::text, 'unsure'::text, 'snoozed'::text])));

alter table public."el8_member_load_state" add constraint "el8_member_load_state_recommended_direction_check" CHECK (recommended_direction IS NULL OR (recommended_direction = ANY (ARRAY['reduce'::text, 'hold'::text, 'expand'::text, 'flagged'::text])));

alter table public."el8_member_state" add constraint "el8_member_state_revision_check" CHECK (revision >= 0);

alter table public."el8_member_state" add constraint "el8_member_state_schema_version_check" CHECK (schema_version = '3.0.0'::text AND (state ->> 'schemaVersion'::text) = schema_version AND NULLIF(state ->> 'revision'::text, ''::text)::integer = revision AND (state ->> 'memberId'::text) = user_id::text);

alter table public."el8_member_state" add constraint "el8_member_state_state_check" CHECK (jsonb_typeof(state) = 'object'::text);

alter table public."el8_module_assignments" add constraint "el8_module_assignments_assignment_status_check" CHECK (assignment_status = ANY (ARRAY['recommended'::text, 'due'::text, 'overdue'::text, 'in_progress'::text, 'completed'::text, 'dismissed'::text]));

alter table public."el8_plan_checkins" add constraint "el8_plan_checkins_adherence_check" CHECK (adherence = ANY (ARRAY['done'::text, 'partly'::text, 'not_done'::text]));

alter table public."el8_plan_checkins" add constraint "el8_plan_checkins_burden_check" CHECK (burden = ANY (ARRAY['easy'::text, 'manageable'::text, 'hard'::text]));

alter table public."el8_plan_checkins" add constraint "el8_plan_checkins_signal_check" CHECK (signal = ANY (ARRAY['better'::text, 'same'::text, 'worse'::text, 'unclear'::text]));

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_kind_check" CHECK (kind = ANY (ARRAY['reassess'::text, 'reprioritize'::text]));

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_status_check" CHECK (status = ANY (ARRAY['open'::text, 'completed'::text, 'cancelled'::text]));

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_adherence_check" CHECK (adherence = ANY (ARRAY['strong'::text, 'mixed'::text, 'low'::text, 'unknown'::text]));

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_burden_check" CHECK (burden = ANY (ARRAY['easy'::text, 'manageable'::text, 'hard'::text]));

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_outcome_check" CHECK (outcome = ANY (ARRAY['improving'::text, 'unchanged'::text, 'worsening'::text, 'unknown'::text]));

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_priority_shift_check" CHECK (priority_shift = ANY (ARRAY['no'::text, 'yes'::text, 'unsure'::text]));

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_recommendation_check" CHECK (recommendation = ANY (ARRAY['continue'::text, 'continue_briefly'::text, 'simplify'::text, 'modify'::text, 'progress'::text, 'pause_reassess'::text, 'reprioritize'::text]));

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_usefulness_check" CHECK (usefulness = ANY (ARRAY['useful'::text, 'mixed'::text, 'not_useful'::text]));

alter table public."el8_plans" add constraint "el8_plans_canonical_actions_shape_check" CHECK (canonical_actions IS NULL OR jsonb_typeof(canonical_actions) = 'array'::text);

alter table public."el8_plans" add constraint "el8_plans_canonical_v2_required_fields_check" CHECK (schema_version IS NULL OR schema_version = '2.0.0'::text AND focus_ids IS NOT NULL AND jsonb_typeof(focus_ids) = 'array'::text AND jsonb_array_length(focus_ids) > 0 AND NOT jsonb_path_exists(focus_ids, '$[*]?(@.type() != "string")'::jsonpath) AND canonical_actions IS NOT NULL AND jsonb_typeof(canonical_actions) = 'array'::text AND jsonb_array_length(canonical_actions) > 0 AND NOT jsonb_path_exists(canonical_actions, '$[*]?(@.type() != "object")'::jsonpath));

alter table public."el8_plans" add constraint "el8_plans_focus_ids_shape_check" CHECK (focus_ids IS NULL OR jsonb_typeof(focus_ids) = 'array'::text);

alter table public."el8_plans" add constraint "el8_plans_legacy_payload_check" CHECK (schema_version = '2.0.0'::text OR actions IS NOT NULL AND generated_from IS NOT NULL AND focus_dimensions IS NOT NULL AND interventions IS NOT NULL AND capacity IS NOT NULL);

alter table public."el8_plans" add constraint "el8_plans_review_days_check" CHECK (schema_version = '2.0.0'::text OR review_days >= 1 AND review_days <= 30);

alter table public."el8_plans" add constraint "el8_plans_row_contract_check" CHECK (schema_version IS NULL AND baseline_completed_at IS NOT NULL AND dimension IS NOT NULL AND source IS NOT NULL AND primary_action IS NOT NULL AND supporting_action IS NOT NULL AND measure IS NOT NULL AND review_days IS NOT NULL OR schema_version = '2.0.0'::text);

alter table public."el8_plans" add constraint "el8_plans_schema_version_check" CHECK (schema_version IS NULL OR schema_version = '2.0.0'::text);

alter table public."el8_plans" add constraint "el8_plans_status_check" CHECK (schema_version IS NULL AND (status = ANY (ARRAY['active'::text, 'completed'::text, 'replaced'::text, 'superseded'::text, 'needs_reassessment'::text, 'qa_isolated'::text, 'qa_result'::text])) OR schema_version = '2.0.0'::text AND (status = ANY (ARRAY['proposed'::text, 'active'::text, 'paused'::text, 'completed'::text, 'replaced'::text, 'superseded'::text, 'needs_reassessment'::text])));

alter table public."el8_plans" add constraint "el8_plans_v2_canonical_action_ids" CHECK (schema_version IS DISTINCT FROM '2.0.0'::text OR el8_canonical_action_ids_valid(canonical_actions));

alter table public."el8_profiles" add constraint "el8_profiles_account_status_check" CHECK (account_status = ANY (ARRAY['active'::text, 'admin_paused'::text, 'deactivated'::text]));

alter table public."el8_profiles" add constraint "el8_profiles_appearance_check" CHECK (appearance = ANY (ARRAY['light'::text, 'dark'::text]));

alter table public."el8_profiles" add constraint "el8_profiles_hydration_target_ml_check" CHECK (hydration_target_ml >= 500 AND hydration_target_ml <= 10000);

alter table public."el8_profiles" add constraint "el8_profiles_measurement_system_check" CHECK (measurement_system IS NULL OR (measurement_system = ANY (ARRAY['metric'::text, 'imperial'::text])));

alter table public."el8_profiles" add constraint "el8_profiles_onboarding_status_check" CHECK (onboarding_status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text, 'safety_paused'::text]));

alter table public."el8_profiles" add constraint "el8_profiles_sex_check" CHECK (sex IS NULL OR (sex = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'prefer_not_to_say'::text])));

alter table public."el8_qa_feedback" add constraint "el8_qa_feedback_feedback_type_check" CHECK (feedback_type = ANY (ARRAY['bug'::text, 'friction'::text, 'question'::text, 'suggestion'::text, 'general'::text]));

alter table public."el8_qa_runs" add constraint "el8_qa_runs_status_check" CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'abandoned'::text]));

alter table public."el8_question_experiment_variants" add constraint "el8_question_experiment_variants_allocation_weight_check" CHECK (allocation_weight > 0::numeric);

alter table public."el8_question_experiments" add constraint "el8_question_experiments_max_experimental_questions_per_c_check" CHECK (max_experimental_questions_per_checkin >= 0 AND max_experimental_questions_per_checkin <= 5);

alter table public."el8_question_experiments" add constraint "el8_question_experiments_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text]));

alter table public."el8_question_exposures" add constraint "el8_question_exposures_active_duration_seconds_check" CHECK (active_duration_seconds IS NULL OR active_duration_seconds >= 0);

alter table public."el8_question_exposures" add constraint "el8_question_exposures_clarity_rating_check" CHECK (clarity_rating IS NULL OR clarity_rating >= 0 AND clarity_rating <= 4);

alter table public."el8_question_exposures" add constraint "el8_question_exposures_friction_rating_check" CHECK (friction_rating IS NULL OR friction_rating >= 0 AND friction_rating <= 4);

alter table public."el8_question_exposures" add constraint "el8_question_exposures_usefulness_rating_check" CHECK (usefulness_rating IS NULL OR usefulness_rating >= 0 AND usefulness_rating <= 4);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_actionability_check" CHECK (actionability >= 1 AND actionability <= 5);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_burden_check" CHECK (burden >= 1 AND burden <= 5);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_expected_information_gain_check" CHECK (expected_information_gain >= 1 AND expected_information_gain <= 5);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_minimum_repeat_interval_hours_check" CHECK (minimum_repeat_interval_hours >= 0);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_question_family_check" CHECK (question_family = ANY (ARRAY['state'::text, 'driver'::text, 'spillover'::text, 'action'::text]));

alter table public."el8_question_matrix" add constraint "el8_question_matrix_sensitivity_check" CHECK (sensitivity >= 1 AND sensitivity <= 5);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_validation_state_check" CHECK (validation_state = ANY (ARRAY['draft'::text, 'research_grounded'::text, 'qa'::text, 'pilot'::text, 'validated'::text, 'retired'::text]));

alter table public."el8_quick_logs" add constraint "el8_quick_logs_measure_check" CHECK (measure = ANY (ARRAY['water'::text, 'sleep_start'::text, 'sleep_end'::text, 'mood'::text, 'energy'::text, 'weight'::text]));

alter table public."el8_safety_events" add constraint "el8_safety_events_disposition_check" CHECK (disposition = ANY (ARRAY['open'::text, 'transferred'::text, 'closed'::text, 'unable_to_confirm'::text]));

alter table public."el8_safety_events" add constraint "el8_safety_events_provisional_level_check" CHECK (provisional_level >= 1 AND provisional_level <= 3);

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_current_danger_check" CHECK (current_danger IS NULL OR (current_danger = ANY (ARRAY['Yes'::text, 'No'::text, 'Unsure'::text])));

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_external_support_check" CHECK (external_support IS NULL OR (external_support = ANY (ARRAY['Yes'::text, 'No'::text, 'Not applicable'::text, 'Prefer not to say'::text])));

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_reconciliation_type_check" CHECK (reconciliation_type = ANY (ARRAY['member_request'::text, 'simulation_resolution'::text]));

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'closed_test'::text, 'remains_paused'::text, 'resumed'::text, 'transferred'::text]));

alter table public."el8_signals" add constraint "el8_signals_dimension_check" CHECK (dimension = ANY (ARRAY['Physical'::text, 'Emotional'::text, 'Social'::text, 'Spiritual'::text, 'Intellectual'::text, 'Occupational'::text, 'Financial'::text, 'Environmental'::text]));

alter table public."el8_submissions" add constraint "el8_submissions_input_type_check" CHECK (input_type = ANY (ARRAY['text'::text, 'photo'::text, 'voice'::text, 'mixed'::text]));

alter table public."el8_submissions" add constraint "el8_submissions_media_kind_check" CHECK (media_kind IS NULL OR (media_kind = ANY (ARRAY['photo'::text, 'voice'::text])));

alter table public."el8_submissions" add constraint "el8_submissions_processing_status_check" CHECK (processing_status = ANY (ARRAY['submitted'::text, 'processing'::text, 'transcribed'::text, 'ready_for_review'::text, 'confirmed'::text, 'corrected'::text, 'discarded'::text, 'cancelled'::text, 'failed'::text]));

alter table public."el8_weekly_checkins" add constraint "el8_weekly_active_duration_nonnegative" CHECK (active_duration_seconds IS NULL OR active_duration_seconds >= 0);

alter table public."el8_weekly_checkins" add constraint "el8_weekly_checkins_overall_week_check" CHECK (overall_week = ANY (ARRAY['very_difficult'::text, 'difficult'::text, 'mixed'::text, 'good'::text, 'very_good'::text]));

alter table public."el8_adaptation_decisions" add constraint "el8_adaptation_decisions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_admin_audit" add constraint "el8_admin_audit_admin_user_id_fkey" FOREIGN KEY (admin_user_id) REFERENCES auth.users(id);

alter table public."el8_admin_audit" add constraint "el8_admin_audit_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

alter table public."el8_admins" add constraint "el8_admins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_ai_usage" add constraint "el8_ai_usage_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES el8_submissions(submission_id) ON DELETE SET NULL;

alter table public."el8_ai_usage" add constraint "el8_ai_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_assessment_sessions" add constraint "el8_assessment_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_source_checkin_id_fkey" FOREIGN KEY (source_checkin_id) REFERENCES el8_daily_checkins(id) ON DELETE SET NULL;

alter table public."el8_checkin_followups" add constraint "el8_checkin_followups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_checkin_id_fkey" FOREIGN KEY (checkin_id) REFERENCES el8_daily_checkins(id) ON DELETE CASCADE;

alter table public."el8_checkin_signals" add constraint "el8_checkin_signals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_daily_checkins" add constraint "el8_daily_checkins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_emotional_deepenings" add constraint "el8_emotional_deepenings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_entry_revisions" add constraint "el8_entry_revisions_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES el8_entries(entry_id);

alter table public."el8_focus_clarifications" add constraint "el8_focus_clarifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_intelligence_test_events" add constraint "el8_intelligence_test_events_session_id_fkey" FOREIGN KEY (session_id) REFERENCES el8_intelligence_test_sessions(id) ON DELETE CASCADE;

alter table public."el8_intelligence_test_notes" add constraint "el8_intelligence_test_notes_session_id_fkey" FOREIGN KEY (session_id) REFERENCES el8_intelligence_test_sessions(id) ON DELETE CASCADE;

alter table public."el8_intelligence_test_results" add constraint "el8_intelligence_test_results_session_id_fkey" FOREIGN KEY (session_id) REFERENCES el8_intelligence_test_sessions(id) ON DELETE CASCADE;

alter table public."el8_member_activity" add constraint "el8_member_activity_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_member_load_state" add constraint "el8_member_load_state_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_member_state" add constraint "el8_member_state_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_module_assignments" add constraint "el8_module_assignments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_onboarding_runs" add constraint "el8_onboarding_runs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_plan_checkins" add constraint "el8_plan_checkins_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES el8_plans(id) ON DELETE CASCADE;

alter table public."el8_plan_checkins" add constraint "el8_plan_checkins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES el8_plans(id);

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_resulting_plan_id_fkey" FOREIGN KEY (resulting_plan_id) REFERENCES el8_plans(id);

alter table public."el8_plan_reassessments" add constraint "el8_plan_reassessments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES el8_plans(id) ON DELETE CASCADE;

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_resulting_plan_id_fkey" FOREIGN KEY (resulting_plan_id) REFERENCES el8_plans(id);

alter table public."el8_plan_reviews" add constraint "el8_plan_reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_plans" add constraint "el8_plans_parent_plan_id_fkey" FOREIGN KEY (parent_plan_id) REFERENCES el8_plans(id);

alter table public."el8_plans" add constraint "el8_plans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_profiles" add constraint "el8_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_qa_events" add constraint "el8_qa_events_run_id_fkey" FOREIGN KEY (run_id) REFERENCES el8_qa_runs(id) ON DELETE CASCADE;

alter table public."el8_qa_events" add constraint "el8_qa_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_qa_feedback" add constraint "el8_qa_feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_qa_runs" add constraint "el8_qa_runs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_question_experiment_variants" add constraint "el8_question_experiment_variants_experiment_key_fkey" FOREIGN KEY (experiment_key) REFERENCES el8_question_experiments(experiment_key) ON DELETE CASCADE;

alter table public."el8_question_experiment_variants" add constraint "el8_question_experiment_variants_question_key_fkey" FOREIGN KEY (question_key) REFERENCES el8_checkin_question_bank(question_key);

alter table public."el8_question_exposures" add constraint "el8_question_exposures_checkin_id_fkey" FOREIGN KEY (checkin_id) REFERENCES el8_daily_checkins(id) ON DELETE SET NULL;

alter table public."el8_question_exposures" add constraint "el8_question_exposures_experiment_key_fkey" FOREIGN KEY (experiment_key) REFERENCES el8_question_experiments(experiment_key) ON DELETE SET NULL;

alter table public."el8_question_exposures" add constraint "el8_question_exposures_question_key_fkey" FOREIGN KEY (question_key) REFERENCES el8_checkin_question_bank(question_key);

alter table public."el8_question_matrix" add constraint "el8_question_matrix_primary_signal_fkey" FOREIGN KEY (primary_signal) REFERENCES el8_signals(signal_key);

alter table public."el8_quick_logs" add constraint "el8_quick_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_safety_events" add constraint "el8_safety_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_event_id_fkey" FOREIGN KEY (event_id) REFERENCES el8_safety_events(event_id) ON DELETE CASCADE;

alter table public."el8_safety_reconciliations" add constraint "el8_safety_reconciliations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_submissions" add constraint "el8_submissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

alter table public."el8_weekly_checkins" add constraint "el8_weekly_checkins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX el8_adaptation_decisions_user_idx ON public.el8_adaptation_decisions USING btree (user_id);

CREATE INDEX el8_admin_audit_admin_user_idx ON public.el8_admin_audit USING btree (admin_user_id);

CREATE INDEX el8_admin_audit_target_user_idx ON public.el8_admin_audit USING btree (target_user_id);

CREATE INDEX el8_ai_usage_submission_idx ON public.el8_ai_usage USING btree (submission_id);

CREATE INDEX el8_ai_usage_user_created_idx ON public.el8_ai_usage USING btree (user_id, created_at DESC);

CREATE INDEX el8_assessment_sessions_module_idx ON public.el8_assessment_sessions USING btree (user_id, module_id, started_at DESC);

CREATE INDEX el8_assessment_sessions_user_idx ON public.el8_assessment_sessions USING btree (user_id, started_at DESC);

CREATE INDEX el8_checkin_followups_user_status_due_idx ON public.el8_checkin_followups USING btree (user_id, status, due_on, priority DESC);

CREATE INDEX el8_checkin_signals_user_created_idx ON public.el8_checkin_signals USING btree (user_id, created_at DESC);

CREATE INDEX el8_checkin_signals_user_dimension_idx ON public.el8_checkin_signals USING btree (user_id, dimension, created_at DESC);

CREATE INDEX el8_daily_checkins_user_date_idx ON public.el8_daily_checkins USING btree (user_id, local_date DESC);

CREATE INDEX el8_emotional_deepenings_user_created_idx ON public.el8_emotional_deepenings USING btree (user_id, created_at DESC);

CREATE UNIQUE INDEX el8_entries_submission_idx ON public.el8_entries USING btree (submission_id) WHERE (submission_id IS NOT NULL);

CREATE INDEX el8_entry_revisions_entry_idx ON public.el8_entry_revisions USING btree (entry_id);

CREATE INDEX el8_focus_clarifications_user_created_idx ON public.el8_focus_clarifications USING btree (user_id, created_at DESC);

CREATE INDEX el8_intelligence_test_events_session_created_idx ON public.el8_intelligence_test_events USING btree (session_id, created_at);

CREATE INDEX el8_intelligence_test_notes_session_created_idx ON public.el8_intelligence_test_notes USING btree (session_id, created_at);

CREATE INDEX el8_intelligence_test_sessions_environment_started_idx ON public.el8_intelligence_test_sessions USING btree (qa_environment, started_at DESC);

CREATE INDEX el8_member_state_user_id_idx ON public.el8_member_state USING btree (user_id);

CREATE UNIQUE INDEX el8_module_assignments_active_unique ON public.el8_module_assignments USING btree (user_id, module_id) WHERE (assignment_status = ANY (ARRAY['recommended'::text, 'due'::text, 'overdue'::text, 'in_progress'::text]));

CREATE INDEX el8_module_assignments_user_status_idx ON public.el8_module_assignments USING btree (user_id, assignment_status, priority, available_at);

CREATE INDEX el8_onboarding_runs_user_idx ON public.el8_onboarding_runs USING btree (user_id);

CREATE UNIQUE INDEX el8_one_active_plan_per_user ON public.el8_plans USING btree (user_id) WHERE (status = 'active'::text);

CREATE UNIQUE INDEX el8_one_completed_baseline_per_user ON public.el8_assessment_sessions USING btree (user_id) WHERE ((module_type = 'universal_baseline'::text) AND (status = 'completed'::text));

CREATE UNIQUE INDEX el8_one_pending_member_reconciliation_per_event ON public.el8_safety_reconciliations USING btree (event_id) WHERE ((reconciliation_type = 'member_request'::text) AND (status = 'pending'::text));

CREATE INDEX el8_plan_checkins_plan_idx ON public.el8_plan_checkins USING btree (plan_id);

CREATE INDEX el8_plan_checkins_user_plan_created_idx ON public.el8_plan_checkins USING btree (user_id, plan_id, created_at DESC);

CREATE INDEX el8_plan_reassessments_plan_idx ON public.el8_plan_reassessments USING btree (plan_id, created_at DESC);

CREATE INDEX el8_plan_reassessments_resulting_plan_idx ON public.el8_plan_reassessments USING btree (resulting_plan_id) WHERE (resulting_plan_id IS NOT NULL);

CREATE INDEX el8_plan_reassessments_user_idx ON public.el8_plan_reassessments USING btree (user_id, status, created_at DESC);

CREATE INDEX el8_plan_reviews_plan_idx ON public.el8_plan_reviews USING btree (plan_id);

CREATE INDEX el8_plan_reviews_user_plan_created_idx ON public.el8_plan_reviews USING btree (user_id, plan_id, created_at DESC);

CREATE INDEX el8_plans_parent_plan_idx ON public.el8_plans USING btree (parent_plan_id);

CREATE INDEX el8_plans_user_created_idx ON public.el8_plans USING btree (user_id, created_at DESC);

CREATE INDEX el8_qa_accel_user_created_idx ON public.el8_qa_accelerated_checkins USING btree (user_id, created_at DESC);

CREATE INDEX el8_qa_events_run_time_idx ON public.el8_qa_events USING btree (run_id, occurred_at);

CREATE INDEX el8_question_exposures_experiment_idx ON public.el8_question_exposures USING btree (experiment_key, question_key, offered_at DESC);

CREATE INDEX el8_question_exposures_user_offered_idx ON public.el8_question_exposures USING btree (user_id, offered_at DESC);

CREATE INDEX el8_question_matrix_dimension_idx ON public.el8_question_matrix USING btree (primary_dimension);

CREATE INDEX el8_question_matrix_primary_signal_idx ON public.el8_question_matrix USING btree (primary_signal);

CREATE INDEX el8_question_matrix_state_idx ON public.el8_question_matrix USING btree (validation_state, qa_only, active);

CREATE INDEX el8_quick_logs_user_date_idx ON public.el8_quick_logs USING btree (user_id, local_date, measure, logged_at);

CREATE INDEX el8_safety_events_user_idx ON public.el8_safety_events USING btree (user_id);

CREATE INDEX el8_safety_reconciliations_user_idx ON public.el8_safety_reconciliations USING btree (user_id);

CREATE INDEX el8_submissions_user_idx ON public.el8_submissions USING btree (user_id);

CREATE INDEX el8_weekly_checkins_user_week_idx ON public.el8_weekly_checkins USING btree (user_id, week_start DESC);

create policy "anonymous discovery test submissions" on public."discovery_human_test_reports" as PERMISSIVE for INSERT to "anon", "authenticated" with check (true);

create policy "members insert own adaptation decisions" on public."el8_adaptation_decisions" as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));

create policy "members read own adaptation decisions" on public."el8_adaptation_decisions" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "members update own adaptation decisions" on public."el8_adaptation_decisions" as PERMISSIVE for UPDATE to public using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "members_read_own_ai_usage" on public."el8_ai_usage" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "assessment_sessions_delete_own" on public."el8_assessment_sessions" as PERMISSIVE for DELETE to "authenticated" using (((( SELECT auth.uid() AS uid) = user_id) AND (status <> 'completed'::text)));

create policy "assessment_sessions_insert_own" on public."el8_assessment_sessions" as PERMISSIVE for INSERT to public with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "assessment_sessions_select_own" on public."el8_assessment_sessions" as PERMISSIVE for SELECT to public using ((( SELECT auth.uid() AS uid) = user_id));

create policy "assessment_sessions_update_own" on public."el8_assessment_sessions" as PERMISSIVE for UPDATE to "authenticated" using (((( SELECT auth.uid() AS uid) = user_id) AND (status <> 'completed'::text))) with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "members insert own checkin followups" on public."el8_checkin_followups" as PERMISSIVE for INSERT to "authenticated" with check ((auth.uid() = user_id));

create policy "members read own checkin followups" on public."el8_checkin_followups" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "members update own checkin followups" on public."el8_checkin_followups" as PERMISSIVE for UPDATE to public using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "authenticated read active checkin questions" on public."el8_checkin_question_bank" as PERMISSIVE for SELECT to "authenticated" using ((active = true));

create policy "members insert own checkin signals" on public."el8_checkin_signals" as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));

create policy "members read own checkin signals" on public."el8_checkin_signals" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "daily_checkins_insert_own" on public."el8_daily_checkins" as PERMISSIVE for INSERT to public with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "daily_checkins_select_own" on public."el8_daily_checkins" as PERMISSIVE for SELECT to public using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members insert emotional deepenings" on public."el8_emotional_deepenings" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "members read emotional deepenings" on public."el8_emotional_deepenings" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "entries insert own" on public."el8_entries" as PERMISSIVE for INSERT to "authenticated" with check ((member_id = ( SELECT p.member_code
   FROM el8_profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid)))));

create policy "entries read own active" on public."el8_entries" as PERMISSIVE for SELECT to "authenticated" using (((deleted_at IS NULL) AND (member_id = ( SELECT p.member_code
   FROM el8_profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid))))));

create policy "el8_focus_clarifications_self_insert" on public."el8_focus_clarifications" as PERMISSIVE for INSERT to "authenticated" with check ((user_id = ( SELECT auth.uid() AS uid)));

create policy "el8_focus_clarifications_self_select" on public."el8_focus_clarifications" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

create policy "members insert own activity" on public."el8_member_activity" as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));

create policy "members read own activity" on public."el8_member_activity" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "members update own activity" on public."el8_member_activity" as PERMISSIVE for UPDATE to public using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "members insert own load state" on public."el8_member_load_state" as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));

create policy "members read own load state" on public."el8_member_load_state" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "members update own load state" on public."el8_member_load_state" as PERMISSIVE for UPDATE to public using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "Members can create own canonical state" on public."el8_member_state" as PERMISSIVE for INSERT to "authenticated" with check (((( SELECT auth.uid() AS uid) = user_id) AND (schema_version = '3.0.0'::text) AND (revision = 0) AND ((state ->> 'schemaVersion'::text) = '3.0.0'::text) AND ((NULLIF((state ->> 'revision'::text), ''::text))::integer = 0) AND ((state ->> 'memberId'::text) = (user_id)::text)));

create policy "Members can read own canonical state" on public."el8_member_state" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "Members can update own canonical state" on public."el8_member_state" as PERMISSIVE for UPDATE to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id)) with check (((( SELECT auth.uid() AS uid) = user_id) AND (schema_version = '3.0.0'::text) AND ((state ->> 'schemaVersion'::text) = '3.0.0'::text) AND ((NULLIF((state ->> 'revision'::text), ''::text))::integer = revision) AND ((state ->> 'memberId'::text) = (user_id)::text)));

create policy "members read own module assignments" on public."el8_module_assignments" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members insert plan checkins" on public."el8_plan_checkins" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "members read plan checkins" on public."el8_plan_checkins" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members complete own open reassessments" on public."el8_plan_reassessments" as PERMISSIVE for UPDATE to "authenticated" using (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'open'::text))) with check (((( SELECT auth.uid() AS uid) = user_id) AND (status = ANY (ARRAY['open'::text, 'completed'::text]))));

create policy "members insert own plan reassessments" on public."el8_plan_reassessments" as PERMISSIVE for INSERT to "authenticated" with check (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'open'::text)));

create policy "members read own plan reassessments" on public."el8_plan_reassessments" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members insert plan reviews" on public."el8_plan_reviews" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "members read plan reviews" on public."el8_plan_reviews" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members insert own plans" on public."el8_plans" as PERMISSIVE for INSERT to "authenticated" with check (((( SELECT auth.uid() AS uid) = user_id) AND (is_test = false) AND (schema_version = '2.0.0'::text)));

create policy "members read own plans" on public."el8_plans" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members update own plans" on public."el8_plans" as PERMISSIVE for UPDATE to "authenticated" using (((( SELECT auth.uid() AS uid) = user_id) AND (is_test = false))) with check (((( SELECT auth.uid() AS uid) = user_id) AND (is_test = false) AND ((schema_version IS NULL) OR (schema_version = '2.0.0'::text))));

create policy "profile read own" on public."el8_profiles" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "profile update own" on public."el8_profiles" as PERMISSIVE for UPDATE to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "qa_accel_insert_own" on public."el8_qa_accelerated_checkins" as PERMISSIVE for INSERT to "authenticated" with check ((auth.uid() = user_id));

create policy "qa_accel_select_own" on public."el8_qa_accelerated_checkins" as PERMISSIVE for SELECT to "authenticated" using ((auth.uid() = user_id));

create policy "qa testers own events" on public."el8_qa_events" as PERMISSIVE for ALL to "authenticated" using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "testers insert own qa feedback" on public."el8_qa_feedback" as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));

create policy "testers read own qa feedback" on public."el8_qa_feedback" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "qa testers own runs" on public."el8_qa_runs" as PERMISSIVE for ALL to "authenticated" using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "members_insert_own_question_exposures" on public."el8_question_exposures" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "members_read_own_question_exposures" on public."el8_question_exposures" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "members_update_own_question_exposures" on public."el8_question_exposures" as PERMISSIVE for UPDATE to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id)) with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "authenticated_read_active_matrix" on public."el8_question_matrix" as PERMISSIVE for SELECT to "authenticated" using ((active = true));

create policy "quick_logs_delete_own" on public."el8_quick_logs" as PERMISSIVE for DELETE to public using ((auth.uid() = user_id));

create policy "quick_logs_insert_own" on public."el8_quick_logs" as PERMISSIVE for INSERT to public with check ((auth.uid() = user_id));

create policy "quick_logs_select_own" on public."el8_quick_logs" as PERMISSIVE for SELECT to public using ((auth.uid() = user_id));

create policy "quick_logs_update_own" on public."el8_quick_logs" as PERMISSIVE for UPDATE to public using ((auth.uid() = user_id)) with check ((auth.uid() = user_id));

create policy "safety insert own" on public."el8_safety_events" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "safety read own" on public."el8_safety_events" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "safety reconciliation read own" on public."el8_safety_reconciliations" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "authenticated_read_active_signals" on public."el8_signals" as PERMISSIVE for SELECT to "authenticated" using ((active = true));

create policy "submissions insert own" on public."el8_submissions" as PERMISSIVE for INSERT to "authenticated" with check (((( SELECT auth.uid() AS uid) = user_id) AND (member_code = ( SELECT p.member_code
   FROM el8_profiles p
  WHERE (p.user_id = ( SELECT auth.uid() AS uid))))));

create policy "submissions read own" on public."el8_submissions" as PERMISSIVE for SELECT to "authenticated" using ((( SELECT auth.uid() AS uid) = user_id));

create policy "weekly_checkins_insert_own" on public."el8_weekly_checkins" as PERMISSIVE for INSERT to public with check ((( SELECT auth.uid() AS uid) = user_id));

create policy "weekly_checkins_select_own" on public."el8_weekly_checkins" as PERMISSIVE for SELECT to public using ((( SELECT auth.uid() AS uid) = user_id));

CREATE TRIGGER on_auth_user_created_el8 AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION el8_handle_new_user();

CREATE TRIGGER el8_guard_member_state_revision BEFORE UPDATE ON el8_member_state FOR EACH ROW EXECUTE FUNCTION el8_guard_member_state_revision();

CREATE TRIGGER trg_el8_plan_checkin_integrity BEFORE INSERT OR UPDATE OF plan_id, user_id ON el8_plan_checkins FOR EACH ROW EXECUTE FUNCTION el8_enforce_plan_evidence_integrity();

CREATE TRIGGER trg_el8_plan_review_integrity BEFORE INSERT OR UPDATE OF plan_id, user_id ON el8_plan_reviews FOR EACH ROW EXECUTE FUNCTION el8_enforce_plan_evidence_integrity();

CREATE TRIGGER el8_guard_plan_schema_version BEFORE UPDATE ON el8_plans FOR EACH ROW EXECUTE FUNCTION el8_guard_plan_schema_version();

CREATE TRIGGER el8_validate_plan_v3 BEFORE INSERT OR UPDATE ON el8_plans FOR EACH ROW EXECUTE FUNCTION el8_validate_plan_v3();

revoke all on table public."discovery_human_test_reports" from public,anon,authenticated,service_role;

grant insert on table public."discovery_human_test_reports" to "postgres";

grant select on table public."discovery_human_test_reports" to "postgres";

grant update on table public."discovery_human_test_reports" to "postgres";

grant delete on table public."discovery_human_test_reports" to "postgres";

grant truncate on table public."discovery_human_test_reports" to "postgres";

grant references on table public."discovery_human_test_reports" to "postgres";

grant trigger on table public."discovery_human_test_reports" to "postgres";

grant maintain on table public."discovery_human_test_reports" to "postgres";

grant insert on table public."discovery_human_test_reports" to "anon";

grant select on table public."discovery_human_test_reports" to "anon";

grant update on table public."discovery_human_test_reports" to "anon";

grant delete on table public."discovery_human_test_reports" to "anon";

grant truncate on table public."discovery_human_test_reports" to "anon";

grant references on table public."discovery_human_test_reports" to "anon";

grant trigger on table public."discovery_human_test_reports" to "anon";

grant maintain on table public."discovery_human_test_reports" to "anon";

grant insert on table public."discovery_human_test_reports" to "authenticated";

grant select on table public."discovery_human_test_reports" to "authenticated";

grant update on table public."discovery_human_test_reports" to "authenticated";

grant delete on table public."discovery_human_test_reports" to "authenticated";

grant truncate on table public."discovery_human_test_reports" to "authenticated";

grant references on table public."discovery_human_test_reports" to "authenticated";

grant trigger on table public."discovery_human_test_reports" to "authenticated";

grant maintain on table public."discovery_human_test_reports" to "authenticated";

grant insert on table public."discovery_human_test_reports" to "service_role";

grant select on table public."discovery_human_test_reports" to "service_role";

grant update on table public."discovery_human_test_reports" to "service_role";

grant delete on table public."discovery_human_test_reports" to "service_role";

grant truncate on table public."discovery_human_test_reports" to "service_role";

grant references on table public."discovery_human_test_reports" to "service_role";

grant trigger on table public."discovery_human_test_reports" to "service_role";

grant maintain on table public."discovery_human_test_reports" to "service_role";

revoke all on table public."el8_adaptation_decisions" from public,anon,authenticated,service_role;

grant insert on table public."el8_adaptation_decisions" to "postgres";

grant select on table public."el8_adaptation_decisions" to "postgres";

grant update on table public."el8_adaptation_decisions" to "postgres";

grant delete on table public."el8_adaptation_decisions" to "postgres";

grant truncate on table public."el8_adaptation_decisions" to "postgres";

grant references on table public."el8_adaptation_decisions" to "postgres";

grant trigger on table public."el8_adaptation_decisions" to "postgres";

grant maintain on table public."el8_adaptation_decisions" to "postgres";

grant insert on table public."el8_adaptation_decisions" to "anon";

grant select on table public."el8_adaptation_decisions" to "anon";

grant update on table public."el8_adaptation_decisions" to "anon";

grant delete on table public."el8_adaptation_decisions" to "anon";

grant truncate on table public."el8_adaptation_decisions" to "anon";

grant references on table public."el8_adaptation_decisions" to "anon";

grant trigger on table public."el8_adaptation_decisions" to "anon";

grant maintain on table public."el8_adaptation_decisions" to "anon";

grant insert on table public."el8_adaptation_decisions" to "authenticated";

grant select on table public."el8_adaptation_decisions" to "authenticated";

grant update on table public."el8_adaptation_decisions" to "authenticated";

grant delete on table public."el8_adaptation_decisions" to "authenticated";

grant truncate on table public."el8_adaptation_decisions" to "authenticated";

grant references on table public."el8_adaptation_decisions" to "authenticated";

grant trigger on table public."el8_adaptation_decisions" to "authenticated";

grant maintain on table public."el8_adaptation_decisions" to "authenticated";

grant insert on table public."el8_adaptation_decisions" to "service_role";

grant select on table public."el8_adaptation_decisions" to "service_role";

grant update on table public."el8_adaptation_decisions" to "service_role";

grant delete on table public."el8_adaptation_decisions" to "service_role";

grant truncate on table public."el8_adaptation_decisions" to "service_role";

grant references on table public."el8_adaptation_decisions" to "service_role";

grant trigger on table public."el8_adaptation_decisions" to "service_role";

grant maintain on table public."el8_adaptation_decisions" to "service_role";

revoke all on table public."el8_admin_audit" from public,anon,authenticated,service_role;

grant insert on table public."el8_admin_audit" to "postgres";

grant select on table public."el8_admin_audit" to "postgres";

grant update on table public."el8_admin_audit" to "postgres";

grant delete on table public."el8_admin_audit" to "postgres";

grant truncate on table public."el8_admin_audit" to "postgres";

grant references on table public."el8_admin_audit" to "postgres";

grant trigger on table public."el8_admin_audit" to "postgres";

grant maintain on table public."el8_admin_audit" to "postgres";

grant insert on table public."el8_admin_audit" to "service_role";

grant select on table public."el8_admin_audit" to "service_role";

grant update on table public."el8_admin_audit" to "service_role";

grant delete on table public."el8_admin_audit" to "service_role";

grant truncate on table public."el8_admin_audit" to "service_role";

grant references on table public."el8_admin_audit" to "service_role";

grant trigger on table public."el8_admin_audit" to "service_role";

grant maintain on table public."el8_admin_audit" to "service_role";

revoke all on table public."el8_admins" from public,anon,authenticated,service_role;

grant insert on table public."el8_admins" to "postgres";

grant select on table public."el8_admins" to "postgres";

grant update on table public."el8_admins" to "postgres";

grant delete on table public."el8_admins" to "postgres";

grant truncate on table public."el8_admins" to "postgres";

grant references on table public."el8_admins" to "postgres";

grant trigger on table public."el8_admins" to "postgres";

grant maintain on table public."el8_admins" to "postgres";

grant insert on table public."el8_admins" to "service_role";

grant select on table public."el8_admins" to "service_role";

grant update on table public."el8_admins" to "service_role";

grant delete on table public."el8_admins" to "service_role";

grant truncate on table public."el8_admins" to "service_role";

grant references on table public."el8_admins" to "service_role";

grant trigger on table public."el8_admins" to "service_role";

grant maintain on table public."el8_admins" to "service_role";

revoke all on table public."el8_ai_usage" from public,anon,authenticated,service_role;

grant insert on table public."el8_ai_usage" to "postgres";

grant select on table public."el8_ai_usage" to "postgres";

grant update on table public."el8_ai_usage" to "postgres";

grant delete on table public."el8_ai_usage" to "postgres";

grant truncate on table public."el8_ai_usage" to "postgres";

grant references on table public."el8_ai_usage" to "postgres";

grant trigger on table public."el8_ai_usage" to "postgres";

grant maintain on table public."el8_ai_usage" to "postgres";

grant insert on table public."el8_ai_usage" to "service_role";

grant select on table public."el8_ai_usage" to "service_role";

grant update on table public."el8_ai_usage" to "service_role";

grant delete on table public."el8_ai_usage" to "service_role";

grant truncate on table public."el8_ai_usage" to "service_role";

grant references on table public."el8_ai_usage" to "service_role";

grant trigger on table public."el8_ai_usage" to "service_role";

grant maintain on table public."el8_ai_usage" to "service_role";

grant select on table public."el8_ai_usage" to "authenticated";

revoke all on table public."el8_assessment_sessions" from public,anon,authenticated,service_role;

grant insert on table public."el8_assessment_sessions" to "postgres";

grant select on table public."el8_assessment_sessions" to "postgres";

grant update on table public."el8_assessment_sessions" to "postgres";

grant delete on table public."el8_assessment_sessions" to "postgres";

grant truncate on table public."el8_assessment_sessions" to "postgres";

grant references on table public."el8_assessment_sessions" to "postgres";

grant trigger on table public."el8_assessment_sessions" to "postgres";

grant maintain on table public."el8_assessment_sessions" to "postgres";

grant insert on table public."el8_assessment_sessions" to "service_role";

grant select on table public."el8_assessment_sessions" to "service_role";

grant update on table public."el8_assessment_sessions" to "service_role";

grant delete on table public."el8_assessment_sessions" to "service_role";

grant truncate on table public."el8_assessment_sessions" to "service_role";

grant references on table public."el8_assessment_sessions" to "service_role";

grant trigger on table public."el8_assessment_sessions" to "service_role";

grant maintain on table public."el8_assessment_sessions" to "service_role";

grant insert on table public."el8_assessment_sessions" to "authenticated";

grant select on table public."el8_assessment_sessions" to "authenticated";

grant update on table public."el8_assessment_sessions" to "authenticated";

grant delete on table public."el8_assessment_sessions" to "authenticated";

revoke all on table public."el8_checkin_followups" from public,anon,authenticated,service_role;

grant insert on table public."el8_checkin_followups" to "postgres";

grant select on table public."el8_checkin_followups" to "postgres";

grant update on table public."el8_checkin_followups" to "postgres";

grant delete on table public."el8_checkin_followups" to "postgres";

grant truncate on table public."el8_checkin_followups" to "postgres";

grant references on table public."el8_checkin_followups" to "postgres";

grant trigger on table public."el8_checkin_followups" to "postgres";

grant maintain on table public."el8_checkin_followups" to "postgres";

grant insert on table public."el8_checkin_followups" to "anon";

grant select on table public."el8_checkin_followups" to "anon";

grant update on table public."el8_checkin_followups" to "anon";

grant delete on table public."el8_checkin_followups" to "anon";

grant truncate on table public."el8_checkin_followups" to "anon";

grant references on table public."el8_checkin_followups" to "anon";

grant trigger on table public."el8_checkin_followups" to "anon";

grant maintain on table public."el8_checkin_followups" to "anon";

grant insert on table public."el8_checkin_followups" to "authenticated";

grant select on table public."el8_checkin_followups" to "authenticated";

grant update on table public."el8_checkin_followups" to "authenticated";

grant delete on table public."el8_checkin_followups" to "authenticated";

grant truncate on table public."el8_checkin_followups" to "authenticated";

grant references on table public."el8_checkin_followups" to "authenticated";

grant trigger on table public."el8_checkin_followups" to "authenticated";

grant maintain on table public."el8_checkin_followups" to "authenticated";

grant insert on table public."el8_checkin_followups" to "service_role";

grant select on table public."el8_checkin_followups" to "service_role";

grant update on table public."el8_checkin_followups" to "service_role";

grant delete on table public."el8_checkin_followups" to "service_role";

grant truncate on table public."el8_checkin_followups" to "service_role";

grant references on table public."el8_checkin_followups" to "service_role";

grant trigger on table public."el8_checkin_followups" to "service_role";

grant maintain on table public."el8_checkin_followups" to "service_role";

revoke all on table public."el8_checkin_question_bank" from public,anon,authenticated,service_role;

grant insert on table public."el8_checkin_question_bank" to "postgres";

grant select on table public."el8_checkin_question_bank" to "postgres";

grant update on table public."el8_checkin_question_bank" to "postgres";

grant delete on table public."el8_checkin_question_bank" to "postgres";

grant truncate on table public."el8_checkin_question_bank" to "postgres";

grant references on table public."el8_checkin_question_bank" to "postgres";

grant trigger on table public."el8_checkin_question_bank" to "postgres";

grant maintain on table public."el8_checkin_question_bank" to "postgres";

grant insert on table public."el8_checkin_question_bank" to "anon";

grant select on table public."el8_checkin_question_bank" to "anon";

grant update on table public."el8_checkin_question_bank" to "anon";

grant delete on table public."el8_checkin_question_bank" to "anon";

grant truncate on table public."el8_checkin_question_bank" to "anon";

grant references on table public."el8_checkin_question_bank" to "anon";

grant trigger on table public."el8_checkin_question_bank" to "anon";

grant maintain on table public."el8_checkin_question_bank" to "anon";

grant insert on table public."el8_checkin_question_bank" to "authenticated";

grant select on table public."el8_checkin_question_bank" to "authenticated";

grant update on table public."el8_checkin_question_bank" to "authenticated";

grant delete on table public."el8_checkin_question_bank" to "authenticated";

grant truncate on table public."el8_checkin_question_bank" to "authenticated";

grant references on table public."el8_checkin_question_bank" to "authenticated";

grant trigger on table public."el8_checkin_question_bank" to "authenticated";

grant maintain on table public."el8_checkin_question_bank" to "authenticated";

grant insert on table public."el8_checkin_question_bank" to "service_role";

grant select on table public."el8_checkin_question_bank" to "service_role";

grant update on table public."el8_checkin_question_bank" to "service_role";

grant delete on table public."el8_checkin_question_bank" to "service_role";

grant truncate on table public."el8_checkin_question_bank" to "service_role";

grant references on table public."el8_checkin_question_bank" to "service_role";

grant trigger on table public."el8_checkin_question_bank" to "service_role";

grant maintain on table public."el8_checkin_question_bank" to "service_role";

revoke all on table public."el8_checkin_signals" from public,anon,authenticated,service_role;

grant insert on table public."el8_checkin_signals" to "postgres";

grant select on table public."el8_checkin_signals" to "postgres";

grant update on table public."el8_checkin_signals" to "postgres";

grant delete on table public."el8_checkin_signals" to "postgres";

grant truncate on table public."el8_checkin_signals" to "postgres";

grant references on table public."el8_checkin_signals" to "postgres";

grant trigger on table public."el8_checkin_signals" to "postgres";

grant maintain on table public."el8_checkin_signals" to "postgres";

grant insert on table public."el8_checkin_signals" to "anon";

grant select on table public."el8_checkin_signals" to "anon";

grant update on table public."el8_checkin_signals" to "anon";

grant delete on table public."el8_checkin_signals" to "anon";

grant truncate on table public."el8_checkin_signals" to "anon";

grant references on table public."el8_checkin_signals" to "anon";

grant trigger on table public."el8_checkin_signals" to "anon";

grant maintain on table public."el8_checkin_signals" to "anon";

grant insert on table public."el8_checkin_signals" to "authenticated";

grant select on table public."el8_checkin_signals" to "authenticated";

grant update on table public."el8_checkin_signals" to "authenticated";

grant delete on table public."el8_checkin_signals" to "authenticated";

grant truncate on table public."el8_checkin_signals" to "authenticated";

grant references on table public."el8_checkin_signals" to "authenticated";

grant trigger on table public."el8_checkin_signals" to "authenticated";

grant maintain on table public."el8_checkin_signals" to "authenticated";

grant insert on table public."el8_checkin_signals" to "service_role";

grant select on table public."el8_checkin_signals" to "service_role";

grant update on table public."el8_checkin_signals" to "service_role";

grant delete on table public."el8_checkin_signals" to "service_role";

grant truncate on table public."el8_checkin_signals" to "service_role";

grant references on table public."el8_checkin_signals" to "service_role";

grant trigger on table public."el8_checkin_signals" to "service_role";

grant maintain on table public."el8_checkin_signals" to "service_role";

revoke all on table public."el8_daily_checkins" from public,anon,authenticated,service_role;

grant insert on table public."el8_daily_checkins" to "postgres";

grant select on table public."el8_daily_checkins" to "postgres";

grant update on table public."el8_daily_checkins" to "postgres";

grant delete on table public."el8_daily_checkins" to "postgres";

grant truncate on table public."el8_daily_checkins" to "postgres";

grant references on table public."el8_daily_checkins" to "postgres";

grant trigger on table public."el8_daily_checkins" to "postgres";

grant maintain on table public."el8_daily_checkins" to "postgres";

grant insert on table public."el8_daily_checkins" to "service_role";

grant select on table public."el8_daily_checkins" to "service_role";

grant update on table public."el8_daily_checkins" to "service_role";

grant delete on table public."el8_daily_checkins" to "service_role";

grant truncate on table public."el8_daily_checkins" to "service_role";

grant references on table public."el8_daily_checkins" to "service_role";

grant trigger on table public."el8_daily_checkins" to "service_role";

grant maintain on table public."el8_daily_checkins" to "service_role";

grant insert on table public."el8_daily_checkins" to "authenticated";

grant select on table public."el8_daily_checkins" to "authenticated";

revoke all on table public."el8_emotional_deepenings" from public,anon,authenticated,service_role;

grant insert on table public."el8_emotional_deepenings" to "postgres";

grant select on table public."el8_emotional_deepenings" to "postgres";

grant update on table public."el8_emotional_deepenings" to "postgres";

grant delete on table public."el8_emotional_deepenings" to "postgres";

grant truncate on table public."el8_emotional_deepenings" to "postgres";

grant references on table public."el8_emotional_deepenings" to "postgres";

grant trigger on table public."el8_emotional_deepenings" to "postgres";

grant maintain on table public."el8_emotional_deepenings" to "postgres";

grant insert on table public."el8_emotional_deepenings" to "service_role";

grant select on table public."el8_emotional_deepenings" to "service_role";

grant update on table public."el8_emotional_deepenings" to "service_role";

grant delete on table public."el8_emotional_deepenings" to "service_role";

grant truncate on table public."el8_emotional_deepenings" to "service_role";

grant references on table public."el8_emotional_deepenings" to "service_role";

grant trigger on table public."el8_emotional_deepenings" to "service_role";

grant maintain on table public."el8_emotional_deepenings" to "service_role";

grant insert on table public."el8_emotional_deepenings" to "authenticated";

grant select on table public."el8_emotional_deepenings" to "authenticated";

revoke all on table public."el8_entries" from public,anon,authenticated,service_role;

grant insert on table public."el8_entries" to "postgres";

grant select on table public."el8_entries" to "postgres";

grant update on table public."el8_entries" to "postgres";

grant delete on table public."el8_entries" to "postgres";

grant truncate on table public."el8_entries" to "postgres";

grant references on table public."el8_entries" to "postgres";

grant trigger on table public."el8_entries" to "postgres";

grant maintain on table public."el8_entries" to "postgres";

grant insert on table public."el8_entries" to "service_role";

grant select on table public."el8_entries" to "service_role";

grant update on table public."el8_entries" to "service_role";

grant delete on table public."el8_entries" to "service_role";

grant truncate on table public."el8_entries" to "service_role";

grant references on table public."el8_entries" to "service_role";

grant trigger on table public."el8_entries" to "service_role";

grant maintain on table public."el8_entries" to "service_role";

grant insert on table public."el8_entries" to "authenticated";

grant select on table public."el8_entries" to "authenticated";

revoke all on table public."el8_entry_revisions" from public,anon,authenticated,service_role;

grant insert on table public."el8_entry_revisions" to "postgres";

grant select on table public."el8_entry_revisions" to "postgres";

grant update on table public."el8_entry_revisions" to "postgres";

grant delete on table public."el8_entry_revisions" to "postgres";

grant truncate on table public."el8_entry_revisions" to "postgres";

grant references on table public."el8_entry_revisions" to "postgres";

grant trigger on table public."el8_entry_revisions" to "postgres";

grant maintain on table public."el8_entry_revisions" to "postgres";

grant insert on table public."el8_entry_revisions" to "service_role";

grant select on table public."el8_entry_revisions" to "service_role";

grant update on table public."el8_entry_revisions" to "service_role";

grant delete on table public."el8_entry_revisions" to "service_role";

grant truncate on table public."el8_entry_revisions" to "service_role";

grant references on table public."el8_entry_revisions" to "service_role";

grant trigger on table public."el8_entry_revisions" to "service_role";

grant maintain on table public."el8_entry_revisions" to "service_role";

revoke all on table public."el8_focus_clarifications" from public,anon,authenticated,service_role;

grant insert on table public."el8_focus_clarifications" to "postgres";

grant select on table public."el8_focus_clarifications" to "postgres";

grant update on table public."el8_focus_clarifications" to "postgres";

grant delete on table public."el8_focus_clarifications" to "postgres";

grant truncate on table public."el8_focus_clarifications" to "postgres";

grant references on table public."el8_focus_clarifications" to "postgres";

grant trigger on table public."el8_focus_clarifications" to "postgres";

grant maintain on table public."el8_focus_clarifications" to "postgres";

grant insert on table public."el8_focus_clarifications" to "service_role";

grant select on table public."el8_focus_clarifications" to "service_role";

grant update on table public."el8_focus_clarifications" to "service_role";

grant delete on table public."el8_focus_clarifications" to "service_role";

grant truncate on table public."el8_focus_clarifications" to "service_role";

grant references on table public."el8_focus_clarifications" to "service_role";

grant trigger on table public."el8_focus_clarifications" to "service_role";

grant maintain on table public."el8_focus_clarifications" to "service_role";

grant insert on table public."el8_focus_clarifications" to "authenticated";

grant select on table public."el8_focus_clarifications" to "authenticated";

revoke all on table public."el8_intelligence_test_config" from public,anon,authenticated,service_role;

grant insert on table public."el8_intelligence_test_config" to "postgres";

grant select on table public."el8_intelligence_test_config" to "postgres";

grant update on table public."el8_intelligence_test_config" to "postgres";

grant delete on table public."el8_intelligence_test_config" to "postgres";

grant truncate on table public."el8_intelligence_test_config" to "postgres";

grant references on table public."el8_intelligence_test_config" to "postgres";

grant trigger on table public."el8_intelligence_test_config" to "postgres";

grant maintain on table public."el8_intelligence_test_config" to "postgres";

grant insert on table public."el8_intelligence_test_config" to "service_role";

grant select on table public."el8_intelligence_test_config" to "service_role";

grant update on table public."el8_intelligence_test_config" to "service_role";

grant delete on table public."el8_intelligence_test_config" to "service_role";

grant truncate on table public."el8_intelligence_test_config" to "service_role";

grant references on table public."el8_intelligence_test_config" to "service_role";

grant trigger on table public."el8_intelligence_test_config" to "service_role";

grant maintain on table public."el8_intelligence_test_config" to "service_role";

revoke all on table public."el8_intelligence_test_events" from public,anon,authenticated,service_role;

grant insert on table public."el8_intelligence_test_events" to "postgres";

grant select on table public."el8_intelligence_test_events" to "postgres";

grant update on table public."el8_intelligence_test_events" to "postgres";

grant delete on table public."el8_intelligence_test_events" to "postgres";

grant truncate on table public."el8_intelligence_test_events" to "postgres";

grant references on table public."el8_intelligence_test_events" to "postgres";

grant trigger on table public."el8_intelligence_test_events" to "postgres";

grant maintain on table public."el8_intelligence_test_events" to "postgres";

grant insert on table public."el8_intelligence_test_events" to "service_role";

grant select on table public."el8_intelligence_test_events" to "service_role";

grant update on table public."el8_intelligence_test_events" to "service_role";

grant delete on table public."el8_intelligence_test_events" to "service_role";

grant truncate on table public."el8_intelligence_test_events" to "service_role";

grant references on table public."el8_intelligence_test_events" to "service_role";

grant trigger on table public."el8_intelligence_test_events" to "service_role";

grant maintain on table public."el8_intelligence_test_events" to "service_role";

revoke all on table public."el8_intelligence_test_notes" from public,anon,authenticated,service_role;

grant insert on table public."el8_intelligence_test_notes" to "postgres";

grant select on table public."el8_intelligence_test_notes" to "postgres";

grant update on table public."el8_intelligence_test_notes" to "postgres";

grant delete on table public."el8_intelligence_test_notes" to "postgres";

grant truncate on table public."el8_intelligence_test_notes" to "postgres";

grant references on table public."el8_intelligence_test_notes" to "postgres";

grant trigger on table public."el8_intelligence_test_notes" to "postgres";

grant maintain on table public."el8_intelligence_test_notes" to "postgres";

grant insert on table public."el8_intelligence_test_notes" to "service_role";

grant select on table public."el8_intelligence_test_notes" to "service_role";

grant update on table public."el8_intelligence_test_notes" to "service_role";

grant delete on table public."el8_intelligence_test_notes" to "service_role";

grant truncate on table public."el8_intelligence_test_notes" to "service_role";

grant references on table public."el8_intelligence_test_notes" to "service_role";

grant trigger on table public."el8_intelligence_test_notes" to "service_role";

grant maintain on table public."el8_intelligence_test_notes" to "service_role";

revoke all on table public."el8_intelligence_test_results" from public,anon,authenticated,service_role;

grant insert on table public."el8_intelligence_test_results" to "postgres";

grant select on table public."el8_intelligence_test_results" to "postgres";

grant update on table public."el8_intelligence_test_results" to "postgres";

grant delete on table public."el8_intelligence_test_results" to "postgres";

grant truncate on table public."el8_intelligence_test_results" to "postgres";

grant references on table public."el8_intelligence_test_results" to "postgres";

grant trigger on table public."el8_intelligence_test_results" to "postgres";

grant maintain on table public."el8_intelligence_test_results" to "postgres";

grant insert on table public."el8_intelligence_test_results" to "service_role";

grant select on table public."el8_intelligence_test_results" to "service_role";

grant update on table public."el8_intelligence_test_results" to "service_role";

grant delete on table public."el8_intelligence_test_results" to "service_role";

grant truncate on table public."el8_intelligence_test_results" to "service_role";

grant references on table public."el8_intelligence_test_results" to "service_role";

grant trigger on table public."el8_intelligence_test_results" to "service_role";

grant maintain on table public."el8_intelligence_test_results" to "service_role";

revoke all on table public."el8_intelligence_test_sessions" from public,anon,authenticated,service_role;

grant insert on table public."el8_intelligence_test_sessions" to "postgres";

grant select on table public."el8_intelligence_test_sessions" to "postgres";

grant update on table public."el8_intelligence_test_sessions" to "postgres";

grant delete on table public."el8_intelligence_test_sessions" to "postgres";

grant truncate on table public."el8_intelligence_test_sessions" to "postgres";

grant references on table public."el8_intelligence_test_sessions" to "postgres";

grant trigger on table public."el8_intelligence_test_sessions" to "postgres";

grant maintain on table public."el8_intelligence_test_sessions" to "postgres";

grant insert on table public."el8_intelligence_test_sessions" to "service_role";

grant select on table public."el8_intelligence_test_sessions" to "service_role";

grant update on table public."el8_intelligence_test_sessions" to "service_role";

grant delete on table public."el8_intelligence_test_sessions" to "service_role";

grant truncate on table public."el8_intelligence_test_sessions" to "service_role";

grant references on table public."el8_intelligence_test_sessions" to "service_role";

grant trigger on table public."el8_intelligence_test_sessions" to "service_role";

grant maintain on table public."el8_intelligence_test_sessions" to "service_role";

revoke all on table public."el8_member_activity" from public,anon,authenticated,service_role;

grant insert on table public."el8_member_activity" to "postgres";

grant select on table public."el8_member_activity" to "postgres";

grant update on table public."el8_member_activity" to "postgres";

grant delete on table public."el8_member_activity" to "postgres";

grant truncate on table public."el8_member_activity" to "postgres";

grant references on table public."el8_member_activity" to "postgres";

grant trigger on table public."el8_member_activity" to "postgres";

grant maintain on table public."el8_member_activity" to "postgres";

grant insert on table public."el8_member_activity" to "anon";

grant select on table public."el8_member_activity" to "anon";

grant update on table public."el8_member_activity" to "anon";

grant delete on table public."el8_member_activity" to "anon";

grant truncate on table public."el8_member_activity" to "anon";

grant references on table public."el8_member_activity" to "anon";

grant trigger on table public."el8_member_activity" to "anon";

grant maintain on table public."el8_member_activity" to "anon";

grant insert on table public."el8_member_activity" to "authenticated";

grant select on table public."el8_member_activity" to "authenticated";

grant update on table public."el8_member_activity" to "authenticated";

grant delete on table public."el8_member_activity" to "authenticated";

grant truncate on table public."el8_member_activity" to "authenticated";

grant references on table public."el8_member_activity" to "authenticated";

grant trigger on table public."el8_member_activity" to "authenticated";

grant maintain on table public."el8_member_activity" to "authenticated";

grant insert on table public."el8_member_activity" to "service_role";

grant select on table public."el8_member_activity" to "service_role";

grant update on table public."el8_member_activity" to "service_role";

grant delete on table public."el8_member_activity" to "service_role";

grant truncate on table public."el8_member_activity" to "service_role";

grant references on table public."el8_member_activity" to "service_role";

grant trigger on table public."el8_member_activity" to "service_role";

grant maintain on table public."el8_member_activity" to "service_role";

revoke all on table public."el8_member_load_state" from public,anon,authenticated,service_role;

grant insert on table public."el8_member_load_state" to "postgres";

grant select on table public."el8_member_load_state" to "postgres";

grant update on table public."el8_member_load_state" to "postgres";

grant delete on table public."el8_member_load_state" to "postgres";

grant truncate on table public."el8_member_load_state" to "postgres";

grant references on table public."el8_member_load_state" to "postgres";

grant trigger on table public."el8_member_load_state" to "postgres";

grant maintain on table public."el8_member_load_state" to "postgres";

grant insert on table public."el8_member_load_state" to "anon";

grant select on table public."el8_member_load_state" to "anon";

grant update on table public."el8_member_load_state" to "anon";

grant delete on table public."el8_member_load_state" to "anon";

grant truncate on table public."el8_member_load_state" to "anon";

grant references on table public."el8_member_load_state" to "anon";

grant trigger on table public."el8_member_load_state" to "anon";

grant maintain on table public."el8_member_load_state" to "anon";

grant insert on table public."el8_member_load_state" to "authenticated";

grant select on table public."el8_member_load_state" to "authenticated";

grant update on table public."el8_member_load_state" to "authenticated";

grant delete on table public."el8_member_load_state" to "authenticated";

grant truncate on table public."el8_member_load_state" to "authenticated";

grant references on table public."el8_member_load_state" to "authenticated";

grant trigger on table public."el8_member_load_state" to "authenticated";

grant maintain on table public."el8_member_load_state" to "authenticated";

grant insert on table public."el8_member_load_state" to "service_role";

grant select on table public."el8_member_load_state" to "service_role";

grant update on table public."el8_member_load_state" to "service_role";

grant delete on table public."el8_member_load_state" to "service_role";

grant truncate on table public."el8_member_load_state" to "service_role";

grant references on table public."el8_member_load_state" to "service_role";

grant trigger on table public."el8_member_load_state" to "service_role";

grant maintain on table public."el8_member_load_state" to "service_role";

revoke all on table public."el8_member_state" from public,anon,authenticated,service_role;

grant insert on table public."el8_member_state" to "postgres";

grant select on table public."el8_member_state" to "postgres";

grant update on table public."el8_member_state" to "postgres";

grant delete on table public."el8_member_state" to "postgres";

grant truncate on table public."el8_member_state" to "postgres";

grant references on table public."el8_member_state" to "postgres";

grant trigger on table public."el8_member_state" to "postgres";

grant maintain on table public."el8_member_state" to "postgres";

grant insert on table public."el8_member_state" to "service_role";

grant select on table public."el8_member_state" to "service_role";

grant update on table public."el8_member_state" to "service_role";

grant delete on table public."el8_member_state" to "service_role";

grant truncate on table public."el8_member_state" to "service_role";

grant references on table public."el8_member_state" to "service_role";

grant trigger on table public."el8_member_state" to "service_role";

grant maintain on table public."el8_member_state" to "service_role";

grant insert on table public."el8_member_state" to "authenticated";

grant select on table public."el8_member_state" to "authenticated";

grant update on table public."el8_member_state" to "authenticated";

revoke all on table public."el8_module_assignments" from public,anon,authenticated,service_role;

grant insert on table public."el8_module_assignments" to "postgres";

grant select on table public."el8_module_assignments" to "postgres";

grant update on table public."el8_module_assignments" to "postgres";

grant delete on table public."el8_module_assignments" to "postgres";

grant truncate on table public."el8_module_assignments" to "postgres";

grant references on table public."el8_module_assignments" to "postgres";

grant trigger on table public."el8_module_assignments" to "postgres";

grant maintain on table public."el8_module_assignments" to "postgres";

grant insert on table public."el8_module_assignments" to "service_role";

grant select on table public."el8_module_assignments" to "service_role";

grant update on table public."el8_module_assignments" to "service_role";

grant delete on table public."el8_module_assignments" to "service_role";

grant truncate on table public."el8_module_assignments" to "service_role";

grant references on table public."el8_module_assignments" to "service_role";

grant trigger on table public."el8_module_assignments" to "service_role";

grant maintain on table public."el8_module_assignments" to "service_role";

grant select on table public."el8_module_assignments" to "authenticated";

revoke all on table public."el8_onboarding_runs" from public,anon,authenticated,service_role;

grant insert on table public."el8_onboarding_runs" to "postgres";

grant select on table public."el8_onboarding_runs" to "postgres";

grant update on table public."el8_onboarding_runs" to "postgres";

grant delete on table public."el8_onboarding_runs" to "postgres";

grant truncate on table public."el8_onboarding_runs" to "postgres";

grant references on table public."el8_onboarding_runs" to "postgres";

grant trigger on table public."el8_onboarding_runs" to "postgres";

grant maintain on table public."el8_onboarding_runs" to "postgres";

grant insert on table public."el8_onboarding_runs" to "service_role";

grant select on table public."el8_onboarding_runs" to "service_role";

grant update on table public."el8_onboarding_runs" to "service_role";

grant delete on table public."el8_onboarding_runs" to "service_role";

grant truncate on table public."el8_onboarding_runs" to "service_role";

grant references on table public."el8_onboarding_runs" to "service_role";

grant trigger on table public."el8_onboarding_runs" to "service_role";

grant maintain on table public."el8_onboarding_runs" to "service_role";

revoke all on table public."el8_plan_checkins" from public,anon,authenticated,service_role;

grant insert on table public."el8_plan_checkins" to "postgres";

grant select on table public."el8_plan_checkins" to "postgres";

grant update on table public."el8_plan_checkins" to "postgres";

grant delete on table public."el8_plan_checkins" to "postgres";

grant truncate on table public."el8_plan_checkins" to "postgres";

grant references on table public."el8_plan_checkins" to "postgres";

grant trigger on table public."el8_plan_checkins" to "postgres";

grant maintain on table public."el8_plan_checkins" to "postgres";

grant insert on table public."el8_plan_checkins" to "service_role";

grant select on table public."el8_plan_checkins" to "service_role";

grant update on table public."el8_plan_checkins" to "service_role";

grant delete on table public."el8_plan_checkins" to "service_role";

grant truncate on table public."el8_plan_checkins" to "service_role";

grant references on table public."el8_plan_checkins" to "service_role";

grant trigger on table public."el8_plan_checkins" to "service_role";

grant maintain on table public."el8_plan_checkins" to "service_role";

grant insert on table public."el8_plan_checkins" to "authenticated";

grant select on table public."el8_plan_checkins" to "authenticated";

revoke all on table public."el8_plan_reassessments" from public,anon,authenticated,service_role;

grant insert on table public."el8_plan_reassessments" to "postgres";

grant select on table public."el8_plan_reassessments" to "postgres";

grant update on table public."el8_plan_reassessments" to "postgres";

grant delete on table public."el8_plan_reassessments" to "postgres";

grant truncate on table public."el8_plan_reassessments" to "postgres";

grant references on table public."el8_plan_reassessments" to "postgres";

grant trigger on table public."el8_plan_reassessments" to "postgres";

grant maintain on table public."el8_plan_reassessments" to "postgres";

grant insert on table public."el8_plan_reassessments" to "authenticated";

grant select on table public."el8_plan_reassessments" to "authenticated";

grant update on table public."el8_plan_reassessments" to "authenticated";

grant delete on table public."el8_plan_reassessments" to "authenticated";

grant truncate on table public."el8_plan_reassessments" to "authenticated";

grant references on table public."el8_plan_reassessments" to "authenticated";

grant trigger on table public."el8_plan_reassessments" to "authenticated";

grant maintain on table public."el8_plan_reassessments" to "authenticated";

grant insert on table public."el8_plan_reassessments" to "service_role";

grant select on table public."el8_plan_reassessments" to "service_role";

grant update on table public."el8_plan_reassessments" to "service_role";

grant delete on table public."el8_plan_reassessments" to "service_role";

grant truncate on table public."el8_plan_reassessments" to "service_role";

grant references on table public."el8_plan_reassessments" to "service_role";

grant trigger on table public."el8_plan_reassessments" to "service_role";

grant maintain on table public."el8_plan_reassessments" to "service_role";

revoke all on table public."el8_plan_reviews" from public,anon,authenticated,service_role;

grant insert on table public."el8_plan_reviews" to "postgres";

grant select on table public."el8_plan_reviews" to "postgres";

grant update on table public."el8_plan_reviews" to "postgres";

grant delete on table public."el8_plan_reviews" to "postgres";

grant truncate on table public."el8_plan_reviews" to "postgres";

grant references on table public."el8_plan_reviews" to "postgres";

grant trigger on table public."el8_plan_reviews" to "postgres";

grant maintain on table public."el8_plan_reviews" to "postgres";

grant insert on table public."el8_plan_reviews" to "service_role";

grant select on table public."el8_plan_reviews" to "service_role";

grant update on table public."el8_plan_reviews" to "service_role";

grant delete on table public."el8_plan_reviews" to "service_role";

grant truncate on table public."el8_plan_reviews" to "service_role";

grant references on table public."el8_plan_reviews" to "service_role";

grant trigger on table public."el8_plan_reviews" to "service_role";

grant maintain on table public."el8_plan_reviews" to "service_role";

grant insert on table public."el8_plan_reviews" to "authenticated";

grant select on table public."el8_plan_reviews" to "authenticated";

revoke all on table public."el8_plans" from public,anon,authenticated,service_role;

grant insert on table public."el8_plans" to "postgres";

grant select on table public."el8_plans" to "postgres";

grant update on table public."el8_plans" to "postgres";

grant delete on table public."el8_plans" to "postgres";

grant truncate on table public."el8_plans" to "postgres";

grant references on table public."el8_plans" to "postgres";

grant trigger on table public."el8_plans" to "postgres";

grant maintain on table public."el8_plans" to "postgres";

grant insert on table public."el8_plans" to "service_role";

grant select on table public."el8_plans" to "service_role";

grant update on table public."el8_plans" to "service_role";

grant delete on table public."el8_plans" to "service_role";

grant truncate on table public."el8_plans" to "service_role";

grant references on table public."el8_plans" to "service_role";

grant trigger on table public."el8_plans" to "service_role";

grant maintain on table public."el8_plans" to "service_role";

grant insert on table public."el8_plans" to "authenticated";

grant select on table public."el8_plans" to "authenticated";

grant update on table public."el8_plans" to "authenticated";

revoke all on table public."el8_profiles" from public,anon,authenticated,service_role;

grant insert on table public."el8_profiles" to "postgres";

grant select on table public."el8_profiles" to "postgres";

grant update on table public."el8_profiles" to "postgres";

grant delete on table public."el8_profiles" to "postgres";

grant truncate on table public."el8_profiles" to "postgres";

grant references on table public."el8_profiles" to "postgres";

grant trigger on table public."el8_profiles" to "postgres";

grant maintain on table public."el8_profiles" to "postgres";

grant insert on table public."el8_profiles" to "service_role";

grant select on table public."el8_profiles" to "service_role";

grant update on table public."el8_profiles" to "service_role";

grant delete on table public."el8_profiles" to "service_role";

grant truncate on table public."el8_profiles" to "service_role";

grant references on table public."el8_profiles" to "service_role";

grant trigger on table public."el8_profiles" to "service_role";

grant maintain on table public."el8_profiles" to "service_role";

grant select on table public."el8_profiles" to "authenticated";

grant update on table public."el8_profiles" to "authenticated";

revoke all on table public."el8_qa_accelerated_checkins" from public,anon,authenticated,service_role;

grant insert on table public."el8_qa_accelerated_checkins" to "postgres";

grant select on table public."el8_qa_accelerated_checkins" to "postgres";

grant update on table public."el8_qa_accelerated_checkins" to "postgres";

grant delete on table public."el8_qa_accelerated_checkins" to "postgres";

grant truncate on table public."el8_qa_accelerated_checkins" to "postgres";

grant references on table public."el8_qa_accelerated_checkins" to "postgres";

grant trigger on table public."el8_qa_accelerated_checkins" to "postgres";

grant maintain on table public."el8_qa_accelerated_checkins" to "postgres";

grant insert on table public."el8_qa_accelerated_checkins" to "anon";

grant select on table public."el8_qa_accelerated_checkins" to "anon";

grant update on table public."el8_qa_accelerated_checkins" to "anon";

grant delete on table public."el8_qa_accelerated_checkins" to "anon";

grant truncate on table public."el8_qa_accelerated_checkins" to "anon";

grant references on table public."el8_qa_accelerated_checkins" to "anon";

grant trigger on table public."el8_qa_accelerated_checkins" to "anon";

grant maintain on table public."el8_qa_accelerated_checkins" to "anon";

grant insert on table public."el8_qa_accelerated_checkins" to "authenticated";

grant select on table public."el8_qa_accelerated_checkins" to "authenticated";

grant update on table public."el8_qa_accelerated_checkins" to "authenticated";

grant delete on table public."el8_qa_accelerated_checkins" to "authenticated";

grant truncate on table public."el8_qa_accelerated_checkins" to "authenticated";

grant references on table public."el8_qa_accelerated_checkins" to "authenticated";

grant trigger on table public."el8_qa_accelerated_checkins" to "authenticated";

grant maintain on table public."el8_qa_accelerated_checkins" to "authenticated";

grant insert on table public."el8_qa_accelerated_checkins" to "service_role";

grant select on table public."el8_qa_accelerated_checkins" to "service_role";

grant update on table public."el8_qa_accelerated_checkins" to "service_role";

grant delete on table public."el8_qa_accelerated_checkins" to "service_role";

grant truncate on table public."el8_qa_accelerated_checkins" to "service_role";

grant references on table public."el8_qa_accelerated_checkins" to "service_role";

grant trigger on table public."el8_qa_accelerated_checkins" to "service_role";

grant maintain on table public."el8_qa_accelerated_checkins" to "service_role";

revoke all on table public."el8_qa_events" from public,anon,authenticated,service_role;

grant insert on table public."el8_qa_events" to "postgres";

grant select on table public."el8_qa_events" to "postgres";

grant update on table public."el8_qa_events" to "postgres";

grant delete on table public."el8_qa_events" to "postgres";

grant truncate on table public."el8_qa_events" to "postgres";

grant references on table public."el8_qa_events" to "postgres";

grant trigger on table public."el8_qa_events" to "postgres";

grant maintain on table public."el8_qa_events" to "postgres";

grant insert on table public."el8_qa_events" to "anon";

grant select on table public."el8_qa_events" to "anon";

grant update on table public."el8_qa_events" to "anon";

grant delete on table public."el8_qa_events" to "anon";

grant truncate on table public."el8_qa_events" to "anon";

grant references on table public."el8_qa_events" to "anon";

grant trigger on table public."el8_qa_events" to "anon";

grant maintain on table public."el8_qa_events" to "anon";

grant insert on table public."el8_qa_events" to "authenticated";

grant select on table public."el8_qa_events" to "authenticated";

grant update on table public."el8_qa_events" to "authenticated";

grant delete on table public."el8_qa_events" to "authenticated";

grant truncate on table public."el8_qa_events" to "authenticated";

grant references on table public."el8_qa_events" to "authenticated";

grant trigger on table public."el8_qa_events" to "authenticated";

grant maintain on table public."el8_qa_events" to "authenticated";

grant insert on table public."el8_qa_events" to "service_role";

grant select on table public."el8_qa_events" to "service_role";

grant update on table public."el8_qa_events" to "service_role";

grant delete on table public."el8_qa_events" to "service_role";

grant truncate on table public."el8_qa_events" to "service_role";

grant references on table public."el8_qa_events" to "service_role";

grant trigger on table public."el8_qa_events" to "service_role";

grant maintain on table public."el8_qa_events" to "service_role";

revoke all on table public."el8_qa_feedback" from public,anon,authenticated,service_role;

grant insert on table public."el8_qa_feedback" to "postgres";

grant select on table public."el8_qa_feedback" to "postgres";

grant update on table public."el8_qa_feedback" to "postgres";

grant delete on table public."el8_qa_feedback" to "postgres";

grant truncate on table public."el8_qa_feedback" to "postgres";

grant references on table public."el8_qa_feedback" to "postgres";

grant trigger on table public."el8_qa_feedback" to "postgres";

grant maintain on table public."el8_qa_feedback" to "postgres";

grant insert on table public."el8_qa_feedback" to "anon";

grant select on table public."el8_qa_feedback" to "anon";

grant update on table public."el8_qa_feedback" to "anon";

grant delete on table public."el8_qa_feedback" to "anon";

grant truncate on table public."el8_qa_feedback" to "anon";

grant references on table public."el8_qa_feedback" to "anon";

grant trigger on table public."el8_qa_feedback" to "anon";

grant maintain on table public."el8_qa_feedback" to "anon";

grant insert on table public."el8_qa_feedback" to "authenticated";

grant select on table public."el8_qa_feedback" to "authenticated";

grant update on table public."el8_qa_feedback" to "authenticated";

grant delete on table public."el8_qa_feedback" to "authenticated";

grant truncate on table public."el8_qa_feedback" to "authenticated";

grant references on table public."el8_qa_feedback" to "authenticated";

grant trigger on table public."el8_qa_feedback" to "authenticated";

grant maintain on table public."el8_qa_feedback" to "authenticated";

grant insert on table public."el8_qa_feedback" to "service_role";

grant select on table public."el8_qa_feedback" to "service_role";

grant update on table public."el8_qa_feedback" to "service_role";

grant delete on table public."el8_qa_feedback" to "service_role";

grant truncate on table public."el8_qa_feedback" to "service_role";

grant references on table public."el8_qa_feedback" to "service_role";

grant trigger on table public."el8_qa_feedback" to "service_role";

grant maintain on table public."el8_qa_feedback" to "service_role";

revoke all on table public."el8_qa_runs" from public,anon,authenticated,service_role;

grant insert on table public."el8_qa_runs" to "postgres";

grant select on table public."el8_qa_runs" to "postgres";

grant update on table public."el8_qa_runs" to "postgres";

grant delete on table public."el8_qa_runs" to "postgres";

grant truncate on table public."el8_qa_runs" to "postgres";

grant references on table public."el8_qa_runs" to "postgres";

grant trigger on table public."el8_qa_runs" to "postgres";

grant maintain on table public."el8_qa_runs" to "postgres";

grant insert on table public."el8_qa_runs" to "anon";

grant select on table public."el8_qa_runs" to "anon";

grant update on table public."el8_qa_runs" to "anon";

grant delete on table public."el8_qa_runs" to "anon";

grant truncate on table public."el8_qa_runs" to "anon";

grant references on table public."el8_qa_runs" to "anon";

grant trigger on table public."el8_qa_runs" to "anon";

grant maintain on table public."el8_qa_runs" to "anon";

grant insert on table public."el8_qa_runs" to "authenticated";

grant select on table public."el8_qa_runs" to "authenticated";

grant update on table public."el8_qa_runs" to "authenticated";

grant delete on table public."el8_qa_runs" to "authenticated";

grant truncate on table public."el8_qa_runs" to "authenticated";

grant references on table public."el8_qa_runs" to "authenticated";

grant trigger on table public."el8_qa_runs" to "authenticated";

grant maintain on table public."el8_qa_runs" to "authenticated";

grant insert on table public."el8_qa_runs" to "service_role";

grant select on table public."el8_qa_runs" to "service_role";

grant update on table public."el8_qa_runs" to "service_role";

grant delete on table public."el8_qa_runs" to "service_role";

grant truncate on table public."el8_qa_runs" to "service_role";

grant references on table public."el8_qa_runs" to "service_role";

grant trigger on table public."el8_qa_runs" to "service_role";

grant maintain on table public."el8_qa_runs" to "service_role";

revoke all on table public."el8_question_experiment_variants" from public,anon,authenticated,service_role;

grant insert on table public."el8_question_experiment_variants" to "postgres";

grant select on table public."el8_question_experiment_variants" to "postgres";

grant update on table public."el8_question_experiment_variants" to "postgres";

grant delete on table public."el8_question_experiment_variants" to "postgres";

grant truncate on table public."el8_question_experiment_variants" to "postgres";

grant references on table public."el8_question_experiment_variants" to "postgres";

grant trigger on table public."el8_question_experiment_variants" to "postgres";

grant maintain on table public."el8_question_experiment_variants" to "postgres";

grant insert on table public."el8_question_experiment_variants" to "service_role";

grant select on table public."el8_question_experiment_variants" to "service_role";

grant update on table public."el8_question_experiment_variants" to "service_role";

grant delete on table public."el8_question_experiment_variants" to "service_role";

grant truncate on table public."el8_question_experiment_variants" to "service_role";

grant references on table public."el8_question_experiment_variants" to "service_role";

grant trigger on table public."el8_question_experiment_variants" to "service_role";

grant maintain on table public."el8_question_experiment_variants" to "service_role";

revoke all on table public."el8_question_experiments" from public,anon,authenticated,service_role;

grant insert on table public."el8_question_experiments" to "postgres";

grant select on table public."el8_question_experiments" to "postgres";

grant update on table public."el8_question_experiments" to "postgres";

grant delete on table public."el8_question_experiments" to "postgres";

grant truncate on table public."el8_question_experiments" to "postgres";

grant references on table public."el8_question_experiments" to "postgres";

grant trigger on table public."el8_question_experiments" to "postgres";

grant maintain on table public."el8_question_experiments" to "postgres";

grant insert on table public."el8_question_experiments" to "service_role";

grant select on table public."el8_question_experiments" to "service_role";

grant update on table public."el8_question_experiments" to "service_role";

grant delete on table public."el8_question_experiments" to "service_role";

grant truncate on table public."el8_question_experiments" to "service_role";

grant references on table public."el8_question_experiments" to "service_role";

grant trigger on table public."el8_question_experiments" to "service_role";

grant maintain on table public."el8_question_experiments" to "service_role";

revoke all on table public."el8_question_exposures" from public,anon,authenticated,service_role;

grant insert on table public."el8_question_exposures" to "postgres";

grant select on table public."el8_question_exposures" to "postgres";

grant update on table public."el8_question_exposures" to "postgres";

grant delete on table public."el8_question_exposures" to "postgres";

grant truncate on table public."el8_question_exposures" to "postgres";

grant references on table public."el8_question_exposures" to "postgres";

grant trigger on table public."el8_question_exposures" to "postgres";

grant maintain on table public."el8_question_exposures" to "postgres";

grant insert on table public."el8_question_exposures" to "anon";

grant select on table public."el8_question_exposures" to "anon";

grant update on table public."el8_question_exposures" to "anon";

grant delete on table public."el8_question_exposures" to "anon";

grant truncate on table public."el8_question_exposures" to "anon";

grant references on table public."el8_question_exposures" to "anon";

grant trigger on table public."el8_question_exposures" to "anon";

grant maintain on table public."el8_question_exposures" to "anon";

grant insert on table public."el8_question_exposures" to "authenticated";

grant select on table public."el8_question_exposures" to "authenticated";

grant update on table public."el8_question_exposures" to "authenticated";

grant delete on table public."el8_question_exposures" to "authenticated";

grant truncate on table public."el8_question_exposures" to "authenticated";

grant references on table public."el8_question_exposures" to "authenticated";

grant trigger on table public."el8_question_exposures" to "authenticated";

grant maintain on table public."el8_question_exposures" to "authenticated";

grant insert on table public."el8_question_exposures" to "service_role";

grant select on table public."el8_question_exposures" to "service_role";

grant update on table public."el8_question_exposures" to "service_role";

grant delete on table public."el8_question_exposures" to "service_role";

grant truncate on table public."el8_question_exposures" to "service_role";

grant references on table public."el8_question_exposures" to "service_role";

grant trigger on table public."el8_question_exposures" to "service_role";

grant maintain on table public."el8_question_exposures" to "service_role";

revoke all on table public."el8_question_matrix" from public,anon,authenticated,service_role;

grant insert on table public."el8_question_matrix" to "postgres";

grant select on table public."el8_question_matrix" to "postgres";

grant update on table public."el8_question_matrix" to "postgres";

grant delete on table public."el8_question_matrix" to "postgres";

grant truncate on table public."el8_question_matrix" to "postgres";

grant references on table public."el8_question_matrix" to "postgres";

grant trigger on table public."el8_question_matrix" to "postgres";

grant maintain on table public."el8_question_matrix" to "postgres";

grant insert on table public."el8_question_matrix" to "anon";

grant select on table public."el8_question_matrix" to "anon";

grant update on table public."el8_question_matrix" to "anon";

grant delete on table public."el8_question_matrix" to "anon";

grant truncate on table public."el8_question_matrix" to "anon";

grant references on table public."el8_question_matrix" to "anon";

grant trigger on table public."el8_question_matrix" to "anon";

grant maintain on table public."el8_question_matrix" to "anon";

grant insert on table public."el8_question_matrix" to "authenticated";

grant select on table public."el8_question_matrix" to "authenticated";

grant update on table public."el8_question_matrix" to "authenticated";

grant delete on table public."el8_question_matrix" to "authenticated";

grant truncate on table public."el8_question_matrix" to "authenticated";

grant references on table public."el8_question_matrix" to "authenticated";

grant trigger on table public."el8_question_matrix" to "authenticated";

grant maintain on table public."el8_question_matrix" to "authenticated";

grant insert on table public."el8_question_matrix" to "service_role";

grant select on table public."el8_question_matrix" to "service_role";

grant update on table public."el8_question_matrix" to "service_role";

grant delete on table public."el8_question_matrix" to "service_role";

grant truncate on table public."el8_question_matrix" to "service_role";

grant references on table public."el8_question_matrix" to "service_role";

grant trigger on table public."el8_question_matrix" to "service_role";

grant maintain on table public."el8_question_matrix" to "service_role";

revoke all on table public."el8_quick_logs" from public,anon,authenticated,service_role;

grant insert on table public."el8_quick_logs" to "postgres";

grant select on table public."el8_quick_logs" to "postgres";

grant update on table public."el8_quick_logs" to "postgres";

grant delete on table public."el8_quick_logs" to "postgres";

grant truncate on table public."el8_quick_logs" to "postgres";

grant references on table public."el8_quick_logs" to "postgres";

grant trigger on table public."el8_quick_logs" to "postgres";

grant maintain on table public."el8_quick_logs" to "postgres";

grant insert on table public."el8_quick_logs" to "anon";

grant select on table public."el8_quick_logs" to "anon";

grant update on table public."el8_quick_logs" to "anon";

grant delete on table public."el8_quick_logs" to "anon";

grant truncate on table public."el8_quick_logs" to "anon";

grant references on table public."el8_quick_logs" to "anon";

grant trigger on table public."el8_quick_logs" to "anon";

grant maintain on table public."el8_quick_logs" to "anon";

grant insert on table public."el8_quick_logs" to "authenticated";

grant select on table public."el8_quick_logs" to "authenticated";

grant update on table public."el8_quick_logs" to "authenticated";

grant delete on table public."el8_quick_logs" to "authenticated";

grant truncate on table public."el8_quick_logs" to "authenticated";

grant references on table public."el8_quick_logs" to "authenticated";

grant trigger on table public."el8_quick_logs" to "authenticated";

grant maintain on table public."el8_quick_logs" to "authenticated";

grant insert on table public."el8_quick_logs" to "service_role";

grant select on table public."el8_quick_logs" to "service_role";

grant update on table public."el8_quick_logs" to "service_role";

grant delete on table public."el8_quick_logs" to "service_role";

grant truncate on table public."el8_quick_logs" to "service_role";

grant references on table public."el8_quick_logs" to "service_role";

grant trigger on table public."el8_quick_logs" to "service_role";

grant maintain on table public."el8_quick_logs" to "service_role";

revoke all on table public."el8_safety_events" from public,anon,authenticated,service_role;

grant insert on table public."el8_safety_events" to "postgres";

grant select on table public."el8_safety_events" to "postgres";

grant update on table public."el8_safety_events" to "postgres";

grant delete on table public."el8_safety_events" to "postgres";

grant truncate on table public."el8_safety_events" to "postgres";

grant references on table public."el8_safety_events" to "postgres";

grant trigger on table public."el8_safety_events" to "postgres";

grant maintain on table public."el8_safety_events" to "postgres";

grant insert on table public."el8_safety_events" to "service_role";

grant select on table public."el8_safety_events" to "service_role";

grant update on table public."el8_safety_events" to "service_role";

grant delete on table public."el8_safety_events" to "service_role";

grant truncate on table public."el8_safety_events" to "service_role";

grant references on table public."el8_safety_events" to "service_role";

grant trigger on table public."el8_safety_events" to "service_role";

grant maintain on table public."el8_safety_events" to "service_role";

grant insert on table public."el8_safety_events" to "authenticated";

grant select on table public."el8_safety_events" to "authenticated";

revoke all on table public."el8_safety_reconciliations" from public,anon,authenticated,service_role;

grant insert on table public."el8_safety_reconciliations" to "postgres";

grant select on table public."el8_safety_reconciliations" to "postgres";

grant update on table public."el8_safety_reconciliations" to "postgres";

grant delete on table public."el8_safety_reconciliations" to "postgres";

grant truncate on table public."el8_safety_reconciliations" to "postgres";

grant references on table public."el8_safety_reconciliations" to "postgres";

grant trigger on table public."el8_safety_reconciliations" to "postgres";

grant maintain on table public."el8_safety_reconciliations" to "postgres";

grant insert on table public."el8_safety_reconciliations" to "service_role";

grant select on table public."el8_safety_reconciliations" to "service_role";

grant update on table public."el8_safety_reconciliations" to "service_role";

grant delete on table public."el8_safety_reconciliations" to "service_role";

grant truncate on table public."el8_safety_reconciliations" to "service_role";

grant references on table public."el8_safety_reconciliations" to "service_role";

grant trigger on table public."el8_safety_reconciliations" to "service_role";

grant maintain on table public."el8_safety_reconciliations" to "service_role";

grant select on table public."el8_safety_reconciliations" to "authenticated";

revoke all on table public."el8_signals" from public,anon,authenticated,service_role;

grant insert on table public."el8_signals" to "postgres";

grant select on table public."el8_signals" to "postgres";

grant update on table public."el8_signals" to "postgres";

grant delete on table public."el8_signals" to "postgres";

grant truncate on table public."el8_signals" to "postgres";

grant references on table public."el8_signals" to "postgres";

grant trigger on table public."el8_signals" to "postgres";

grant maintain on table public."el8_signals" to "postgres";

grant insert on table public."el8_signals" to "anon";

grant select on table public."el8_signals" to "anon";

grant update on table public."el8_signals" to "anon";

grant delete on table public."el8_signals" to "anon";

grant truncate on table public."el8_signals" to "anon";

grant references on table public."el8_signals" to "anon";

grant trigger on table public."el8_signals" to "anon";

grant maintain on table public."el8_signals" to "anon";

grant insert on table public."el8_signals" to "authenticated";

grant select on table public."el8_signals" to "authenticated";

grant update on table public."el8_signals" to "authenticated";

grant delete on table public."el8_signals" to "authenticated";

grant truncate on table public."el8_signals" to "authenticated";

grant references on table public."el8_signals" to "authenticated";

grant trigger on table public."el8_signals" to "authenticated";

grant maintain on table public."el8_signals" to "authenticated";

grant insert on table public."el8_signals" to "service_role";

grant select on table public."el8_signals" to "service_role";

grant update on table public."el8_signals" to "service_role";

grant delete on table public."el8_signals" to "service_role";

grant truncate on table public."el8_signals" to "service_role";

grant references on table public."el8_signals" to "service_role";

grant trigger on table public."el8_signals" to "service_role";

grant maintain on table public."el8_signals" to "service_role";

revoke all on table public."el8_submissions" from public,anon,authenticated,service_role;

grant insert on table public."el8_submissions" to "postgres";

grant select on table public."el8_submissions" to "postgres";

grant update on table public."el8_submissions" to "postgres";

grant delete on table public."el8_submissions" to "postgres";

grant truncate on table public."el8_submissions" to "postgres";

grant references on table public."el8_submissions" to "postgres";

grant trigger on table public."el8_submissions" to "postgres";

grant maintain on table public."el8_submissions" to "postgres";

grant insert on table public."el8_submissions" to "authenticated";

grant select on table public."el8_submissions" to "authenticated";

grant maintain on table public."el8_submissions" to "authenticated";

grant insert on table public."el8_submissions" to "service_role";

grant select on table public."el8_submissions" to "service_role";

grant update on table public."el8_submissions" to "service_role";

grant delete on table public."el8_submissions" to "service_role";

grant truncate on table public."el8_submissions" to "service_role";

grant references on table public."el8_submissions" to "service_role";

grant trigger on table public."el8_submissions" to "service_role";

grant maintain on table public."el8_submissions" to "service_role";

revoke all on table public."el8_weekly_checkins" from public,anon,authenticated,service_role;

grant insert on table public."el8_weekly_checkins" to "postgres";

grant select on table public."el8_weekly_checkins" to "postgres";

grant update on table public."el8_weekly_checkins" to "postgres";

grant delete on table public."el8_weekly_checkins" to "postgres";

grant truncate on table public."el8_weekly_checkins" to "postgres";

grant references on table public."el8_weekly_checkins" to "postgres";

grant trigger on table public."el8_weekly_checkins" to "postgres";

grant maintain on table public."el8_weekly_checkins" to "postgres";

grant insert on table public."el8_weekly_checkins" to "service_role";

grant select on table public."el8_weekly_checkins" to "service_role";

grant update on table public."el8_weekly_checkins" to "service_role";

grant delete on table public."el8_weekly_checkins" to "service_role";

grant truncate on table public."el8_weekly_checkins" to "service_role";

grant references on table public."el8_weekly_checkins" to "service_role";

grant trigger on table public."el8_weekly_checkins" to "service_role";

grant maintain on table public."el8_weekly_checkins" to "service_role";

grant insert on table public."el8_weekly_checkins" to "authenticated";

grant select on table public."el8_weekly_checkins" to "authenticated";

revoke all on function public.activate_el8_plan_v2(uuid) from public,anon,authenticated,service_role;

grant execute on function public.activate_el8_plan_v2(uuid) to "postgres";

grant execute on function public.activate_el8_plan_v2(uuid) to "authenticated";

grant execute on function public.activate_el8_plan_v2(uuid) to "service_role";

revoke all on function public.activate_el8_plan_v3(uuid) from public,anon,authenticated,service_role;

grant execute on function public.activate_el8_plan_v3(uuid) to "postgres";

grant execute on function public.activate_el8_plan_v3(uuid) to "authenticated";

grant execute on function public.activate_el8_plan_v3(uuid) to "service_role";

revoke all on function public.el8_account_purge_active() from public,anon,authenticated,service_role;

grant execute on function public.el8_account_purge_active() to "postgres";

grant execute on function public.el8_account_purge_active() to "service_role";

revoke all on function public.el8_admin_delete_test_account(uuid,text,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_admin_delete_test_account(uuid,text,text) to "postgres";

grant execute on function public.el8_admin_delete_test_account(uuid,text,text) to "service_role";

revoke all on function public.el8_admin_get_member(uuid) from public,anon,authenticated,service_role;

grant execute on function public.el8_admin_get_member(uuid) to "postgres";

grant execute on function public.el8_admin_get_member(uuid) to "service_role";

revoke all on function public.el8_admin_list_members() from public,anon,authenticated,service_role;

grant execute on function public.el8_admin_list_members() to "postgres";

grant execute on function public.el8_admin_list_members() to "service_role";

revoke all on function public.el8_admin_reset_onboarding(uuid,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_admin_reset_onboarding(uuid,text) to "postgres";

grant execute on function public.el8_admin_reset_onboarding(uuid,text) to "service_role";

revoke all on function public.el8_admin_resolve_safety(uuid,text,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_admin_resolve_safety(uuid,text,text) to "postgres";

grant execute on function public.el8_admin_resolve_safety(uuid,text,text) to "service_role";

revoke all on function public.el8_admin_set_account_status(uuid,text,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_admin_set_account_status(uuid,text,text) to "postgres";

grant execute on function public.el8_admin_set_account_status(uuid,text,text) to "service_role";

revoke all on function public.el8_canonical_action_ids_valid(jsonb) from public,anon,authenticated,service_role;

grant execute on function public.el8_canonical_action_ids_valid(jsonb) to "postgres";

grant execute on function public.el8_canonical_action_ids_valid(jsonb) to "service_role";

revoke all on function public.el8_correct_entry(text,text,jsonb,text,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_correct_entry(text,text,jsonb,text,text) to "postgres";

grant execute on function public.el8_correct_entry(text,text,jsonb,text,text) to "service_role";

revoke all on function public.el8_create_once(text,text,text,text,jsonb,text,text,text,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_create_once(text,text,text,text,jsonb,text,text,text,text) to "postgres";

grant execute on function public.el8_create_once(text,text,text,text,jsonb,text,text,text,text) to "service_role";

revoke all on function public.el8_days_between(timestamp with time zone,timestamp with time zone) from public,anon,authenticated,service_role;

grant execute on function public.el8_days_between(timestamp with time zone,timestamp with time zone) to "postgres";

grant execute on function public.el8_days_between(timestamp with time zone,timestamp with time zone) to "service_role";

revoke all on function public.el8_enforce_plan_evidence_integrity() from public,anon,authenticated,service_role;

grant execute on function public.el8_enforce_plan_evidence_integrity() to "postgres";

grant execute on function public.el8_enforce_plan_evidence_integrity() to "service_role";

revoke all on function public.el8_guard_append_only_record() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_append_only_record() to "postgres";

grant execute on function public.el8_guard_append_only_record() to "service_role";

revoke all on function public.el8_guard_entry_delete() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_entry_delete() to "postgres";

grant execute on function public.el8_guard_entry_delete() to "service_role";

revoke all on function public.el8_guard_entry_identity() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_entry_identity() to "postgres";

grant execute on function public.el8_guard_entry_identity() to "service_role";

revoke all on function public.el8_guard_entry_revisions_append_only() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_entry_revisions_append_only() to "postgres";

grant execute on function public.el8_guard_entry_revisions_append_only() to "service_role";

revoke all on function public.el8_guard_immutable_history() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_immutable_history() to "postgres";

grant execute on function public.el8_guard_immutable_history() to "service_role";

revoke all on function public.el8_guard_member_state_revision() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_member_state_revision() to "postgres";

grant execute on function public.el8_guard_member_state_revision() to "service_role";

revoke all on function public.el8_guard_module_assignment_identity() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_module_assignment_identity() to "postgres";

grant execute on function public.el8_guard_module_assignment_identity() to "service_role";

revoke all on function public.el8_guard_plan_identity() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_plan_identity() to "postgres";

grant execute on function public.el8_guard_plan_identity() to "service_role";

revoke all on function public.el8_guard_plan_review_immutable() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_plan_review_immutable() to "postgres";

grant execute on function public.el8_guard_plan_review_immutable() to "service_role";

revoke all on function public.el8_guard_plan_schema_version() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_plan_schema_version() to "postgres";

grant execute on function public.el8_guard_plan_schema_version() to "service_role";

revoke all on function public.el8_guard_profile_system_fields() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_profile_system_fields() to "postgres";

grant execute on function public.el8_guard_profile_system_fields() to "service_role";

revoke all on function public.el8_guard_reassessment_update() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_reassessment_update() to "postgres";

grant execute on function public.el8_guard_reassessment_update() to "service_role";

revoke all on function public.el8_guard_safety_event_delete() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_safety_event_delete() to "postgres";

grant execute on function public.el8_guard_safety_event_delete() to "service_role";

revoke all on function public.el8_guard_safety_event_member_fields() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_safety_event_member_fields() to "postgres";

grant execute on function public.el8_guard_safety_event_member_fields() to "service_role";

revoke all on function public.el8_guard_safety_reconciliation_delete() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_safety_reconciliation_delete() to "postgres";

grant execute on function public.el8_guard_safety_reconciliation_delete() to "service_role";

revoke all on function public.el8_guard_safety_reconciliation_identity() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_safety_reconciliation_identity() to "postgres";

grant execute on function public.el8_guard_safety_reconciliation_identity() to "service_role";

revoke all on function public.el8_guard_submission_delete() from public,anon,authenticated,service_role;

grant execute on function public.el8_guard_submission_delete() to "postgres";

grant execute on function public.el8_guard_submission_delete() to "service_role";

revoke all on function public.el8_handle_new_user() from public,anon,authenticated,service_role;

grant execute on function public.el8_handle_new_user() to "postgres";

grant execute on function public.el8_handle_new_user() to "service_role";

revoke all on function public.el8_intelligence_test_complete(jsonb) from public,anon,authenticated,service_role;

grant execute on function public.el8_intelligence_test_complete(jsonb) to "postgres";

grant execute on function public.el8_intelligence_test_complete(jsonb) to "service_role";

revoke all on function public.el8_intelligence_test_config() from public,anon,authenticated,service_role;

grant execute on function public.el8_intelligence_test_config() to "postgres";

grant execute on function public.el8_intelligence_test_config() to "service_role";

revoke all on function public.el8_intelligence_test_event(jsonb) from public,anon,authenticated,service_role;

grant execute on function public.el8_intelligence_test_event(jsonb) to "postgres";

grant execute on function public.el8_intelligence_test_event(jsonb) to "service_role";

revoke all on function public.el8_intelligence_test_note(jsonb) from public,anon,authenticated,service_role;

grant execute on function public.el8_intelligence_test_note(jsonb) to "postgres";

grant execute on function public.el8_intelligence_test_note(jsonb) to "service_role";

revoke all on function public.el8_intelligence_test_start(jsonb) from public,anon,authenticated,service_role;

grant execute on function public.el8_intelligence_test_start(jsonb) to "postgres";

grant execute on function public.el8_intelligence_test_start(jsonb) to "service_role";

revoke all on function public.el8_is_admin() from public,anon,authenticated,service_role;

grant execute on function public.el8_is_admin() to "postgres";

grant execute on function public.el8_is_admin() to "service_role";

revoke all on function public.el8_make_member_code() from public,anon,authenticated,service_role;

grant execute on function public.el8_make_member_code() to "postgres";

grant execute on function public.el8_make_member_code() to "service_role";

revoke all on function public.el8_purge_account(uuid) from public,anon,authenticated,service_role;

grant execute on function public.el8_purge_account(uuid) to "postgres";

grant execute on function public.el8_purge_account(uuid) to "service_role";

revoke all on function public.el8_request_safety_reconciliation(uuid,text,text,boolean,text) from public,anon,authenticated,service_role;

grant execute on function public.el8_request_safety_reconciliation(uuid,text,text,boolean,text) to "postgres";

grant execute on function public.el8_request_safety_reconciliation(uuid,text,text,boolean,text) to "service_role";

revoke all on function public.el8_review_is_test(el8_plan_reviews) from public,anon,authenticated,service_role;

grant execute on function public.el8_review_is_test(el8_plan_reviews) to "postgres";

grant execute on function public.el8_review_is_test(el8_plan_reviews) to "service_role";

revoke all on function public.el8_validate_plan_v3() from public,anon,authenticated,service_role;

grant execute on function public.el8_validate_plan_v3() to "postgres";

grant execute on function public.el8_validate_plan_v3() to "service_role";

revoke all on function public.rls_auto_enable() from public,anon,authenticated,service_role;

grant execute on function public.rls_auto_enable() to "postgres";

grant execute on function public.rls_auto_enable() to "service_role";

revoke all on function public.save_el8_member_state(integer,jsonb) from public,anon,authenticated,service_role;

grant execute on function public.save_el8_member_state(integer,jsonb) to "postgres";

grant execute on function public.save_el8_member_state(integer,jsonb) to "authenticated";

grant execute on function public.save_el8_member_state(integer,jsonb) to "service_role";

revoke all on sequence public."el8_intelligence_test_events_id_seq" from public,anon,authenticated,service_role;

grant select on sequence public."el8_intelligence_test_events_id_seq" to "postgres";

grant update on sequence public."el8_intelligence_test_events_id_seq" to "postgres";

grant usage on sequence public."el8_intelligence_test_events_id_seq" to "postgres";

grant select on sequence public."el8_intelligence_test_events_id_seq" to "anon";

grant update on sequence public."el8_intelligence_test_events_id_seq" to "anon";

grant usage on sequence public."el8_intelligence_test_events_id_seq" to "anon";

grant select on sequence public."el8_intelligence_test_events_id_seq" to "authenticated";

grant update on sequence public."el8_intelligence_test_events_id_seq" to "authenticated";

grant usage on sequence public."el8_intelligence_test_events_id_seq" to "authenticated";

grant select on sequence public."el8_intelligence_test_events_id_seq" to "service_role";

grant update on sequence public."el8_intelligence_test_events_id_seq" to "service_role";

grant usage on sequence public."el8_intelligence_test_events_id_seq" to "service_role";

revoke all on sequence public."el8_intelligence_test_notes_id_seq" from public,anon,authenticated,service_role;

grant select on sequence public."el8_intelligence_test_notes_id_seq" to "postgres";

grant update on sequence public."el8_intelligence_test_notes_id_seq" to "postgres";

grant usage on sequence public."el8_intelligence_test_notes_id_seq" to "postgres";

grant select on sequence public."el8_intelligence_test_notes_id_seq" to "anon";

grant update on sequence public."el8_intelligence_test_notes_id_seq" to "anon";

grant usage on sequence public."el8_intelligence_test_notes_id_seq" to "anon";

grant select on sequence public."el8_intelligence_test_notes_id_seq" to "authenticated";

grant update on sequence public."el8_intelligence_test_notes_id_seq" to "authenticated";

grant usage on sequence public."el8_intelligence_test_notes_id_seq" to "authenticated";

grant select on sequence public."el8_intelligence_test_notes_id_seq" to "service_role";

grant update on sequence public."el8_intelligence_test_notes_id_seq" to "service_role";

grant usage on sequence public."el8_intelligence_test_notes_id_seq" to "service_role";

revoke all on sequence public."el8_member_seq" from public,anon,authenticated,service_role;

grant select on sequence public."el8_member_seq" to "postgres";

grant update on sequence public."el8_member_seq" to "postgres";

grant usage on sequence public."el8_member_seq" to "postgres";

grant select on sequence public."el8_member_seq" to "anon";

grant update on sequence public."el8_member_seq" to "anon";

grant usage on sequence public."el8_member_seq" to "anon";

grant select on sequence public."el8_member_seq" to "authenticated";

grant update on sequence public."el8_member_seq" to "authenticated";

grant usage on sequence public."el8_member_seq" to "authenticated";

grant select on sequence public."el8_member_seq" to "service_role";

grant update on sequence public."el8_member_seq" to "service_role";

grant usage on sequence public."el8_member_seq" to "service_role";

revoke all on sequence public."el8_qa_events_id_seq" from public,anon,authenticated,service_role;

grant select on sequence public."el8_qa_events_id_seq" to "postgres";

grant update on sequence public."el8_qa_events_id_seq" to "postgres";

grant usage on sequence public."el8_qa_events_id_seq" to "postgres";

grant select on sequence public."el8_qa_events_id_seq" to "anon";

grant update on sequence public."el8_qa_events_id_seq" to "anon";

grant usage on sequence public."el8_qa_events_id_seq" to "anon";

grant select on sequence public."el8_qa_events_id_seq" to "authenticated";

grant update on sequence public."el8_qa_events_id_seq" to "authenticated";

grant usage on sequence public."el8_qa_events_id_seq" to "authenticated";

grant select on sequence public."el8_qa_events_id_seq" to "service_role";

grant update on sequence public."el8_qa_events_id_seq" to "service_role";

grant usage on sequence public."el8_qa_events_id_seq" to "service_role";

commit;
