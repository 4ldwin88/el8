# Discovery Legacy QA Migration Inventory

Status: active migration aid for the isolated Discovery reconstruction.

## Purpose

The canonical Discovery implementation lives under `development/discovery/**` and is gated by `.github/workflows/discovery-round3.yml`.

The repository-wide `npm test` gate still executes the historical intelligence and root `discovery-v2-*` suites. Those tests are useful evidence, but they are not automatically authoritative for the reconstructed implementation. This inventory prevents us from changing the new architecture merely to satisfy obsolete implementation assumptions.

## Canonical gates already present

`development/discovery/questions/validate.mjs`
- question-bank structural validity

`development/discovery/questions/behavior-tests.mjs`
- canonical question behavior

`development/discovery/regression-tests.mjs`
- architecture regressions

`development/discovery/end-to-end-tests.mjs`
- adversarial end-to-end scenarios

## Legacy `npm test` inventory

### Selection / adaptive questioning

Historical suites:
- `intelligence/selection/question-selector.test.js`
- `intelligence/selection/adaptive-discovery-v1.test.js`
- `intelligence/selection/discovery-comparison-harness.test.js`
- `intelligence/selection/adaptive-discovery-adversarial.test.js`

Requirements worth preserving at the behavioral level:
- questioning respects friction/capacity and explicit question limits
- high-value urgent signals can outrank routine questions
- safety follow-ups can override ordinary burden limits when explicitly triggered
- sufficiently certain/fresh evidence should suppress unnecessary questioning
- stale evidence may be refreshed
- recently asked questions should not be repeated without cause
- tie/ambiguity clarification should only appear when its dependencies are satisfied
- cross-dimensional questions may outrank narrower questions when they resolve shared uncertainty more efficiently
- specific actionable questions should outrank vague broad questions when appropriate
- expected information gain can distinguish otherwise similar candidates
- learned answer probabilities may refine information-gain estimates
- breadth alone must not artificially inflate information gain

Migration rule: preserve these outcomes only where they agree with the current Discovery specification. Do not preserve old selector APIs, filenames, scoring constants, or object shapes merely for compatibility.

### Evidence / learning

Historical suites:
- `intelligence/evidence/answer-evidence.test.js`
- `intelligence/evidence/answer-value-matrix.test.js`
- `intelligence/evidence/learning-loop.test.js`
- `intelligence/evidence/qa-option-evidence.test.js`
- `intelligence/evidence/question-option-evidence.test.js`
- `intelligence/evidence/driver-spillover-evidence.test.js`

Candidate requirements to reconcile before migration:
- answers must produce explicit evidence rather than opaque score changes
- answer options must map consistently to the evidence they contribute
- learning/history may affect future question selection without silently rewriting canonical question meaning
- cross-dimensional/driver evidence must retain provenance

Status: review against current Discovery evidence/state model before porting.

### State / taxonomy

Historical suites:
- `intelligence/model/subdimension-taxonomy.test.js`
- `intelligence/model/hierarchical-state.test.js`

Candidate requirements to reconcile before migration:
- dimension/subdimension identifiers remain internally coherent
- derived state must remain traceable to underlying evidence

Status: review against the current four-state and Discovery output architecture; do not inherit obsolete quantitative-state assumptions.

### Integration / routing policy

Historical suites:
- `intelligence/integration/routing-screen.test.js`
- `intelligence/integration/matrix-qa-selector.test.js`
- `intelligence/integration/blind-qa-policy.test.js`

Candidate requirements to reconcile before migration:
- Discovery output must route into downstream decisions through an explicit contract
- question selection must not depend on hidden/manual test knowledge
- policy/routing behavior must remain deterministic enough to regression-test

Status: migrate as contract tests only after the reconstructed Discovery output contract is locked.

### Simulation

Historical suite:
- `intelligence/simulation/run-simulation.js`

Candidate requirement:
- exercise repeated/adversarial member paths at system level, not only isolated unit cases

Status: the canonical `end-to-end-tests.mjs` is the preferred replacement surface. Add missing scenario classes there rather than reviving the old simulation architecture.

### Root Discovery v2 QA

Historical suites:
- `discovery-v2-synthetic-runner.js --enforce`
- `discovery-v2-7-contract-qa.js`
- `discovery-v2-5-driver-closure-qa.js`
- `discovery-v2-persistent-uncertainty-regression.js`

Migration rule:
- extract still-valid acceptance criteria from these suites
- represent those criteria inside `development/discovery/**`
- do not make canonical code import or depend on root `discovery-v2-*` implementation files
- once every still-valid criterion has a canonical equivalent, retire the corresponding root QA dependency from the Discovery development gate

## Retirement criteria for legacy Discovery files

A legacy Discovery implementation/test file is safe to retire only when all of the following are true:

1. Its intended behavioral requirement has been classified as current, superseded, or obsolete.
2. Every current requirement has an equivalent canonical test under `development/discovery/**`.
3. The canonical test passes independently of root Discovery implementation files.
4. No production/prototype entry point still imports the legacy file.
5. Removing it does not remove unique test coverage that remains part of the approved Discovery specification.

## CI policy during reconstruction

- `Discovery Development Regression` is the authoritative CI gate for the isolated reconstruction.
- `Adaptive QA Tests` remains a repository-wide compatibility signal while it still runs historical suites.
- A red historical suite is investigated and classified; it is not by itself a reason to distort the reconstructed architecture.
- Before merge to `main`, unresolved failures must be explicitly classified and any still-valid requirement must be represented in canonical tests.

## Next migration pass

1. Inspect the four root `discovery-v2-*` suites and extract their acceptance criteria.
2. Compare each criterion against current canonical regression/end-to-end coverage.
3. Add only missing current requirements to canonical tests.
4. Repeat for evidence and integration suites.
5. Search repository imports/references before deleting or archiving legacy Discovery files.
