# Discovery Legacy QA Migration Inventory

Status: active migration aid for the isolated Discovery reconstruction.

## Architecture boundary

The **EL8 Intelligence Engine** is the overall decision and coordination system. **Discovery** is one subsystem within it: the subsystem responsible for understanding the member, identifying concerns/drivers, resolving uncertainty, and producing sufficient traceable evidence/state for downstream intelligence functions.

The canonical Discovery implementation currently lives under `development/discovery/**` and is gated by the canonical repository/Discovery CI. Historical code under `intelligence/**` is migration source material unless explicitly promoted into the canonical Intelligence Engine architecture.

See `intelligence/README.md` for the target engine boundary and migration order.

## Canonical Discovery gates

- `development/discovery/questions/validate.mjs` — question-bank structural validity
- `development/discovery/questions/behavior-tests.mjs` — canonical question behavior
- `development/discovery/evidence-contract-tests.mjs` — evidence/provenance contracts
- `development/discovery/state-contract-tests.mjs` — derived-state contracts
- `development/discovery/regression-tests.mjs` — architecture regressions
- `development/discovery/end-to-end-tests.mjs` — adversarial end-to-end scenarios

## Legacy intelligence inventory

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
- tie/ambiguity clarification should only appear when dependencies are satisfied
- cross-dimensional questions may outrank narrower questions when they resolve shared uncertainty more efficiently
- specific actionable questions should outrank vague broad questions when appropriate
- expected information gain may distinguish otherwise similar candidates
- learned answer probabilities may refine future selection without changing canonical question meaning
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

Requirements to preserve/reconcile:
- answers produce explicit evidence rather than opaque score changes
- answer options map consistently to the evidence they contribute
- learning/history may affect future question selection without silently rewriting canonical question meaning
- cross-dimensional/driver evidence retains provenance

Migration target: canonical Intelligence evidence/state modules, with Discovery consuming their contracts rather than owning the entire Intelligence Engine.

### State / taxonomy

Historical suites:
- `intelligence/model/subdimension-taxonomy.test.js`
- `intelligence/model/hierarchical-state.test.js`

Requirements to preserve/reconcile:
- dimension/subdimension identifiers remain internally coherent
- derived state remains traceable to underlying evidence
- obsolete quantitative-state assumptions are not inherited merely for compatibility

Migration target: canonical Intelligence state/model layer shared by downstream prioritization/planning.

### Integration / routing policy

Historical suites:
- `intelligence/integration/routing-screen.test.js`
- `intelligence/integration/matrix-qa-selector.test.js`
- `intelligence/integration/blind-qa-policy.test.js`

Requirements to preserve/reconcile:
- Discovery output routes into downstream Intelligence decisions through an explicit contract
- question selection does not depend on hidden/manual test knowledge
- policy/routing behavior remains deterministic enough to regression-test
- old blind eight-dimension probing is not automatically authoritative

Migration target: explicit Discovery → Intelligence boundary contracts.

### Planning / interventions

Historical implementation includes plan-engine, intervention-library, end-to-end assessment, and adversarial infrastructure.

Classification: these are broader Intelligence Engine concerns, not Discovery concerns. Migrate useful behavior into clean prioritization/planning/intervention modules after evidence/state and selection/routing contracts are stable.

### Simulation

Historical suite:
- `intelligence/simulation/run-simulation.js`
- `intelligence/simulation/synthetic-members.js`

Requirement:
- exercise repeated/adversarial member paths at system level, not only isolated unit cases

Migration target: canonical Intelligence/Discovery scenario harnesses after the runtime contracts stabilize. The current Discovery `end-to-end-tests.mjs` remains the preferred Discovery-level scenario surface.

## Migrated root Discovery v2 requirements

The retired root `discovery-v2-*` files contained several behavioral requirements that remain valid at the principle level:

- no material concern may disappear silently
- unresolved/unknown concerns cannot be treated as resolved
- member correction/current direct evidence outranks weaker historical or derived evidence
- evidence for one concern must not falsely resolve another
- persistent uncertainty requires a strategy/recovery change rather than fabricated certainty
- avoid redundant recovery once sufficient evidence exists
- healthy/low-need paths should avoid unnecessary questioning
- correction recovery and multi-concern accountability belong in canonical regression/E2E coverage

Superseded implementation details include exact v2 terminal-state vocabularies, exact exit-reason arrays, exact answer IDs, v2 object shapes, v2 scoring thresholds, and fixed legacy question ceilings where they conflict with the reconstructed architecture.

## Retirement criteria

A legacy Intelligence/Discovery implementation or test is safe to retire only when all are true:

1. Its intended behavioral requirement is classified as current, superseded, obsolete, or review/recalibrate.
2. Every current requirement has equivalent canonical coverage.
3. Every review/recalibrate requirement has an explicit decision recorded before retirement.
4. Canonical tests pass independently of the legacy implementation.
5. No production/prototype entry point imports the legacy file.
6. Removing it does not remove unique approved behavior.

## Migration order

Follow the broader Intelligence Engine dependency order:

1. evidence and state/model behavior
2. question selection and routing
3. prioritization and planning
4. interventions
5. learning/adaptation
6. simulation and integration harnesses
7. retire superseded legacy modules/tests

This ordering is deliberate: migrate foundations once, then build downstream behavior on the canonical contracts instead of repeatedly rewriting dependent modules.
