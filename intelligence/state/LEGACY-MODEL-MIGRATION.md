# Legacy `intelligence/model/**` Migration Record

Status: **Step 1 capability classification; no legacy deletion authorized by this record alone**

This record classifies the capabilities currently represented by the historical model layer against the canonical taxonomy and Member State contracts.

## `subdimension-taxonomy.js`

Disposition: **REDESIGN / then RETIRE implementation**

Preserve:
- eight-dimension vocabulary
- useful broad topic/subdimension vocabulary
- concept that dimensions contain more detailed domains

Reject:
- arbitrary `0.12` default state
- treating every topic as a numeric pressure value
- deriving a dimension by averaging topic values

Canonical destination:
- `intelligence/state/taxonomy.js`
- `intelligence/state/member-state-contract.js`

Migration status: semantic vocabulary has been reconciled into the first milestone topic registry. Historical implementation remains temporarily for reference until Step 1 lock review is complete.

## `subdimension-taxonomy.test.js`

Disposition: **RETIRE after Step 1 lock**

The historical test primarily protects numeric defaults and dimension averaging. Those are explicitly rejected. Useful structural expectations (eight dimensions and detailed topics) are covered by canonical contract tests.

## `hierarchical-state.js`

Disposition: **REDESIGN / then RETIRE implementation**

Preserve:
- concept that detailed evidence should inform higher-level member understanding
- evidence-count/provenance awareness
- separation between detailed state and dimension-level presentation

Reject:
- mutable numeric deltas as evidence
- clamped pressure accumulation
- weighted numeric aggregation as the canonical dimension state

Canonical destination:
- evidence references on concern/driver state
- explicit concern/driver relationships
- later projection/read-model layer for member-facing dimension summaries

Migration status: core structural concepts are represented in Member State; projection behavior remains future work and should not be copied from the old numeric aggregator.

## `hierarchical-state.test.js`

Disposition: **RETIRE after Step 1 lock**

The historical assertions protect numeric pressure increases and aggregation thresholds. Canonical tests instead protect traceability, registry integrity, and absence of required numeric scoring.

## `dimension-hypothesis-state.js`

Disposition: **REDESIGN**

Preserve:
- candidate vs supported/cleared hypothesis lifecycle
- confirmation/contradiction concept
- ability to decide what still needs investigation

Reject:
- dimension-wide numeric priors as the hypothesis model
- hard-coded numeric confirmation thresholds as canonical truth
- treating entire dimensions as the primary hypothesis unit

Canonical destination:
- concern status
- driver-relationship status
- evidence sufficiency/unresolved reasons
- Discovery question-selection/sufficiency policy

Migration status: lifecycle vocabulary is partially represented by canonical concern and relationship statuses. Investigation-selection behavior must be reconciled during Discovery contract work rather than copied into State.

## `dimension-hypothesis-state.test.js`

Disposition: **TEMPORARY migration evidence**

The numeric threshold assertions are obsolete, but the behavioral scenarios (candidate, confirmed/supported, contradicted/cleared, next item requiring confirmation) should inform later Discovery contract/regression tests before this test is retired.

## `question-subdimension-map.js`

Disposition: **REDESIGN / then RETIRE implementation**

Preserve:
- explicit semantic relationship between authored questions and the domain concepts they investigate

Reject:
- historical question IDs as taxonomy
- a separate mapping table when current question definitions can carry their own semantic effects/topics/concerns

Canonical destination:
- current Discovery question definitions/effects
- canonical taxonomy/concern IDs
- later authoring validation ensuring question references resolve to known semantics

Migration status: current Discovery already embeds semantic effects in question definitions. Remaining useful historical mappings should be checked during the shallow Discovery capability inventory rather than preserved as a parallel canonical map.

## Step 1 lock conclusion

The legacy model layer contains useful concepts, but none of its numeric state machinery should become canonical.

The canonical replacement now covers:
- eight dimensions
- versioned topic registry
- versioned current concern registry
- concern lifecycle/status
- evidence/observation references
- first-class drivers
- cross-dimensional driver-to-concern relationships
- sufficiency/unresolved state
- member context
- safety references
- schema/taxonomy versioning
- structural validation

Still intentionally deferred to later canonical components:
- Discovery investigation-selection policy
- evidence contract details
- member-facing qualitative dimension projections
- prioritization
- persistence/storage implementation

No legacy model file should be deleted until the Step 1 contract tests are executed in the repository's canonical test environment and the Step 1 lock is recorded.
