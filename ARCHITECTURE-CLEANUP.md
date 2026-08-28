# EL8 Canonical Architecture Cleanup

Status: final verification pass

## Canonical MVP loop

Baseline / Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment

Safety may interrupt ordinary flow at any point.

## Authority rule

Each decision has one canonical owner:
- Discovery: gather decision-changing evidence.
- Member State: durable member truth and provenance boundary.
- Prioritization: decide what matters now and preserve member agency.
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

Historical implementations belong in Git history or an explicitly non-authoritative reference area, not as indefinitely executable parallel architecture.

## Deletion gates

Before deleting an obsolete artifact:
- identify all imports/callers;
- preserve any unique behavioral invariant in canonical QA;
- remove or migrate consumers;
- run relevant focused tests;
- run Canonical Repository QA.

A transitional adapter is not permanent architecture. It must document what consumes it and the condition that permits deletion.

## Completed reduction boundaries

- Retired the adaptive onboarding Planning bridge and legacy Planning engine after selection/deepening, priority override, activation readiness, rejection/adaptation, capacity and accelerated E2E invariants moved to canonical Planning QA.
- Retired legacy reassessment Discovery bridges, persistence client and dead browser reassessment route; focused reassessment is now a Review routing decision back into canonical Discovery.
- Removed hidden baseline-to-plan database automation so Baseline cannot bypass Discovery and Prioritization.
- Canonical browser Planning now consumes Discovery evidence through Member State with revision-safe persistence.
- Canonical plan activation is retry-safe across partial completion failures and page reloads.
- Canonical plan result → Member State persistence preserves stale-write protection and review metadata.
- Review consumes canonical Planning metadata and owns adaptation routing.
- Canonical activation readiness lives under `intelligence/planning/activation-readiness.js`; plan-specific requirements are applied by canonical Planning.
- Member-facing Prioritization uses qualitative evidence support; numeric confidence remains internal evidence metadata rather than a member-facing decision threshold.
- Consolidated duplicate Canonical Repository QA into `.github/workflows/qa.yml`.
- Preserved accelerated browser E2E QA and the persistence concurrency/idempotency harness because they validate distinct canonical boundaries.
- Retired the obsolete public Intelligence Test deployment/runtime client while preserving historical Intelligence Test material as non-authoritative reference evidence for Discovery design.

## Final verification order

1. Verify no executable legacy Planning, reassessment, retired RPC or duplicate QA references remain reachable.
2. Verify every remaining Planning/Discovery/Review adapter has a current canonical consumer and no competing decision authority.
3. Reconcile README and intelligence documentation with the final executable graph.
4. Run Canonical Repository QA on the reconciled repository.
5. Run the accelerated browser E2E QA manually across keep, replace, simplify, deepen, reassess and safety-hold scenarios before declaring the cleanup complete.

## Completion criteria

Architecture cleanup is complete when:
- one implementation owns each canonical decision;
- no executable legacy implementation competes with canonical authority;
- every remaining transitional adapter has an explicit deletion condition;
- canonical QA covers the behavioral invariants retained from deleted code;
- the repository dependency graph matches the documented MVP loop;
- historical reference material is clearly non-authoritative and cannot silently execute as production architecture;
- Canonical Repository QA passes on the reduced repository;
- accelerated browser E2E QA confirms the canonical loop can be exercised without waiting for real review windows.
