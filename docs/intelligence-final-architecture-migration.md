# EL8 Intelligence final architecture migration

Authority: Drive `02.03 EL8 Operating System Architecture`, September 6, 2026 Discovery-to-Planning requirements. This repository record is an implementation map, not an independent product authority.

## Target reasoning progression

Broad Orientation -> Dynamic Area Priority -> Unified Deduplicated Driver Landscape -> Driver/Relationship Triage -> Severity & Materiality Triage -> Causal-Leverage Hypothesis Ranking -> Selective Deepening -> Member State synthesis -> Focus Recommendation/Confirmation -> Decision-Critical Additional Deepening as Needed -> Planning / Intervention Selection -> Intervention-linked Toolkit -> Action/Outcome Evidence -> Review -> Planning or Focused Reassessment.

Safety remains cross-cutting. Member State remains authoritative longitudinal truth. The reasoning model is cardinality-agnostic from one through all eight selected areas.

## Audit classification

### KEEP / STRENGTHEN
- `intelligence/registries/*`: canonical IDs, questions/answers, effects, evidence, relationships, actions and tools. These are governed knowledge assets; migrate behavior around them rather than rewriting their IDs.
- `intelligence/state/member-state-*`: authoritative member-state contract, normalization, transition and persistence.
- `intelligence/state/cross-dimensional-hypothesis.js`: salvage relationship provenance/confidence/revalidation semantics and member-edge validation. Extend into the canonical driver-graph read model rather than creating a second relationship system.
- `intelligence/safety/*`: independent deterministic control plane.
- `intelligence/planning/action-registry.js`, `discovery-planning-contract.js`, `toolkit-composition.js`: salvage governed intervention/action and Toolkit knowledge/eligibility semantics.
- `intelligence/review/*`, `intelligence/tracking/*`: preserve canonical outcome/review/learning responsibilities.
- `intelligence/contracts/*`: preserve capability boundaries and decision trace, revise contracts where the new graph/stage outputs require it.
- telemetry/persistence infrastructure that records canonical state without making decisions.

### REWRITE / REPLACE AS ORCHESTRATION
- `intelligence/discovery/discovery-controller.js`: current phase + per-construct scheduler architecture is the main replacement target. Its orientation matrix and observation plumbing are salvageable; its `constructIds`, `resolutionStates`, recovery loop, `question-scheduler` dependency and scheduler-exhaustion handoff must not remain the governing reasoning model.
- `intelligence/discovery/question-scheduler.js`: demote/replace. Question selection must be driven by explicit stage requirements and decision-value discriminators over the unified graph, not a general construct scheduler.
- `intelligence/discovery/sufficiency.js`: rewrite sufficiency around stage/decision requirements and no-silent-loss invariants rather than per-construct scheduler completion.
- `intelligence/discovery/triage.js`: merge into explicit area-priority / driver-severity triage responsibilities; remove generic triage as an alternate behavioral architecture.
- `intelligence/prioritization/prioritization.js`: preserve governed factor semantics and relationship leverage, but rewrite candidate input around canonical graph nodes and supported Focus candidates. Ranking must not depend on constructs having survived scheduler filtering.
- `app/onboarding/discovery-runtime.js` and snapshot/handoff adapters: simplify to thin UI/application adapters over canonical orchestration. They must not re-audit/filter candidates independently.
- `intelligence-test/discovery.html`, `priorities.html`, `plan.html`: retain QA controls/telemetry but adapt to the canonical production contracts. Test pages must not implement decision logic.

### MERGE / SIMPLIFY
- construct projection + observation normalization -> evidence-to-canonical-node projection feeding the graph.
- baseline discriminator presentation -> unified driver-landscape proposal/triage, with semantic deduplication across selected areas.
- plan deepening -> canonical decision-critical requirement resolver callable after Focus and before Plan materialization.
- Focus presentation reasoning -> Prioritization output; avoid separate UI-created ranking semantics.

### RETIRE AFTER CALLER MIGRATION
- generic importance triage paths that duplicate area/driver prioritization.
- per-construct recovery behavior whose purpose is only to satisfy scheduler specificity.
- compatibility candidate filtering that can silently remove supported areas/drivers.
- tests that require known-wrong sequencing or scheduler behavior; replace them with invariant/cardinality scenarios.
- duplicate legacy root-level Discovery/priority/proposal pages once unique behavior is represented in canonical app/QA surfaces.
- legacy `registries/*` intervention/question sources only after their unique data is reconciled into `intelligence/registries/*`; do not delete governed knowledge before reconciliation.

### MISSING — IMPLEMENT
1. `intelligence/discovery/area-priority.js` — derives investigation order/budget without eliminating areas.
2. `intelligence/discovery/driver-graph.js` — canonical node/edge read model; semantic deduplication; many evidence paths per node; hypothesis status/provenance.
3. `intelligence/discovery/driver-landscape.js` — expands bounded plausible upstream/downstream candidates from governed relationships + member evidence.
4. `intelligence/discovery/severity-triage.js` — severity/frequency/material impact aggregation for major nodes.
5. `intelligence/discovery/leverage-ranking.js` — ranks which hypotheses warrant deepening; does not establish causality.
6. `intelligence/discovery/deepening-policy.js` — selects minimum decision-changing discriminator questions/assessments.
7. `intelligence/discovery/discovery-orchestrator.js` — explicit staged state machine over the above capabilities; supports collapsed stages for simple cases and compression for broad cases.
8. `intelligence/contracts/driver-graph.js` — canonical graph/node/edge/stage contracts and no-silent-loss dispositions.
9. cardinality/cross-area scenario suite covering 1, 2 unrelated, 2 related/shared-driver, several, all 8, dominant upstream, competing hypotheses, disagreement, low-concern, Safety, mixed direct+deepen, durable-learning influence.

## Dependency direction

Registries + Member State evidence -> graph projection -> area priority + driver landscape -> severity/materiality -> leverage hypotheses -> selective deepening -> Member State synthesis -> Prioritization -> member confirmation -> requirement resolver -> Planning -> Toolkit -> evidence -> Review.

No UI, QA page, persistence adapter or compatibility bridge may filter/re-rank/reinterpret canonical candidates independently.

## Deletion gate

Do not delete a legacy module until: its unique knowledge/behavior is classified; required behavior is represented in the target authority; all production/QA callers are migrated; cardinality/invariant regressions pass; and repository search confirms no new dependency on the obsolete path. Historical persistence migrations may retain explicit readers, but known-wrong behavioral compatibility is not a reason to keep obsolete decision code.

## Human QA gate

v0.13 is the last candidate on the old scheduler architecture. Do not ask for another ordinary human pass until the new orchestration passes automated cardinality/cross-area scenarios and exact-candidate validation. The next human candidate should receive the next Intelligence version only when the redesigned behavior is actually prepared for human testing.