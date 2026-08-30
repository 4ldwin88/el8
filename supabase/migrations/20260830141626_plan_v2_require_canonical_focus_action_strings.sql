alter table public.el8_plans drop constraint if exists el8_plans_canonical_v2_required_fields_check;
alter table public.el8_plans add constraint el8_plans_canonical_v2_required_fields_check check (
  schema_version is null
  or (
    schema_version = '2.0.0'
    and focus_ids is not null
    and jsonb_typeof(focus_ids) = 'array'
    and jsonb_array_length(focus_ids) > 0
    and not jsonb_path_exists(focus_ids, '$[*] ? (@.type() != "string")')
    and canonical_actions is not null
    and jsonb_typeof(canonical_actions) = 'array'
    and jsonb_array_length(canonical_actions) > 0
    and not jsonb_path_exists(canonical_actions, '$[*] ? (@.type() != "object")')
  )
);
