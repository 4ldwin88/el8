# EL8 Canonical Architecture Cleanup

Status: final verification pass

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

Historical implementations belong in Git history, not as indefinitely executable parallel architecture. Historical Intelligence Test material retained in `intelligence-test/` is reference evidence only: its public deployment workflow and legacy Supabase RPC client are retired, so it is not a competing production authority.

## Deletion gates

Before deleting an obsolete artifact:
- identify all imports/callers;
- preserve any unique behavioral invariant in canonical QA;
- remove or migrate consumers;
- run relevant focused tests;
- run Canonical Repository QA.

A transitional adapter is not permanent architecture. It must document what consumes it and the condition that permits deletion.

## Completed reduction boundaries

- Adaptive onboarding Planning and initial-plan bridges retired after their selection/deepening, priority-override, activation-readiness, rejection/adaptation, capacity and accelerated E2E invariants moved to canonical Member State / Planning QA.
- Legacy reassessment Planning/Discovery bridges, persistence client and dead browser route retired; Review now routes adaptation/reassessment through canonical boundaries.
- Browser Planning consumes canonical Discovery evidence, persisted Member State revision and canonical Planning output; activation is retry-safe across partial failure and reload.
- Canonical plan persistence is revision-safe and Review consumes canonical Planning measurement/review metadata.
- Legacy Planning scenario parity (P01–P08, mechanism discrimination, activation deepening, review window and adaptation behavior) is covered by canonical QA.
- Member-facing prioritization uses qualitative evidence-support semantics; numeric confidence remains internal evidence metadata rather than a member-facing decision threshold.
- Duplicate canonical QA workflow and obsolete public Intelligence Test deployment/runtime client retired.
- Canonical activation readiness lives under `intelligence/planning/activation-readiness.js`.
- Distinct Baseline → Discovery onboarding boundary tests remain; they do not own intervention selection.

## Remaining verification

1. Run repository-wide stale-reference searches for retired Planning/reassessment/RPC names and competing threshold logic.
2. Confirm remaining browser/profile QA routes are either canonical QA or deliberate dependencies rather than parallel decision engines.
3. Reconcile README/intelligence documentation where it still describes retired executable surfaces.
4. Run Canonical Repository QA on the final reduced head.
5. Run the accelerated manual browser E2E flow from the tester QA menu before declaring the cleanup complete.

## Completion criteria

Architecture cleanup is complete when:
- one implementation owns each canonical decision;
- no executable legacy implementation competes with canonical authority;
- every remaining transitional adapter has an explicit deletion condition;
- canonical QA covers the behavioral invariants retained from deleted code;
- the repository dependency graph matches the documented MVP loop;
- Canonical Repository QA passes on the reduced repository;
- accelerated browser E2E QA can traverse the canonical loop without requiring real-time waiting.
