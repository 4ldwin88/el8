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
Accepted code, intelligence, assets, and supporting material that form the current maintained EL8 product/prototype. Active is production-intent and regression-protected. It is not the place to develop uncertain behavior.

### Development
Isolated candidate work being designed, implemented, reviewed, or validated for possible promotion into Active. Development is an initiative workspace, not a permanent parallel copy of the product.

### Test / Validation
Testing is the gate between Development and Active, not a third product implementation. `tests/` contains durable automated, synthetic, regression, integration, and QA assets. Initiative-specific exploratory harnesses remain inside their Development initiative until worth promoting to permanent tests.

### Archive
Superseded, rejected, obsolete, or historical work retained only when direct repository access remains useful. Active must never depend on Archive.

### Delete Candidate
Material with no continuing operational, historical, testing, or reference value. Delete only after dependency checks and confirmation that Git history is sufficient.

### Test Freeze
Temporary protection for artifacts involved in an active human test. Frozen material is not moved, renamed, refactored, archived, or behaviorally changed except for documented critical fixes.

## 2. Runtime environment isolation

Stable and Development must be usable simultaneously in the same browser with different signed-in accounts. This is a permanent EL8 development requirement, not a temporary convenience.

Therefore Stable and Development must have **distinct browser authentication/storage origins** in deployed use. A path-only split such as `/stable/` and `/development/` on the same hostname is insufficient because browser localStorage, cookies and many auth persistence mechanisms are origin-scoped and would cause the two builds to compete for the same session.

Preferred deployment model:

```text
Stable repository state  → stable deployment origin
Development workspace    → development deployment origin
```

For example, production may later use separate hosts/subdomains such as `app.<domain>` and `dev.<domain>`. During prototype development, separate GitHub Pages-capable origins or another deployment arrangement that produces distinct origins is acceptable. Exact hostnames are deployment configuration, not repository architecture.

Rules:
1. Stable and Development may use the same Supabase project during early prototyping only if authentication persistence remains isolated by browser origin and development data is unmistakably identified/test-scoped.
2. Before production-sensitive development, prefer separate backend environments/configuration for Stable and Development so experimental migrations, functions and test data cannot damage stable data.
3. Environment-specific URLs, Supabase keys/IDs, feature flags and similar configuration must be supplied through environment configuration rather than duplicated business logic.
4. A member must be able to remain signed into Stable Account A while simultaneously signed into Development Account B in ordinary browser tabs/windows without session replacement.
5. Tests must include a dual-session isolation check before the environment architecture is considered complete.

## 3. Final repository architecture

```text
/
├── README.md
├── index.html                         # stable deployment/member entry when required
├── .github/
│   └── workflows/                     # CI, validation and promotion gates
├── app/                               # ACTIVE member-facing product
│   ├── shell/
│   ├── home/
│   ├── plan/
│   ├── insights/
│   ├── explore/
│   ├── profile/
│   ├── track/
│   └── workflows/
├── intelligence/                      # ACTIVE reusable intelligence/domain layer
│   ├── evidence/
│   ├── integration/
│   ├── model/
│   ├── planning/
│   ├── policy/
│   ├── question-bank/
│   ├── selection/
│   └── simulation/
├── assets/                            # ACTIVE shared product assets
│   ├── brand/
│   ├── icons/
│   ├── images/
│   └── styles/
├── development/                       # TEMPORARY initiative workspaces
│   ├── discovery/
│   ├── assessments/
│   ├── check-ins/
│   ├── interventions/
│   └── experiments/
├── tests/                             # DURABLE promotion + regression validation
│   ├── unit/
│   ├── integration/
│   ├── cases/
│   ├── evals/
│   ├── regressions/
│   └── qa/
├── admin/                             # restricted/internal accepted surfaces
├── supabase/                          # backend schema/functions/configuration
├── docs/                              # repository governance + technical docs
└── archive/                           # exceptional retained history
    ├── prototypes/
    ├── superseded/
    ├── experiments/
    └── legacy/
```

`development/qa/` is intentionally not a permanent top-level Development domain. Temporary QA belongs inside the initiative being tested (for example `development/discovery/qa/`); durable QA belongs in `tests/qa/`.

Root remains intentionally small. Deployment constraints and stable public URLs take precedence.

## 4. Environment boundary and promotion pipeline

```text
DEVELOPMENT INITIATIVE
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

Failed/rejected work returns to Development or is retired. Promotion moves only accepted behavior/contracts/tests into permanent product domains; it does not copy the whole experimental workspace.

Branches provide temporary change isolation and review but are not themselves the permanent Stable/Development runtime environments.

## 5. Active architecture

`app/` owns accepted member-facing presentation and interaction. Canonical MVP destinations are Home, Plan, Insights and Explore, with Profile through the avatar and Track as a global action. Secondary flows belong under `app/workflows/`.

`intelligence/` owns accepted reusable reasoning/domain logic. UI code must not duplicate intelligence rules merely for convenience.

`assets/` contains accepted shared presentation assets only.

`tests/` protects accepted behavior. Important failures discovered during development become regression cases when behavior is promoted.

## 6. Development architecture

Development is temporary and organized by initiative/domain:

- `development/discovery/` — candidate Discovery engine, policies, questions, schemas, telemetry, UI and initiative-local QA.
- `development/assessments/` — unaccepted assessment work.
- `development/check-ins/` — unaccepted check-in behavior.
- `development/interventions/` — unaccepted intervention/adaptation behavior.
- `development/experiments/` — bounded experiments without a mature permanent domain.

Successful initiatives graduate into permanent `app/`, `intelligence/`, `supabase/`, `assets/` and `tests/` destinations as appropriate. Failed or superseded initiatives are retired. Development folders should not become permanent duplicate implementations.

## 7. Discovery status

The previous Discovery human-test freeze is **closed as of 2026-08-24 by project decision**. Discovery may now be reorganized into `development/discovery/` after dependency, public-route and workflow references are mapped.

Discovery remains Development—not Active—until it passes the applicable validation/promotion gates.

Migration sequence:
1. Inventory current Discovery files, routes, dependencies and workflows.
2. Map the current public/test entry route and decide whether a compatibility redirect is temporarily required.
3. Move the isolated implementation into `development/discovery/` with initiative-local `engine/`, `policies/`, `questions/`, `schemas/`, `telemetry/`, `ui/` and `qa/` as warranted.
4. Update CI/path references atomically.
5. Verify the Development deployment and its independent authentication origin.
6. Continue synthetic/independent/human validation when those rounds are scheduled.
7. Promote only accepted pieces into permanent Active domains.

There must ultimately be one accepted Discovery implementation, not competing Development and Active engines.

## 8. Promotion contract

A candidate is promotable only when:
1. Intended behavior and acceptance criteria are defined.
2. Relevant automated/synthetic tests pass.
3. Known high-severity findings are resolved or explicitly accepted.
4. Independent review has occurred when warranted.
5. Human validation has occurred when member behavior/usability is material.
6. Regression cases exist for important discovered failures.
7. Dependencies and persistence contracts are understood.
8. Active does not depend on Development.
9. Deployment/public routes and environment configuration are verified.
10. Stable/Development session isolation is verified when authentication is affected.
11. Temporary experimental scaffolding is excluded from promotion.

Promotion is a focused change and must not be combined with unrelated cleanup.

## 9. Testing ownership

- `tests/unit/` — stable unit-level validation.
- `tests/integration/` — cross-domain, persistence, auth/environment and contract validation.
- `tests/cases/` — canonical fixtures/cases.
- `tests/evals/` — evaluation runners and acceptance logic.
- `tests/regressions/` — failures that must not recur.
- `tests/qa/` — stable readiness/UI/system QA.

Temporary exploratory harnesses remain inside their Development initiative. GitHub Actions remain in `.github/workflows/`; path-dependent workflows move atomically with referenced files.

## 10. Active dependency rules

Active may depend on Active, accepted assets, backend infrastructure and accepted contracts. Active must not depend on Archive and must not normally depend on Development.

Development may consume accepted Active contracts when necessary to prove compatibility but should avoid mutating Stable behavior or data.

## 11. File movement rules

Before moving/renaming a live file:
1. Identify imports, links, assets, routes, workflow references, tests and deployment assumptions.
2. Determine lifecycle state and any active Test Freeze.
3. Decide destination by environment first, then domain responsibility.
4. Update references atomically.
5. Run relevant validation.
6. Verify deployed/public behavior and environment/session isolation where applicable.

Do not reorganize a working implementation solely because a folder name is aesthetically imperfect.

## 12. Archive and deletion rules

Prefer Git history over retaining meaningless duplicates. Archive only when direct runnable/viewable history or traceability has continuing value. Delete only after dependency checks establish no operational/testing value remains.

## 13. Documentation authority

This file is authoritative for repository lifecycle states, runtime environments, promotion, test protection, cleanup and maintenance.

`docs/repository-target-architecture.md` controls detailed internal domain layout subject to these environment boundaries. `docs/repository-classification.md` records current-state classification and migration decisions. README should point here rather than duplicate this policy.

## 14. Cleanup migration sequence

1. Inventory current repository state.
2. Classify each substantive artifact as Active, Development, Tests/Validation, Archive or Delete Candidate.
3. Map dependencies, deployment/public routes and authentication/session assumptions.
4. Map each retained artifact to final environment + domain destination.
5. Move low-risk Development/Archive/support material first.
6. Consolidate canonical Active app and intelligence layers in controlled batches.
7. Consolidate durable regression/validation assets under `tests/`.
8. Migrate Discovery into `development/discovery/` now that its freeze is closed.
9. Retire superseded root pages/helpers only after canonical behavior is validated.
10. Establish/verify distinct Stable and Development deployment origins and dual-account session isolation.
11. Verify deployment and CI after each structural batch.
12. Review stale branches only after the file tree is stable.

## 15. Decision rule for every current file

Assign one action before movement:
1. KEEP — already appropriate and stable.
2. MIGRATE — retained behavior belongs at another canonical path.
3. MERGE — useful behavior should be absorbed into another canonical module.
4. HOLD — active dependency/Test Freeze makes movement premature.
5. RETIRE — superseded and dependency-free after accepted behavior/test coverage is preserved.

Then assign lifecycle destination: Active, Development, Tests/Validation, Archive, or Delete.

No mass move, rename or deletion occurs without classification and dependency checks.