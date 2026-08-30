alter table public.el8_plans alter column source drop not null;
alter table public.el8_plans drop constraint if exists el8_plans_row_contract_check;
alter table public.el8_plans add constraint el8_plans_row_contract_check check (
  (
    schema_version is null
    and baseline_completed_at is not null
    and dimension is not null
    and source is not null
    and primary_action is not null
    and supporting_action is not null
    and measure is not null
    and review_days is not null
  )
  or schema_version = '2.0.0'
);
