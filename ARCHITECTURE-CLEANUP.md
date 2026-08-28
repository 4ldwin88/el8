# EL8 Canonical Architecture Cleanup

Status: final prototype/document reconciliation

## Canonical MVP loop

Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment

Safety may interrupt ordinary flow at any point.

Discovery begins with the broad life-status snapshot retained from the former Baseline questionnaire. The snapshot is evidence collection inside Discovery. It is not a separate canonical stage. Canonical Member State establishes the immutable initial baseline from completed Discovery evidence and confirmed focus.

## Authority rule

Each decision has one canonical owner:
- Discovery: gather decision-changing evidence, including the opening broad snapshot.
- Member State: durable member truth/provenance boundary and immutable initial baseline snapshot.
- Prioritization: decide what matters now, subject to explicit member confirmation.
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

Historical implementations belong in Git history, not as indefinitely executable parallel architecture. Historical Intelligence Test material is reference evidence only and must not become a competing production authority.

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
- Separate Baseline member routing has been retired. The useful opening matrix is now the first Discovery surface, while legacy baseline-named adapters remain only where needed to read/migrate existing evidence shapes.

## Final verification

1. Confirm every member route enters Discovery through `discovery-snapshot.html`, with `assessment.html` compatibility-only.
2. Confirm remaining baseline-named modules are bounded evidence-shape compatibility adapters, not a parallel assessment or decision engine.
3. Confirm browser/profile QA routes validate the canonical loop rather than implementing competing decisions.
4. Confirm member-facing stage labels and copy consistently show Discovery → Focus → Plan.
5. Run Canonical Repository QA on the final reconciled head.
6. Run accelerated manual browser E2E from the tester QA menu before declaring cleanup complete.

## Completion criteria

Architecture cleanup is complete when:
- one implementation owns each canonical decision;
- no executable legacy implementation competes with canonical authority;
- every remaining transitional adapter has an explicit deletion condition;
- canonical QA covers the behavioral invariants retained from deleted code;
- the repository dependency graph matches the documented MVP loop;
- Canonical Repository QA passes on the reconciled repository;
- accelerated browser E2E QA can traverse the canonical loop without requiring real-time waiting.
