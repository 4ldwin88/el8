# Canonical Supabase Cutover Ledger

Remote project: `jprdsidxwjkgiqqakwpr`
Cutover date: 2026-08-30

This ledger records the canonical Intelligence persistence cutover already applied to the remote Supabase project. It exists to prevent repository/database drift while the applied SQL is reconciled into versioned repository migrations.

## Applied sequence

- `20260830140344 canonical_member_state_v3`
- `20260830140419 canonical_plan_v2_envelope`
- `20260830140449 harden_intelligence_test_rpcs`
- `20260830140612 member_state_v3_insert_revision`
- `20260830140621 member_state_v3_update_envelope_rls`
- `20260830140645 member_state_v3_rpc_initial_revision_fix`
- `20260830140716 plan_v2_canonical_write_gate`
- `20260830140739 plan_v2_relax_legacy_required_columns`
- `20260830140816 plan_v2_canonical_write_rls`
- `20260830140904 plan_v2_preserve_historical_updates`
- `20260830140919 plan_v2_schema_version_immutable_guard`
- `20260830140947 member_state_v3_revision_trigger_guard`
- `20260830141009 member_state_v3_insert_rpc_policy`
- `20260830141101 plan_v2_require_canonical_insert`
- `20260830141154 plan_v2_canonical_insert_defaults`
- `20260830141217 plan_v2_canonical_insert_defaults` (historical duplicate; retained in the remote ledger)
- `20260830141259 plan_v2_relax_source_for_canonical`
- `20260830141342 plan_v2_review_days_legacy_only`
- `20260830141425 plan_v2_status_contract`
- `20260830141549 member_state_v3_envelope_constraint`
- `20260830141626 plan_v2_require_canonical_focus_action_strings`

## Current contract

Member State uses schema `3.0.0`, authenticated ownership, envelope/revision integrity, exact +1 revision updates, and a `SECURITY INVOKER` save RPC unavailable to anonymous callers.

Canonical Plan uses schema `2.0.0`, non-empty string Focus IDs, non-empty object Action instances, canonical-only new inserts, Action-specific review timing, and compatibility-preserving historical rows. Legacy Plan rows remain schema-version NULL and are not fabricated into canonical data.

The Intelligence test ingestion RPCs are no longer executable by `anon` or ordinary `authenticated` clients.

## Reconciliation rule

Do not rewrite or delete the remote migration ledger to hide the duplicate `plan_v2_canonical_insert_defaults` entry. Repository history must describe what actually happened. Any future migration must roll forward from the current remote state.
