# EL8 Canonical Architecture Cleanup

Status: active reduction pass

## Canonical MVP loop

Baseline / Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment

Safety may interrupt ordinary flow at any point.

## Authority rule

Each decision has one canonical owner:
- Discovery: gather decision-changing evidence.
- Member State: durable member truth and provenance boundary.
- Prioritization: decide what matters now.
- Planning: choose bounded feasible interventions and review rules.
- Review: interpret outcome evidence and decide continue/adapt/reassess.
- Safety: determine safety interruption/escalation semantics.
- Persistence: store/reload canonical Member State without becoming a decision authority.

## Reduction classification

Every executable repository artifact must be classified as one of:
1. CANONICAL — directly implements the loop or canonical contracts.
2. DEPENDENCY — required by a canonical implementation but owns no competing decision.
3. QA — validates canonical behavior and contains no production decision authority.
4. TRANSITIONAL — temporary compatibility boundary with a named canonical replacement and deletion condition.
5. OBSOLETE — duplicate, superseded, unreachable, or historical executable machinery; delete after unique behavioral coverage is preserved.

Historical implementations belong in Git history, not as indefinitely executable parallel architecture.

## Deletion gates

Before deleting an obsolete artifact:
- identify all imports/callers;
- preserve any unique behavioral invariant in canonical QA;
- remove or migrate consumers;
- run relevant focused tests;
- run Canonical Repository QA.

A transitional adapter is not permanent architecture. It must document what consumes it and the condition that permits deletion.

## Completed reduction boundaries

- Adaptive onboarding Planning bridge retired after its selection/deepening, priority-override, activation-readiness, rejection/adaptation, capacity and accelerated E2E invariants moved to canonical Member State / Planning QA.
- Canonical activation readiness now lives under `intelligence/planning/activation-readiness.js`.
- Distinct Baseline → Discovery onboarding boundary tests remain; they do not own intervention selection.

## Current cleanup order

1. Trace executable modules reachable from the canonical Member State loop.
2. Audit remaining legacy Planning projections, aliases, action-ID translations, and old intervention-routing machinery.
3. Audit duplicate Review/adaptation machinery.
4. Audit old Discovery handoffs/contracts now superseded by Member State.
5. Audit root-level and profile/browser QA harnesses for duplicate coverage.
6. Delete obsolete modules in small reviewable boundaries.
7. Remove transitional adapters once all consumers are canonical.
8. Reconcile README/intelligence documentation to the final executable graph.

## Completion criteria

Architecture cleanup is complete when:
- one implementation owns each canonical decision;
- no executable legacy implementation competes with canonical authority;
- every remaining transitional adapter has an explicit deletion condition;
- canonical QA covers the behavioral invariants retained from deleted code;
- the repository dependency graph matches the documented MVP loop;
- Canonical Repository QA passes on the reduced repository.
