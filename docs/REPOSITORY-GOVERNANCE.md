# EL8 Repository Governance

Status: Authoritative repository organization, environment, promotion, and maintenance policy
Reconciled: 2026-08-25

## Purpose

This document governs how EL8 code is organized, isolated, tested, promoted, and retired. The repository is treated like an operational product organization: Stable is protected, Development is the integration environment for unfinished candidate builds, and Experiments are independent laboratories for uncertain ideas.

The cleanup objective is not to preserve historical layouts. It is to preserve valuable working capability from the old prototype, merge accepted capability into the new MVP architecture, validate it, and delete superseded material when Git history is sufficient.

## 1. Permanent environment model

### Stable
Stable is the accepted, maintained EL8 build. It contains only promoted product behavior and must remain usable while Development changes independently. Stable must never depend on Development or Experiments.

### Development
Development is the integrated unfinished EL8 build. Candidate features that have passed isolated experimentation are combined here and tested as a coherent next release. Development may depend on Stable contracts but must not mutate Stable runtime state.

### Experiments
Experiments are isolated workspaces for new concepts, prototypes, research spikes, adversarial testing, alternative UX, new intelligence behavior, and other work not yet accepted into Development. Experiments should be bounded and disposable. Successful work is promoted by capability, not by copying an entire experimental tree.

### Tests
`tests/` contains durable validation shared across the product lifecycle. Experiment-specific disposable harnesses stay with their experiment until they earn permanent regression value.

### Archive / deletion
Git history is the default archive. Keep repository archive material only when direct runnable/viewable access has continuing value. Otherwise retire obsolete files after dependency and validation checks.

## 2. Runtime isolation contract

Stable and Development must support simultaneous authenticated use in the same browser with different accounts.

A path-only split on one hostname is not sufficient because browser authentication persistence is origin-scoped. Stable and Development therefore require distinct deployed origins.

Required topology:

```text
Stable source       -> stable deployment origin       -> Stable Account A
Development source  -> development deployment origin  -> Development Account B
Experiments         -> isolated preview/origin when authentication is required
```

Rules:
1. Stable and Development must use different browser origins.
2. Environment identity and backend configuration must be configuration-driven, not implemented through duplicated business logic.
3. During prototype development Stable and Development may temporarily share a Supabase project only when browser sessions are origin-isolated and development/test records are clearly namespaced.
4. Before production-sensitive work, Stable and Development should use separate backend projects/environments.
5. A permanent integration/QA check must verify Stable Account A remains signed in while Development Account B signs in and operates independently.
6. Experimental authenticated surfaces must not overwrite Stable or Development browser sessions.

## 3. Repository architecture

```text
/
├── README.md
├── package.json
├── .github/
│   └── workflows/
├── stable/                         # deployable accepted EL8 build
│   ├── app/
│   ├── intelligence/
│   ├── assets/
│   ├── admin/
│   └── config/
├── development/                    # deployable integrated next EL8 build
│   ├── app/
│   ├── intelligence/
│   ├── assets/
│   ├── admin/
│   └── config/
├── experiments/                    # independent bounded laboratories
│   ├── discovery/
│   ├── assessments/
│   ├── check-ins/
│   ├── interventions/
│   └── sandbox/
├── tests/                          # durable cross-environment validation
│   ├── unit/
│   ├── integration/
│   ├── cases/
│   ├── evals/
│   ├── regressions/
│   └── qa/
├── supabase/                       # backend source/configuration
│   ├── stable/
│   ├── development/
│   └── shared/
└── docs/                           # current repository/technical authority only
```

The final root should remain small. Temporary compatibility entry points may exist only while deployment migration requires them.

## 4. Source strategy

Stable and Development are deployable environment assemblies, not permission to maintain two unrelated applications forever. Shared accepted modules should be factored so fixes are not manually duplicated where practical. Environment-specific configuration, routing, feature availability, and deployment wiring may differ.

During this cleanup, the old working prototype is a capability donor. For every old file or behavior:
- KEEP when already canonical and useful;
- MERGE when useful behavior belongs inside the MVP architecture;
- MIGRATE when useful but incorrectly located;
- HOLD only when a live dependency prevents safe movement;
- RETIRE when superseded or valueless after preserved behavior/tests are confirmed.

No file is retained merely because it existed before.

## 5. Product architecture

The accepted member architecture is Home, Plan, Insights and Explore as primary destinations; Profile is entered through the avatar; Track is a global capture action. Authentication, onboarding, Universal Baseline, Discovery, check-ins, history, safety, privacy/data and similar flows are supporting workflows.

The MVP shell is the structural destination. Proven working functions from the old prototype are merged into that architecture rather than preserving the old page topology.

## 6. Intelligence architecture

Accepted intelligence follows:

Discovery -> Evidence / Member State -> Prioritization -> Planning -> Intervention -> Outcomes / Learning

Safety may interrupt normal routing through an accepted safety contract.

Experimental intelligence stays under `experiments/` until validated. Development integrates candidate intelligence with the candidate member build. Stable receives only promoted behavior and regression coverage.

## 7. Promotion pipeline

```text
EXPERIMENT
   -> isolated validation
   -> accepted capability
DEVELOPMENT
   -> integration + synthetic/regression validation
   -> independent/human validation when warranted
   -> release gate
STABLE
   -> ongoing regression protection
```

Promotion moves capability, contracts and useful regression cases. It does not preserve experimental scaffolding.

## 8. Stable rules

Stable must:
- remain independently deployable;
- have no runtime dependency on Development or Experiments;
- contain only accepted member and intelligence behavior;
- have regression coverage for material promoted behavior;
- use stable environment configuration;
- remain operational during Development work.

## 9. Development rules

Development must:
- be independently deployable on its own origin;
- represent one coherent candidate next build, not a dumping ground;
- integrate the new MVP shell with preserved proven prototype functions;
- use development environment configuration;
- tolerate unfinished candidate behavior without destabilizing Stable;
- shed temporary scaffolding as features mature.

## 10. Experiment rules

Experiments must:
- be independently scoped;
- avoid becoming hidden production dependencies;
- carry their own temporary UI/QA when needed;
- be easy to delete when rejected;
- promote only accepted capability into Development.

Discovery currently remains experimental/candidate work until its validation gates justify Development integration and eventual Stable promotion.

## 11. Testing ownership

- `tests/unit/` — accepted module validation.
- `tests/integration/` — cross-domain, persistence, auth and environment validation.
- `tests/cases/` — canonical fixtures/cases.
- `tests/evals/` — evaluation runners and acceptance logic.
- `tests/regressions/` — failures that must never recur.
- `tests/qa/` — durable readiness/UI/system checks.

The dual-session isolation test is mandatory before the environment migration is complete.

## 12. Backend/environment configuration

Environment-specific values include deployment URL, environment identity, Supabase project URL/key, feature flags, telemetry labels and test-data namespace. They must be supplied through environment configuration.

Stable and Development backend migrations must become independently controllable before production-sensitive development. Shared schema/contracts may be maintained under `supabase/shared/` where genuinely common.

## 13. Documentation policy

Keep only documentation that is current and operationally useful. Repository governance, architecture, persistence/security contracts and current validation/release procedures may remain. Historical migration narratives, obsolete QA reports, superseded architecture documents and completed cleanup instructions should be deleted once their useful decisions or tests have been absorbed.

README is the short entry point. This document is authoritative for environment lifecycle and promotion policy. `docs/repository-target-architecture.md` defines detailed target placement.

## 14. Cleanup execution order

1. Lock this environment model and target tree.
2. Inventory every current file and dependency.
3. Build a capability map of the old working prototype: preserve behavior, not layout.
4. Establish the deployable Development MVP shell and merge preserved functions into it.
5. Establish Stable and Development configuration/origin boundaries and verify dual sessions.
6. Separate independent experimental initiatives from Development.
7. Consolidate durable tests and CI.
8. Promote the validated build into Stable.
9. Remove superseded root pages, helpers, QA harnesses and obsolete documents in broad verified batches.
10. Run full regression, smoke, auth/session and deployment validation.
11. Delete stale branches only after the tree and deployments are stable.

## 15. Decision rule

Before any destructive batch, every affected artifact receives an action: KEEP, MIGRATE, MERGE, HOLD or RETIRE. RETIRE is preferred over archive when Git history already provides sufficient recovery.
