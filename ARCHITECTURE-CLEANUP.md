# EL8 Canonical Architecture Cleanup

Status: final prototype/document reconciliation

## Canonical MVP loop

Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment

Safety may interrupt ordinary flow at any point.

Discovery begins with the broad life-status snapshot as evidence collection inside Discovery. It is not a separate canonical stage. Canonical Member State establishes the initial baseline from completed Discovery evidence and confirmed focus.

## Authority rule

Each decision has one canonical owner:
- Discovery: gather decision-changing evidence, including the opening broad snapshot.
- Member State: durable member truth/provenance boundary and initial baseline snapshot.
- Prioritization: decide what matters now, subject to explicit member confirmation.
- Planning: choose bounded feasible interventions and review rules.
- Review: interpret outcome evidence and decide continue/adapt/reassess.
- Safety: determine safety interruption/escalation semantics.
- Persistence: store/reload canonical Member State without becoming a decision authority.

## Repository classification

Every executable repository artifact must be classified as one of:
1. CANONICAL — directly implements the loop or canonical contracts.
2. DEPENDENCY — required by a canonical implementation but owns no competing decision.
3. QA — validates canonical behavior and contains no production decision authority.
4. OBSOLETE — duplicate, superseded, unreachable, or historical executable machinery; delete after unique behavioral coverage is preserved.

Historical implementations belong in Git history, not as executable parallel architecture. Historical Intelligence Test material is reference evidence only and must not become a competing production authority.

## Deletion gates

Before deleting an obsolete artifact:
- identify all imports/callers;
- preserve any unique behavioral invariant in canonical QA;
- remove or migrate consumers;
- run relevant focused tests;
- run Canonical Repository QA.

Current EL8 development does not preserve obsolete interfaces or evidence shapes for backward compatibility. When a boundary translation is required by the current architecture, it must translate between current canonical layers rather than emulate retired behavior.

## Completed reduction boundaries

- Adaptive onboarding Planning and initial-plan bridges retired after their selection/deepening, priority-override, activation-readiness, rejection/adaptation, capacity and accelerated E2E invariants moved to canonical Member State / Planning QA.
- Retired reassessment Planning/Discovery bridges, persistence client and dead browser route removed; Review routes adaptation/reassessment through canonical boundaries.
- Browser Planning consumes canonical Discovery evidence, persisted Member State revision and canonical Planning output; activation is retry-safe across partial failure and reload.
- Canonical plan persistence is revision-safe and Review consumes canonical Planning measurement/review metadata.
- Historical Planning scenario parity (P01–P08, mechanism discrimination, activation deepening, review window and adaptation behavior) is covered by canonical QA.
- Member-facing prioritization uses qualitative evidence-support semantics; numeric confidence remains internal evidence metadata rather than a member-facing decision threshold.
- Duplicate canonical QA workflow and obsolete public Intelligence Test deployment/runtime client retired.
- Canonical activation readiness lives under `intelligence/planning/activation-readiness.js`.
- Separate Baseline member routing is retired. The useful opening matrix is the first Discovery surface.
- Obsolete assessment routing and historical evidence-shape fallbacks are removed.
- Discovery concern IDs remain valid boundary vocabulary and map explicitly to canonical Member State constructs where required; this is current architecture, not backward compatibility.

## Final verification

1. Confirm every new-member route enters the canonical Discovery opening snapshot.
2. Confirm no retired Baseline/assessment implementation or historical evidence fallback remains executable.
3. Confirm browser/profile QA routes validate the canonical loop rather than implementing competing decisions.
4. Confirm member-facing stage labels and copy consistently show Discovery → Focus → Plan.
5. Confirm current boundary adapters translate only between active canonical layers.
6. Run Canonical Repository QA on the final reconciled head.
7. Run accelerated manual browser E2E from the tester QA menu before declaring cleanup complete.

## Completion criteria

Architecture cleanup is complete when:
- one implementation owns each canonical decision;
- no executable obsolete implementation competes with canonical authority;
- no backward-compatibility machinery exists solely for retired prototype data or interfaces;
- canonical QA covers the behavioral invariants retained from deleted code;
- the repository dependency graph matches the documented MVP loop;
- Canonical Repository QA passes on the reconciled repository;
- accelerated browser E2E QA can traverse the canonical loop without requiring real-time waiting.
