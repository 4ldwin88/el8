# EL8 Repository Target Architecture

Status: Target-state operational architecture
Reconciled: 2026-08-27

`docs/REPOSITORY-GOVERNANCE.md` controls lifecycle, promotion and environment isolation. This document defines physical/domain placement.

## 1. Design goals

The repository should have one obvious source location for each accepted capability. Product domains belong in directories; release states belong in Git branches and deployment configuration.

The target must:
- keep the deployment root small;
- avoid permanent Stable/Development source duplication;
- make ownership obvious;
- keep accepted intelligence independently testable;
- preserve unique regression value while deleting disposable harnesses;
- use Git history as the default archive.

## 2. Target tree

```text
/
├── README.md
├── package.json
├── .github/
│   └── workflows/
├── app/
│   ├── auth/
│   ├── onboarding/
│   ├── shell/
│   ├── home/
│   ├── plan/
│   ├── insights/
│   ├── explore/
│   ├── profile/
│   ├── track/
│   └── workflows/
├── intelligence/
│   ├── contracts/
│   ├── discovery/
│   ├── evidence/
│   ├── state/
│   ├── prioritization/
│   ├── planning/
│   ├── interventions/
│   ├── outcomes/
│   └── safety/
├── assets/
├── admin/
├── supabase/
├── tests/
└── docs/
```

Static-hosting entry pages may remain at root when they are genuine deployment routes. Business logic should not live there when a canonical domain owns it.

## 3. Member application architecture

- `auth/` — signup, login, logout, recovery and session handling.
- `onboarding/` — account setup, Discovery orchestration, member focus confirmation, initial Plan proposal and introduction. Discovery begins with a broad opening snapshot; there is no separate canonical Baseline stage.
- `shell/` — common navigation/layout. Primary destinations are Home, Plan, Insights and Explore; Profile is avatar-accessed; Track is global.
- `home/` — today's execution surface and required member inputs.
- `plan/` — active plan, priorities/focus dimensions, interventions/actions, schedule/calendar, rationale and review state.
- `insights/` — immutable initial baseline/current state, trends, dimension details and evidence interpretation.
- `explore/` — For You, learning, saved content and professional/expert-services space.
- `profile/` — member record, history, assessments, membership, connections, settings, notifications and privacy/data.
- `track/` — speed-first capture and plan-derived quick logs.
- `workflows/` — supporting flows without a better primary owner.

The initial baseline is established as part of canonical Member State from completed Discovery evidence. It is historical state, not an independent assessment engine or onboarding stage.

## 4. Capability-donor rule

Historical root pages/scripts and candidate implementations are capability donors, not architecture. Useful behavior is merged into a canonical module, converted into durable regression coverage, isolated as a bounded experiment, or retired when superseded.

## 5. Intelligence architecture

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

Canonical chain:

Discovery -> Evidence / Member State -> Prioritization -> Planning -> Interventions -> Outcomes / Review / Learning

Safety may interrupt the chain. Alternative engines must not sit beside accepted implementations as ambiguous peers. The Discovery opening snapshot is an input surface owned by Discovery; it must not become a parallel Baseline engine.

## 6. Environment assembly

Stable, candidate development and experiments use Git refs plus distinct deployment origins. Environment configuration supplies deployment identity, backend/project/key, feature flags, telemetry labels and test namespace.

A branch-based environment model prevents source duplication while still allowing Stable Account A and Development Account B to operate simultaneously in one browser when deployed to distinct origins.

## 7. Experiments

Prefer isolated experiment/feature branches. A repository `experiments/` directory is optional and should exist only for bounded runnable work that benefits from coexistence and has no production dependency. Successful experiments promote capability and tests; rejected scaffolding is deleted.

## 8. Tests

Tests with a clear domain owner stay beside that domain. This keeps implementation and regression semantics together and is the default for canonical Intelligence and app modules.

Use a root `tests/` tree only for cross-domain/system concerns such as persistence concurrency, authentication/session isolation, end-to-end deployment readiness, shared fixtures/evals or regression cases with no natural single owner.

Important failures from old QA/adversarial harnesses become durable tests before those harnesses are retired.

## 9. Backend

Repository-owned Supabase migrations/functions/configuration belong under `supabase/`, organized by capability and environment requirements rather than duplicated application trees. If backend implementation is externally deployed and not repository-owned, the repository must still retain its canonical contract and an appropriate verification path.

## 10. Documentation

`docs/` contains only current operational/technical authority. Historical reviews, migration maps, completed validation ledgers and superseded architecture documents belong in Git history rather than the live tree.

Cleanup-control documents are temporary and should delete themselves once their acceptance criteria are met.

## 11. Root acceptance rule

A root artifact survives only when it is one of:
- repository/deployment metadata;
- a genuine static-hosting/deployment entry route;
- an unavoidable top-level client/configuration boundary;
- a temporary compatibility surface with an explicit retirement dependency.

Everything else should have a canonical domain owner.

## 12. Completion criteria

The repository reaches target state when:
1. accepted behavior has one obvious owner;
2. no production path depends on retired/development/experiment implementations;
3. canonical QA is green;
4. unique legacy QA value has durable ownership;
5. the root contains no unexplained historical implementation files;
6. current documentation describes the tree that actually exists;
7. stable and candidate deployments can be isolated by branch/configuration without source duplication.
