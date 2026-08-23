# EL8 Plan Engine v1 — Independent Architecture Review

Status: pre-human-validation review  
Branch: `plan-engine-v1`  
Review target: Plan Engine + intervention library + Discovery-to-Plan handoff

## Executive verdict

**CONDITIONAL PASS for controlled human testing. DO NOT MERGE TO PRODUCTION YET.**

The Plan Engine is structurally sound enough to move from synthetic QA into a small, supervised human-validation gate. Its strongest design choices are conservative active-plan limits, explicit uncertainty language, safety-hold short-circuiting, separation of candidate interventions from ranking logic, and dynamic friction adjustment using recent adherence rather than a permanent member label.

The main weakness is not an obvious coding defect. It is that several important policy concepts are represented in data but are not yet enforced by the ranking engine. Human testing should therefore be treated as validation of an experimental planner, not validation of wellness efficacy.

## What was reviewed

1. `intelligence/planning/plan-engine.js`
2. `intelligence/planning/intervention-library.js`
3. Existing Plan Engine unit, end-to-end and adversarial test architecture
4. Discovery evidence normalization and Plan Engine output contract
5. Safety, friction, capacity, adherence and adaptation behavior

## Strengths

### 1. Conservative plan size

Low-capacity members receive one active item; other members receive at most two. This is a good default for EL8 because the planner is less likely to generate a superficially comprehensive but unusable plan.

### 2. Friction is dynamic

The engine uses current capacity plus recent adherence to estimate a friction budget. Strong demonstrated adherence can permit somewhat harder actions while weak adherence reduces friction tolerance. This is materially better than assigning members a static compliance or motivation label.

### 3. Uncertainty is explicit

The output states that plan choices are hypotheses to test rather than claims of causality or optimality. That boundary should remain visible throughout future product integration.

### 4. Safety hold has precedence

A safety hold prevents normal plan generation and returns escalation status. This is the correct architectural ordering: safety screening precedes optimization.

### 5. Discovery and intervention selection remain separable

Discovery supplies ranked evidence; the planning layer maps drivers to authorized candidate actions and ranks those actions. This separation makes future testing, auditing and replacement of either layer substantially easier.

### 6. Intervention metadata is audit-friendly

The intervention library records dimension, effort, cadence, measurement, evidence-strength label and behavior-change-technique tags. This is a useful foundation for later evidence governance.

## Findings requiring attention

### P1 — Eligibility metadata is not enforced

Library items can define `eligibility.minReadiness`, but candidate generation currently does not filter or penalize candidates that fail that threshold. Readiness affects the general priority score, but this is not equivalent to enforcing an explicit eligibility rule.

**Required before broad testing:** enforce eligibility in candidate generation and add regression tests proving ineligible actions cannot become active.

### P1 — Contraindications are modeled but not enforced

Every library item has a contraindications array, but Plan Engine candidate construction does not evaluate it. The arrays are currently empty, so this is dormant technical debt rather than an immediate observed failure. It becomes safety-relevant as soon as contraindications are populated.

**Required before adding any contraindicated intervention:** implement a centralized eligibility/contraindication gate with tests.

### P1 — Evidence-strength labels do not affect ranking

Actions marked `supported` and `evidence_informed` are currently treated equally by the priority calculation. That can be acceptable for an MVP only if the labels are descriptive, but it becomes misleading if EL8 implies that stronger evidence receives greater selection weight.

**Decision needed:** either deliberately keep evidence strength informational and document that policy, or introduce a modest evidence-quality term into ranking. Do not silently imply weighting that does not exist.

### P2 — Duplicate action exposure is possible

If multiple drivers map to the same intervention in future library growth, the planner can surface duplicates because candidates are driver-action pairs and no action-ID deduplication occurs.

**Recommendation:** deduplicate by action ID before active selection while retaining all supporting driver evidence in provenance.

### P2 — Unknown adherence defaults to 0.60

A neutral default is reasonable, but 0.60 is still a policy assumption. It produces a specific friction budget and may influence intervention selection before behavioral evidence exists.

**Recommendation:** preserve the neutral default for the first human gate, but explicitly test first-use members and compare 0.50/0.60/unknown-as-separate-state behavior before locking the policy.

### P2 — Adaptation returns instructions, not a rebuilt plan

`adaptPlan()` can return `simplify_or_reschedule`, `reprioritize`, `maintain`, or `reassess`, but it does not itself execute the adaptation. This is acceptable as a decision layer, but product integration must not present the plan as already adapted unless another component actually performs the transition.

### P2 — Completion promotes backlog without re-ranking

When an active item is completed or deferred, the next backlog item is promoted in stored order. If member context changes between initial plan creation and promotion, the ranking may be stale.

**Recommendation:** re-score remaining candidates when capacity, adherence, safety, readiness or circumstances materially change.

## Human-validation gate

Proceed with a deliberately small human gate before any merge into the main experience.

### Gate H1 — Member Zero supervised test

Run the real Discovery output through Plan Engine without automatically committing the resulting actions to the live plan. Capture:

- selected active action(s)
- rejected/backlog alternatives
- perceived relevance
- perceived effort
- whether the plan addresses the actual problem
- whether a clearly better action was omitted
- whether any recommendation feels unsafe, intrusive, obvious, patronizing or impractical
- time required to understand the plan

The reviewer should record expected actions **before seeing the engine output** where practical. This reduces hindsight bias.

### Gate H2 — Blind human scenarios

Use at least 5 additional scenarios covering:

1. high need + low capacity + poor adherence
2. high need + low capacity + strong adherence
3. multiple competing dimensions
4. insufficient/uncertain Discovery evidence
5. a case where the highest-severity problem should not automatically produce the highest-effort action

For each scenario, compare engine selection with at least one independent human judgment. Disagreement is not automatically engine failure; unexplained or systematically poor disagreement is.

### Gate H3 — Failure-oriented scenarios

Before merge, explicitly attempt to produce:

- an ineligible recommendation
- an action above a low-capacity member's reasonable friction level
- duplicate active actions
- an action unsupported by any Discovery driver
- a normal plan during safety hold
- a plan generated from empty evidence
- stale promotion after a material context change

## Proposed acceptance criteria

The Plan Engine can advance toward integration when all of the following are true:

- no safety-hold bypasses
- no ineligible active recommendations
- no unexplained duplicate active actions
- no actions without traceable Discovery evidence
- at least 80% of human-rated active recommendations are judged relevant and realistically actionable in the small validation set
- all serious human-review disagreements are documented and either fixed or explicitly accepted as policy decisions
- synthetic regression suite remains green after fixes

The 80% threshold is an engineering gate for this early sample, not a clinical efficacy claim or final product KPI.

## Merge recommendation

**Do not merge `plan-engine-v1` into the production path yet.**

First implement eligibility enforcement, decide the evidence-strength policy, add deduplication/provenance handling, and run Gate H1 plus the blind scenarios. If those pass without a new P1 defect, the branch is suitable for a limited shadow integration where EL8 generates plans for comparison but does not automatically replace the current member plan.

## Overall rating

Architecture: **8.2/10**  
Synthetic test maturity: **8.5/10**  
Human validation maturity: **3.0/10**  
Production readiness: **5.5/10**

The gap is now primarily validation and policy enforcement rather than basic architecture. That is the right kind of problem to have at this stage.