# EL8 Clean-Build Retirement Plan

Status: ACTIVE repository cleanup strategy
Adopted: 2026-08-25
Reconciled: 2026-08-25

## Objective

Converge the repository on the smallest clean EL8 implementation that contains the approved MVP and canonical Intelligence capabilities, validate that implementation, then retire superseded historical structure in broad dependency-safe batches.

This plan replaces file-by-file preservation as the default cleanup method. Git history is the historical archive unless a retained artifact has continuing operational value.

## Source-of-truth rule

Bring forward capabilities, not legacy file layouts.

Canonical source material:
- `app/**` for accepted member-facing architecture and reusable UI behavior;
- `intelligence/contracts/**` for shared contracts;
- `intelligence/discovery/**` for Discovery;
- `intelligence/state/**` for Member State and taxonomy;
- `intelligence/prioritization/**`;
- `intelligence/planning/**`;
- `intelligence/interventions/**`;
- `intelligence/outcomes/**`;
- `intelligence/safety/**`;
- domain-local tests plus `tests/**` only for cross-domain/system validation;
- `supabase/**` when backend source/configuration is repository-owned;
- accepted shared assets;
- repository governance/architecture documentation.

Historical root implementations are not sources of truth merely because they still run. Stable, candidate Development and experiments are Git/deployment states rather than permanent duplicated source trees.

## Approved product shell

The clean build converges on:
1. Home — today's execution, EL8 requests/evidence and Quick Logs.
2. Plan — active plan, rationale, actions/interventions, schedule/calendar and review.
3. Insights — Baseline vs Current, qualitative condition, trends, relationships and dimension detail.
4. Explore — For You, Learn, Experts and Saved.
5. Profile — avatar-accessed member/account/history/settings surface.
6. Track — global speed-first capture action rather than a bottom-navigation destination.
7. Supporting workflows — account access, onboarding, Universal Baseline/reassessment, check-ins, plan review/history, safety and privacy/data.

## Canonical Intelligence chain

Discovery → Evidence/Member State → Prioritization → Planning → Interventions → Outcomes/Learning

Safety may interrupt ordinary routing through the canonical Safety contract. No aggregate wellness score, numeric dimension truth, legacy signal-score model or parallel decision engine is carried forward.

## Build strategy

### Phase 1 — Freeze the keep-set
Use canonical domain directories as the default keep-set. New accepted work goes only into target architecture locations. Candidate work is isolated by branch and deployment when necessary.

### Phase 2 — Complete the canonical member shell
Make deployment entry routes consume `app/**` modules and shared assets. Rebuild useful legacy behavior when necessary rather than preserving legacy page architecture.

### Phase 3 — Complete supporting workflows
Bring only required onboarding, assessment, check-in, safety, history and account behavior into the appropriate canonical feature directory.

### Phase 4 — Canonical validation
The clean build must pass repository QA, Discovery regression, critical persistence/auth checks and member-route smoke validation. Durable domain tests stay beside their owners; genuinely cross-domain/system tests may live under `tests/`.

### Phase 5 — Broad retirement
After the clean build proves required behavior, retire superseded root pages/scripts, old QA harnesses, experiments, migration-era helpers and duplicate implementations in broad batches. Preserve only external compatibility routes that are still intentionally supported.

### Phase 6 — Final tree normalization
The root contains only deployment-required entry files and repository metadata. Permanent implementation belongs in canonical directories. Git branches/deployments provide release-state isolation. Git history replaces repository archaeology.

## Retirement test

A historical artifact can be retired when all are true:
1. Its required capability exists canonically or is explicitly rejected.
2. Canonical code does not import or link to it.
3. CI/deployment does not require it, except an intentionally retained compatibility route.
4. Unique durable test coverage has been represented canonically.
5. Required validation passes after removal.

We do not require preservation of every old implementation detail.

## Execution priority

1. Canonical member shell and routes.
2. Account/onboarding/baseline path required to reach the shell.
3. Home + Track shared evidence behavior.
4. Plan.
5. Insights.
6. Explore.
7. Profile.
8. Supporting assessment/check-in/history/safety workflows.
9. Backend/persistence verification.
10. Broad legacy retirement.
11. Final documentation, deployment verification and branch cleanup.

## Definition of done

Repository cleanup is complete when:
- there is one obvious implementation for each approved capability;
- root is small and deployment-oriented;
- canonical production paths do not depend on historical or experimental engines;
- canonical Intelligence and Safety semantics are used end-to-end;
- Stable and candidate Development can be independently deployed/authenticated through branches/configuration and distinct origins;
- required automated/regression/smoke gates pass;
- unique persistence/auth/QA behavior has durable test ownership;
- superseded implementation clutter has been retired rather than indefinitely archived.

Delete this plan when those conditions are satisfied and its continuing rules are fully represented by repository governance, target architecture and durable tests.
