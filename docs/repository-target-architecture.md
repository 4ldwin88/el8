# EL8 Repository Target Architecture

Status: Target-state domain architecture
Reconciled: 2026-08-24

This document defines EL8's internal domain structure. `docs/REPOSITORY-GOVERNANCE.md` is authoritative for lifecycle/environment boundaries, runtime isolation, promotion, Test Freeze and cleanup policy. `docs/repository-classification.md` maps current files before migration.

## 1. Governing model

Placement is decided in two steps:
1. **Environment/lifecycle first** — Active, Development, Tests/Validation, Archive or Delete.
2. **Domain responsibility second** — the permanent or initiative domain that owns the artifact.

Development is temporary; permanent product domains are `app/`, `intelligence/`, `supabase/`, `assets/`, `admin/` and `tests/`.

Stable and Development must also be independently deployable to **different browser origins** so two different EL8 accounts can remain signed in simultaneously. Repository folder separation alone does not provide session isolation.

## 2. Target top-level structure

```text
/
├── README.md
├── index.html
├── .github/
│   └── workflows/
├── app/                               # ACTIVE member product
│   ├── shell/
│   ├── home/
│   ├── plan/
│   ├── insights/
│   ├── explore/
│   ├── profile/
│   ├── track/
│   └── workflows/
├── intelligence/                      # ACTIVE EL8 intelligence
│   ├── evidence/
│   ├── integration/
│   ├── model/
│   ├── planning/
│   ├── policy/
│   ├── question-bank/
│   ├── selection/
│   └── simulation/
├── development/                       # TEMPORARY initiative workspaces
│   ├── discovery/
│   ├── assessments/
│   ├── check-ins/
│   ├── interventions/
│   └── experiments/
├── tests/                             # PERMANENT validation system
│   ├── unit/
│   ├── integration/
│   ├── cases/
│   ├── evals/
│   ├── regressions/
│   └── qa/
├── supabase/                          # backend
├── assets/                            # accepted shared assets
│   ├── brand/
│   ├── icons/
│   ├── images/
│   └── styles/
├── admin/                             # restricted accepted surfaces
├── docs/                              # repository/technical docs
└── archive/                           # exceptional retained history
```

`development/qa/` is intentionally absent. Initiative-local QA belongs inside that initiative; durable QA belongs in `tests/qa/`.

## 3. Runtime topology

The repository architecture and deployment architecture are related but not identical.

```text
Repository Active ─────→ Stable deployment origin ─────→ Stable browser session

Development initiative → Development deployment origin → Development browser session

Tests / CI ─────────────→ validates Development → promotion → validates Stable
```

Stable and Development must not be deployed merely as two paths on the same origin when both use persistent authentication. They require separate origins so browser auth/session storage cannot overwrite the other build's account.

Environment-specific backend/configuration values should be injected as configuration. The codebase should not fork business logic just to produce Stable and Development deployments.

Long-term preferred topology also separates backend environments so Development database migrations/functions/test data cannot affect Stable. During prototype work a shared backend may be tolerated only with strict test-data isolation and separate browser origins.

## 4. Active member app

`app/` owns accepted member-facing presentation and interaction.

- `app/shell/` — shared header, four-destination bottom navigation, avatar Profile entry, global Track action, routing/layout.
- `app/home/` — Today's execution surface, EL8-requested evidence/check-ins, daily progress and detailed Home Quick Logs.
- `app/plan/` — Active Plan, intervention/action details, rationale, cadence, calendar/schedule and review state.
- `app/insights/` — Baseline-versus-Current state, trends, graphs, dimension details and evidence interpretation.
- `app/explore/` — For You, Learn, Experts and Saved.
- `app/profile/` — member record, priorities/constraints, history, achievements, assessments, connections, membership, notifications, privacy/data and settings.
- `app/track/` — global speed-first evidence capture with plan-derived Quick Logs plus text/photo/file/audio fallbacks.
- `app/workflows/` — onboarding, Universal Baseline, reassessment, check-ins, plan review/history, safety/escalation, privacy/data and other secondary flows.

## 5. Active intelligence

`intelligence/` owns accepted reusable reasoning/domain logic. UI code calls domain contracts instead of duplicating intelligence rules.

Preserve independently testable boundaries for evidence, integration, model, planning, policy, question-bank, selection and simulation. Large question banks remain modular. Generated artifacts must be distinguishable from human-authored source if generation is introduced.

## 6. Development initiatives

`development/` is not a parallel permanent product. Each folder is an isolated candidate workspace with a lifecycle.

### `development/discovery/`

```text
development/discovery/
├── engine/
├── policies/
├── questions/
├── schemas/
├── telemetry/
├── ui/
└── qa/                 # only while useful to this initiative
```

The previous Discovery human-test freeze is closed. Current Discovery material may now migrate here after dependency/public-route/workflow mapping.

### Other initiatives
- `development/assessments/` — unaccepted assessment work.
- `development/check-ins/` — unaccepted check-in behavior.
- `development/interventions/` — unaccepted intervention/adaptation behavior.
- `development/experiments/` — bounded experiments without a mature domain.

Successful work graduates into permanent domains. Failed/superseded work is retired. A completed Development initiative should normally shrink substantially or disappear.

## 7. Tests and validation

- `tests/unit/` — stable unit-level tests.
- `tests/integration/` — cross-domain, persistence, environment/auth and contract tests.
- `tests/cases/` — canonical fixtures/cases.
- `tests/evals/` — evaluation runners and acceptance logic.
- `tests/regressions/` — failures that must not recur.
- `tests/qa/` — durable readiness/UI/system QA.

A permanent integration test must verify the environment contract: Stable Account A and Development Account B can coexist without session replacement or storage collision.

Exploratory initiative-specific QA stays with the initiative until it deserves durable status.

## 8. Promotion mapping

Promotion does not move an entire Development folder into Active. Accepted pieces are distributed to their permanent homes.

Examples:
- accepted Discovery reasoning/policies → relevant `intelligence/` domains;
- accepted Discovery member flow → `app/workflows/` or relevant feature;
- accepted intervention presentation → `app/plan/`;
- accepted evidence capture → `app/track/` + `intelligence/evidence/` as appropriate;
- backend changes → `supabase/`;
- accepted regression cases → `tests/regressions/`;
- temporary review/test UI → retire unless continuing value exists.

## 9. Configuration contract

Stable and Development should share source contracts while receiving environment-specific configuration. Configuration may include:
- deployment/base URL;
- environment identity (`stable`, `development`, test where needed);
- Supabase URL/project and publishable key;
- feature flags;
- telemetry labels;
- test-data namespace/markers.

Do not hard-code Stable assumptions into reusable modules. Do not solve environment isolation by duplicating the whole application source tree.

## 10. Schemas, telemetry and assets

Keep contracts close to their governing domain. Experimental Discovery schemas/telemetry/assets stay inside `development/discovery/`; accepted shared equivalents move to permanent domains.

Do not create generic top-level schema or telemetry dumping grounds unless a genuinely shared infrastructure layer emerges.

`assets/` is for accepted shared presentation material only. Experimental assets remain with their Development initiative.

## 11. Documentation and admin

`docs/` owns repository governance and technical implementation documentation. Product authority remains in governed EL8 product documents outside the repo.

`admin/` owns restricted accepted administrative surfaces and stays separate from the normal member app.

## 12. Archive

Prefer Git history to a large permanent archive. Retain files under `archive/` only when directly runnable/viewable historical material or traceability has continuing value.

## 13. Migration sequence

1. Inventory and classify current repository artifacts.
2. Map dependencies, routes, workflows and auth/session assumptions.
3. Establish final environment + domain destination for each retained artifact.
4. Migrate Discovery into `development/discovery/` now that its Test Freeze is closed.
5. Consolidate Active Home/Track, Plan, Insights, Explore, Profile and workflows.
6. Consolidate accepted intelligence domains.
7. Consolidate durable validation under `tests/`.
8. Establish distinct Stable and Development deployment origins/configuration.
9. Verify simultaneous dual-account sessions.
10. Retire superseded root pages/helpers after canonical behavior is validated.
11. Verify deployment/CI after each structural batch.
12. Review stale branches after the tree stabilizes.

## 14. Decision rule

Every existing file receives an action—KEEP, MIGRATE, MERGE, HOLD or RETIRE—and a lifecycle destination—Active, Development, Tests/Validation, Archive or Delete—before structural movement.

No mass move occurs without dependency and deployment checks.