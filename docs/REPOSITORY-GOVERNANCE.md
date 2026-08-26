# EL8 Repository Governance

Status: Authoritative repository organization, environment, promotion, and maintenance policy
Reconciled: 2026-08-25

## Purpose

This document governs how EL8 code is organized, isolated, tested, promoted, and retired. Source directories represent product domains. Release state is represented by Git branches and deployment environments rather than duplicated `stable/` and `development/` source trees.

The cleanup objective is to preserve valuable working capability, converge it into one obvious canonical architecture, validate it, and delete superseded material when Git history is sufficient.

## 1. Permanent environment model

### Stable
Stable is the accepted deployable EL8 release, represented by the protected release/default branch and its stable deployment origin.

### Development
Development is an integration branch or short-lived integration branch containing the coherent candidate next release. It deploys to a distinct preview/development origin and must not require a duplicated source tree.

### Experiments
Uncertain concepts should normally live on bounded experiment branches or isolated preview work. An `experiments/` directory is permitted only when a runnable experiment genuinely benefits from coexisting with canonical source and is not a production dependency.

### Tests
Durable tests live with the domain they protect when practical. Cross-domain integration, end-to-end, fixtures, or system QA may use a dedicated `tests/` directory when that improves ownership.

### Archive / deletion
Git history is the default archive. Repository archive folders are not a substitute for deletion unless direct runnable/viewable access has continuing value.

## 2. Runtime isolation contract

Stable and Development must support simultaneous authenticated use in the same browser with different accounts. Because browser authentication persistence is origin-scoped, stable and candidate deployments require distinct origins.

Required topology:

```text
stable branch/release      -> stable deployment origin
candidate/integration      -> preview/development origin
experiment branch          -> isolated preview when authentication is required
```

Environment identity and backend configuration must be configuration-driven. Prototype environments may temporarily share a Supabase project only when browser sessions are origin-isolated and development/test records are clearly namespaced. Before production-sensitive work, backend environments should also be independently controllable.

## 3. Repository architecture

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
├── supabase/              # when backend source/config is repository-owned
├── tests/                 # only for genuinely cross-domain/system validation
└── docs/                  # current repository/technical authority only
```

The root should remain deployment-oriented and small. Compatibility entry points may exist only while a migration or static-hosting constraint requires them.

## 4. Source strategy

There is one canonical source location for each accepted capability. Branches may diverge temporarily during development, but the repository must not maintain permanent duplicated copies of the application by environment.

For legacy or candidate artifacts:
- KEEP when already canonical and useful;
- MERGE when useful behavior belongs inside an existing canonical domain;
- MIGRATE when useful but incorrectly located;
- HOLD only when a live dependency prevents safe movement;
- RETIRE when superseded or valueless after preserved behavior/tests are confirmed.

No file is retained merely because it existed before.

## 5. Product architecture

The accepted member architecture is Home, Plan, Insights and Explore as primary destinations; Profile is entered through the avatar; Track is a global capture action. Authentication, onboarding, Universal Baseline, Discovery, check-ins, history, safety, privacy/data and similar flows are supporting workflows.

Proven capabilities are merged into this architecture rather than preserving historical page topology.

## 6. Intelligence architecture

Accepted intelligence follows:

Discovery -> Evidence / Member State -> Prioritization -> Planning -> Interventions -> Outcomes / Learning

Safety may interrupt normal routing through the canonical safety contract. Alternative intelligence belongs on an isolated experiment branch or other non-production surface until accepted.

## 7. Promotion pipeline

```text
EXPERIMENT / FEATURE BRANCH
   -> isolated validation
   -> accepted capability
INTEGRATION / CANDIDATE BRANCH
   -> coherent regression + system validation
   -> human/independent validation when warranted
STABLE RELEASE BRANCH
```

Promotion moves commits/capability and regression protection. It does not require copying source between environment directories.

## 8. Stable rules

Stable must remain independently deployable, contain only accepted behavior, have regression protection for material behavior, use stable environment configuration, and remain operational during candidate work.

## 9. Development rules

Candidate development must be independently deployable on its own origin, represent one coherent next build rather than a dumping ground, use development configuration, and shed temporary scaffolding as work matures.

## 10. Experiment rules

Experiments must be bounded, avoid becoming hidden production dependencies, carry temporary QA only when needed, be easy to delete when rejected, and promote only accepted capability.

## 11. Testing ownership

Prefer domain-local tests such as `intelligence/safety/policy.test.js` or `app/insights/dimension-history.test.mjs` when a test protects one owner. Use `tests/` for cross-domain persistence, authentication/session isolation, fixtures/evals, deployable-build smoke checks, and other validation without a natural single owner.

Canonical repository QA must run the durable domain suites. A dual-session isolation test is required before production-sensitive environment separation is considered complete.

## 12. Backend/environment configuration

Deployment URL, environment identity, Supabase project URL/key, feature flags, telemetry labels and test-data namespace are configuration concerns, not reasons to duplicate business logic. Repository-owned backend source belongs under `supabase/`; externally deployed backend behavior must still have a documented contract and durable verification path.

## 13. Documentation policy

Keep only documentation that is current and operationally useful. Repository governance, target architecture, persistence/security contracts and current validation/release procedures may remain. Historical migration narratives, obsolete QA reports, superseded architecture documents and completed cleanup instructions should be deleted once useful decisions or tests have been absorbed.

README is the short entry point. This document is authoritative for repository lifecycle and promotion policy. `docs/repository-target-architecture.md` defines detailed target placement.

## 14. Cleanup execution order

1. Converge accepted behavior into canonical domain ownership.
2. Remove duplicated, historical and migration-only implementations after dependency checks.
3. Convert unique valuable QA behavior into durable tests before deleting harnesses.
4. Keep Canonical Repository QA and focused regression workflows green after each structural batch.
5. Reconcile documentation with implemented architecture.
6. Minimize the deployment root and remove completed cleanup-control documents.
7. Validate stable/candidate deployments and environment isolation before release-sensitive work.
8. Delete stale branches only after the canonical tree and deployments are stable.

## 15. Decision rule

Before destructive changes, affected artifacts receive an action: KEEP, MIGRATE, MERGE, HOLD or RETIRE. RETIRE is preferred over archive when Git history provides sufficient recovery.
