# EL8 Repository Governance

Status: Authoritative repository, branch, build, promotion, cleanup, and maintenance policy  
Reconciled: 2026-08-26

## Purpose

This document governs how EL8 code is organized, isolated, tested, promoted, and retired. It also prevents the repository from returning to a state with dozens of stale branches, parallel implementations, abandoned PRs, or unclear build authority.

Source directories represent product domains. Build state is represented by Git refs and deployment environments, never by duplicated `stable/` and `development/` source trees. Git history is the default archive.

## 1. Current lifecycle state

EL8 currently has a **Working Prototype**. It does **not** yet have a declared Stable Build.

Until the Stable/Development split is formally activated:

- `main` is the canonical working prototype and the only permanent branch.
- All implementation work occurs on short-lived branches created from current `main`.
- A branch is merged only after applicable gates pass.
- The branch is deleted after merge or rejection.
- A working prototype is not automatically considered stable or production-ready.

The current prototype may contain known product, UX, validation, infrastructure, and operational work still to be completed. Those issues belong in planned development; they are not a reason to create permanent alternate branches.

## 2. Future permanent build model

When EL8 reaches the agreed release-readiness threshold, activate two persistent build lines:

### Stable
The accepted release line. Stable must be independently deployable and boring by design: accepted behavior only, no speculative development, no experimental fixes, and no incomplete migrations.

### Development
The coherent next-build integration line. Development may contain accepted-in-progress work intended for the next Stable release. It must remain deployable and reasonably healthy; it is not a dumping ground for arbitrary experiments.

### Feature / fix / experiment branches
Short-lived branches created from Development once the split exists. They contain one bounded objective and return to Development through a PR after validation.

The permanent flow becomes:

```text
feature / fix / experiment
        ↓
   isolated validation
        ↓
     Development
        ↓
 candidate regression + integration validation
        ↓
 human / independent validation when warranted
        ↓
 release-readiness decision
        ↓
       Stable
```

Stable and Development use the same canonical source architecture. Environment differences are configuration and deployment concerns.

## 3. Promotion principle

EL8 follows **develop first, prove second, promote third**.

No change is experimented on Stable. A proposed change is developed away from Stable, validated against its own acceptance criteria, integrated into Development, tested as part of the coherent candidate build, and only then promoted to Stable.

A failed gate stops promotion. The response is to fix, revise, or reject the candidate—not to weaken the gate merely to make it pass.

Emergency Stable fixes, once Stable exists, use a short-lived hotfix branch from Stable, receive the smallest applicable gate set plus regression protection, merge to Stable, and are immediately reconciled back into Development so the lines cannot silently diverge.

## 4. Stable activation gate

Do not create a permanent Stable/Development split prematurely. Activate it when all of the following are true:

1. The working prototype has a coherent MVP/release scope.
2. Core onboarding and primary member workflows function end-to-end.
3. Canonical persistence and authentication/session behavior are reliable.
4. Safety-critical behavior has durable tests and required human review.
5. Canonical Repository QA is green.
6. Focused domain regressions are green.
7. Required live-backend/persistence checks pass.
8. A representative human-validation round has no unresolved release-blocking defects.
9. Stable and Development can deploy to distinct origins/configuration.
10. Rollback/recovery procedure is defined.

Passing one or several gates does not independently confer Stable status. Stable is an explicit release decision after the complete gate set is satisfied.

## 5. Branch protocol

### Permanent branches
Current prototype phase: `main` only.

Future release phase: Stable release branch plus one Development integration branch. Exact names should be chosen once and then remain fixed; do not accumulate aliases such as `dev2`, `stable-old`, `candidate-final`, etc.

### Temporary branch naming
Use one of:

- `feat/<short-purpose>`
- `fix/<short-purpose>`
- `experiment/<short-purpose>`
- `docs/<short-purpose>`
- `hotfix/<short-purpose>` — only after Stable exists

Do not use personal-name branch families, version graveyards, numbered retry branches, `final-final`, or branches whose purpose cannot be inferred from the name.

### Branch limits

- One branch per bounded objective.
- Reuse the active branch for corrections to that same objective instead of creating retry branches.
- Do not create a new branch merely because CI failed.
- Do not leave completed branches after merge.
- Do not keep rejected experiments as branches; Git history/closed PRs are sufficient.
- Before starting work, check whether an active branch already owns the objective.

### Branch exit rule
Every temporary branch must end in exactly one state:

1. **MERGED** — accepted through PR and gates; delete branch.
2. **REJECTED** — close PR/document reason if useful; delete branch.
3. **ACTIVE** — current bounded work with a clear next action.

There is no permanent `stale`, `maybe later`, or `archive` branch state.

## 6. Pull request protocol

Every material implementation branch should have one PR representing its objective. Keep corrections on that PR until it passes or is rejected.

A PR should state:

- problem/objective;
- intended behavior;
- affected contracts or architecture;
- tests/regressions added;
- required gates;
- migration/backend implications;
- human validation required, if any.

Draft PRs are temporary working surfaces, not storage. Once superseded or abandoned, close them. After merge, delete the source branch.

## 7. Gate hierarchy

Use the smallest gate set that is sufficient, but never skip a gate relevant to the risk.

### Level A — local/domain
Focused unit/contract tests for the changed owner.

### Level B — canonical repository
`npm test` / Canonical Repository QA and applicable focused workflows.

### Level C — integration/live
Authentication, persistence, Supabase, deployment, concurrency, migration, or environment checks where mocked tests are insufficient.

### Level D — human/independent
Required for material onboarding, Discovery, planning, safety, major UX, or release-candidate behavior where technically correct code may still produce a poor or misleading experience.

### Stable promotion
A release candidate must pass all gates designated for that release and have no unresolved release blockers.

## 8. Runtime isolation

Stable and Development must eventually support simultaneous authenticated use in the same browser with different accounts. Because browser authentication persistence is origin-scoped, stable and candidate deployments require distinct origins.

Required future topology:

```text
Stable       -> stable deployment origin
Development  -> development/preview origin
Experiment   -> isolated preview when authentication is required
```

Environment identity, backend URL/key, feature flags, telemetry labels, and test namespace are configuration concerns. Before production-sensitive work, Stable and Development backend environments should be independently controllable.

## 9. Repository architecture

```text
/
├── README.md
├── package.json
├── .github/workflows/
├── app/
├── intelligence/
├── assets/
├── admin/                 # when required
├── supabase/              # repository-owned backend source/config
├── tests/                 # cross-domain/system validation
└── docs/                  # current technical authority only
```

The root remains deployment-oriented and small. Shared implementation belongs in its domain owner. Temporary reports, scripts, experiments, screenshots, exports, generated files, and migration notes do not belong in root merely because it is convenient.

## 10. Source strategy

There is one canonical source location for each accepted capability. Branches may diverge temporarily, but permanent duplicated application trees by environment are prohibited.

For artifacts under review:

- **KEEP** — canonical and useful.
- **MERGE** — useful behavior belongs inside an existing owner.
- **MIGRATE** — useful but incorrectly located.
- **HOLD** — temporary live dependency prevents safe movement; must have an exit condition.
- **RETIRE** — superseded or valueless after behavior/tests are preserved.

No file is retained merely because it existed before.

## 11. Product and intelligence architecture

Primary member architecture: Home, Plan, Insights, Explore; Profile through avatar; Track as global capture action. Authentication, onboarding, Universal Baseline, Discovery, check-ins, history, safety, privacy/data, and similar flows are supporting workflows.

Canonical intelligence chain:

`Discovery → Evidence / Member State → Prioritization → Planning → Interventions → Outcomes / Learning`

Safety may interrupt normal routing through the canonical Safety contract. Alternative intelligence remains isolated until accepted.

## 12. Testing ownership

Prefer domain-local tests when a test protects one owner. Use `tests/` for cross-domain persistence, authentication/session isolation, fixtures/evals, deployable-build smoke checks, and validation without a natural single owner.

A defect found during live or human testing should receive a regression test when the behavior can be durably automated. Do not repeatedly rediscover the same failure manually.

## 13. Backend and migration protocol

Backend schema/function changes are first-class code changes even when applied directly through Supabase tooling.

For every material backend change:

1. preserve the invariant being protected unless the invariant itself is intentionally changed;
2. prefer migration/supersession over destructive deletion of member history;
3. update repository-owned persistence contracts/migrations where applicable;
4. test against the live development backend when mocks cannot prove correctness;
5. ensure Stable is not silently depending on an untracked development-only backend mutation once Stable exists.

## 14. Documentation protocol

README is the short entry point. This governance document is authoritative for repository lifecycle. Architecture and persistence documents own their respective contracts.

Update documentation in the same change whenever a change modifies:

- canonical architecture;
- branch/build lifecycle;
- persistence contract;
- release/promotion gates;
- deployment/environment model;
- safety authority.

Delete completed cleanup plans and obsolete migration narratives after their durable rules are absorbed into authoritative documents.

## 15. Repository hygiene protocol

Run a hygiene pass at the end of each substantial work cycle and before Stable promotion.

Check:

- branch list;
- open/draft PRs;
- root-directory clutter;
- duplicate implementations;
- obsolete compatibility files;
- temporary QA harnesses;
- outdated documentation;
- workflows no longer protecting canonical code;
- backend changes not represented by current contracts/migrations.

Expected branch state during the current prototype phase is normally `main` plus only the few branches actively being worked on. After a work item merges, return to `main` only whenever no other objective is active.

## 16. Cleanup and archive rule

Git history is the archive. Repository archive folders and archive branches are exceptional, not normal. Before destructive changes, assign KEEP, MIGRATE, MERGE, HOLD, or RETIRE. RETIRE is preferred when Git history provides sufficient recovery.

Bring forward capabilities, not historical layouts.

## 17. Decision authority

The lifecycle hierarchy is:

1. Stable release contract, once activated.
2. Development integration contract, once activated.
3. This repository governance document.
4. Domain-specific technical contracts.
5. Individual implementation artifacts.

If implementation behavior contradicts an authoritative contract, reconcile the implementation or explicitly update the contract; do not allow both versions to remain silently authoritative.
