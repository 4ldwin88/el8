-- Reconciled remote migration: canonical_plan_v2_envelope
-- Applied additively to preserve historical pre-v2 Plan rows.

begin;

alter table public.el8_plans
  add column if not exists schema_version text,
  add column if not exists focus_ids jsonb,
  add column if not exists canonical_actions jsonb;

alter table public.el8_plans drop constraint if exists el8_plans_schema_version_check;
alter table public.el8_plans add constraint el8_plans_schema_version_check
  check (schema_version is null or schema_version = '2.0.0');

alter table public.el8_plans drop constraint if exists el8_plans_focus_ids_shape_check;
alter table public.el8_plans add constraint el8_plans_focus_ids_shape_check
  check (focus_ids is null or jsonb_typeof(focus_ids) = 'array');

alter table public.el8_plans drop constraint if exists el8_plans_canonical_actions_shape_check;
alter table public.el8_plans add constraint el8_plans_canonical_actions_shape_check
  check (canonical_actions is null or jsonb_typeof(canonical_actions) = 'array');

comment on column public.el8_plans.schema_version is
  'Canonical Plan contract version. NULL identifies historical pre-v2 rows.';
comment on column public.el8_plans.focus_ids is
  'Canonical member-confirmed Focus construct IDs for Plan v2.';
comment on column public.el8_plans.canonical_actions is
  'Canonical Action instances for Plan v2. Review timing belongs to each Action.';

commit;
