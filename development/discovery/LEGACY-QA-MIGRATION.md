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

## Root Discovery v2 QA — classified

### `discovery-v2-7-contract-qa.js`

Historical assertions:
- terminal signal states are exactly `resolved`, `linked`, `cleared`, `deferred`
- hard question ceiling is exactly 8
- evidence precedence is exactly `member-correction > current-direct > current-derived > warm-start`
- exit reasons are exactly `resolved`, `healthy`, `opt-out`, `budget`
- every material signal must be terminal before a resolved exit
- open/unknown/null signals cannot silently count as resolved/accounted

Classification:
- **CURRENT PRINCIPLE:** no material concern may disappear silently; unresolved/unknown concerns cannot be treated as resolved.
- **CURRENT PRINCIPLE:** member correction and current direct evidence must outrank weaker historical/derived evidence. Exact legacy array/API is not authoritative.
- **SUPERSEDED IMPLEMENTATION DETAIL:** exact terminal-state vocabulary. Round 3 uses its own resolution-state model.
- **SUPERSEDED IMPLEMENTATION DETAIL:** exact four exit-reason strings.
- **SUPERSEDED IMPLEMENTATION DETAIL:** exact 8-question ceiling. The reconstructed controller currently uses an explicit configurable outer guardrail and priority-resolution fallback rather than inheriting the old constant.

Migration target: canonical tests must enforce concern accountability and precedence semantics without importing the v2.7 contract object.

### `discovery-v2-5-driver-closure-qa.js`

Historical regression:
- money + sleep + energy can all be raised simultaneously
- a scope answer may narrow a concern but must not be mistaken for driver proof
- evidence for one concern/bridge must not falsely resolve unrelated open concerns
- known money-driver evidence should be retained as such
- Discovery must continue asking a useful discriminator while material driver uncertainty remains
- it must not emit a false resolved exit after only partial closure

Classification:
- **CURRENT:** all six behavioral requirements remain valid.
- **SUPERSEDED IMPLEMENTATION DETAIL:** exact answer IDs, direct-score thresholds, `driverEvidence` field shape, and requirement that the next question be specifically `E2` or `SL2`.

Migration target: add a canonical multi-concern partial-closure regression using Round 3 state/evidence contracts.

### `discovery-v2-persistent-uncertainty-regression.js`

Historical regression:
- repeated `Not sure` answers must change question strategy
- Discovery must not end merely because uncertainty persists
- after repeated uncertainty it should offer a more concrete/observable recovery question rather than another equally uncertain prompt
- once a recovery question resolves the concern, no redundant recovery question is required

Classification:
- **CURRENT PRINCIPLE:** persistent uncertainty requires a strategy change/recovery path and cannot silently become certainty.
- **CURRENT PRINCIPLE:** avoid redundant recovery once sufficient evidence is obtained.
- **SUPERSEDED IMPLEMENTATION DETAIL:** exactly two uncertain answers, exact `uncertaintyStreak` field, and blanket requirement that the recovery question contain no `unsure` option. Round 3 recovery is concern/state-driven rather than a global streak counter.

Migration target: canonical regression should verify recovery/specificity escalation after weak evidence without requiring the old global state fields.

### `discovery-v2-synthetic-runner.js --enforce`

Historical acceptance metrics:
- true driver appears in top three often enough
- healthy cases exit early
- member corrections recover correctly
- uncertain cases recover useful signal
- all required member-raised signals are accounted for
- silent abandonment rate is zero
- budget exhaustion remains bounded
- routes should not collapse into nearly identical question sequences across scenario classes

Classification:
- **CURRENT:** member-raised concern accountability and zero silent abandonment.
- **CURRENT:** correction recovery.
- **CURRENT:** healthy/low-need paths should avoid unnecessary questioning.
- **CURRENT:** uncertainty should have a useful recovery path.
- **CURRENT:** adversarial multi-concern scenarios belong in canonical system-level tests.
- **REVIEW/RECALIBRATE:** driver top-three metric. Round 3 is evidence/state/plan oriented and should not inherit ranking thresholds blindly.
- **REVIEW/RECALIBRATE:** budget-exhaustion percentage. Retain bounded burden/guardrail behavior, but establish a threshold from the reconstructed design.
- **REVIEW/RECALIBRATE:** route-overlap metric. Diversity is useful only when driven by member evidence; route diversity is not itself a product goal.

Migration target: use `development/discovery/end-to-end-tests.mjs` as the canonical scenario surface. Add missing accountability, healthy-exit, correction, uncertainty-recovery and multi-concern partial-closure scenarios there. Do not port the old synthetic runner wholesale.

## Retirement criteria for legacy Discovery files

A legacy Discovery implementation/test file is safe to retire only when all of the following are true:

1. Its intended behavioral requirement has been classified as current, superseded, obsolete, or review/recalibrate.
2. Every current requirement has an equivalent canonical test under `development/discovery/**`.
3. Every review/recalibrate requirement has an explicit decision recorded before retirement.
4. The canonical test passes independently of root Discovery implementation files.
5. No production/prototype entry point still imports the legacy file.
6. Removing it does not remove unique test coverage that remains part of the approved Discovery specification.

## CI policy during reconstruction

- `Discovery Development Regression` is the authoritative CI gate for the isolated reconstruction.
- `Adaptive QA Tests` remains a repository-wide compatibility signal while it still runs historical suites.
- A red historical suite is investigated and classified; it is not by itself a reason to distort the reconstructed architecture.
- Before merge to `main`, unresolved failures must be explicitly classified and any still-valid requirement must be represented in canonical tests.

## Next migration pass

1. Add canonical regressions for multi-concern partial closure and persistent-uncertainty recovery.
2. Add/confirm canonical accountability, healthy-path and correction scenarios in end-to-end coverage.
3. Review evidence/learning legacy suites against the Round 3 observation/projection model.
4. Review integration suites after the reconstructed Discovery output contract is locked.
5. Search repository imports/references before deleting or archiving legacy Discovery files.
