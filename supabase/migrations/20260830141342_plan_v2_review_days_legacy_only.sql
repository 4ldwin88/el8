alter table public.el8_plans drop constraint if exists el8_plans_review_days_check;
alter table public.el8_plans add constraint el8_plans_review_days_check check (
  schema_version = '2.0.0'
  or (review_days >= 1 and review_days <= 30)
);
