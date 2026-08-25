# EL8 Repository Target Architecture

Status: Target-state operational architecture
Reconciled: 2026-08-25

`docs/REPOSITORY-GOVERNANCE.md` controls lifecycle, promotion and environment isolation. This document defines the target physical/domain layout.

## 1. Design goals

The repository must support three clear working states:

1. `stable/` — accepted deployable EL8.
2. `development/` — integrated unfinished next build, independently deployable.
3. `experiments/` — isolated tests of uncertain concepts before Development integration.

Stable and Development must run simultaneously under different browser origins and therefore support different authenticated accounts at the same time.

The cleanup preserves useful working capability from the legacy prototype while replacing its accumulated page/file structure with the approved MVP shell architecture.

## 2. Target tree

```text
/
├── README.md
├── package.json
├── .github/
│   └── workflows/
├── stable/
│   ├── app/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── shell/
│   │   ├── home/
│   │   ├── plan/
│   │   ├── insights/
│   │   ├── explore/
│   │   ├── profile/
│   │   ├── track/
│   │   └── workflows/
│   ├── intelligence/
│   ├── assets/
│   ├── admin/
│   └── config/
├── development/
│   ├── app/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── shell/
│   │   ├── home/
│   │   ├── plan/
│   │   ├── insights/
│   │   ├── explore/
│   │   ├── profile/
│   │   ├── track/
│   │   └── workflows/
│   ├── intelligence/
│   ├── assets/
│   ├── admin/
│   └── config/
├── experiments/
│   ├── discovery/
│   ├── assessments/
│   ├── check-ins/
│   ├── interventions/
│   └── sandbox/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── cases/
│   ├── evals/
│   ├── regressions/
│   └── qa/
├── supabase/
│   ├── stable/
│   ├── development/
│   └── shared/
└── docs/
```

## 3. Member application architecture

Both deployable environments use the same conceptual product architecture:

- `auth/` — signup, login, logout, recovery and session handling.
- `onboarding/` — account setup, preferences needed before first use, Universal Baseline, Discovery handoff, initial Plan proposal and introduction.
- `shell/` — common navigation/layout. Primary destinations are Home, Plan, Insights and Explore; Profile is avatar-accessed; Track is global.
- `home/` — today's execution surface and required member inputs.
- `plan/` — active actions, schedule/calendar, rationale and review state.
- `insights/` — baseline/current state, trends, dimension details and evidence interpretation.
- `explore/` — For You, learning, saved content and professional/expert-services space.
- `profile/` — member record, history, assessments, membership, connections, settings, notifications and privacy/data.
- `track/` — speed-first capture and plan-derived quick logs.
- `workflows/` — check-ins, reassessment, plan review/history, safety/escalation, privacy/data and secondary flows that do not deserve a primary domain.

## 4. Capability-donor rule

Legacy root pages and scripts are not target architecture. They are reviewed for useful capabilities. A capability may be:

- merged into a target app module;
- merged into target intelligence;
- converted into a durable test;
- moved into an experiment if still uncertain;
- retired when superseded.

Examples of capabilities worth preserving when proven include authentication/persistence, member profile/preferences, baseline/discovery handoffs, plan generation/review, quick logging, check-ins, history, evidence interpretation, safety handling, privacy/data controls and useful visual/interaction behavior.

## 5. Intelligence architecture

Within Stable and Development, intelligence should converge on independently testable domains rather than legacy engines organized by historical implementation:

```text
intelligence/
├── contracts/
├── discovery/
├── evidence/
├── state/
├── prioritization/
├── planning/
├── interventions/
├── outcomes/
└── safety/
```

This reflects the canonical chain:

Discovery -> Evidence / State -> Prioritization -> Planning -> Interventions -> Outcomes / Learning

Safety may interrupt the chain.

Candidate alternative engines belong under `experiments/`, not beside accepted intelligence inside a deployable environment.

## 6. Environment assembly and duplication control

The target folders describe deployment boundaries. They do not require manually maintaining two permanently divergent copies of every source file. Shared accepted code should be factored/reused where the deployment toolchain permits without creating runtime coupling between Stable and Development.

During migration, Development is assembled first from the MVP shell plus preserved legacy capability. Once validated, that release is promoted into Stable. After promotion, new work resumes in Development/Experiments.

## 7. Configuration

Each deployable environment has explicit configuration for:

- environment identity;
- base/deployment URL;
- Supabase URL/project/key;
- feature flags;
- telemetry labels;
- development/test data namespace.

No reusable business logic should contain hard-coded Stable-only assumptions.

## 8. Authentication isolation

Stable and Development must use distinct origins. The final validation includes:

1. sign into Stable as Account A;
2. sign into Development as Account B in the same browser;
3. navigate/reload both builds;
4. confirm neither session changes the other;
5. confirm environment-specific storage and redirect URLs remain correct.

If an experiment needs authentication, it must use an isolated preview/origin or explicitly non-persistent test auth rather than colliding with the two deployable sessions.

## 9. Experiments

Experiments are organized by initiative and may contain their own engine, UI, schemas, telemetry and QA. They are not deployment dependencies.

Discovery remains here while it is independently validated. Accepted pieces are promoted into Development domains; rejected scaffolding is deleted.

## 10. Tests

Permanent tests are organized by purpose rather than by historical implementation. Important old QA/adversarial failures should become durable regression cases before old harnesses are removed.

`tests/integration/` owns auth/session isolation, persistence and cross-domain checks. `tests/qa/` owns deployable-build readiness and smoke validation.

## 11. Backend

`supabase/shared/` contains genuinely shared schema/contracts. `supabase/stable/` and `supabase/development/` contain environment-specific migrations/configuration/functions where separation is required. The prototype may initially point both builds at one project, but the directory structure must not assume that remains permanent.

## 12. Documentation

The final `docs/` should be small. Keep current governance, target architecture, security/persistence contracts and live operational procedures. Completed migration plans, historical QA narratives and obsolete design explanations are deletion candidates once their useful information is represented in code/tests/current authority.

## 13. Migration sequence

1. Build a complete capability/dependency map of current root/app/intelligence/docs/workflows.
2. Create Development as the first clean integrated environment using the MVP shell.
3. Merge valuable legacy prototype behavior into Development domain-by-domain.
4. Move still-unaccepted Discovery and other uncertain work into Experiments.
5. Consolidate durable tests.
6. Establish separate Stable/Development deployment configuration and origins.
7. Verify simultaneous Account A / Account B sessions.
8. Validate the integrated Development build end-to-end.
9. Promote the validated release into Stable.
10. Retire legacy root implementations and obsolete documentation.
11. Run final deployment/regression checks and then remove stale branches.
