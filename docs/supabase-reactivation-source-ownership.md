# EL8 Supabase Reactivation Source-Ownership Plan

Date: 2026-09-15
Branch: `reconcile/g02-intelligence`
Scope: preparation only while EL8 Supabase remains intentionally inactive.

## Current operating constraint

Jay currently has two active Supabase project slots available, and those active slots are reserved for Sontu and Ridgewood. EL8 Supabase project `jprdsidxwjkgiqqakwpr` must remain inactive until Jay explicitly reallocates an active slot. Do not attempt to wake, activate, mutate, migrate, deploy to, branch, or otherwise change EL8 Supabase during this preparation phase.

Drive remains intended authority. This repository is implementation/source evidence. Supabase is read-only runtime/persistence evidence when available.

## Current candidate identity

- PR: #144, `G-02 Intelligence reconciliation validation`
- PR state: Draft/open/unmerged
- Branch: `reconcile/g02-intelligence`
- Current documentation-preparation head after this file is created: update from PR metadata after commit
- Last audited implementation head before 2026-09-15 documentation preparation: `9bbcf926ff518aff868168c4feb905f441e83452`
- Historical stale PR-body SHA: `00060fe3e86b131f69aa9cecfcc7aacb8806784c`
- Main base observed during reconciliation: `cb21bedea4ef48bd040e1a38de48e945419805f4`

Do not treat the documentation-preparation head as a newly tested implementation candidate. It only records governance/source-preparation material.

## Known Supabase read-only evidence

Fresh 2026-09-15 metadata checks found:

- EL8 Supabase project `jprdsidxwjkgiqqakwpr` status: `INACTIVE`
- Database version reported: PostgreSQL `17.6.1.155`
- Development branches listed: none
- Edge Functions listed: 21 active functions
- Security/performance advisors: no lints returned
- Database/table/RLS/policy/function-definition/migration SQL refresh: blocked by `INVALID_ARGUMENT`

Older 2026-09-10 forensic evidence reported 43 public tables, 175 applied migrations, 21 active Edge Functions, only one checked-in Edge Function, legacy Plan rows, zero canonical Member State rows, and broader implementation/runtime drift. Treat those as dated evidence until live catalog access is refreshed.

## Repository source status

- `main` has no `supabase/functions` directory.
- `reconcile/g02-intelligence` has only `supabase/functions/intelligence-test`.
- Therefore, 20 of the 21 known live Edge Functions are not source-owned in this branch.
- The branch includes `supabase/CANONICAL-CUTOVER-LEDGER.md`, but that ledger is not proof that live database schema, RLS, migration ledger, or Edge Function bodies match the repository.

## Edge Function source-ownership inventory

Disposition meanings:

- `KEEP`: likely retained if source, caller, authority, and tests are reconciled.
- `MODIFY`: likely retained but must be changed before promotion.
- `REPLACE`: likely replaced by a governed repository-owned implementation.
- `RETIRE`: likely removed later after caller/data obligations are proven.
- `DEFER`: no responsible disposition until authority, source, callers, and current body are inspected.

| Live function | Live metadata from prior read-only audit | Repo source status | Current disposition | Evidence needed after reactivation |
| --- | --- | --- | --- | --- |
| `persistence-harness` | active, v10, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; identify whether QA-only or current runtime; map to 05.04/05.05/06.06; prove no member-data mutation risk; decide keep/retire. |
| `interpret-submission` | active, v3, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; map to Track/Discovery authority; identify callers and persistence effects; add source or retire path. |
| `confirm-submission` | active, v9, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; inspect state transitions and writes; verify idempotency, ownership, and Drive authority. |
| `transcribe-submission` | active, v4, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; confirm input/storage boundaries and privacy authority; classify as keep/replace/retire. |
| `analyze-photo` | active, v13, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; inspect media handling, AI use, privacy, and caller paths; require source-owned tests before use. |
| `cleanup-abandoned-media` | active, v4, `verify_jwt=false` | missing from branch | DEFER | Retrieve body; determine whether unauthenticated access is justified by scheduler/webhook design; inspect storage effects before any retention. |
| `apply-plan-review` | active, v85, `verify_jwt=true` | missing from branch | MODIFY or REPLACE likely | Retrieve current body; compare with Review/Adaptation and Planning authority; identify direct Plan/Member State writes; replace with governed command path if it owns behavior outside repo. |
| `cancel-submission` | active, v1, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; map to Track/submission lifecycle; prove cancellation ownership and audit behavior. |
| `qa-reset-daily-checkin` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Determine whether this is QA-only; prove no production/member dependency; retire if obsolete test fixture. |
| `adaptive-qa-v08` | active, v2, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Inspect body and data usage; classify historical QA versus current validated gate; avoid preserving obsolete candidate behavior. |
| `adaptive-qa-v09` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Same as adaptive QA family; check for callers and stored records before retirement. |
| `adaptive-qa-v10` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Same as adaptive QA family; map to current QA authority or retire. |
| `adaptive-qa-v11` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Same as adaptive QA family; prove no current runtime dependency. |
| `adaptive-qa-v12` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Same as adaptive QA family; preserve provenance if retired. |
| `adaptive-qa-v13` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Same as adaptive QA family; verify no hidden deployment/test gate dependency. |
| `interpret-image` | active, v2, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; map to Track/Discovery/media authority; inspect writes and privacy handling. |
| `interpret-track` | active, v1, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; map to Track evidence semantics; verify current caller and persistence contract. |
| `confirm-track` | active, v1, `verify_jwt=true` | missing from branch | DEFER | Retrieve body; inspect confirmation writes and idempotency; reconcile with Member State/Track authority. |
| `submit-discovery-human-test` | active, v3, `verify_jwt=false` | missing from branch | RETIRE or REPLACE likely | Retrieve body; justify unauthenticated access or replace with authenticated/test-only path; map to human-test gate authority. |
| `qa-plan-lifecycle` | active, v1, `verify_jwt=true` | missing from branch | RETIRE or DEFER likely | Inspect body; map to current Plan lifecycle tests; retire if obsolete QA server behavior. |
| `intelligence-test` | active, v2, `verify_jwt=false` | source exists at `supabase/functions/intelligence-test` | MODIFY or REPLACE likely | Compare checked-in source to live body/digest; justify unauthenticated access; verify it does not bypass current Drive authority or protected data. |

## Reactivation checklist

Run these checks only after Jay explicitly allows EL8 Supabase to be active/readable. Start read-only.

1. Confirm project identity and status for `jprdsidxwjkgiqqakwpr`; record project status, DB version, region, branch list, and current Edge Function list with version, `verify_jwt`, entrypoint, and digest.
2. Retrieve every Edge Function body and compare each live digest/body to repository source. Do not deploy or overwrite any function during comparison.
3. For each function, identify callers from repository search, workflow references, app pages, QA harnesses, scheduled/webhook usage, and Supabase logs if available read-only.
4. Build a function disposition table: `KEEP`, `MODIFY`, `REPLACE`, `RETIRE`, or `DEFER`, with Drive authority owner, repo source path, test owner, data touched, and promotion gate.
5. Refresh database catalog read-only: public tables, columns, constraints, indexes, triggers, RLS policies, grants, functions/RPC definitions, migration ledger versions, storage buckets/policies if applicable, cron/scheduled jobs if applicable.
6. Compare live catalog fingerprints to repository migrations and recorded baselines. Preserve historical duplicate/legacy migration evidence; do not rewrite history to make counts look clean.
7. Query only aggregate/non-personal data shapes needed for reconciliation: row counts by table, schema version distribution, legacy/current identifiers, orphan/reference integrity counts, and empty/non-empty status. Do not extract member payloads unless separately authorized and necessary.
8. Reconcile repository migration lineage: identify checked-in migrations absent live, live migrations absent repo, same-version SQL differences, and required forward-only migration path. No migration execution without separate approval.
9. Verify repository gates against the exact candidate identity before any human-test claim: full non-live test suite, module import graph, source/runtime fingerprint, database replay in disposable environment, and browser smoke on the exact candidate if deploy is later authorized.
10. Confirm release posture in Drive and PR #144: blocked/frozen until function source ownership, database contract verification, complete gate evidence, and human-test script approval are all resolved.

## Branch and PR cleanup recommendations

Do not delete branches, close PRs, or rewrite history during this preparation pass.

Recommended later cleanup order:

1. Keep PR #144 as the visible active reconciliation container until a clearer candidate supersedes it.
2. Mark branches/PRs as historical only after their unique evidence has been captured in Drive or repository docs.
3. Do not close a PR merely because it is old if it is the only visible provenance for a correction, rejected path, or test failure.
4. Prefer one future owner-approved candidate branch for implementation after source ownership is reconciled.
5. Main should not be updated until Drive authority, repo candidate, test gate, Supabase catalog/functions, and deployment identity describe the same system.

## Current blocked state

EL8 remains improved but blocked and not human-test-ready. The blocker is not just project inactivity; it is the unresolved mismatch between Drive authority, repository source ownership, live Supabase functions, live database catalog evidence, test coverage, and promotion gates.

The next safe work while Supabase is inactive is repository-only cleanup that removes stale governance claims and improves exact-source/test ownership. The next backend-facing work must wait until EL8 Supabase is intentionally reactivated or a current exported catalog/function snapshot is provided.
