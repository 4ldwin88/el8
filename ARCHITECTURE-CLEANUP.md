# EL8 Canonical Architecture Cleanup

Status: final prototype/document reconciliation

## Canonical MVP loop

Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment

Safety may interrupt ordinary flow at any point.

Discovery begins directly with broad, human orientation about what matters to the member and adapts from the evidence they provide. It does not require an opening life-domain matrix. A lightweight coverage check may be used later only when needed to resolve meaningful uncertainty; it must not define member priorities. Canonical Member State establishes the immutable initial baseline from completed Discovery evidence before Prioritization or any member priority decision.

## Authority rule

Each decision has one canonical owner:
- Discovery: gather decision-changing evidence, beginning with broad member context and adapting toward relevant concerns, drivers, constraints and desired outcomes.
- Member State: durable member truth/provenance boundary and immutable initial baseline snapshot.
- Prioritization: decide what matters now; member decisions about proposed priorities are recorded separately and may include no accepted priority.
- Planning: choose bounded feasible interventions and review rules for accepted priorities. Planning is not entered when the member chooses no active priority/plan.
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
- Separate Baseline member routing has been retired. Fresh member and QA routes enter adaptive Discovery directly; legacy baseline-named adapters remain only where needed to read/migrate existing evidence shapes.

## Final verification

1. Confirm every fresh member and QA route enters adaptive Discovery directly, with `assessment.html` compatibility-only.
2. Confirm remaining baseline-named modules are bounded evidence-shape compatibility adapters, not a parallel assessment or decision engine.
3. Confirm browser/profile QA routes validate the canonical loop rather than implementing competing decisions.
4. Confirm member-facing stage labels and copy consistently show Discovery → Focus → Plan.
5. Confirm any broad domain coverage check is optional/later evidence collection and cannot define priorities or precede the broad human Discovery opening.
6. Run Canonical Repository QA on the final reconciled head.
7. Run accelerated manual browser E2E from the tester QA menu on the exact deployed candidate before declaring cleanup complete.

## Completion criteria

Architecture cleanup is complete when:
- one implementation owns each canonical decision;
- no executable legacy implementation competes with canonical authority;
- every remaining transitional adapter has an explicit deletion condition;
- canonical QA covers the behavioral invariants retained from deleted code;
- the repository dependency graph matches the documented MVP loop;
- Canonical Repository QA passes on the reconciled repository;
- accelerated browser E2E QA can traverse the canonical loop without requiring real-time waiting.
