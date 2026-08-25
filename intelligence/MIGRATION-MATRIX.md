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
| `integration/routing-screen*` | RETAIN TEMPORARILY | Routing may be product/application integration rather than Intelligence. Keep until callers and ownership are identified. |
| `integration/experience-router*` | RETAIN TEMPORARILY | Potential orchestration/application concern; canonical ownership not proven yet. |
| `integration/checkin-shadow.js` | RETAIN TEMPORARILY | Shadow/integration behavior needs caller and data-contract inspection before disposition. |
| `integration/matrix-qa-selector*` | KEEP NONCANONICAL | QA/selection support is validation tooling unless a runtime dependency proves otherwise. |
| `integration/blind-qa-policy*` | KEEP NONCANONICAL | QA policy belongs to validation/testing support, not canonical runtime Intelligence. |
| `integration/.v05`, `integration/README-v05.md` | RETIRE LATER | Version-marker/documentation remnants; remove only with their legacy integration cleanup. |
| `simulation/synthetic-members.js` | KEEP NONCANONICAL | Synthetic member fixtures remain valuable for validation/simulation. |
| `simulation/run-simulation.js` | KEEP NONCANONICAL | Simulation harness remains useful, but should eventually target canonical contracts instead of legacy runtime modules. |

## Completed reconciliation

1. `model/subdimension-taxonomy.js`: missing valid vocabulary migrated without the legacy numeric state/averaging model.
2. `model/question-subdimension-map.js`: legacy mapping mechanism determined obsolete because canonical questions carry direct semantic effects.
3. `selection/question-selector.js`: useful dependency/trigger gating, uncertainty need, redundancy control, burden/capacity handling, deterministic ranking, Safety-critical override, and information-value behavior rebuilt against canonical concerns/effects in `development/discovery/question-selector.js`; adversarial tests are part of mandatory Discovery QA.
4. `model/dimension-hypothesis-state.js`: semantic comparison completed. Its useful state lifecycle is already represented by canonical concern `status`, `sufficiency`, evidence provenance, and unresolved reasons; its numeric confidence accumulation and dimension-priority formula are not migrated.
5. `model/hierarchical-state.js`: semantic comparison completed. Evidence provenance/count/timing and hierarchical organization are already represented canonically; legacy mutable subdimension values, confidence accumulation, direction labels, and weighted/peak dimension scores are not migrated.

## Immediate migration queue

1. Inspect callers of `integration/routing-screen*`, `integration/experience-router*`, and `integration/checkin-shadow.js` before assigning ownership.
2. Update simulation/QA tooling to consume canonical contracts after integration ownership is resolved.
3. Before deleting legacy selector/model files, verify no required runtime caller remains and canonical Discovery has reached its promotion gate.

## Model reconciliation conclusion

The legacy `model/**` runtime architecture contains no remaining known semantic capability that requires migration. Its valid taxonomy vocabulary and state lifecycle concepts are represented in canonical taxonomy/Member State. Its remaining distinctive behavior is numeric aggregation/scoring that the canonical architecture intentionally rejects. Files remain until the deletion gate is satisfied.

## Selector migration guardrails

Do not restore legacy signal IDs or numeric wellness scoring. Canonical selector ranking values are ephemeral decision-support calculations—not Member State and not member wellness scores. Safety eligibility/override must remain compatible with the canonical Safety interface rather than creating a parallel selector-specific safety model.

## Deletion gate

A RETIRE LATER item can be deleted only when its canonical replacement is covered by mandatory QA; repository search shows no required caller; any unique still-valid semantics have been migrated; and the deletion itself passes canonical QA and relevant regression suites.
