# EL8 Repository Target Architecture

Status: Target-state organization plan
Reconciled: 2026-08-24

This document reconciles the earlier EL8 repository-organization proposal with the frozen MVP architecture and the current repository classification map. It defines the destination structure; `docs/repository-classification.md` defines how current files are classified before migration.

## 1. Governing principle

Organize by product/domain responsibility first, not by the accidental collection of HTML pages currently in the repository.

The earlier proposal correctly separated Discovery/intelligence concerns into engine/policy/question/schema/evaluation/telemetry/UI responsibilities. That proposal was provisional, not a locked literal folder tree. The current repository already contains a substantial `intelligence/` domain structure, so cleanup should preserve useful existing boundaries rather than rename working code solely to match an old sketch.

The frozen MVP adds a second requirement: member-facing UI must converge on Home, Plan, Insights and Explore, with Profile through the avatar and Track as a global action.

## 2. Target top-level structure

```text
/
├── README.md
├── index.html                         # GitHub Pages/member app entry
├── .github/
│   └── workflows/                     # CI/validation workflows
├── assets/
│   ├── brand/
│   ├── icons/
│   ├── images/
│   └── styles/
├── app/
│   ├── shell/                         # shared member shell/navigation
│   ├── home/
│   ├── plan/
│   ├── insights/
│   ├── explore/
│   ├── profile/
│   ├── track/
│   └── workflows/                     # onboarding, assessments, check-ins, history, safety, account states
├── intelligence/
│   ├── evidence/
│   ├── integration/
│   ├── model/
│   ├── planning/
│   ├── policy/
│   ├── question-bank/
│   ├── selection/
│   └── simulation/
├── discovery/                         # eventual consolidated Discovery domain
│   ├── engine/
│   ├── policies/
│   ├── questions/
│   ├── schemas/
│   ├── telemetry/
│   └── ui/
├── tests/
│   ├── evals/
│   ├── cases/
│   ├── regressions/
│   ├── integration/
│   └── qa/
├── admin/                             # restricted/internal surfaces
├── docs/
│   ├── repository-classification.md
│   ├── repository-target-architecture.md
│   └── technical/                     # technical implementation/validation docs
└── archive/                           # only where retained history is genuinely useful
```

This is a target map, not permission for a bulk move. Active paths may remain where they are until dependencies and CI references are migrated safely.

## 3. Member app architecture

`app/` owns member-facing presentation and interaction, not EL8's core intelligence rules.

### `app/shell/`

Shared header, four-destination bottom navigation, avatar Profile entry, global Track action, routing and shared app-layout primitives.

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

Global member-initiated capture UI. Quick Logs are plan-derived and speed-first; text/photo/file/audio are universal fallbacks. Home and Track must call the same evidence/logging contracts.

### `app/workflows/`

Secondary flows that should not become primary destinations: onboarding, Universal Baseline, reassessment, check-ins, plan review/history, safety/escalation, privacy/data, account hold and similar focused states.

## 4. Intelligence architecture

Preserve the current `intelligence/` directory as the primary reusable intelligence/domain layer. Its existing boundaries—evidence, integration, model, planning, policy, question-bank, selection and simulation—are closer to the desired architecture than the current root-page sprawl.

Do not duplicate intelligence logic inside `app/` page folders. UI calls domain contracts; domain rules remain independently testable.

Large question banks should remain modular by domain/concern rather than return to one giant file. Generated artifacts should be distinguishable from human-authored source when generation is introduced.

## 5. Discovery architecture

The earlier architecture proposal envisioned a coherent Discovery domain containing engine, policies, questions/domain modules, schemas, evaluations/cases/regressions, telemetry and UI.

That conceptual separation remains valid, but the current active `discovery-round3/`, related root files and GitHub workflows must not be physically reorganized during active validation merely to achieve cosmetic cleanliness.

Target after Discovery stabilization:

- `discovery/engine/` — orchestration, projection/resolution and adaptive flow logic.
- `discovery/policies/` — bounded decision/safety/routing policies specific to Discovery.
- `discovery/questions/` — Discovery question/domain source modules.
- `discovery/schemas/` — contracts and data schemas.
- `discovery/telemetry/` — Discovery-specific observability definitions where needed.
- `discovery/ui/` — external/internal Discovery test surfaces that are not canonical member-app screens.

Cross-product intelligence that is not Discovery-specific remains under `intelligence/` rather than being duplicated into `discovery/`.

## 6. Tests and validation

The earlier proposal's `evals/`, `cases/` and `regressions/` concepts should become a coherent `tests/` hierarchy rather than remaining scattered at root.

Target:

- `tests/evals/` — evaluation runners and scoring/acceptance logic.
- `tests/cases/` — canonical synthetic/human-readable cases and fixtures.
- `tests/regressions/` — locked failures that must never recur.
- `tests/integration/` — cross-domain/persistence/contract tests.
- `tests/qa/` — UI/readiness/shadow/segmented-scale and other QA harnesses.

GitHub Actions remain under `.github/workflows/` and should be updated only in the same change that relocates their referenced paths.

## 7. Telemetry

Do not create a top-level `telemetry/` folder merely because the earlier provisional tree named one. Telemetry should live close to the domain that owns its meaning unless a genuinely shared observability layer emerges. Discovery-specific telemetry can live under `discovery/telemetry/`; shared product telemetry can later justify a common infrastructure location.

## 8. Schemas and contracts

Do not create a generic top-level `schemas/` dumping ground. Keep contracts close to their governing domain:

- Discovery contracts/schemas → `discovery/schemas/`
- intelligence/evidence models → relevant `intelligence/` domain
- member-app view/input contracts → relevant `app/` feature or shared app contracts

This preserves ownership and reduces cross-domain ambiguity.

## 9. Assets

`assets/` should become presentation-only shared material. Target subfolders include brand, icons, images and shared styles. Feature-specific scripts/business logic should not accumulate there.

## 10. Documentation

`docs/` owns repository/technical implementation documentation. Product authority remains in the governed EL8 Drive; GitHub documentation should explain how the repository implements that authority rather than silently becoming a competing product-spec system.

Current key repository docs:

- `docs/repository-classification.md` — current-state classification and migration safety rules.
- `docs/repository-target-architecture.md` — destination architecture and reconciliation with the earlier organization plan.

## 11. Admin

Restricted administrative surfaces should converge under `admin/` and remain explicitly separate from the normal member app. Moving them requires dependency/authorization checks first.

## 12. Archive policy

Prefer Git history over a large permanent archive. Use `archive/` only when a historical artifact needs to remain directly runnable/viewable or is still referenced during a transition. Otherwise, once dependencies are removed and accepted behavior/tests are migrated, obsolete files may be deleted because Git preserves history.

## 13. Migration sequence

Phase 0 — Freeze and classify: COMPLETE.

Phase 1 — Dependency map:
- map root Home/Track/Plan files and shared navigation/evidence dependencies;
- map Insights/dimension/history;
- map Explore/content/saved;
- map Profile/account/settings;
- map assessment/check-in workflows;
- protect Discovery/QA/CI references.

Phase 2 — Create canonical app shell:
- establish `app/shell/` and canonical member routing/navigation primitives;
- do not break existing public test URLs during migration.

Phase 3 — Migrate Home + Track together:
- one evidence model;
- Home progress-aware expandable Quick Logs;
- Track speed-first plan-derived Quick Logs plus universal capture.

Phase 4 — Migrate Plan.

Phase 5 — Migrate Insights.

Phase 6 — Migrate Explore.

Phase 7 — Migrate Profile and supporting workflows.

Phase 8 — Consolidate QA/tests and root experiments after dependency checks.

Phase 9 — Consolidate Discovery only after active Discovery validation is stable and its workflows can be changed atomically.

Phase 10 — Retire superseded root pages, navigation helpers and the temporary MVP shell after the canonical implementation is validated.

## 14. Decision rule for current files

For every existing file, assign one of five actions before moving it:

1. KEEP — already in an appropriate stable domain/path.
2. MIGRATE — functionality remains valid but belongs in the new structure.
3. MERGE — useful behavior should be absorbed into another canonical module.
4. HOLD — active validation/dependency makes movement premature.
5. RETIRE — superseded and dependency-free after accepted behavior/test coverage is preserved.

No mass rename/move should occur without this action map.