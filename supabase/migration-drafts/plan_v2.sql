-- EL8 canonical Plan v2 migration draft.
-- STAGED ONLY. Do not apply directly to the remote project.
-- Generate/reconcile a real versioned migration through the Supabase CLI after remote history is synchronized.

begin;

-- Add canonical envelope fields without destroying historical Plan rows.
alter table public.el8_plans
  add column if not exists schema_version text,
  add column if not exists focus_ids jsonb,
  add column if not exists canonical_actions jsonb;

-- Existing rows are legacy evidence/history. Do not fabricate canonical Focus/Action IDs for them.
-- New canonical rows must declare Plan v2 and carry array-shaped Focus/Action payloads.
alter table public.el8_plans
  drop constraint if exists el8_plans_schema_version_check,
  add constraint el8_plans_schema_version_check
    check (schema_version is null or schema_version = '2.0.0');

alter table public.el8_plans
  drop constraint if exists el8_plans_focus_ids_shape_check,
  add constraint el8_plans_focus_ids_shape_check
    check (focus_ids is null or jsonb_typeof(focus_ids) = 'array');

alter table public.el8_plans
  drop constraint if exists el8_plans_canonical_actions_shape_check,
  add constraint el8_plans_canonical_actions_shape_check
    check (canonical_actions is null or jsonb_typeof(canonical_actions) = 'array');

alter table public.el8_plans
  drop constraint if exists el8_plans_canonical_v2_required_fields_check,
  add constraint el8_plans_canonical_v2_required_fields_check
    check (
      schema_version is null
      or (
        schema_version = '2.0.0'
        and focus_ids is not null
        and canonical_actions is not null
      )
    );

comment on column public.el8_plans.schema_version is
  'Canonical Plan contract version. NULL identifies historical pre-v2 rows.';
comment on column public.el8_plans.focus_ids is
  'Canonical member-confirmed Focus construct IDs for Plan v2.';
comment on column public.el8_plans.canonical_actions is
  'Canonical Action instances for Plan v2. Review timing belongs to each Action, not a universal plan review_days default.';

-- Legacy columns intentionally remain during compatibility verification:
-- primary_action, supporting_action, supporting_dimension, focus_dimensions,
-- interventions, actions, review_days. New canonical code must not depend on them.
-- A later destructive migration may remove them only after caller tracing and historical export/retention decisions are complete.

commit;
