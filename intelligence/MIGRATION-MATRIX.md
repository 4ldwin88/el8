# Intelligence Legacy Migration Record

Status: **COMPLETED FOR THE CLASSIFIED DISCOVERY/MODEL/INTEGRATION/SIMULATION SCOPE**

This file is retained as a concise historical record of the controlled Intelligence reconstruction. It is no longer an active migration queue.

## Result

Canonical Discovery has been promoted to `intelligence/discovery/**` and mandatory QA executes from that location.

The classified legacy runtime areas were reconciled and removed after their valid semantics were either migrated, represented canonically elsewhere, or explicitly rejected:

- legacy `intelligence/model/**`
- legacy `intelligence/selection/**`
- legacy `intelligence/simulation/**`
- legacy routing/scoring/shadow/QA implementations under `intelligence/integration/**`
- the temporary `development/discovery/**` promotion copy

An orphaned `experience-router.test.js` left after the integration batch was subsequently removed as well.

## Semantics preserved

The reconstruction retained the useful behavior rather than the obsolete file shapes:

- canonical taxonomy and concern vocabulary
- traceable Member State lifecycle and sufficiency
- evidence provenance and contradiction handling
- adaptive question selection
- dependency/trigger eligibility
- uncertainty/information need
- redundancy suppression
- burden/capacity sensitivity
- deterministic selection
- Safety-critical override behavior
- adversarial, vertical-slice, end-to-end, and synthetic validation

## Semantics intentionally rejected

The canonical architecture does not preserve:

- aggregate wellness scores
- mutable numeric dimension/subdimension state
- numeric confidence accumulation as member truth
- weighted/peak dimension scoring
- legacy signal-ID routing as canonical taxonomy
- numeric experience-router severity weights as Intelligence state
- parallel legacy selector/policy engines

Internal ranking calculations may still be used to choose among candidate actions/questions, but those values are ephemeral decision mechanics and are not Member State or member wellness scores.

## Canonical locations

- shared contracts: `intelligence/contracts/**`
- Discovery: `intelligence/discovery/**`
- Member State/taxonomy: `intelligence/state/**`
- Prioritization: `intelligence/prioritization/**`
- Planning: `intelligence/planning/**`
- Interventions: `intelligence/interventions/**`
- Outcomes: `intelligence/outcomes/**`

`intelligence/ARCHITECTURE.md` remains the architectural authority for subsystem boundaries and future build-out.

## Validation result

The migration was executed behind repeated QA boundaries. Canonical Repository QA and Discovery Development Regression passed after:

1. canonical Discovery promotion,
2. removal of the former development copy,
3. legacy model removal,
4. legacy integration removal, and
5. legacy selection/simulation removal.

The canonical synthetic simulation also exposed a real `targets` versus `effects` integration mismatch during migration; that defect was corrected before legacy simulation retirement. This is evidence that the replacement validation path was functioning rather than merely duplicating old tests.

## Remaining repository cleanup

This migration record does **not** declare every historical file in the repository obsolete. Older root-level prototype files, `intelligence/question-bank/**`, `intelligence/policy/**`, planning-era files, migration notes, and product/UI artifacts require their own dependency/ownership decisions before deletion.

Future cleanup must therefore continue capability-by-capability rather than treating completion of this migration as permission for indiscriminate repository deletion.
