# EL8 Intelligence Engine — Canonical Architecture

Status: **canonical target architecture**

This document defines the target architecture of the EL8 Intelligence Engine. It is the reference used to decide whether historical intelligence code should be migrated, redesigned, temporarily retained, or retired.

The architecture is intentionally defined before further aggressive legacy cleanup. Historical implementations are evidence of prior ideas; they are not authoritative merely because they exist.

## 1. Mission

The Intelligence Engine is EL8's decision and coordination system. It converts member observations into traceable understanding, determines what deserves attention, produces a manageable plan, selects interventions, evaluates outcomes, learns over time, and escalates explicit safety conditions.

The engine must optimize for useful decisions rather than maximum measurement. It should ask only what it needs, preserve uncertainty when evidence is insufficient, keep member-facing work focused, and remain auditable from source observation to downstream action.

## 2. Canonical pipeline

`Observations → Discovery → Evidence → Member State → Prioritization → Planning → Intervention → Outcomes → Learning`

Safety/escalation and orchestration are cross-cutting controls over the full pipeline.

Validation, simulation, telemetry, and observability verify the pipeline but do not define member truth.

## 3. Core components

### 3.1 Observation Intake

Purpose: accept member-provided and system-provided observations without prematurely interpreting them as truth about a dimension.

Responsibilities:
- normalize source, timestamp, temporality, answer/value, and provenance
- distinguish direct member input from derived/system evidence
- support assessment, check-in, tracking, integration, and intervention-outcome sources
- preserve corrections and contradictions rather than silently overwriting history

Output: immutable or append-oriented observations suitable for Discovery/evidence interpretation.

### 3.2 Discovery

Purpose: understand what is materially going on for the member with the minimum reasonable burden.

Subcomponents:
- concern detection and scope
- driver discovery
- adaptive question selection
- cross-dimensional investigation
- ambiguity/uncertainty resolution
- contradiction and correction handling
- evidence sufficiency
- concern accountability
- burden/question-budget governance
- Discovery exit and downstream handoff

Rules:
- Discovery is a subsystem of Intelligence, not the whole engine
- no material concern disappears silently
- unresolved uncertainty remains explicit
- sufficiently understood areas should not be repeatedly probed
- high-value/safety investigation may override ordinary burden limits
- cross-dimensional questions are preferred when they efficiently resolve shared uncertainty

### 3.3 Evidence

Purpose: represent what observations support, oppose, exclude, or leave uncertain.

Responsibilities:
- semantic effects rather than arbitrary member-facing scores
- provenance to originating observations/questions
- source type and temporality
- polarity/support/exclusion semantics
- certainty/strength where justified
- cross-dimensional and shared-driver effects
- contradictory evidence retention

Evidence is not the same as Member State. Evidence is the traceable basis from which state is derived.

### 3.4 Member State / Model

Purpose: maintain EL8's current, traceable understanding of the member.

State should support:
- eight dimensions and approved subdimensions/concerns
- active/inactive/unresolved concerns
- candidate drivers and relationships
- uncertainty and sufficiency
- temporal/freshness state
- baseline/current/history where product requirements require them
- member priorities/preferences
- readiness/capacity constraints

Rules:
- derived state must be traceable to evidence
- do not inherit obsolete quantitative wellness scoring merely for compatibility
- taxonomy is canonical domain vocabulary and should be maintained separately from transient question IDs
- state changes should be explainable

### 3.5 Prioritization

Purpose: decide what deserves attention now.

Inputs may include:
- member-stated importance
- urgency/immediacy
- safety
- severity/materiality
- leverage/shared-driver potential
- dependencies
- readiness/capacity
- expected benefit
- burden/cost
- recency and confidence

Outputs:
- ranked candidate concerns/drivers
- explicit rationale
- deferred items with reason
- escalation flags where applicable

Prioritization must not force all eight dimensions into active work. Balance is a system objective over time, not a requirement to create eight simultaneous tasks.

### 3.6 Planning

Purpose: convert prioritized intelligence into a focused, understandable member plan.

Responsibilities:
- select a small manageable set of objectives/actions
- respect dependencies and sequencing
- define cadence and expected outcome
- explain why an action is in the plan
- avoid duplicate/conflicting actions
- adapt plan load to member capacity
- preserve deferred priorities for later review

Planning consumes Intelligence state; it should not independently reinvent Discovery.

### 3.7 Intervention

Purpose: select and manage actions intended to improve the prioritized state.

Responsibilities:
- intervention catalog/library
- eligibility and contraindication/scope rules
- intervention-to-driver/concern mapping
- personalization parameters
- start/stop/replace/escalate lifecycle
- adherence/completion observations
- outcome expectations and review windows

Interventions can include actions, education, prompts, referrals, routines, tracking requests, and other approved EL8 mechanisms.

### 3.8 Learning & Adaptation

Purpose: improve future Intelligence decisions from outcomes without silently rewriting canonical meaning.

Responsibilities:
- question usefulness/calibration telemetry
- intervention effectiveness by context
- answer/outcome distributions
- plan burden/adherence patterns
- repeated-member history
- calibration drift detection
- conservative adjustment of authored priors/policies

Rules:
- learned behavior must be bounded and auditable
- canonical question/evidence meaning is not silently changed by empirical frequency
- member-specific adaptation and global/system learning must remain distinguishable
- sufficient evidence is required before empirical behavior influences authored defaults

### 3.9 Safety & Escalation

Purpose: provide explicit override behavior for conditions that should not follow ordinary wellness optimization routing.

Responsibilities:
- detect approved safety/escalation signals
- interrupt normal question-budget or prioritization rules where required
- produce explicit escalation state/action
- maintain provenance and auditability
- avoid diagnosing beyond EL8's approved scope

Safety is cross-cutting and may override Discovery, prioritization, planning, or intervention behavior.

### 3.10 Orchestration / Lifecycle

Purpose: coordinate when Intelligence components run and what contract passes between them.

Responsibilities:
- assessment → Discovery → plan lifecycle
- daily/weekly/monthly check-in routing
- event-driven reevaluation
- stale-state refresh
- intervention review
- plan revision
- environment/version compatibility
- idempotency and deterministic reruns where required

The orchestrator coordinates components; it should contain minimal domain logic itself.

### 3.11 Validation, Simulation & Observability

Purpose: prove the engine behaves correctly and make failures diagnosable.

Includes:
- unit/contract tests
- regression suites
- adversarial scenarios
- synthetic-member simulations
- end-to-end scenarios
- release gates
- telemetry and structured decision traces
- performance/burden metrics
- environment health checks

Tests validate canonical behavior; historical tests are migration evidence, not permanent architecture requirements.

## 4. Canonical boundaries

### Discovery owns
- asking/choosing investigative questions
- resolving concerns/drivers/uncertainty
- determining Discovery sufficiency
- producing evidence/state handoff

### Discovery does not own
- final prioritization of all member work
- plan construction
- intervention selection/lifecycle
- long-term learning policy
- app UI
- persistence infrastructure

### Intelligence owns
The complete decision lifecycle from observations through learning, including the contracts between its subsystems.

### Product/app owns
Presentation, navigation, interaction surfaces, authentication UX, and rendering of Intelligence outputs.

### Data/platform owns
Persistence, identity, authorization, environment isolation, migrations, backups, and infrastructure concerns. Intelligence defines data contracts but should not own platform implementation.

## 5. Canonical repository target

Target conceptual structure:

```text
intelligence/
  README.md
  ARCHITECTURE.md
  observations/
  discovery/
  evidence/
  state/
  prioritization/
  planning/
  interventions/
  learning/
  safety/
  orchestration/
  validation/
```

During reconstruction, `development/discovery/**` remains the canonical current Discovery implementation. It should eventually be promoted/moved into the canonical Intelligence structure once the subsystem is stable and the environment pipeline is ready for that promotion.

Historical folders under `intelligence/**` remain migration source material until individually classified.

## 6. Environment contract

The engine must support the repository's separated environments without creating separate divergent engines.

- stable and development consume versioned canonical Intelligence contracts
- experimental work is isolated until validated/promoted
- stable and development deployments remain independently usable
- authentication/session configuration must permit a user to be signed into a stable account and a development account simultaneously without session collision
- environment-specific configuration must not leak into domain logic

## 7. Architecture invariants

1. Every important downstream decision is explainable from traceable evidence/state.
2. Uncertainty is represented, not fabricated away.
3. Corrections and contradictions preserve history/provenance.
4. Safety overrides ordinary optimization when explicitly triggered.
5. Discovery minimizes unnecessary questioning.
6. Member-facing plans remain manageable and focused.
7. The eight dimensions remain available to the system without requiring simultaneous intervention in all eight.
8. Question IDs and implementation filenames are not domain taxonomy.
9. Learning may calibrate behavior but may not silently redefine canonical semantics.
10. Orchestration coordinates domain modules instead of accumulating their business logic.
11. Stable/development/experimental environments share architecture and contracts rather than becoming separate products.
12. Canonical modules should be cohesive and reasonably sized to reduce truncated edits and review risk.
13. Legacy code is retired only after unique approved behavior is migrated or explicitly rejected.

## 8. Migration classification

Every legacy component must receive one of four dispositions:

- **MIGRATE** — behavior is necessary and should be rebuilt on canonical contracts.
- **REDESIGN** — concept is necessary but implementation/semantics are unsuitable.
- **TEMPORARY** — still needed during migration but not part of the target architecture.
- **RETIRE** — obsolete, duplicated, broken, or contrary to canonical architecture.

No further broad deletion should occur without recording the relevant capability/disposition in the migration inventory.

## 9. Current legacy map

Repository inventory currently shows historical components under:
- `intelligence/model/**` — hypothesis state, hierarchical state, subdimension taxonomy, question/subdimension mapping
- `intelligence/question-bank/**` — older question schema/content and clarification logic
- `intelligence/selection/**` — adaptive Discovery, selector, adversarial scenarios, comparison harnesses
- `intelligence/policy/**` — question-budget governance
- `intelligence/planning/**` — planning/intervention-era implementation and tests
- `intelligence/integration/**` — routing and integration-era logic/tests
- `intelligence/simulation/**` — synthetic member/simulation infrastructure

The legacy `intelligence/evidence/**` quantitative implementation has been retired after comparison with the reconstructed observation/effect contracts. Useful evidence principles are preserved in this architecture and the canonical Discovery migration inventory.

## 10. Migration order

To minimize rework:

1. lock taxonomy and state contracts
2. finish Discovery/evidence contracts
3. migrate adaptive selection and burden policy
4. define Discovery → Prioritization handoff
5. build prioritization
6. migrate/redesign planning
7. migrate/redesign interventions
8. add bounded learning/adaptation
9. consolidate safety/escalation
10. build orchestration contracts
11. rebuild simulation/validation around canonical modules
12. retire remaining legacy implementations
13. promote stable Discovery/Intelligence modules out of reconstruction paths

## 11. Change control

Changes to the major component boundaries, canonical pipeline, or architecture invariants should update this document first or in the same commit as the implementation change.

Implementation details may evolve without changing this specification when they preserve the stated contracts and invariants.
