# Intelligence Legacy Migration Matrix

Status: bounded classification/reconciliation pass after the validated canonical vertical spike.

Rules: classify capabilities, not filenames. No deletion during classification. Ambiguous items default to RETAIN TEMPORARILY.

| Legacy area / capability | Disposition | Canonical destination / reason |
|---|---|---|
| `selection/adaptive-discovery-v1*` | RETIRE LATER | Legacy Discovery implementation; replacement is being proven under `development/discovery/**`. Keep until promotion and dependency checks. |
| `selection/discovery-question-bank-v1.js` | RETIRE LATER | Legacy question bank superseded by canonical Discovery question assets; retain until Discovery promotion. |
| `selection/question-selector*` | MIGRATE | Adaptive selection remains required. Preserve useful behavior—dependency/trigger eligibility, uncertainty/freshness need, redundancy control, friction/capacity, burden budgets, deterministic ranking, safety override, and expected-information-gain concepts—but rebuild against canonical concern/evidence semantics rather than legacy signals. |
| `selection/adversarial-scenarios.js` | KEEP NONCANONICAL | Validation fixture/scenario capability belongs with validation/simulation support, not runtime Intelligence. |
| `selection/discovery-comparison-harness*` | KEEP NONCANONICAL | Migration/regression comparison tooling; useful until canonical Discovery is promoted. |
| `selection/member-zero-simulation.js` | KEEP NONCANONICAL | Test/simulation fixture, not canonical runtime architecture. |
| `model/dimension-hypothesis-state*` | RETAIN TEMPORARILY | State-like capability may contain semantics worth reconciling, but canonical Member State is authoritative. Do not delete before semantic comparison. |
| `model/hierarchical-state*` | RETIRE LATER | Canonical Member State now owns hierarchical member state. Retain until dependency checks and any useful semantics are reconciled. |
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

1. `model/subdimension-taxonomy.js` compared with canonical taxonomy; missing valid vocabulary migrated without the legacy numeric state/averaging model.
2. `model/question-subdimension-map.js` compared with canonical Discovery; mapping mechanism determined obsolete because canonical questions carry direct semantic effects.

## Immediate migration queue

1. Rebuild the useful behavior from `selection/question-selector.js` as a canonical Discovery selector using concern/evidence semantics and canonical Safety contracts.
2. Inspect `model/dimension-hypothesis-state*` for any still-valid nonnumeric state semantics.
3. Inspect callers of `integration/routing-screen*`, `integration/experience-router*`, and `integration/checkin-shadow.js` before assigning ownership.
4. Update simulation/QA tooling to consume canonical contracts after reconciliation.

## Selector migration guardrails

Do not copy the legacy selector wholesale. In particular, do not restore legacy signal IDs or numeric wellness scoring. The canonical selector may rank questions internally, but ranking values are ephemeral decision-support calculations—not Member State and not member wellness scores. Safety eligibility/override must use the canonical Safety interface rather than a parallel selector-specific safety model.

## Deletion gate

A RETIRE LATER item can be deleted only when its canonical replacement is covered by mandatory QA; repository search shows no required caller; any unique still-valid semantics have been migrated; and the deletion itself passes canonical QA and relevant regression suites.
