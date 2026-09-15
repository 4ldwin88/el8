-- EL8 Supabase reactivation read-only catalog checks
-- Date prepared: 2026-09-15
-- Project intended for later use: jprdsidxwjkgiqqakwpr
--
-- Use only after Jay explicitly authorizes EL8 Supabase to be active/readable.
-- These queries are read-only. Do not run migrations, DDL, DML, function deploys,
-- branch operations, or payload extraction as part of this script.
--
-- Recommended execution: run each numbered section separately, capture the output
-- as dated evidence, and compare to repository baselines / Drive authority.
-- Do not extract personal member payloads. Prefer aggregate counts and schema/status
-- distributions.

-- R3.1 public table inventory
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relkind as relkind,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r','p','v','m','f')
order by n.nspname, c.relname;

-- R3.2 public column inventory
select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
order by table_schema, table_name, ordinal_position;

-- R3.3 constraints
select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid, true) as constraint_def
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
order by schema_name, table_name, constraint_name;

-- R3.4 indexes
select
  schemaname as schema_name,
  tablename as table_name,
  indexname as index_name,
  indexdef
from pg_indexes
where schemaname = 'public'
order by schema_name, table_name, index_name;

-- R3.5 triggers
select
  event_object_schema as schema_name,
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
order by schema_name, table_name, trigger_name, event_manipulation;

-- R3.6 RLS policies
select
  schemaname as schema_name,
  tablename as table_name,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
order by schema_name, table_name, policyname;

-- R3.7 role grants on public tables and views
select
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated','service_role','postgres')
order by table_schema, table_name, grantee, privilege_type;

-- R3.8 public and private function inventory with definitions
-- Use this for source comparison only. Do not execute the returned functions.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_args,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  pg_get_functiondef(p.oid) as function_def
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public','private','storage','auth')
  and (
    p.proname ilike '%el8%'
    or p.proname ilike '%member%'
    or p.proname ilike '%plan%'
    or p.proname ilike '%review%'
    or p.proname ilike '%track%'
    or p.proname ilike '%discovery%'
    or p.proname ilike '%qa%'
  )
order by schema_name, function_name, identity_args;

-- R3.9 migration ledger versions
select
  version,
  name,
  statements is not null as has_statements,
  case when statements is null then null else cardinality(statements) end as statement_count
from supabase_migrations.schema_migrations
order by version;

-- R3.10 migration version summary for quick comparison
select
  count(*) as migration_count,
  min(version) as first_version,
  max(version) as last_version
from supabase_migrations.schema_migrations;

-- R5.1 aggregate table counts only
-- Review the generated statements before execution. They return counts, not payloads.
select format(
  'select %L as table_name, count(*)::bigint as row_count from %I.%I;',
  c.relname,
  n.nspname,
  c.relname
) as count_sql
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r','p')
order by c.relname;

-- R5.2 known EL8 schema/status distributions, aggregate only
-- These are safe to run when the named tables exist. If a table does not exist,
-- record that as evidence instead of creating it.
select 'el8_member_state' as table_name, count(*)::bigint as row_count
from public.el8_member_state;

select
  'el8_member_state' as table_name,
  state ->> 'schema_version' as schema_version,
  count(*)::bigint as row_count
from public.el8_member_state
group by state ->> 'schema_version'
order by schema_version nulls first;

select 'el8_plans' as table_name, count(*)::bigint as row_count
from public.el8_plans;

select
  'el8_plans' as table_name,
  schema_version,
  status,
  is_test,
  count(*)::bigint as row_count
from public.el8_plans
group by schema_version, status, is_test
order by schema_version nulls first, status nulls first, is_test nulls first;

-- R5.3 orphan/reference checks for known high-risk EL8 relationships
-- If these tables/columns differ, record the mismatch and update the checklist.
select
  'el8_plans_without_member_state' as check_name,
  count(*)::bigint as row_count
from public.el8_plans p
left join public.el8_member_state ms on ms.member_id = p.member_id
where ms.member_id is null;

-- R5.4 storage bucket metadata, if storage schema is available
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
order by id;

-- R5.5 cron/scheduled jobs, if pg_cron is installed and readable
select
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
from cron.job
order by jobid;

-- R3/R5 pass criteria summary:
-- PASS only if outputs are captured, diffed, and every difference is either
-- expected from approved history or assigned a forward-only remediation path.
-- FAIL if any section cannot be read, returns unexpected grants/RLS/function drift,
-- exposes unknown writers, requires personal payload inspection, or conflicts with
-- Drive authority. On failure, keep PR #144 draft/blocked and stop before mutation.
