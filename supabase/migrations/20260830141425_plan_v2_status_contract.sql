alter table public.el8_plans drop constraint if exists el8_plans_status_check;
alter table public.el8_plans add constraint el8_plans_status_check check (
  (schema_version is null and status = any(array['active','completed','replaced','superseded','needs_reassessment','qa_isolated','qa_result']))
  or
  (schema_version = '2.0.0' and status = any(array['proposed','active','paused','completed','replaced','superseded','needs_reassessment']))
);
