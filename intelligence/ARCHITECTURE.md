# EL8 Intelligence Engine — Canonical Architecture

Status: **canonical target architecture and migration strategy**

This document defines the target architecture of the EL8 Intelligence Engine and the controlled reconstruction/migration strategy used to reach it. Historical implementations are evidence of prior behavior and domain knowledge; they are not authoritative merely because they exist.

Further broad legacy deletion is paused until the relevant capability has been classified and the canonical replacement boundary has been proven.

## 1. Mission

The Intelligence Engine is EL8's decision and coordination system. It converts member observations into traceable understanding, determines what deserves attention, produces a manageable plan, selects interventions, evaluates outcomes, learns over time, and escalates explicit safety conditions.

The engine optimizes for useful decisions rather than maximum measurement. It should ask only what it needs, preserve uncertainty when evidence is insufficient, keep member-facing work focused, and remain auditable from source observation to downstream action.

## 2. Canonical system model

The primary decision flow is:

`Observations → Discovery → Evidence/State → Prioritization → Planning → Intervention → Outcomes → Learning`

This is a decision-flow diagram, not a claim that every component is a one-way pipeline stage.

**Member State is a shared substrate.** Discovery derives/updates it from traceable evidence; Prioritization, Planning, Intervention review, Learning, and Orchestration may read it through canonical contracts. State access must not be reinvented independently inside each subsystem.

**Safety/Escalation is cross-cutting.** Its interface is defined early so Discovery, Prioritization, Planning, and Interventions can raise and consume safety signals consistently. Full safety implementation may mature later.

**Orchestration is cross-cutting coordination.** It schedules/coordinates component execution but should contain minimal domain logic.

Validation, simulation, telemetry, and observability verify the system but do not define member truth.

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

Purpose: maintain EL8's current, traceable understanding of the member as a shared Intelligence substrate.

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
- consumers use shared contracts rather than private reinterpretations of state

### 3.5 Prioritization

Purpose: decide what deserves attention now.

Inputs may include member-stated importance, urgency/immediacy, safety, severity/materiality, leverage/shared-driver potential, dependencies, readiness/capacity, expected benefit, burden/cost, recency, and confidence.

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

Planning consumes Intelligence state and prioritization output; it should not independently reinvent Discovery.

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
- member-specific adaptation and global/system learning remain distinguishable
- sufficient evidence is required before empirical behavior influences authored defaults

### 3.9 Safety & Escalation

Purpose: provide explicit override behavior for conditions that should not follow ordinary wellness optimization routing.

Responsibilities:
- define a shared safety signal/interface early in reconstruction
- detect approved safety/escalation signals
- interrupt normal question-budget or prioritization rules where required
- produce explicit escalation state/action
- maintain provenance and auditability
- avoid diagnosing beyond EL8's approved scope

Safety is cross-cutting and may override Discovery, Prioritization, Planning, or Intervention behavior.

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
- vertical-slice and end-to-end scenarios
- release gates
- telemetry and structured decision traces
- performance/burden metrics
- environment health checks

Tests validate canonical behavior; historical tests are migration evidence, not permanent architecture requirements.

## 4. Shared contracts

Create/maintain a small `intelligence/contracts/` surface only for genuinely cross-boundary concepts. Do not turn it into a generic dumping ground.

Likely shared contracts include:
- observation envelope/reference
- evidence/effect envelope/reference
- Member State identifiers/references and versioning
- safety/escalation signal and disposition
- Discovery handoff/result envelope
- prioritization result/reference
- outcome/reference
- common IDs, timestamps, provenance, schema versions, and decision-trace metadata where shared

Subsystem-private types/contracts remain with their owning subsystem.

Cross-subsystem contracts should be versionable and testable so stable/development/experimental environments can consume the same canonical semantics.

## 5. Canonical boundaries

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
The complete decision lifecycle from observations through learning, including contracts between its subsystems.

### Product/app owns
Presentation, navigation, interaction surfaces, authentication UX, and rendering of Intelligence outputs.

### Data/platform owns
Persistence, identity, authorization, environment isolation, migrations, backups, and infrastructure concerns. Intelligence defines data contracts but does not own platform implementation.

Multi-account stable/development session isolation is therefore a platform/auth requirement, not an Intelligence implementation responsibility.

## 6. Canonical repository target

Target conceptual structure:

```text
intelligence/
  README.md
  ARCHITECTURE.md
  contracts/
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

During reconstruction, `development/discovery/**` remains the canonical current Discovery implementation.

### Discovery promotion gate

Promote/move `development/discovery/**` into `intelligence/discovery/**` after all of the following are true:
1. taxonomy/Member State and required shared contracts are locked for the current milestone
2. the Safety/Escalation interface required by Discovery is defined
3. the Discovery/Evidence contracts pass canonical contract/regression tests
4. a thin canonical vertical slice reaches an Outcome without importing legacy Intelligence implementations as hidden dependencies
5. required adversarial vertical-slice cases pass
6. remaining legacy Discovery dependencies are explicitly classified

Promotion should happen promptly after this gate so temporary paths do not become permanent dependencies.

Historical folders under `intelligence/**` remain migration source material until classified.

## 7. Environment contract

The engine supports separated environments without creating divergent engines.

- experimental work is isolated until validated/promoted
- development integrates validated work
- stable consumes promoted, release-gated work
- environments consume the same versioned canonical Intelligence contracts
- stable and development deployments remain independently usable
- authentication/session configuration permits a user to be signed into stable and development accounts simultaneously without session collision
- environment-specific configuration does not leak into domain logic

Conceptual promotion direction:

`experimental → development → stable`

Branching/deployment mechanics and authentication isolation belong to repository/platform configuration, not Intelligence domain modules.

## 8. Architecture invariants

1. Every important downstream decision is explainable from traceable evidence/state.
2. Uncertainty is represented, not fabricated away.
3. Corrections and contradictions preserve history/provenance.
4. Safety overrides ordinary optimization when explicitly triggered.
5. Discovery minimizes unnecessary questioning.
6. Member-facing plans remain manageable and focused.
7. The eight dimensions remain available without requiring simultaneous intervention in all eight.
8. Question IDs and implementation filenames are not domain taxonomy.
9. Learning may calibrate behavior but may not silently redefine canonical semantics.
10. Orchestration coordinates domain modules instead of accumulating their business logic.
11. Stable/development/experimental environments share architecture/contracts rather than becoming separate products.
12. Canonical modules are cohesive and reasonably sized to reduce truncated edits and review risk.
13. Legacy code is retired only after unique approved behavior is migrated or explicitly rejected.
14. Member State is a shared substrate accessed through canonical contracts, not a one-time pipeline payload.
15. Cross-boundary contracts have explicit ownership/versioning and contract tests.
16. A complete thin vertical slice must validate boundaries before full downstream subsystem build-out.

## 9. Legacy migration classification

Every legacy capability eventually receives one of four dispositions:

- **MIGRATE** — behavior is necessary and should be rebuilt on canonical contracts.
- **REDESIGN** — concept is necessary but implementation/semantics are unsuitable.
- **TEMPORARY** — retained during migration but not part of the target architecture.
- **RETIRE** — obsolete, duplicated, broken, or contrary to canonical architecture.

### Classification strategy

Do not perform exhaustive archaeology before the architecture has been pressure-tested.

Before the vertical slice:
- perform a shallow capability inventory sufficient to avoid omitting obvious unique behavior
- default ambiguous material to **TEMPORARY**
- do not broadly delete ambiguous legacy modules

After the vertical slice validates the contracts:
- perform detailed classification informed by the working canonical system
- migrate/redesign unique approved behavior
- retire confirmed-obsolete implementations

This prevents the migration matrix from becoming open-ended process work or being repeatedly redone as contracts change.

## 10. Current legacy map

Historical components currently include:
- `intelligence/model/**` — hypothesis state, hierarchical state, subdimension taxonomy, question/subdimension mapping
- `intelligence/question-bank/**` — older question schema/content and clarification logic
- `intelligence/selection/**` — adaptive Discovery, selector, adversarial scenarios, comparison harnesses
- `intelligence/policy/**` — question-budget governance
- `intelligence/planning/**` — planning/intervention-era implementation and tests
- `intelligence/integration/**` — routing and integration-era logic/tests
- `intelligence/simulation/**` — synthetic member/simulation infrastructure

The legacy `intelligence/evidence/**` quantitative implementation has been retired after comparison with the reconstructed observation/effect contracts. Useful evidence principles are preserved in this architecture and canonical Discovery tests/migration documentation.

No additional legacy directory should be removed wholesale merely because current Discovery does not import it.

## 11. Canonical vertical slice

Before full downstream build-out, prove one thin complete decision cycle:

`Observation → Discovery → Evidence/Member State → Prioritization → Plan → Intervention → Outcome`

Prioritization, Planning, and Intervention may initially be deliberately thin implementations/stubs. Their purpose at this stage is to validate contracts and information flow, not to implement the final decision sophistication.

Minimum adversarial cases:
1. contradiction/correction
2. explicit safety/escalation trigger
3. low-evidence/unresolved concern
4. cross-dimensional/shared-driver evidence
5. healthy/low-need path that avoids unnecessary work

The slice must demonstrate:
- traceability from outcome/decision back to evidence/observation
- uncertainty survives where unresolved
- safety signals propagate through the shared interface
- Member State can be consumed by multiple subsystems without private reinterpretation
- no hidden dependency on retired/legacy implementation is required to complete the cycle

If the slice exposes a bad contract, fix the contract before full subsystem build-out.

## 12. Revised reconstruction and cleanup sequence

1. **Lock taxonomy + Member State schema/contracts.**
2. **Define the minimal shared `intelligence/contracts/` surface and Safety/Escalation interface.**
3. **Finish the minimum Discovery/Evidence contracts required for a complete vertical slice, including Discovery → Prioritization handoff.**
4. **Perform a shallow legacy capability inventory.** Ambiguous items default to TEMPORARY; do not spend unbounded time adjudicating them.
5. **Build thin Prioritization, Planning, Intervention, and Outcome plumbing.**
6. **Run the canonical vertical slice and minimum adversarial cases.**
7. **Correct/freeze the milestone contracts based on the spike.**
8. **Promote `development/discovery/**` to `intelligence/discovery/**` once the promotion gate passes.**
9. **Build out Prioritization and Planning, then Interventions, against proven contracts.**
10. **Add bounded Learning/Adaptation and complete the Safety implementation.**
11. **Build/consolidate Orchestration and the full Validation/Simulation/Observability harness around stable modules.**
12. **Return to the legacy tree for detailed classification using the working canonical architecture as evidence.**
13. **Migrate/redesign remaining unique approved behavior and retire confirmed-obsolete legacy.**
14. **Validate the complete Intelligence Engine and promote through experimental → development → stable.**

## 13. Cleanup rules

Repository cleanliness is an outcome of successful migration, not the primary objective.

Hard rules:
- do not delete legacy code solely because it is old or currently unused by Discovery
- do not preserve old APIs, filenames, object shapes, or numeric scoring merely for compatibility
- preserve useful behavior/domain knowledge, then implement it cleanly against canonical contracts
- do not let TEMPORARY mean permanent; revisit temporary material after vertical-slice validation
- do not build full downstream subsystems before the thin vertical slice validates their boundaries
- do not let environment/deployment concerns leak into Intelligence domain modules
- prefer one canonical implementation over compatibility layers once migration is complete

A legacy component is safe to retire when its useful capability has been migrated, explicitly rejected, or proven unnecessary against a working canonical replacement and no required entry point depends on it.

## 14. Change control

Changes to major component boundaries, shared contracts, architecture invariants, promotion gates, or migration sequence update this document first or in the same commit as implementation changes.

Implementation details may evolve without changing this specification when they preserve the stated contracts and invariants.
