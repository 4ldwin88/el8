# Intelligence Legacy Migration Matrix

Status: bounded classification/reconciliation pass after the validated canonical vertical spike.

Rules: classify capabilities, not filenames. No deletion during classification. Ambiguous items default to RETAIN TEMPORARILY.

| Legacy area / capability | Disposition | Canonical destination / reason |
|---|---|---|
| `selection/adaptive-discovery-v1*` | RETIRE LATER | Legacy Discovery implementation; replacement is being proven under `development/discovery/**`. Keep until promotion and dependency checks. |
| `selection/discovery-question-bank-v1.js` | RETIRE LATER | Legacy question bank superseded by canonical Discovery question assets; retain until Discovery promotion. |
| `selection/question-selector*` | RETIRE LATER | Required adaptive-selection semantics have been rebuilt in canonical Discovery and are now mandatory-QA covered. Legacy files remain only until caller/dependency checks and Discovery promotion. |
| `selection/adversarial-scenarios.js` | KEEP NONCANONICAL | Validation fixture/scenario capability belongs with validation/simulation support, not runtime Intelligence. |
| `selection/discovery-comparison-harness*` | KEEP NONCANONICAL | Migration/regression comparison tooling; useful until canonical Discovery is promoted. |
| `selection/member-zero-simulation.js` | KEEP NONCANONICAL | Test/simulation fixture, not canonical runtime architecture. |
| `model/dimension-hypothesis-state*` | RETIRE LATER | Useful lifecycle semantics are already represented more precisely at canonical concern level. Legacy dimension-level confidence/positive/negative accumulation and numeric priority formulas are obsolete. |
| `model/hierarchical-state*` | RETIRE LATER | Semantic reconciliation complete. Canonical Member State already preserves hierarchical dimension/topic/concern structure, evidence references, observation timing, concern status/sufficiency, and evidence confidence without deriving numeric dimension wellness values. Legacy weighted/peak dimension aggregation is intentionally obsolete. |
| `model/subdimension-taxonomy*` | RETIRE LATER | Valid legacy vocabulary has been reconciled into `intelligence/state/taxonomy.js`; legacy numeric subdimension state/averaging is intentionally obsolete. |
| `model/question-subdimension-map.js` | RETIRE LATER | Legacy `question -> signal -> subdimension` mapping is superseded by canonical Discovery questions that express semantic effects directly against concerns. |
| `integration/routing-screen*` | RETIRE LATER | Legacy onboarding/routing UI plus dimension severity scoring. No indexed runtime caller found. Useful user-facing prompts can be redesigned at the product layer if needed; numeric routing evidence is obsolete and must not enter canonical Intelligence. |
| `integration/experience-router*` | RETIRE LATER | Legacy experience-first routing UI with numeric dimension weights/severity. No indexed runtime caller found. The UX idea may be reused separately, but the scoring/router implementation is not canonical Intelligence. |
| `integration/checkin-shadow.js` | RETIRE LATER | Shadow adapter for the legacy question bank/evidence matrix/selector. No indexed runtime caller found and its selector capability has already been rebuilt canonically. Do not migrate this adapter as runtime architecture. |
| `integration/matrix-qa-selector*` | RETIRE LATER | Legacy QA selector encodes useful coverage-first/anti-tunneling/redundancy/burden principles, but these are now represented by canonical selector + adversarial/synthetic QA. Its dimension-severity, signal-uncertainty, and numeric score model is obsolete. |
| `integration/blind-qa-policy*` | RETIRE LATER | Useful broad-coverage/stop-condition intent is preserved by canonical validation scenarios; implementation depends on legacy numeric belief/uncertainty thresholds and matrix question families, so it should not survive as architecture. |
| `integration/.v05`, `integration/README-v05.md` | RETIRE LATER | Version-marker/documentation remnants; remove only with their legacy integration cleanup. |
| `simulation/synthetic-members.js` | RETIRE LATER | Scenario-based validation capability has been rebuilt as canonical synthetic simulation against canonical Member State/question targets/selector. Legacy trigger/signal fixture schema is obsolete. |
| `simulation/run-simulation.js` | RETIRE LATER | Canonical synthetic simulation is mandatory-QA covered and both repository QA/regression gates pass. Legacy runner remains only until final dependency/deletion gate. |

## Completed reconciliation

1. `model/subdimension-taxonomy.js`: missing valid vocabulary migrated without the legacy numeric state/averaging model.
2. `model/question-subdimension-map.js`: legacy mapping mechanism determined obsolete because canonical questions carry direct semantic effects.
3. `selection/question-selector.js`: useful dependency/trigger gating, uncertainty need, redundancy control, burden/capacity handling, deterministic ranking, Safety-critical override, and information-value behavior rebuilt against canonical concerns/targets/effects in `development/discovery/question-selector.js`; adversarial tests are part of mandatory Discovery QA.
4. `model/dimension-hypothesis-state.js`: semantic comparison completed. Its useful state lifecycle is already represented by canonical concern `status`, `sufficiency`, evidence provenance, and unresolved reasons; its numeric confidence accumulation and dimension-priority formula are not migrated.
5. `model/hierarchical-state.js`: semantic comparison completed. Evidence provenance/count/timing and hierarchical organization are already represented canonically; legacy mutable subdimension values, confidence accumulation, direction labels, and weighted/peak dimension scores are not migrated.
6. `integration/routing-screen.js`: inspected and caller-searched. It is a legacy product-routing screen coupled to numeric dimension severity/evidence, not a canonical Intelligence subsystem.
7. `integration/experience-router.js`: inspected and caller-searched. Experience-first UX remains a possible product concept, but its numeric dimension inference/severity weights are obsolete as Intelligence state.
8. `integration/checkin-shadow.js`: inspected and caller-searched. It is explicitly a shadow adapter around the legacy bank/evidence/selector stack; canonical selector migration removes its architectural purpose.
9. `simulation/synthetic-members.js` + `simulation/run-simulation.js`: validation purpose preserved by `development/discovery/canonical-simulation.test.mjs`, now mandatory in `test:discovery`. The simulation exposed and helped correct canonical target-schema handling; both required CI workflows pass after the correction.
10. `integration/matrix-qa-selector.js`: coverage-first exploration, anti-tunneling, redundancy control, burden sensitivity, and cross-dimensional probing were reviewed. Canonical selector/tests preserve the valid principles without legacy dimension severity/signal scoring.
11. `integration/blind-qa-policy.js`: broad evidence coverage and conservative stopping intent were reviewed. These remain validation requirements rather than a separate runtime policy engine; legacy numeric belief/uncertainty thresholds are not migrated.

## Immediate migration queue

1. Run final repository dependency searches across all RETIRE LATER legacy Discovery/model/integration/simulation entry points.
2. Inspect remaining KEEP NONCANONICAL selection fixtures/harnesses and determine whether canonical QA fully supersedes them or whether any should be rewritten under validation.
3. Confirm the canonical Discovery promotion gate and promotion path before deleting legacy runtime files.

## Validation reconciliation conclusion

Legacy validation contained several sound testing principles but implemented them through the obsolete scoring architecture. Canonical QA now exercises adaptive target selection, uncertainty need, redundancy suppression, burden/capacity behavior, Safety override, deterministic ranking, adversarial handoffs, end-to-end behavior, and synthetic production-shaped scenarios. Validation semantics should live in canonical tests/simulation fixtures, not in a parallel runtime selector or numeric belief policy.

## Integration reconciliation conclusion

The three previously ambiguous integration components do not need migration into Orchestration. `routing-screen` and `experience-router` mix user-facing routing UX with numeric dimension inference; any future UX should consume canonical Discovery/Member State rather than create a parallel state model. `checkin-shadow` is legacy migration instrumentation, not durable runtime architecture.

## Model reconciliation conclusion

The legacy `model/**` runtime architecture contains no remaining known semantic capability that requires migration. Its valid taxonomy vocabulary and state lifecycle concepts are represented in canonical taxonomy/Member State. Its remaining distinctive behavior is numeric aggregation/scoring that the canonical architecture intentionally rejects. Files remain until the deletion gate is satisfied.

## Selector migration guardrails

Do not restore legacy signal IDs or numeric wellness scoring. Canonical selector ranking values are ephemeral decision-support calculations—not Member State and not member wellness scores. Safety eligibility/override must remain compatible with the canonical Safety interface rather than creating a parallel selector-specific safety model.

## Deletion gate

A RETIRE LATER item can be deleted only when its canonical replacement is covered by mandatory QA; repository search shows no required caller; any unique still-valid semantics have been migrated; and the deletion itself passes canonical QA and relevant regression suites.
