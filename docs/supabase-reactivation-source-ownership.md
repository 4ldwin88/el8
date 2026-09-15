# EL8 Supabase Reactivation Source-Ownership Plan

Date: 2026-09-15
Branch: `reconcile/g02-intelligence`
Scope: repository-only preparation while EL8 Supabase remains intentionally inactive.

## Operating constraint

Jay currently has two active Supabase project slots available, and those active slots are reserved for Sontu and Ridgewood. EL8 Supabase project `jprdsidxwjkgiqqakwpr` must remain inactive until Jay explicitly reallocates an active slot.

Do not wake, activate, mutate, migrate, deploy to, branch, write data to, or otherwise change EL8 Supabase during this preparation phase. Drive remains intended authority. This repository is implementation/source evidence. Supabase is read-only runtime/persistence evidence when available.

## Candidate identity

- PR: #144, `G-02 Intelligence reconciliation validation`
- PR state: Draft/open/unmerged
- Branch: `reconcile/g02-intelligence`
- Current documentation-preparation head: update from PR metadata after each doc-only commit
- Last audited implementation head before 2026-09-15 documentation preparation: `9bbcf926ff518aff868168c4feb905f441e83452`
- Historical stale PR-body SHA: `00060fe3e86b131f69aa9cecfcc7aacb8806784c`
- Main base observed during reconciliation: `cb21bedea4ef48bd040e1a38de48e945419805f4`

Do not treat documentation-preparation heads as newly tested implementation candidates. They only record governance/source-preparation material.

## Known evidence boundary

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
- Read-only SQL snippets for later reactivation are prepared at `supabase/read-only/reactivation-catalog-checks.sql`.

## Source-ownership matrix

Disposition meanings:

- `KEEP`: retain only if live body/source, caller, authority, data touched, and tests are reconciled.
- `MODIFY`: retain but repair before promotion.
- `REPLACE`: replace with a governed repository-owned implementation.
- `RETIRE`: remove later after caller/data obligations are proven and provenance is preserved.
- `DEFER`: no responsible disposition until authority, live body, source, callers, and data effects are inspected.

Promotion gates:

- G1 Function source ownership: live body/digest has a repo-owned source path or a documented retirement path.
- G2 Drive authority mapping: each function/object maps to a specific Drive authority owner and cannot redefine policy.
- G3 Caller and data-effects proof: repository callers, scheduled/webhook usage, storage writes, and privacy/security effects are known.
- G4 Tests: repo tests or disposable-backend checks prove accepted behavior and rejected misuse.
- G5 Release manifest: exact Drive authority snapshot, repo commit, migration/catalog fingerprint, function digests, and deployment identity agree.
- G6 Human-test gate: no unresolved Critical blocker; full required non-live/replay/browser gates pass on the exact candidate; human script is approved.

| Surface | Known live / evidence status | Repo source status | Drive authority / disposition | Later action | Needed evidence | Gate before human testing |
| --- | --- | --- | --- | --- | --- | --- |
| `persistence-harness` | active v10, `verify_jwt=true` | missing | 05.04/05.05/06.06; DEFER | inspect then keep/retire | body, callers, writes, QA/prod purpose | G1-G4 |
| `interpret-submission` | active v3, `verify_jwt=true` | missing | 02.01.02/Track evidence; DEFER | inspect | body, callers, evidence writes, privacy handling | G1-G4 |
| `confirm-submission` | active v9, `verify_jwt=true` | missing | Track/submission lifecycle; DEFER | inspect | state transitions, idempotency, ownership | G1-G4 |
| `transcribe-submission` | active v4, `verify_jwt=true` | missing | 09.02/Track media; DEFER | inspect | body, external services, retention, storage | G1-G4 |
| `analyze-photo` | active v13, `verify_jwt=true` | missing | 09.02/Discovery media; DEFER | inspect | AI/media handling, writes, callers | G1-G4 |
| `cleanup-abandoned-media` | active v4, `verify_jwt=false` | missing | 09.02/05.08; DEFER | inspect | scheduler/webhook auth reason, storage effects | G1-G4 |
| `apply-plan-review` | active v85, `verify_jwt=true` | missing | 02.01.05/02.01.04; MODIFY or REPLACE likely | inspect then route through governed command path if needed | body, Plan/Member State writes, caller graph | G1-G5 |
| `cancel-submission` | active v1, `verify_jwt=true` | missing | Track/submission lifecycle; DEFER | inspect | cancellation semantics, audit trail | G1-G4 |
| `qa-reset-daily-checkin` | active v1, `verify_jwt=true` | missing | 06.06 QA only if retained; RETIRE or DEFER likely | inspect then retire if obsolete | body, test-only proof, no prod dependency | G1-G4 |
| `adaptive-qa-v08` | active v2, `verify_jwt=true` | missing | 06.04-06.08 historical QA; RETIRE or DEFER likely | inspect family | body, stored records, current test value | G1-G4 |
| `adaptive-qa-v09` | active v1, `verify_jwt=true` | missing | 06.04-06.08 historical QA; RETIRE or DEFER likely | inspect family | body, stored records, current test value | G1-G4 |
| `adaptive-qa-v10` | active v1, `verify_jwt=true` | missing | 06.04-06.08 historical QA; RETIRE or DEFER likely | inspect family | body, stored records, current test value | G1-G4 |
| `adaptive-qa-v11` | active v1, `verify_jwt=true` | missing | 06.04-06.08 historical QA; RETIRE or DEFER likely | inspect family | body, stored records, current test value | G1-G4 |
| `adaptive-qa-v12` | active v1, `verify_jwt=true` | missing | 06.04-06.08 historical QA; RETIRE or DEFER likely | inspect family | body, stored records, current test value | G1-G4 |
| `adaptive-qa-v13` | active v1, `verify_jwt=true` | missing | 06.04-06.08 historical QA; RETIRE or DEFER likely | inspect family | body, stored records, current test value | G1-G4 |
| `interpret-image` | active v2, `verify_jwt=true` | missing | Track/Discovery media; DEFER | inspect | body, writes, privacy and caller paths | G1-G4 |
| `interpret-track` | active v1, `verify_jwt=true` | missing | Track evidence; DEFER | inspect | body, evidence semantics, persistence | G1-G4 |
| `confirm-track` | active v1, `verify_jwt=true` | missing | Track/Member State; DEFER | inspect | confirmation writes, idempotency, ownership | G1-G4 |
| `submit-discovery-human-test` | active v3, `verify_jwt=false` | missing | 06.07/06.08; RETIRE or REPLACE likely | inspect then authenticate or retire | body, unauthenticated justification, human-test scope | G1-G6 |
| `qa-plan-lifecycle` | active v1, `verify_jwt=true` | missing | 06.04-06.08/Planning QA; RETIRE or DEFER likely | inspect | body, Plan lifecycle assumptions, current test value | G1-G4 |
| `intelligence-test` | active v2, `verify_jwt=false` | `supabase/functions/intelligence-test` exists | 06.04/06.07; MODIFY or REPLACE likely | compare live body/digest to repo source; justify auth | live body, digest, caller, data effects, tests | G1-G6 |
| public database tables | 43 public tables reported 2026-09-10; not refreshed 2026-09-15 | migrations/checkpoint evidence present, exact current replay unresolved | 05.04/05.05; DEFER | read-only catalog refresh | table/column/constraint/index/RLS/grant fingerprints | G2-G5 |
| migration ledger | 175 applied migrations reported 2026-09-10; not refreshed 2026-09-15 | 26 checked-in migrations reported on main; branch includes migrations and ledger | 05.07; DEFER | compare live versions and SQL to repo | version overlap, same-version SQL differences, forward-only path | G2-G5 |
| Member State persistence | zero rows reported 2026-09-10; live direct DML issue reported in dated evidence | repo remediation evidence exists but live state not refreshed | 05.04/05.05; MODIFY likely | verify current grants/RLS/RPC before action | aggregate counts only, grants, policies, RPC definition | G2-G5 |
| Plan persistence | 21 legacy Plan rows reported 2026-09-10; not refreshed | repo Plan versions and migrations drift reported | 02.01.04/05.04; MODIFY likely | verify schema/version row shapes and activation paths | aggregate row counts by schema/status, constraints, RPCs | G2-G5 |
| storage/media buckets | not fully audited in current evidence | source unknown | 09.02/05.08; DEFER | inspect read-only | bucket names, policies, function references, retention | G2-G4 |
| scheduled jobs/cron/webhooks | not fully audited in current evidence | source unknown | 05.08/06.06; DEFER | inspect read-only | schedules, targets, auth assumptions, callers | G2-G4 |

## Execution-ready reactivation checklist

Run only after Jay explicitly permits EL8 Supabase to be active/readable. Begin read-only. Stop before mutation.

### R0. Confirm active-slot authorization

Check: owner instruction explicitly says EL8 may be reactivated/readable.

Expected output: written owner instruction naming EL8 project `jprdsidxwjkgiqqakwpr` and confirming Sontu/Ridgewood slot impact is acceptable.

Pass: instruction exists and no boundary conflict remains.

Fail: no instruction or unclear slot tradeoff. Action: stop; do not activate or inspect by waking.

### R1. Project identity and metadata

Tool checks:

- Supabase `list_projects`
- Supabase `list_branches` for `jprdsidxwjkgiqqakwpr`
- Supabase `list_edge_functions` for `jprdsidxwjkgiqqakwpr`
- Supabase security and performance advisors, if available

Expected output:

- project id/ref/name/region/status/database version
- branch list
- 21 expected live function slugs unless changed by owner-authorized work
- advisor lints or explicit empty lists

Pass:

- project id matches `jprdsidxwjkgiqqakwpr`
- status is active/readable after owner authorization
- branch/function/advisor metadata is captured in a dated evidence record

Fail:

- wrong project, unreadable project, unexpected active branch, changed function count, or non-empty security/performance lints

Failure action:

- stop promotion work
- record discrepancy in Drive/repo status
- classify whether this is expected drift, missing evidence, or a new blocker

### R2. Edge Function body and source comparison

Tool checks:

- For each function from R1, retrieve live function body/read-only file contents.
- Compare live slug, version, `verify_jwt`, entrypoint, digest/body to repository source under `supabase/functions/<slug>`.
- Search repository for each slug and caller references.

Expected output:

- one row per function with live digest/body captured, repo path, caller list, data touched, and proposed disposition

Pass:

- every retained function has source in repo, authority mapping, caller map, test owner, and accepted auth posture
- every retired function has proven no current caller/data obligation and a preserved provenance note

Fail:

- missing source, digest mismatch, unexpected unauthenticated function, unclear caller, live body that writes governed data outside source-owned commands, or function purpose that conflicts with Drive authority

Failure action:

- keep PR draft/blocked
- create a source-ownership repair issue/doc entry
- do not deploy/overwrite functions until owner approves a specific function disposition

### R3. Database catalog fingerprint refresh

Prepared SQL: `supabase/read-only/reactivation-catalog-checks.sql`

Run read-only SQL sections for:

- public tables/columns
- constraints
- indexes
- triggers
- RLS policies
- grants
- public/private functions and definitions
- migration ledger versions
- aggregate data-shape counts
- storage buckets/policies if accessible
- cron/scheduled jobs if accessible

Expected output:

- deterministic section outputs suitable for hashing/diffing
- no member payload extraction
- aggregate-only row counts and schema/status distributions

Pass:

- catalog fingerprint matches approved baseline or every difference is explained by an approved forward change
- no unexpected broad grants, disabled RLS, missing owner predicates, or unknown writer functions

Fail:

- SQL access blocked, missing sections, unexpected schema/RLS/grant/function drift, migration count/version mismatch, or personal payload required to explain state

Failure action:

- stop release/human-test promotion
- record exact failing section
- decide whether to update baseline, write forward migration, retire source, or preserve historical discrepancy; no live mutation without approval

### R4. Migration lineage comparison

Checks:

- Compare live `supabase_migrations.schema_migrations` versions to repository `supabase/migrations/*.sql`.
- For same-version entries, compare SQL where live statements are available.
- Identify live-only, repo-only, and same-version-different migrations.

Expected output:

- migration reconciliation table with version, live status, repo status, semantic match, and forward-only action

Pass:

- migration history is reproducible through an approved baseline plus forward migrations, without falsifying applied history

Fail:

- live-only or same-version-different entries are unexplained; repo migrations require objects not created by replay; duplicate/historical entries are hidden rather than documented

Failure action:

- keep historical ledger intact
- prepare a forward-only reconciliation plan
- do not rewrite applied history

### R5. Data-shape and privacy-safe aggregate checks

Read-only aggregate checks:

- row counts by relevant table
- schema-version/status distributions
- orphan/reference-integrity counts
- presence/absence of legacy identifiers
- empty/non-empty status for Member State, Plan, Review, Track, media, QA tables

Expected output:

- aggregate result sets only; no member payload content

Pass:

- data shapes are compatible with the intended migration/reconciliation path or are explicitly classified as historical/QA/legacy

Fail:

- personal payloads would be needed, unknown live member data exists, legacy/current semantics are mixed, or orphan counts indicate unsafe migration assumptions

Failure action:

- stop automation/human-test promotion
- ask owner for a data-access decision if payload inspection becomes necessary
- otherwise plan aggregate-safe remediation

### R6. Repository gate readiness

Checks before any human-test claim:

- full non-live repository test suite on exact candidate
- module import graph for actual pages
- source/runtime fingerprint validation
- disposable database replay from approved baseline plus forward migrations
- browser smoke only if deployment is separately authorized
- PR #144 body and Drive status updated to exact candidate identity

Expected output:

- test run identifiers, pass/fail counts, exact commit SHA/tree, source/migration/function fingerprints, and no unresolved Critical blocker

Pass:

- all required gates pass on the same exact candidate and are recorded in Drive/repo

Fail:

- any full gate red, skipped, run on a different commit, or lacking exact provenance

Failure action:

- keep PR draft/blocked
- repair the failing boundary in repo before repeating the gate
- do not call scoped passes human-test readiness

### R7. Human-test promotion gate

Expected proof:

- Drive authority snapshot approved
- source ownership matrix complete
- live Supabase catalog/function evidence reconciled
- repository gates pass on exact candidate
- deployment path authorized and exact deployment verified if used
- human-test script approved
- privacy, safety, security, and external-testing gates satisfied for the intended test scope

Pass:

- owner explicitly promotes the exact candidate to human testing after reviewing the evidence

Fail:

- any unresolved source/runtime/authority/test/privacy/safety blocker

Failure action:

- keep status `IMPROVED BUT BLOCKED - NOT HUMAN-TEST-READY`
- record the blocker and next bounded repair slice

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
