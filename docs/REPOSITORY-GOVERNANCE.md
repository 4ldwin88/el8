# EL8 Repository Governance

Status: Authoritative repository organization, environment, promotion, and maintenance policy
Reconciled: 2026-08-24

## Purpose

This document is the repository-level authority for how EL8 code is organized, isolated, tested, promoted, archived, and cleaned. Product and wellness authority remains in the governed EL8 product documents outside this repository.

The repository must support a low-rework development pipeline: experimental or incomplete work is developed independently, validated independently, and only then promoted into the stable product. Stable product code must not be used as the laboratory for unproven changes.

`docs/repository-target-architecture.md` defines the internal domain structure inside these repository states. Where the two documents appear to conflict, this governance document controls environment/state and promotion rules; the target-architecture document controls internal domain placement.

## 1. Repository states / environments

Every substantive repository artifact must have one clear lifecycle state.

### Active / Stable

Accepted code, intelligence, assets, and supporting material that form the current maintained EL8 product/prototype. Active material is production-intent, understandable, maintained, and covered by appropriate regression validation.

Active is the stable build. It is not the place to develop uncertain behavior.

### Development

Isolated candidate work being designed, implemented, reviewed, or validated for possible promotion into Active. Development is organized by initiative/domain and must have a plausible path to acceptance or retirement.

Development is where new Discovery behavior, assessments, check-ins, interventions, experiments, or other candidate capabilities should be built without repeatedly disturbing the stable implementation.

### Test / Validation

Testing is a validation layer, not a second product implementation. `tests/` contains reusable automated, synthetic, regression, integration, and QA assets. Initiative-specific test harnesses may remain with Development while an initiative is experimental, but accepted regression coverage should move into `tests/` when the behavior is promoted.

Human-test builds may temporarily expose Development code through stable test URLs. Exposure for testing does not make that code Active.

### Archive

Superseded, rejected, obsolete, or historical work retained only when direct repository access remains useful for traceability. Archive is not part of the accepted product and must never be a dependency of Active.

### Delete Candidate

Material with no continuing operational, historical, testing, or reference value. Delete only after dependency checks and confirmation that Git history is sufficient.

### Test Freeze

A temporary protection state applied to files, routes, assets, data, workflows, or dependencies involved in a live human test. Test Freeze overrides cleanup convenience: frozen material must not be moved, renamed, refactored, archived, or behaviorally changed during the active test unless a critical defect requires intervention.

## 2. Final repository architecture

```text
/
├── README.md
├── index.html                         # deployment/member entry when required at root
├── .github/
│   └── workflows/                     # CI, validation and promotion gates
│
├── app/                               # ACTIVE member-facing product
│   ├── shell/
│   ├── home/
│   ├── plan/
│   ├── insights/
│   ├── explore/
│   ├── profile/
│   ├── track/
│   └── workflows/
│
├── intelligence/                      # ACTIVE reusable intelligence/domain layer
│   ├── evidence/
│   ├── integration/
│   ├── model/
│   ├── planning/
│   ├── policy/
│   ├── question-bank/
│   ├── selection/
│   └── simulation/
│
├── assets/                            # ACTIVE shared presentation assets
│   ├── brand/
│   ├── icons/
│   ├── images/
│   └── styles/
│
├── development/                       # ISOLATED candidate implementations
│   ├── discovery/
│   ├── assessments/
│   ├── check-ins/
│   ├── interventions/
│   ├── experiments/
│   └── qa/
│
├── tests/                             # ACCEPTANCE + REGRESSION validation
│   ├── evals/
│   ├── cases/
│   ├── regressions/
│   ├── integration/
│   └── qa/
│
├── admin/                             # restricted/internal accepted surfaces
├── supabase/                          # backend schema/functions/configuration
├── docs/                              # repository governance + technical docs
└── archive/                           # retired material only when worth retaining
    ├── prototypes/
    ├── superseded/
    ├── experiments/
    └── legacy/
```

Root must remain intentionally small. Deployment constraints and stable public URLs take precedence; root entry points may remain when GitHub Pages or tooling requires them.

## 3. Environment boundary rule

The repository has one maintained product and one isolated development environment, with testing acting as the gate between them.

The conceptual flow is:

```text
DEVELOPMENT
    ↓
Automated / synthetic validation
    ↓
Independent / third-party review when warranted
    ↓
Human testing when warranted
    ↓
Findings resolved in Development
    ↓
Regression + integration validation
    ↓
PROMOTION GATE
    ↓
ACTIVE / STABLE
    ↓
Ongoing regression protection
```

Failed or rejected work returns to Development or is retired. It is not patched directly into Active simply to keep an experiment moving.

## 4. Active architecture

`app/` owns accepted member-facing presentation and interaction. Its canonical MVP destinations are Home, Plan, Insights and Explore, with Profile through the avatar and Track as a global action. Secondary flows belong under `app/workflows/` rather than becoming primary navigation destinations.

`intelligence/` owns accepted reusable reasoning/domain logic. UI code must not duplicate intelligence rules merely for convenience. Evidence, planning, policy, selection, question-bank and related contracts remain independently testable.

`assets/` contains accepted shared presentation assets only.

`tests/` protects accepted behavior. When candidate functionality is promoted, the regression cases required to prevent recurrence of known failures are promoted with it.

## 5. Development architecture

Development is organized by initiative/domain rather than by random files or branches.

- `development/discovery/` — candidate Discovery engines, policies, questions, schemas, telemetry and test UI before acceptance.
- `development/assessments/` — assessment work not yet accepted into Active workflows/intelligence.
- `development/check-ins/` — candidate check-in behavior.
- `development/interventions/` — candidate intervention/adaptation behavior.
- `development/experiments/` — bounded experiments that do not yet justify a product domain.
- `development/qa/` — temporary initiative-specific QA harnesses and review surfaces.

A development initiative may contain its own internal domain structure. Promotion moves only accepted product behavior and required contracts/tests into Active; it does not copy the entire experimental workspace.

Branches provide implementation isolation and review, but branches are not permanent environments. The repository tree expresses lifecycle state after work lands; branches express temporary change sets before merge.

## 6. Discovery rule

Discovery is currently an independently validated initiative. While its present human-test build is active, its distributed files, routes, dependencies, and workflows remain under TEST FREEZE even if their current physical paths do not yet match `development/discovery/`.

Do not reorganize Discovery merely for cosmetic cleanliness during the freeze.

After the testing round closes:

1. Resolve findings in the isolated Discovery implementation.
2. Run synthetic/regression validation.
3. Complete required independent/human review gates.
4. Identify which Discovery behavior is accepted product behavior.
5. Promote accepted reusable intelligence into the appropriate `intelligence/` domains and accepted member-facing flows into `app/`.
6. Promote required regression coverage into `tests/`.
7. Archive or delete experimental scaffolding that no longer has value.

There should not ultimately be two competing accepted Discovery engines—one in Development and one in Active.

## 7. Promotion contract

A candidate is promotable only when:

1. Its intended behavior and acceptance criteria are defined.
2. Relevant automated/synthetic tests pass.
3. Known high-severity findings are resolved or explicitly accepted.
4. Independent review has occurred when the initiative warrants it.
5. Human validation has occurred when member behavior/usability is material to acceptance.
6. Regression cases exist for important failures discovered during development.
7. Dependencies and persistence contracts are understood.
8. Active integration does not require Active to depend on Development.
9. Public/deployment routes affected by promotion are verified.
10. Temporary experimental scaffolding is excluded from the promoted implementation.

Promotion should occur as a focused change. Do not combine a promotion with unrelated repository cleanup.

## 8. Human-test protection

During TEST FREEZE:

- Do not change public test URLs unnecessarily.
- Do not move or rename tested files or dependencies.
- Do not refactor frozen code for repository cleanliness.
- Do not silently replace the tested implementation mid-round.
- Critical fixes must be documented so results can distinguish pre-fix and post-fix participants.

A frozen test build may depend on temporary paths. That technical debt is deliberately tolerated until the test closes because preserving test validity is more important than cosmetic structure.

## 9. Testing ownership

`tests/` is primarily for accepted or promotion-gate validation, not a dumping ground for every experimental script.

- `tests/evals/` — evaluation runners and acceptance logic.
- `tests/cases/` — canonical fixtures/cases.
- `tests/regressions/` — failures that must not recur.
- `tests/integration/` — cross-domain, persistence and contract validation.
- `tests/qa/` — stable readiness/UI/system QA.

Temporary exploratory harnesses stay with their Development initiative until they become useful long-term validation assets.

GitHub Actions remain in `.github/workflows/`. Path-dependent workflows must be changed atomically with the paths they validate.

## 10. Active dependency rules

Active may depend on Active, accepted shared assets, backend infrastructure, and accepted contracts.

Active must not depend on Archive.

Active must not normally depend on Development. A temporary migration exception must be explicitly documented and removed as part of promotion completion.

Development may consume accepted Active contracts when needed to prove compatibility, but experiments should avoid mutating Active behavior.

## 11. File movement rules

Before moving or renaming a live file:

1. Identify imports, relative links, assets, routes, workflow references, tests and deployment assumptions.
2. Determine lifecycle state and whether TEST FREEZE applies.
3. Decide the destination according to environment first, then domain responsibility.
4. Update references atomically with the move.
5. Run relevant validation.
6. Verify deployed/public behavior where applicable.

Do not reorganize a working implementation solely because its current folder name is aesthetically imperfect.

## 12. Archive and deletion rules

Prefer Git history over retaining meaningless duplicates.

Use Archive only when a historical artifact needs to remain directly runnable/viewable or provides continuing traceability value. Archived code must not be deployed or referenced by Active.

Delete material only after dependency checks establish that it has no operational/testing value and Git history adequately preserves provenance.

## 13. Documentation authority

This file is authoritative for repository lifecycle states, environment boundaries, promotion, test protection, cleanup and maintenance.

`docs/repository-target-architecture.md` is authoritative for the detailed internal domain layout of Active and Development implementations, but it must conform to the environment boundaries defined here.

`docs/repository-classification.md` records current-state classification and migration decisions.

README should remain concise and point to these documents rather than duplicating them.

## 14. Cleanup migration sequence

Repository cleanup follows this order:

1. Inventory current repository state.
2. Classify each substantive artifact as Active, Development, Archive, Delete Candidate, or TEST FREEZE.
3. Map dependencies and deployment/public-route risk.
4. Map each retained artifact to its final environment and domain destination.
5. Protect all frozen test material.
6. Move low-risk Development/Archive/support material first.
7. Consolidate the canonical Active app and intelligence layers in controlled batches.
8. Consolidate accepted regression/validation assets under `tests/`.
9. Migrate frozen initiatives only after their test freezes close.
10. Retire superseded root pages/helpers only after canonical behavior is validated.
11. Verify deployment and CI after each structural batch.
12. Review stale branches only after the file tree is stable.

## 15. Decision rule for every current file

Before any move, assign one action:

1. KEEP — already appropriate and stable.
2. MIGRATE — retained behavior belongs at another canonical path.
3. MERGE — useful behavior should be absorbed into another canonical module.
4. HOLD — active dependency or TEST FREEZE makes movement premature.
5. RETIRE — superseded and dependency-free after accepted behavior/test coverage is preserved.

Then assign one lifecycle destination: Active, Development, Tests/Validation, Archive, or Delete.

No mass move, rename, or deletion occurs without this classification and dependency check.