# EL8 Repository Target Architecture

Status: Target-state domain architecture
Reconciled: 2026-08-24

This document defines the internal domain structure of the EL8 repository. It is subordinate to `docs/REPOSITORY-GOVERNANCE.md` for lifecycle/environment boundaries, promotion rules, Test Freeze, and cleanup policy. `docs/repository-classification.md` defines how current files are classified before migration.

## 1. Governing model

Repository placement is decided in two steps:

1. **Environment/lifecycle first** — is the artifact Active, Development, Tests/Validation, Archive, Delete Candidate, or under Test Freeze?
2. **Domain responsibility second** — within that lifecycle state, what product/domain responsibility owns it?

This prevents experimental implementations from sitting beside accepted product code as though both were equally canonical, while preserving useful domain boundaries inside each environment.

The frozen MVP requires the accepted member experience to converge on Home, Plan, Insights and Explore, with Profile through the avatar and Track as a global action.

## 2. Target top-level structure

```text
/
├── README.md
├── index.html                         # GitHub Pages/member entry when required
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
└── archive/                           # retained retired material
    ├── prototypes/
    ├── superseded/
    ├── experiments/
    └── legacy/
```

This is a target map, not permission for a bulk move. Active dependencies, CI references, deployment constraints and Test Freeze take precedence.

## 3. Active member app architecture

`app/` owns accepted member-facing presentation and interaction, not EL8's core intelligence rules.

### `app/shell/`
Shared header, four-destination bottom navigation, avatar Profile entry, global Track action, routing and shared layout primitives.

### `app/home/`
Today's execution surface: next actions, EL8-requested evidence/check-ins, daily progress and richer expandable Home Quick Logs.

### `app/plan/`
Active Plan, intervention/action details, rationale, cadence, calendar/schedule and review state.

### `app/insights/`
Baseline-versus-Current presentation, qualitative condition, trends, longitudinal graphs, dimension details and evidence interpretation.

### `app/explore/`
For You, Learn, Experts and Saved.

### `app/profile/`
Account/member record, priorities/constraints, history, achievements, assessments, connections, membership, notifications, privacy/data and settings.

### `app/track/`
Global member-initiated capture UI. Quick Logs are plan-derived and speed-first; text/photo/file/audio are universal fallbacks. Home and Track call the same accepted evidence/logging contracts.

### `app/workflows/`
Secondary flows that should not become primary destinations: onboarding, Universal Baseline, reassessment, check-ins, plan review/history, safety/escalation, privacy/data, account hold and similar focused states.

## 4. Active intelligence architecture

`intelligence/` is the accepted reusable intelligence/domain layer. Preserve useful boundaries such as evidence, integration, model, planning, policy, question-bank, selection and simulation.

Do not duplicate intelligence logic inside `app/` page folders. UI calls domain contracts; domain rules remain independently testable.

Large question banks should remain modular by domain/concern. Generated artifacts should be distinguishable from human-authored source when generation is introduced.

## 5. Development architecture

`development/` contains candidate implementations that have not passed the promotion gate. Organize them by initiative rather than by accidental file type.

### `development/discovery/`
Target internal structure after the current Discovery Test Freeze closes:

```text
development/discovery/
├── engine/
├── policies/
├── questions/
├── schemas/
├── telemetry/
└── ui/
```

Discovery-specific experimental behavior remains here until accepted. Cross-product intelligence that becomes accepted should be promoted into the relevant `intelligence/` domain rather than creating a permanent duplicate Discovery intelligence stack.

### `development/assessments/`
Candidate assessment flows, content, selection behavior or UI that has not been accepted.

### `development/check-ins/`
Candidate daily/weekly/adaptive check-in behavior.

### `development/interventions/`
Candidate intervention, review and adaptation behavior.

### `development/experiments/`
Bounded experiments without a mature product-domain home. Successful experiments must graduate into a named domain; failed experiments are retired.

### `development/qa/`
Temporary development-specific harnesses, review pages and investigation tools. Long-term acceptance/regression assets move to `tests/`.

## 6. Tests and validation

`tests/` is the durable validation layer for promotion and accepted product behavior.

- `tests/evals/` — evaluation runners and scoring/acceptance logic.
- `tests/cases/` — canonical synthetic/human-readable cases and fixtures.
- `tests/regressions/` — locked failures that must never recur.
- `tests/integration/` — cross-domain/persistence/contract tests.
- `tests/qa/` — stable UI/readiness/system QA harnesses.

Initiative-specific exploratory testing may remain inside Development while behavior is unsettled. Promote durable tests with accepted functionality.

GitHub Actions remain under `.github/workflows/` and should be updated only in the same change that relocates referenced paths.

## 7. Promotion mapping

Promotion does not mean moving an entire Development folder into Active. Accepted pieces are mapped to their permanent product domains.

Examples:

- accepted Discovery reasoning/policies → relevant `intelligence/` domains;
- accepted Discovery member assessment UI → `app/workflows/` or relevant member feature;
- accepted intervention presentation → `app/plan/`;
- accepted evidence capture → `app/track/` + `intelligence/evidence/` as appropriate;
- accepted regression cases → `tests/regressions/`;
- temporary review/test UI → retire unless it has continuing operational value.

This rule is intended to minimize rework: experimental scaffolding can change freely without forcing the stable product architecture to change with it.

## 8. Test Freeze and current Discovery paths

The current `discovery-round3/`, related root files and GitHub workflows are protected while the distributed human-test round remains active. Their physical location is therefore a temporary exception to the target architecture.

Do not move them into `development/discovery/` until the freeze closes. When it closes, migrate dependencies and workflows atomically, verify public routes, then continue validation/promotion from the new structure.

## 9. Telemetry

Do not create a generic top-level telemetry dumping ground. Telemetry belongs close to the domain that owns its meaning. Experimental Discovery telemetry belongs with `development/discovery/`; accepted shared observability may later justify a common infrastructure location.

## 10. Schemas and contracts

Keep contracts close to their governing domain:

- experimental Discovery schemas → `development/discovery/schemas/`;
- accepted intelligence/evidence models → relevant `intelligence/` domain;
- member-app view/input contracts → relevant `app/` feature or shared app contracts.

Avoid a generic top-level `schemas/` folder unless a genuinely shared schema layer emerges.

## 11. Assets

`assets/` is for accepted shared presentation material: brand, icons, images and shared styles. Feature-specific scripts/business logic do not belong there.

Experimental assets that exist solely for a Development initiative should remain with that initiative until accepted.

## 12. Documentation

`docs/` owns repository governance and technical implementation documentation. Product authority remains in the governed EL8 Drive; GitHub documentation explains how the repository implements that authority rather than becoming a competing product-spec system.

Key repository docs:

- `docs/REPOSITORY-GOVERNANCE.md` — authoritative lifecycle/environment and promotion policy.
- `docs/repository-target-architecture.md` — internal domain destination architecture.
- `docs/repository-classification.md` — current-state classification and migration map.

## 13. Admin

Restricted administrative surfaces converge under `admin/` and remain explicitly separate from the normal member app. Moving them requires dependency and authorization checks first.

## 14. Archive policy

Prefer Git history over a large permanent archive. Use `archive/` only when a historical artifact needs to remain directly runnable/viewable or has continuing traceability value. Otherwise, once dependencies are removed and accepted behavior/tests are preserved, obsolete files may be deleted.

## 15. Migration sequence

Phase 0 — Freeze and classify current repository state.

Phase 1 — Reconcile environment + domain destination for every retained artifact.

Phase 2 — Dependency map root member files, shared navigation/evidence, workflows, intelligence, CI and public routes.

Phase 3 — Protect all Test Freeze material and explicitly defer its physical migration.

Phase 4 — Consolidate canonical Active app shell and Home + Track.

Phase 5 — Consolidate Active Plan.

Phase 6 — Consolidate Active Insights.

Phase 7 — Consolidate Active Explore.

Phase 8 — Consolidate Active Profile and supporting workflows.

Phase 9 — Consolidate durable acceptance/regression assets under `tests/`; move temporary candidate tooling into the appropriate Development initiative.

Phase 10 — After Discovery Test Freeze closes, migrate Discovery into `development/discovery/`, complete validation, and promote only accepted behavior into Active domains.

Phase 11 — Retire superseded root pages, navigation helpers and temporary prototypes after canonical behavior is validated.

Phase 12 — Verify deployment/CI and review stale branches after the file tree is stable.

## 16. Decision rule for current files

For every existing file, assign both an action and lifecycle destination before moving it.

Action:
1. KEEP — already in an appropriate stable path.
2. MIGRATE — retained behavior belongs elsewhere.
3. MERGE — useful behavior should be absorbed into another canonical module.
4. HOLD — dependency or Test Freeze makes movement premature.
5. RETIRE — superseded and dependency-free after accepted behavior/test coverage is preserved.

Lifecycle destination:
- Active
- Development
- Tests/Validation
- Archive
- Delete

No mass rename/move should occur without this map.