# EL8 Branch Audit

This file records the branch-retirement audit before the next Intelligence manual-test candidate is created.

## Rules

1. `main` is the canonical integration line, but chronology alone does not prove an implementation is best.
2. Before retiring a historical branch, verify that any uniquely useful behavior is already canonical, intentionally recovered, or recorded as a requirement for later current-architecture implementation.
3. Historical Intelligence tester/QA code is evaluated as a possible harness/requirements source, not as architectural authority.
4. Drive-defined current Intelligence contracts remain authoritative for Discovery, Member State, Prioritization, Planning, Action IDs, Safety and persistence unless a deliberate improvement is documented.
5. A branch is retained only when it backs unresolved work that is not yet reconciled. Closed PRs and old deployment candidates do not justify permanent branches.
6. Git history preserves retired implementation; branches are not archives.

## Target working set

- `main` — sole permanent canonical integration branch.
- A temporary QA/deployment branch may be created later from reconciled `main` only when an exact manual-test candidate is needed.

PR #139 and PR #142 are closed as superseded during this consolidation. Their branch refs are retirement candidates after unique useful behavior is accounted for.

## Confirmed retirement classifications

### SUPERSEDED / ALREADY CONTAINED

- `architecture/member-state-v1` — `ahead_by=0`; fully contained in `main` history.
- `feature/member-agency-reasoning-v16` — `ahead_by=0`; fully contained in `main` history.
- `fix/browser-runtime-integrity` — historical divergence; substantive browser import-smoke and review-history functionality already exists on `main`.
- `fix/canonical-plan-member-choice` — old one-line Plan assessment path; member authority is superseded by canonical Focus confirmation / Planning.
- `fix/member-plan-action-choice` — valid member-choice requirement is represented by current Plan v3 architecture; older engine/UI implementation should not be merged.
- `feature/problem-registry-plan-engine-v01` — unique commits are tied to retired problem/intervention registry architecture and old Plan engine.
- `fix/intelligence-e2e-canonical-reconciliation` — PR #139 closed; useful harness behavior selectively recovered/recorded, obsolete Baseline/problem/compatibility architecture rejected.
- `qa/intelligence-manual-candidate` — PR #142 closed; unfinished candidate is not a permanent integration line. Any canonical changes are recovered deliberately into `main` before retirement.

### REQUIREMENTS PRESERVED; OLD IMPLEMENTATION RETIRES

- `qa/accelerated-adaptation-e2e` — preserve requirement that prolonged non-response pauses progression, preserves the plan, and offers an explicit re-engagement route. Reimplement against current Review/Adaptation architecture when that loop is in scope.
- `qa/learning-persistence-e2e` — preserve requirements that later Planning learns from ineffective high-adherence Actions, successful mechanisms, and known execution barriers. Old concern/intervention/Plan-engine implementation is obsolete; reimplement using canonical Action IDs, Plan v3+, Member State and decision trace when longitudinal learning is in scope.

## Remaining audit

All other historical branches are being classified by comparison to `main`:

- `ahead_by=0` => safe retirement unless another active workstream explicitly depends on the branch ref.
- unique commits modifying retired Baseline/problem/compatibility/old-Plan architecture => superseded unless they contain a current requirement not represented elsewhere.
- unique current-architecture tests, contracts, persistence, security/governance, or production fixes => recover deliberately into `main` before retirement.
- simultaneous non-Intelligence workstream branches must not be discarded merely because they are outside this workstream; verify their work is represented first.

## Retirement categories

- **CANONICAL** — `main`.
- **RECOVER THEN RETIRE** — contains useful current implementation that must be ported first.
- **REQUIREMENT PRESERVED; RETIRE IMPLEMENTATION** — useful behavior recorded, but branch code is obsolete.
- **SUPERSEDED** — useful commits already incorporated or intentionally replaced.
- **ABANDONED EXPERIMENT** — noncanonical experiment with no unique behavior worth preserving.

## Manual-test gate

Do not create or hand off another Intelligence manual-test candidate until branch/PR reconciliation is complete. Then create a fresh temporary candidate from reconciled `main` and require exact-head repository QA, accelerated scenario/E2E coverage, deployed-route smoke verification, and machine-verifiable persistence/state-transition checks. Accidental no-plan/no-action dead ends are automated-test failures, not manual-test discoveries.
