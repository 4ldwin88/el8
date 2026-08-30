alter table public.el8_plans alter column actions drop not null;
alter table public.el8_plans alter column actions drop default;
alter table public.el8_plans alter column generated_from drop not null;
alter table public.el8_plans alter column generated_from drop default;
alter table public.el8_plans alter column focus_dimensions drop not null;
alter table public.el8_plans alter column focus_dimensions drop default;
alter table public.el8_plans alter column interventions drop not null;
alter table public.el8_plans alter column interventions drop default;
alter table public.el8_plans alter column capacity drop not null;
alter table public.el8_plans alter column capacity drop default;

alter table public.el8_plans drop constraint if exists el8_plans_legacy_payload_check;
alter table public.el8_plans add constraint el8_plans_legacy_payload_check check (
  schema_version = '2.0.0'
  or (
    actions is not null
    and generated_from is not null
    and focus_dimensions is not null
    and interventions is not null
    and capacity is not null
  )
);
