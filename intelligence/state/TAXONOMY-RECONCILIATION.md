# EL8 Taxonomy Reconciliation

Status: **Step 1 working decision record**

Purpose: reconcile the historical subdimension taxonomy with the reconstructed Discovery concern/driver model before declaring the canonical Member State taxonomy locked.

## Decision

Do **not** promote the historical subdimension list wholesale into canonical state.

The historical model mixes at least three different semantic levels:

1. **dimensions** — stable wellness domains (Physical, Emotional, etc.)
2. **topics/subdimensions** — broad areas such as Sleep, Nutrition, Debt Burden, Support, Meaning
3. **concerns/drivers** — current actionable hypotheses such as poor sleep, money pressure, low support, work instability, or schedule disruption

The reconstructed Discovery bank primarily reasons in concern/driver IDs. Those IDs should not be forced into a one-to-one mapping with historical subdimensions.

Canonical Member State therefore uses this hierarchy:

`Dimension → Topic(s) → Concern(s) ↔ Driver relationships`

A concern has one owning dimension for organization, may reference one or more topic IDs, and may be affected by drivers from any dimension. Cross-dimensional evidence is expected and does not change concern ownership.

## Locked dimensions

Canonical IDs:

- `physical`
- `emotional`
- `social`
- `spiritual`
- `intellectual`
- `occupational`
- `financial`
- `environmental`

These are stable domain identifiers. Display labels are separate from IDs.

## Topic/subdimension treatment

The historical vocabulary is useful as a candidate topic catalog, but it is not yet approved as a permanent exhaustive ontology.

Disposition by dimension:

### Physical

Historical candidates: Sleep, Energy, Movement, Nutrition, MedicalHealth, SubstanceExposure.

Disposition: **MIGRATE as topic candidates**, subject to naming normalization. They represent distinct broad areas and align with current Discovery concerns such as `poor_sleep`, `low_energy`, `low_activity`, and `physical_condition`.

### Emotional

Historical candidates: Mood, Stress, Regulation, Resilience, SelfPerception, Manageability.

Disposition: **REDESIGN before lock**. Stress is clearly useful, but several terms describe capacities or outcomes rather than clean topic boundaries. Current Discovery also uses concerns such as `stress` and `low_activation` that may cross Emotional/Intellectual/Physical contexts.

### Social

Historical candidates: Connection, Support, Belonging, RelationshipQuality, Isolation.

Disposition: **MIGRATE/CONSOLIDATE**. The list contains meaningful distinctions but also overlap (Connection/Belonging/Isolation). Current Discovery explicitly distinguishes `relationship_strain`, `low_support`, and `lonely`; topic boundaries should support those without creating redundant state.

### Spiritual

Historical candidates: Meaning, Purpose, ValuesAlignment, InnerPeace, Practice.

Disposition: **MIGRATE as topic candidates**, but do not force every member through all five. Current Discovery's `lack_direction` may involve Spiritual, Occupational, or Intellectual evidence depending on context.

### Intellectual

Historical candidates: Focus, Clarity, Learning, Curiosity, CognitiveLoad, DecisionCapacity.

Disposition: **MIGRATE/REDESIGN**. Focus, Learning, Cognitive Load, and Decision Capacity are useful distinctions. Clarity/Focus and Curiosity/Learning require overlap review. Current Discovery concerns include `low_focus` and `low_activation`.

### Occupational

Historical candidates: EmploymentStability, Workload, Satisfaction, Direction, Development, IncomeStability.

Disposition: **MIGRATE/REDESIGN**. Employment stability, workload, satisfaction, direction, and development are useful. Income stability is strongly coupled to Financial state and should not become duplicate truth; Occupational may own employment/income-source stability while Financial owns financial adequacy/pressure.

### Financial

Historical candidates: IncomeAdequacy, ExpenseLoad, DebtBurden, Liquidity, Security, FinancialControl.

Disposition: **MIGRATE as topic candidates**. These provide useful explanatory detail underneath the broader current Discovery concern `money_pressure`. Discovery currently asks whether pressure is driven by no/low/unstable income, expenses, debt, or acute expense; canonical state should be able to retain that detail without reducing it to one score.

### Environmental

Historical candidates: Safety, Stability, Comfort, Organization, Access, EnvironmentalStress.

Disposition: **MIGRATE/REDESIGN**. Safety, stability, access, organization, and environmental stress are useful. Comfort may overlap with environmental stress/stability and should remain provisional until current question semantics are reconciled.

## Concern ownership

Concern IDs are semantic hypotheses, not subdimension IDs.

Initial current Discovery examples and provisional owning dimensions:

- `poor_sleep` → physical
- `low_energy` → physical
- `low_activity` → physical
- `physical_condition` → physical
- `stress` → emotional
- `relationship_strain` → social
- `low_support` → social
- `lonely` → social
- `low_focus` → intellectual
- `low_activation` → intellectual (provisional; may be cross-dimensional in evidence)
- `work_instability` → occupational
- `schedule_disruption` → occupational (provisional; driver may affect several concerns)
- `money_pressure` → financial
- `home_instability` → environmental
- `lack_direction` → spiritual (provisional; evidence may be occupational/intellectual/spiritual)

Ownership is for organization and default routing only. It does not imply that all evidence or causes belong to that dimension.

## Driver model

Drivers must be first-class relationships rather than encoded as dimension score spillover.

A driver record should be able to represent:

- a semantic driver ID
- evidence/observation provenance
- affected concern IDs
- optional owning/origin dimension
- temporality
- confidence/sufficiency where justified
- relationship status (candidate/supported/contradicted/excluded/resolved as appropriate)

This allows, for example, employment instability to contribute to financial pressure and stress without copying numeric pressure into three dimension scores.

## State rules resulting from reconciliation

1. Dimension state is not an average of topic/concern scores.
2. Topics do not carry arbitrary default values such as `0.12`.
3. Concerns retain evidence references and explicit uncertainty/sufficiency.
4. Drivers may cross dimensions.
5. A topic may contain multiple concerns over time.
6. A concern may reference multiple topics when genuinely necessary, but has one owning dimension for routing.
7. Historical question/signal IDs are not canonical taxonomy.
8. Current Discovery concern IDs are also not automatically permanent ontology; they are canonical implementation semantics for the current milestone and can be versioned/refined deliberately.
9. Baseline/current/history are derived views over evidence/state, not competing taxonomies.
10. Member-facing qualitative dimension states, if used by the product, are projections of underlying state and must not replace traceable concern/evidence records.

## Step 1 remaining work

Before Step 1 is declared complete:

1. define the canonical topic registry format and approve the first milestone topic set
2. define concern and driver registry/relationship contracts
3. update Member State contract to reference canonical topic/concern/driver registries cleanly
4. add contract tests proving no numeric default/aggregation model is required
5. classify the remaining legacy `intelligence/model/**` capabilities against the new contracts without deleting them yet

Only then should taxonomy + Member State be considered locked for the vertical-slice milestone.
