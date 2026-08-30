# EL8 Drive → Repository Intelligence Reconciliation Plan

Status: BLOCKING EXECUTION AUTHORITY FOR `qa/intelligence-test`  
Created: 2026-08-30  
Human testing: BLOCKED until every applicable gate in this document passes on one exact candidate commit.

## Purpose

This document exists because the previous repository reconciliation was partial. Pieces of the canonical architecture were implemented while older Question Bank, concern-state, browser-harness and test assumptions remained active. That created a mixed architecture and produced a false impression that the browser Intelligence test was ready.

The correction is Drive-first and traceable. The repository must implement the current EL8 Drive authorities. Existing repository behavior is evidence to reconcile, not authority to preserve. Historical tests, adapters, identifiers and browser behavior must not override current Drive decisions.

No human tester should be used to discover defects that can be detected by source reconciliation, contract tests, scenario tests, deployment checks or telemetry checks.

## 1. Authority order

Use the current Drive authorities, resolving apparent conflicts by governance ownership and newer explicit decisions rather than by preserving prototype behavior.

Primary implementation authorities:

1. `00.00 READ ME FIRST — EL8 Drive Governance`
2. `01.00 EL8 Concept Authority`
3. `02.02 EL8 Operating System Architecture`
4. `02.03 EL8 Discovery & Prioritization Specification`
5. `02.04 EL8 Question & Signal Matrix Specification`
6. `02.04.01 EL8 Question & Signal Matrix Workbook` — canonical Question/Signal implementation source, including canonical question IDs
7. `02.06 EL8 Protocol & Action Library` — canonical Action IDs and Action governance
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
19. `09.00.01 EL8 External Testing Legal & Privacy Gate` where external testing is concerned
20. Research/evidence documents as supporting rationale, not substitutes for product authority.

Repository files may reference these authorities but must not silently redefine them.

## 2. Canonical lifecycle to implement

Current core lifecycle:

`Discovery → Member State → Prioritization → member Focus confirmation → Planning → activation/action → Outcome evidence → Review → Planning or focused Reassessment`

Safety may interrupt or pause ordinary flow but does not redefine ordinary wellness condition/severity.

Immediate Intelligence stabilization/human-test scope is the coherent pre-action path:

`Discovery → Member State → Prioritization → member confirmation → proposed Planning`

Post-plan closed-loop implementation remains important, but it must not be used to excuse defects in this stabilization path.

## 3. Non-negotiable capability boundaries

### Discovery

Discovery owns evidence acquisition, evidence provenance, evidence confidence, contradiction handling, sufficiency, contextual/feasibility evidence and concern/construct establishment. It does not select Actions and does not directly decide the member's Focus.

Canonical stage progression:

`Orient → Narrow → Deepen/Fit → Sufficient/Handoff`

At least one meaningful interaction occurs per stage when the path requires it; semantic sufficiency, not a fixed question count, controls progression. Positive/no-focus paths may legitimately be short and must not manufacture problems.

The opening gateway is broad ordinary-language routing. `GEN001` is the canonical opening gateway from the current Question & Signal Matrix. Gateway selections are soft routing priors. They do not themselves establish severity or manufacture canonical constructs.

Discovery must support direct member correction. A current correction supersedes an earlier current-state report while preserving provenance. Contradictions block only when resolving them could change the next governed decision.

The Sufficient/Handoff stage must produce a member-readable synthesis that can be confirmed/corrected before downstream Prioritization relies on it.

### Member State

Member State is the canonical construct-native projection of established/unknown evidence and accepted member decisions. Unknown remains explicit. The browser UI must not manufacture canonical constructs through ad-hoc concern→construct maps.

### Prioritization

Prioritization operates on canonical constructs/Member State, not browser concern aliases. It considers impact, member importance/choice, leverage, urgency, readiness/capacity, evidence confidence, prior learning and constraints.

No arbitrary identity/alphabetical/order fallback may pretend to resolve a genuine tie. Ambiguity must remain visible or trigger member choice/clarification as governed.

Focus count is adaptive. There is no hard-coded two-Focus architecture. Member confirmation/agency is required before Planning.

### Planning

Planning consumes member-confirmed canonical Focus plus evidence/context. A construct alone is not enough for a high-confidence Action recommendation.

Planning must preserve distinct concepts for Focus Priority, Evidence Confidence, Action Fit and Recommendation Confidence. Missing decision-critical information results in explicit DEEPEN / OBSERVE / DEFER behavior rather than fabricated precision.

Hard gates precede scoring: Safety → eligibility/scope/contraindications → required evidence → material constraints/preferences → confidence → fit/ranking.

Only Drive-canonical Action IDs from the Protocol & Action Library are permitted. Member-rejected or contraindicated Actions cannot be recommended merely because of score.

## 4. Identifier migration rule

The Question & Signal Matrix Workbook is the canonical source for current Question IDs. The repository Question Bank must be reconciled row-by-row against it.

Required trace for every active question:

`canonical question ID → prompt/response contract → signal/evidence semantics → canonical construct target(s) or routing-only semantics → Discovery stage/role → consumers/tests/telemetry`

Legacy IDs may remain only in historical migrations, explicit compatibility readers with a documented exit condition, or negative regression guards. They must not remain the active internal decision namespace merely because adapters can translate them.

Raw member-facing concern vocabulary such as money, sleep, stress or low activity may remain as ordinary-language routing vocabulary where the Drive permits it. It must not become a shadow internal ontology competing with canonical construct IDs.

The active implementation must not require a browser-page translation table to convert legacy concern states into canonical constructs.

## 5. Drive-to-repo reconciliation matrix

Before implementation is called reconciled, build and verify a trace matrix covering at minimum:

| Drive authority | Repository owner | Required proof |
|---|---|---|
| Question & Signal Matrix | `intelligence/discovery/questions/*` and adapters | all active IDs/prompts/options/semantics accounted for; no unapproved active legacy IDs |
| Discovery specification | Discovery engine/runtime/contracts | stage progression, sufficiency, contradiction, correction, positive path, evidence provenance |
| Member State architecture | state contracts/projection/transitions | construct-native state, explicit unknowns, provenance/revision |
| Prioritization specification | prioritization engine + Focus confirmation | governed factors, ambiguity behavior, adaptive Focus, member agency |
| Protocol & Action Library | Action Bank/registry | exact canonical Action IDs, construct/plan scopes, evidence/tracking/additional-assessment requirements |
| Adaptive Intelligence spec | orchestration/contracts | authority boundaries and handoffs preserved end-to-end |
| Product Experience | browser test/app surfaces | correct member-facing sequence, understandable synthesis, correction/choice, no internal-score leakage |
| Telemetry/E2E standards | tester runtime + backend | reconstructable evidence/decision/handoff/failure events with version metadata |
| Scenario standard | automated scenario suite | required normal, positive, ambiguous, contradictory, multi-concern, constraint and correction cases |
| External testing gates | exact deployed candidate | all blocking gates green before human use |

The matrix is not complete when a file merely exists. Each row needs implementation evidence and a passing regression/scenario proving the governed behavior.

## 6. Execution sequence — do not skip ahead

### Phase A — Freeze and inventory

1. Keep PR #143 blocked and draft.
2. Keep `main` unchanged while reconciliation occurs.
3. Inventory every active Intelligence source file, test, browser-test file, persistence contract and telemetry endpoint touched by Discovery→Planning.
4. Classify each as KEEP / MERGE / MIGRATE / HOLD / RETIRE / FUTURE SPEC under repository governance.
5. Search active code for legacy question IDs, legacy concern/problem/intervention namespaces, retired Baseline-stage assumptions, duplicate engines and UI-owned decision logic.

Exit gate: complete inventory with no unknown active implementation owner.

### Phase B — Canonical Question & Signal Bank

1. Read the current 02.04 specification and every relevant row/tab of 02.04.01.
2. Produce an explicit canonical question-ID inventory.
3. Reconcile every active repository question against that inventory.
4. Replace active obsolete IDs with canonical IDs.
5. Update all consumers, selectors, telemetry, fixtures and tests to accept canonical IDs.
6. Separate routing-only gateway semantics from evidence that can establish a construct.
7. Remove adapters whose only purpose is to perpetuate the superseded internal ontology.
8. Add validation that fails CI for duplicate IDs, unknown IDs, orphan consumers, invalid targets and unauthorized legacy IDs.

Exit gate: repository Question Bank and consumers are demonstrably synchronized with the Drive workbook.

### Phase C — Discovery engine reconciliation

1. Implement the exact Orient→Narrow→Deepen/Fit→Sufficient/Handoff authority model.
2. Make `GEN001` the governed opening gateway without turning its selections into severity evidence.
3. Route subsequent questions only from relevant evidence/uncertainty rather than running generic legacy orientation sequences.
4. Implement concern/construct evidence lifecycle, explicit unknowns, evidence confidence, contradiction and correction rules.
5. Implement semantic sufficiency.
6. Implement positive/no-focus and unsure/other paths without forced problems.
7. Implement member-readable Sufficient/Handoff synthesis and correction.
8. Remove Discovery behavior that selects Actions or Focus.

Exit gate: Discovery scenario suite passes independently and produces a canonical handoff without UI translation hacks.

### Phase D — Member State boundary

1. Define one canonical Discovery→Member State projection.
2. Preserve evidence/provenance/confidence/unknowns/revision.
3. Remove browser-owned concern→construct conversion.
4. Verify corrections and contradictions project deterministically without erasing history.

Exit gate: Prioritization consumes canonical Member State directly.

### Phase E — Prioritization and Focus

1. Reconcile factor definitions and authority against 02.03/02.07.
2. Remove arbitrary alphabetical/identity tie resolution as a semantic decision.
3. Preserve genuine ambiguity and route it to governed clarification/member choice.
4. Remove fixed two-Focus limit; use adaptive useful Focus set.
5. Implement member confirmation/replacement/decline and preserve agency evidence.
6. Verify capacity/burden changes plan size/selection, not construct severity.

Exit gate: Prioritization and member confirmation scenarios pass with no hidden hierarchy.

### Phase F — Planning and Action governance

1. Reconcile every Action against 02.06 by exact Action ID.
2. Verify construct mappings, plan-scope Actions, tracking requirements, additional-assessment requirements, evidence requirements, stop/success signals and Safety/eligibility gates.
3. Verify canonical Action recommendation scoring only after hard gates.
4. Verify low evidence produces DEEPEN/OBSERVE/DEFER rather than invented recommendations.
5. Verify member rejection and contraindication exclusions.
6. Verify browser Plan UI is a view/controller over canonical Planning output rather than a second Planning engine.

Exit gate: Planning contract/scenario suite and browser selection regressions pass.

### Phase G — Browser tester preservation and reconciliation

Preserve the proven useful v0.1 test-harness capabilities while replacing obsolete product semantics:

- visible `Intelligence v0.2` identification throughout;
- tester mode;
- persistent Tester Notes;
- Exit Test;
- session persistence/resume behavior where intended;
- elapsed timing;
- event sequencing;
- build/engine/version metadata;
- test exit and completion capture;
- telemetry failure must not silently masquerade as success.

Then verify the browser sequence reflects the canonical architecture and Question Bank. Do not restore the retired Universal Baseline stage or other obsolete v0.1 product semantics merely to preserve the shell.

Exit gate: browser dependency/route smoke plus deterministic harness regression passes.

### Phase H — Telemetry and backend verification

Telemetry must make the Intelligence decision path reconstructable, not merely record clicks.

Verify capture of the applicable evidence/answer event, canonical question ID, Discovery stage, state/handoff changes, priority/Focus decisions, Planning decisions/reason codes, tester notes, exits, failures, timing and version metadata.

Perform a live backend test against the exact candidate. Confirm durable rows actually arrive. Do not treat a successful client fetch attempt as persistence proof.

Exit gate: live telemetry can reconstruct a synthetic candidate run and failure path.

### Phase I — Required automated scenario matrix

At minimum cover:

- generally doing well / valid no-focus path;
- unsure / low-information path;
- one clear concern;
- multiple concerns;
- five-plus concerns / high-breadth entry;
- ambiguous financial evidence requiring discrimination;
- contradictory evidence that matters to the next decision;
- contradiction that does not matter and therefore should not block;
- direct member correction at Sufficient/Handoff;
- concern dismissed after deepening;
- member changes/rejects proposed Focus;
- genuine Prioritization tie/ambiguity;
- low capacity constraining burden without changing severity;
- missing Action-specific evidence;
- contraindicated Action;
- member-rejected Action;
- Safety interruption;
- answer-order stability / no arbitrary order dependence;
- telemetry failure behavior;
- browser refresh/resume/exit where supported.

Every human-discovered defect that can be automated becomes a regression before another candidate is promoted.

Exit gate: full required scenario matrix green on exact candidate head.

### Phase J — Exact-candidate promotion gate

Human testing remains blocked until ALL are true on one exact commit SHA:

1. Drive→repo reconciliation matrix complete.
2. No unresolved active legacy architecture or duplicate decision owner.
3. Canonical Repository QA green.
4. Browser import/dependency/route smoke green.
5. Required Intelligence scenario matrix green.
6. Live backend/telemetry verification green.
7. Netlify Deploy Preview success on the same exact head.
8. Version shown correctly throughout the tester.
9. Tester Notes and Exit verified.
10. No known machine-detectable blocker.
11. PR remains unmerged until human validation succeeds.

Only then may the candidate status change from BLOCKED to HUMAN TEST READY.

## 7. Anti-regression rules

- Never call a candidate human-test ready because individual engine tests pass.
- Never infer Drive reconciliation from similarly named repository concepts.
- Never change a producer without tracing every consumer and regression.
- Never preserve a failing historical test by restoring obsolete architecture; update the test to the current Drive contract after verifying the authority.
- Never add an adapter merely to make two conflicting internal ontologies coexist indefinitely.
- Never put canonical decision authority in browser pages.
- Never use human testing as a substitute for source, contract, scenario, deployment or telemetry QA.
- Never merge a QA candidate merely because Netlify deployed it.
- Never state that telemetry works until durable backend evidence from the exact candidate exists.
- Never treat a gateway selection as established severity unless the Drive explicitly defines that semantics.
- Never force a problem, Focus or Action on a valid positive/no-focus path.

## 8. Definition of done for this reconciliation

This reconciliation is done only when a reviewer can start from any canonical Drive requirement in the stabilization scope and trace it to:

`Drive authority → repository owner → canonical identifier/contract → implementation → automated proof → telemetry proof where applicable → exact deployed candidate`

and can perform the reverse trace from any active repository Intelligence decision back to its Drive authority.

If either direction breaks, reconciliation is incomplete.

Until that condition is met, Intelligence v0.2 remains a blocked engineering candidate, not a human-test candidate.