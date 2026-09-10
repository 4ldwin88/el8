# Controlled human-test remediation

## Integration decision — 2026-09-10, before implementation

Fresh-read authorities: 00.00 governance; 00.01 index / 00.02 execution dashboard;
02.01.01 Intelligence Architecture (2026-09-03); 02.03 OS Architecture
(2026-09-07); 05.03 Production Architecture; 05.04 Data Integrity; 05.05 Security;
05.07 Environments & Release Management (technical documents 2026-08-31).
Drive remains semantic authority. This file records implementation evidence only.

Verified remote refs before edits:
- main: cb21bedea4ef48bd040e1a38de48e945419805f4
- reconcile/g02-intelligence: 9bbcf926ff518aff868168c4feb905f441e83452
- benchmark-f-el8-remediation: 1ca7a5f03906f90eb99d5f2ee9bb0891d5485a87
- F parent: c0c22eabb6cb465ff5598ee9d4f0393ed17f1fea; its parent is reconciliation.
- G: 55d4d165f2635412dc82ee25efe6987fc4af63de
- C mechanism, actual branch benchmark/member-state-boundary-20260910:
  aedaa2a42bbd104dae46f55c9ca1d0a36ba176c5
- D mechanism, actual branch benchmark/release-gate-boundary-sol-20260910:
  d513fe18154c6d5e3f5f208c74f48d2e017f0269

The requested C/D branch spellings do not exist. Their inspected actual branches
start directly at reconciliation and contain the described mechanisms. GitHub
compare verifies reconciliation is 628 commits ahead of main and zero behind.
No main change needs integration. A single linear branch,
remediation/human-test-candidate, starts at verified F. No benchmark merge.

Read-only live EL8 catalog inspection confirms PostgreSQL 17.6, the original
invoker Member State RPC, ordinary INSERT/UPDATE policies/grants, and both v2/v3
Plan activation functions. F remains unapplied. Catalog definitions, constraints,
policies, grants and migration names were fetched without member data.

## Slice 1 decision: one enforceable repository candidate gate

Authority: 05.07 reproducible release/validation; 05.04 integrity; 02.03 real
runtime/persistence validation. Invariant: every repository non-live test and
browser entry module must be checked by one offline command; release workflows
consume that command; failed checks cannot produce a deployable artifact; the
artifact records the exact checked source. Live-mutating tests stay separate.

Affected owners: package.json; scripts/browser-import-smoke.mjs; QA, G-02,
Member State database and Pages workflows; build provenance script. Observed
defects: copied suite lists; omitted tests; path-only import checking; Pages
deploys without tests and uploads the whole repository. D's central-gate idea
is useful but its script-name reachability does not discover new test files,
and workflow text ordering alone cannot establish job dependencies. Reimplement
those mechanisms with file discovery and structural workflow checks.

Acceptance before repair: run all discovered non-live test files; add adversarial
gate fixtures for new tests, live-test exclusion, missing exports, bypassed
validation and changed source identity. Preserve substantive test assertions.
Known removed domain-version imports in QA must be migrated to the current
versionless contract, never restored by aliases. Other newly exposed failures
are classified before changing code or expectations.

This slice does not claim browser journey, database replay, concurrency or
human readiness. Storage, trusted writes, backend reproduction and semantic
handoffs remain separately gated slices. No live mutation or deployment.

### Slice 1 verification and self-review

Gate mechanism acceptance: 5/5 tests passed, including newly discovered tests,
missing-export rejection, optional/bypassed workflow rejection and stale/dirty
candidate refusal. The initial acceptance run failed before implementation.
All 82 original offline test files were run: 297 pass / 6 fail. Two failing
Profile files imported a removed domain-version constant; independently verified
D's current-contract correction (versionless Member State, confirmation timestamp
preserved) was incorporated. Those 15 Profile tests now pass.

The candidate-wide gate correctly remains RED: four other baseline failures
(legacy question aliases, two legacy Action ID fixtures, and missing mixed-Focus
disposition UI) plus broken module graphs on nine HTML pages. These are retained
as blockers, not excluded tests. Gate self-tests passing is evidence only for the
gate mechanism, never for the candidate journey. No receipt/artifact is produced
on failure. The backend/lifecycle slices must resolve these before promotion.

Self-review improvements: include new/untracked files in source fingerprint;
verify the built public artifact's import graph as well as source; preserve the
taxonomy directory required by browser imports; remove the old independent build
metadata writer; reject optional reusable validation jobs; deny accidental remote
connections in offline tests. Non-live files are discovered automatically. The
old extra Member State CI owner is retired in favor of the shared gate. Pages
promotion is explicit/manual, requires the same workflow validation receipt and
does not upload SQL, tests, documentation, dependency packages or workflow code.
No workflow or production deployment was executed.

## Slice 2 decision: lossless ordinary Member State storage

Authority: 02.03 September 7 persistence rule, 02.01.01 evidence/decision ownership,
05.04 no guessed historical migration. Invariant: decode(encode(current)) equals
current, including order, missing/unknown values, uncertainty, history and member
decisions. Neither loading nor saving may create semantic defaults or infer Focus
activation. Unsupported representations stop explicitly before domain consumption.

Affected owners: intelligence/state/supabase-persistence.js and its session caller.
C's strict JSON boundary and tests are independently reviewed and useful. Current
read-time normalizers reconstruct Focus ordering and add defaults; an accepted
decision can become an active Focus solely by loading. This violates ownership.
The contract-derived original object is the equality oracle, not another mapper.

C's wholesale removal of historical reader sources is not adopted without proving
history obligations. Disconnect ordinary session reads first. Retained historical
code must be mechanically excluded from application imports and identified as
unapproved migration evidence, not a callable current migration service. No
historical rows will be interpreted or rewritten. Creation/revision semantics
remain a separate SQL-backed slice. The release-wide blockers above remain open;
only this storage slice's independent invariant gate permits its commit.

Pre-edit history check: read-only grouped live query returns zero Member State
rows (2026-09-10). Repository references prove the session opener is the only
ordinary caller of the historical loader; the normalizers have no other current
consumer. Therefore retire those implementations/tests after migrating the caller;
their source remains in Git history. This supersedes the provisional retention
decision above using fresh evidence, not an assumption that history is disposable.
This does not claim other environments/backups have no history: unsupported imports
must fail and any future data migration requires its own reviewed provenance.

Slice 2 result: new fixtures failed 7/8 against F before repair. Final storage,
session and actual SQL-boundary suite: 48/48 pass. State suite: 35/35 pass.
SQL JSONB round-trip includes deliberate Focus ordering, an accepted dormant
decision, missing optional context and nested unknown evidence; it preserves the
original object exactly. No defaults, read migration, aliases or second mapper.
Retired four normalizer/migration source/test files and migrated all callers.
Self-review: no ordinary migration imports remain; no test assertion was weakened
to preserve old semantic defaults. First-save mismatch remains explicitly open.
