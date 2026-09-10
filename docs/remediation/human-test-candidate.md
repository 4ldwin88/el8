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
