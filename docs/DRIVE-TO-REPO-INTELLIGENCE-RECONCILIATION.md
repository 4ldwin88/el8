# EL8 Drive → Repository Intelligence Reconciliation Plan

Status: BLOCKING EXECUTION AUTHORITY FOR `qa/intelligence-test`  
Created: 2026-08-30  
Human testing: BLOCKED until every applicable gate passes on one exact candidate commit.

## Purpose

The repository must implement the current governed EL8 Drive architecture directly. Existing repository behavior is evidence to inspect, not authority to preserve. Git history is the historical archive.

No superseded identifier, question/answer definition, concern/problem/intervention ontology, alias, adapter, compatibility reader, fixture, test, file, document, comment or terminology is retained merely for backward compatibility or traceability. If it is not part of the current governed architecture and is not required by the current product, remove it.

No human tester should be used to discover defects that can be detected by source reconciliation, contract tests, scenario tests, deployment checks or telemetry checks.

## 1. Drive authority order

1. `00.00 READ ME FIRST — EL8 Drive Governance`
2. `01.00 EL8 Concept Authority`
3. `02.02 EL8 Operating System Architecture`
4. `02.03 EL8 Discovery & Prioritization Specification`
5. `02.04 EL8 Question & Signal Matrix Specification`
6. `02.04.01 EL8 Question & Signal Matrix Workbook` — Question/Answer/Signal implementation source
7. `02.06 EL8 Protocol & Action Library` — Action implementation/governance source
8. `02.07 EL8 Adaptive Intelligence System Specification`
9. `02.08 EL8 Product Experience Specification`
10. `03.02 EL8 Member Journey & Service Standards`
11. `05.04 EL8 Data Architecture & Canonical Schema`
12. `05.07 EL8 Environments, Deployment & Release Architecture`
13. `05.08 EL8 Observability, Audit & Incident Architecture`
14. `06.04 Intelligence Evaluation & QA Standard`
15. `06.05 Intelligence Scenario & Regression Standard`
16. `06.06 Intelligence Telemetry, Failure & E2E Standard`
17. `06.07 Intelligence External Testing Gate`
18. `06.08 Intelligence QA Roadmap & Readiness Plan`
19. `09.00.01 EL8 External Testing Legal & Privacy Gate`
20. Current governed research/evidence sources where applicable.

Repository files may reference these authorities but must not redefine them.

## 2. Current lifecycle

`Discovery → Member State → Prioritization → member Focus confirmation → Planning → activation/action → Outcome evidence → Review → Planning or focused Reassessment`

Immediate stabilization scope:

`Discovery → Member State → Prioritization → member Focus confirmation → proposed Planning`

Safety may interrupt ordinary flow without becoming ordinary wellness severity.

## 3. Capability boundaries

Discovery owns evidence acquisition, provenance, confidence, contradiction/correction, sufficiency, context/feasibility and construct establishment. It does not select Actions or decide Focus. Current stages are `Orient → Narrow → Deepen/Fit → Sufficient/Handoff`. `GEN001` is the opening gateway and routes only; it does not establish severity. Positive/no-focus paths must not manufacture problems. Handoff must be member-readable and correctable.

Member State is the construct-native projection of established/unknown evidence and accepted decisions. Unknown remains explicit. No browser concern→construct translation authority is permitted.

Prioritization consumes Member State and current governed factors. Genuine ambiguity remains visible or triggers member choice/clarification. Focus count is adaptive. Member confirmation is required before Planning.

Planning consumes member-confirmed Focus plus evidence/context. Hard gates precede scoring: Safety → eligibility/scope/contraindications → required evidence → material constraints/preferences → confidence → fit/ranking. Missing decision-critical information yields DEEPEN / OBSERVE / DEFER rather than fabricated precision. Only current Drive Action IDs are permitted.

## 4. Question/Answer port rule

The current `02.04.01` Question Bank is the source for the repository Question/Answer registry.

Port every valid current governed Question and Answer row with the current canonical ID, exact current prompt/answer wording, response contract, role, construct/scope, signal/evidence semantics, prerequisites/triggers, stage/scheduling, burden, status and applicable governance metadata.

Current deferred/design-only/held records may exist in the registry only because they are current governed records; runtime exclusion must follow their current status. Retired/superseded records are not ported.

No previous IDs are stored as trace metadata. No previous executable Question IDs, effect-key aliases, concern-state namespace or compatibility mapping is permitted.

Required trace:

`current Question ID → current prompt/answer contract → signal/evidence semantics → current construct target(s) or routing-only semantics → Discovery stage/role → consumers/tests/telemetry`

## 5. Reconciliation proof matrix

| Drive authority | Repository owner | Required proof |
|---|---|---|
| Question & Signal Matrix | `intelligence/discovery/questions/*` / current registry | every valid current Question/Answer accounted for; no superseded definitions |
| Discovery specification | Discovery engine/runtime/contracts | stage, sufficiency, contradiction, correction, positive path, provenance |
| Member State | state contracts/projection | construct-native state, unknowns, provenance/revision |
| Prioritization | prioritization + Focus confirmation | governed factors, ambiguity, adaptive Focus, agency |
| Protocol & Action Library | `action-bank.js` / Action contract | exact current Action IDs and governed fields |
| Adaptive Intelligence | orchestration/contracts | current authority boundaries/handoffs |
| Product Experience | browser surfaces | current sequence, synthesis, correction/choice |
| Telemetry/E2E | tester runtime/backend | reconstructable evidence/decision/failure path |
| Scenario standard | automated scenarios | required governed scenarios |
| External gates | exact deployed candidate | all blocking gates green before human use |

A file existing is not proof. Each row requires implementation evidence and automated verification.

## 6. Execution sequence

### Phase A — inventory and removal map
Keep PR #143 draft/blocked and `main` unchanged. Inventory all active Intelligence sources, tests, browser files, persistence and telemetry. Classify KEEP / MIGRATE / HOLD / REMOVE / FUTURE SPEC. Identify every superseded implementation artifact and its current consumer before removal.

Exit: no unknown active owner and a complete removal/migration map.

### Phase B — current Question & Signal Bank
Read the current 02.04/02.04.01 authorities. Port every valid current Question and Answer. Update consumers/selectors/telemetry/fixtures/tests to the current registry. Remove superseded definitions and translation layers. Separate routing-only semantics from construct evidence. Add CI validation for duplicate/unknown IDs, orphan consumers, invalid targets, status misuse and reintroduction of superseded namespaces.

Exit: repository Question/Answer registry and consumers demonstrably match the current Drive workbook.

### Phase C — Discovery
Implement current stage authority, GEN001 routing-only behavior, relevant adaptive routing, evidence lifecycle, unknowns, confidence, contradiction/correction, semantic sufficiency, positive/no-focus, unsure/other and member-readable/correctable handoff. Remove any Discovery behavior that selects Actions or Focus.

Exit: Discovery scenarios pass and produce current canonical handoff directly.

### Phase D — Member State
Implement one current Discovery→Member State projection with provenance/confidence/unknown/revision. Remove browser-owned or translation-based construct manufacture.

Exit: Prioritization consumes Member State directly.

### Phase E — Prioritization / Focus
Implement current factors, genuine ambiguity behavior, adaptive Focus count and member confirmation/replacement/decline. Capacity/burden may constrain plan size/selection but not construct severity.

Exit: current Prioritization/Focus scenarios pass.

### Phase F — Planning / Action
Reconcile every current Action field-by-field against 02.06 in `action-bank.js`; enforce current Discovery→Planning contract, evidence/tracking/additional-assessment requirements, Safety/eligibility/contraindication gates, held statuses, member rejection and DEEPEN/OBSERVE/DEFER behavior. Browser Plan is a view/controller, not another engine.

Exit: Planning contract/scenario/browser selection regressions pass.

### Phase G — Browser tester
Preserve useful tester infrastructure only: visible Intelligence v0.2, tester mode, persistent notes, Exit Test, intended session persistence/resume, elapsed timing, event sequencing, build/engine/version metadata, completion/exit capture and explicit telemetry failure. Product semantics must come from current architecture.

Exit: browser dependency/route smoke and deterministic harness regression pass.

### Phase H — telemetry
Capture current Question ID, applicable evidence/answer event, Discovery stage, state/handoff, Focus decisions, Planning decisions/reasons, notes, exits, failures, timing and version metadata. Verify durable backend rows from the exact candidate.

Exit: synthetic success and failure paths are reconstructable.

### Phase I — scenario matrix
Cover generally-well/no-focus, unsure/low-info, one concern, multiple concerns, high breadth, ambiguous financial evidence, material/nonmaterial contradiction, handoff correction, dismissed concern, changed/rejected Focus, genuine tie, low capacity, missing Action evidence, contraindicated/rejected Action, Safety interruption, answer-order stability, telemetry failure and browser refresh/resume/exit where supported.

Every automatable human-discovered defect becomes a regression.

Exit: full required matrix green on exact head.

### Phase J — exact-candidate gate
Human testing remains blocked until one exact commit has: complete Drive→repo proof; no superseded/duplicate decision authority; Canonical Repository QA green; browser smoke green; scenarios green; live telemetry green; Netlify preview on same head; correct version; notes/exit verified; no known machine-detectable blocker. PR remains unmerged until human validation succeeds.

## 7. Anti-regression rules

- Current Drive architecture is the only implementation target.
- Git history, not current product code, preserves history.
- Do not restore superseded architecture to satisfy an old test; replace the test with current governed behavior.
- Do not add compatibility adapters between conflicting internal ontologies.
- Do not retain superseded IDs as trace fields.
- Do not put decision authority in browser pages.
- Do not treat gateway selection as severity.
- Do not force problem, Focus or Action on a valid positive path.
- Do not claim telemetry works without durable exact-candidate evidence.
- Do not use human testing as machine QA.

## 8. Definition of done

Every current governed requirement in scope must trace:

`Drive authority → repository owner → current identifier/contract → implementation → automated proof → telemetry proof where applicable → exact deployed candidate`

Every active Intelligence decision must trace back to a current Drive authority. Any superseded implementation artifact found in the active product is a reconciliation defect.

Until both directions hold, Intelligence v0.2 remains BLOCKED.