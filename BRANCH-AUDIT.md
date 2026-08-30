# EL8 Branch Audit

This file records the branch-retirement audit before the next Intelligence manual-test candidate is declared ready.

## Rules

1. `main` is the canonical integration line, but chronology alone does not prove an implementation is best.
2. Before retiring a historical branch, verify that any uniquely useful behavior is already canonical or intentionally recovered.
3. Historical Intelligence tester/QA code is evaluated as a possible harness source, not as architectural authority.
4. Drive-defined current Intelligence contracts remain authoritative for Discovery, Member State, Prioritization, Planning, Action IDs, Safety and persistence.
5. A branch is retained only when it backs unresolved work, a live test candidate, or unique implementation not yet reconciled.

## Current protected working set

- `main` — canonical integration source.
- `qa/accelerated-member-e2e-v2` — current pre-manual candidate branch; reset to the canonical candidate before Netlify/automated verification.
- `fix/intelligence-e2e-canonical-reconciliation` — historical PR #139 / Netlify deploy-preview-139 reference. Preserve temporarily because its tester was the most recently confirmed mostly-working Intelligence browser test.
- Any branch backing an actually open PR remains temporarily retained until the PR is reconciled or closed.

## Intelligence recovery targets

Before retirement, compare/recover as needed:

- PR #139 `intelligence-test/` browser harness and routing.
- accelerated member E2E behavior and scenario coverage.
- adaptive-plan experiment behavior that may address plan/action dead ends.
- current canonical Planning registry and Action Bank coverage.

The goal is not to restore old architecture. The goal is to preserve proven browser/test behavior while running the current canonical Intelligence implementation underneath it.

## Retirement categories

- **CANONICAL** — active integration/test branch.
- **RECOVER THEN RETIRE** — contains useful unique implementation that should be ported first.
- **OPEN WORK** — backs an unresolved PR/workstream; retain temporarily.
- **SUPERSEDED** — useful commits already incorporated or intentionally replaced; safe to retire.
- **ABANDONED EXPERIMENT** — noncanonical experiment with no unique behavior worth preserving; safe to retire.

## Manual-test gate

No Intelligence test is handed to a human tester until the exact Netlify candidate has passed automated repository QA, accelerated scenario/E2E coverage, deployed-route smoke verification, and machine-verifiable persistence/state-transition checks. Accidental no-plan/no-action dead ends are automated-test failures, not manual-test discoveries.
