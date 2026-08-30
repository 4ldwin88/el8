# EL8 Drive → Repository Reconciliation Inventory

Status: ACTIVE / BLOCKING  
Candidate branch: `qa/intelligence-test`  
Authority: companion execution evidence for `DRIVE-TO-REPO-INTELLIGENCE-RECONCILIATION.md`.

## Current-source rule

The current governed EL8 Drive architecture is the only implementation target. Git history is the archive.

Repository reconciliation must not preserve superseded identifiers, question/answer definitions, concern/problem/intervention ontologies, aliases, adapters, compatibility readers, fixtures, tests, files, documents, comments, or terminology merely for historical traceability or backward compatibility.

If an item is not part of the current governed architecture and is not required by the current product, it is removed rather than translated forward.

## Question & Signal authority

`02.04.01 EL8 Question & Signal Matrix Workbook` is the implementation source for the Question/Answer registry. The repository port must cover every valid current governed Question and Answer row and its current metadata/semantics.

Canonical Question IDs use the current descriptive namespaces (`GEN###`, `PHY###`, `EMT###`, `SOC###`, `OCC###`, `FIN###`, `INT###`, `SPT###`, `ENV###`, `SFT###`, `XDM###`). No superseded identifier is part of the target registry.

Required semantics include:

- Questions produce evidence, not plans.
- Gateway selections are routing/salience priors, not impairment/severity evidence.
- Direct state answers establish their named construct only.
- Discriminators identify constructs/facets without adding severity.
- Contributor/cross-domain answers create hypotheses/context rather than parallel construct severity.
- Feasibility/preferences/constraints are Planning evidence, not wellness severity.
- System-control/positive/opt-out answers govern flow rather than wellness state.
- Safety is categorical and governed separately.
- Semantic sufficiency is decision-based, not a fixed count/threshold.

### GEN001

`GEN001` is the opening gateway. Its selections route only. `well` enters the positive path; `unsure` enters the low-burden uncertain-start path; `other` remains uncategorized until clarified. None of its selections manufactures construct severity.

### Current construct authority

Current mapped constructs include EMOTIONAL_STATE, PRESSURE_PATTERN, SLEEP_QUALITY, ENERGY_FUNCTION, LONELINESS, JOB_SECURITY, FINANCIAL_STRAIN, FINANCIAL_CONTROL, ENVIRONMENTAL_SUPPORT, MEANING_PURPOSE, RELATIONSHIP_STRAIN, SUPPORT_AVAILABILITY, PHYSICAL_CONDITION, ACTIVITY_LEVEL, FOCUS_FUNCTION, ACTIVATION, SCHEDULE_DISRUPTION, BODY_WEIGHT_CONCERN, VALUES_CLARITY, NEXT_STEP_CLARITY and DIRECTION_CLARITY. COGNITIVE_ENGAGEMENT remains experimental/deferred unless/until current Drive governance promotes it.

## Question Bank execution status

Completed:

- Retired rows were removed from the Drive Question Bank at user direction.
- The obsolete executable General question bank was removed from `intelligence/discovery/questions/core.js`.
- `general.js` was rebuilt around current canonical General IDs and routing/context/control semantics.

Still blocking:

- Port every remaining valid current Question and Answer row from the Drive Question Bank into the repository.
- Preserve exact current prompt/answer wording and governed metadata needed by runtime/QA.
- Represent deferred/design-only/held material only when it is a current governed item, with runtime exclusion enforced by current status.
- Remove all remaining superseded question/answer definitions, aliases, effect-key ontologies, adapters, fixtures, tests, files, comments and documentation.
- Update every consumer, selector, telemetry event, scenario and browser path to consume the current Question/Answer registry directly.
- Add CI validation for duplicate/unknown Question IDs, orphan consumers, invalid targets, status misuse and any reintroduction of superseded namespaces.

## Action Bank authority

`02.06 EL8 Protocol & Action Library` is the only Action implementation authority. `intelligence/planning/action-bank.js` is the sole executable Action Bank target.

The duplicate intervention library has been removed. No superseded intervention IDs or driver-keyed intervention ontology should remain executable or be retained for compatibility.

Every current Action must preserve its governed fields, including use conditions, minimum evidence, review window, expected signal, burden, exclusions/contraindications, stop/reconsider rules, Safety/referral rules, confidence floor, status, tracking/logging requirement, additional assessment requirement, semantic icon key, evidence/source IDs, evidence strength, permitted claim and evidence-review status.

Current Action IDs are `PHY-A01`–`PHY-A07`, `EMT-A01`–`EMT-A04`, `SOC-A01`–`SOC-A04`, `OCC-A01`–`OCC-A04`, `FIN-A01`–`FIN-A04`, `ENV-A01`–`ENV-A04`, `INT-A01`–`INT-A04`, `SPT-A01`–`SPT-A04`, and `XDM-A01`–`XDM-A06` as governed by the current Drive library. Held/status restrictions such as SOC-A04 and INT-A04 remain binding while current Drive governance says so.

## Active implementation disposition

KEEP / reconcile to current Drive:
- `intelligence/discovery/questions/*`
- Discovery controller/engine/eligibility/scheduler/sufficiency
- `intelligence/state/*`
- `intelligence/prioritization/*`
- `intelligence/planning/action-contract.js`
- `intelligence/planning/action-bank.js`
- `intelligence/planning/discovery-planning-contract.js`
- canonical Planning/scoring/evidence modules
- `intelligence-test/*` tester shell, with product semantics supplied by current canonical engines

REMOVE after current consumers are migrated:
- `intelligence/discovery/question-bank-adapter.js` if it exists only to translate superseded effect/concern semantics
- `intelligence/discovery/concern-projection.js` if it implements a superseded concern ontology rather than current construct-native state
- round/controller modules or tests that exist only for superseded Question IDs, scoring, stages or behavior
- any browser concern→construct translation authority

HOLD only when currently governed:
- current design-only Safety material not yet validated for runtime
- current held/deferred Question or Action records, with explicit runtime exclusion

## Immediate execution sequence

1. Port the full valid current Drive Question/Answer bank into a machine-readable repository registry/domain modules without superseded identifiers or aliases.
2. Reconcile every Discovery consumer to that registry.
3. Delete translation/compatibility modules made unnecessary by the current registry.
4. Add negative CI guards so superseded IDs/ontologies cannot return.
5. Reconcile Discovery stages, evidence lifecycle, correction, contradiction and semantic sufficiency.
6. Reconcile Member State directly to current constructs.
7. Reconcile Prioritization/member Focus confirmation.
8. Complete Action Bank field-by-field reconciliation and Discovery→Planning contract enforcement.
9. Reconcile browser tester, telemetry and required scenarios on the same exact candidate.

Human test status remains BLOCKED until the exact-candidate promotion gates pass.