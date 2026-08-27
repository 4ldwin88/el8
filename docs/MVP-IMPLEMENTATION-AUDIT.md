# EL8 MVP Implementation Audit

Status: Working reconciliation against `MVP-INTELLIGENCE-BOUNDARY.md`.

Purpose: prevent further architecture growth before controlled human testing. Existing code is classified by whether it is required to test EL8's core closed-loop hypothesis.

## KEEP

### Canonical authority boundaries
Keep the separation Baseline → Discovery → Member Confirmation → Planning → Review → Adaptation. Do not merge responsibilities merely to reduce file count. Simplicity means simpler logic inside stable boundaries, not returning to shortcuts.

### `intelligence/safety/`
Keep one canonical cross-stage Safety authority and its lifecycle regression coverage. Simplify policy internals where possible, but do not restore weighted aggregate risk scoring or allow ordinary ranking to override Safety.

### `intelligence/discovery/`
Keep the canonical Discovery engine and onboarding adapter. Discovery should answer only: what concern is sufficiently supported, what matters to the member, and what material uncertainty still blocks a decision?

### `intelligence/planning/plan-engine.js`
Keep as the single intervention-selection authority. Preserve evidence floor, member agency, simple capacity handling, curated library selection, maximum active-action limit, and explicit no-plan/deepen states.

### `intelligence/planning/intervention-library.js`
Keep curated interventions, minimal evidence requirements, effort and mechanism metadata. Mechanism is architectural provision only; MVP should not grow a sophisticated mechanism-learning model.

### `intelligence/review/review-engine.js`
Keep the small canonical outcome vocabulary: KEEP, SIMPLIFY, REPLACE, DEEPEN, REASSESS, plus DISENGAGED as a non-failure state. Keep bounded DEEPEN and Safety pre-emption.

### Onboarding canonical bridge
Keep `flow.js`, `baseline-discovery-handoff.js`, `discovery-runtime.js`, `adaptive-plan.js`, and the minimum persistence/readiness boundary needed to execute the loop.

### Minimal execution evidence
Keep plan quick logs and the minimum evidence/history needed to review an action. Human testing needs to measure whether members can actually execute and report on the plan.

## SIMPLIFY

### Planning scoring
Current ranking arithmetic is acceptable only as an engineered MVP heuristic. Do not add more weights. Prefer clear ordering and coarse capacity over additional mathematical sophistication. Human results should determine whether ranking needs improvement.

### Adaptation exclusions
Keep temporary exact-action exclusion. Mechanism/burden exclusion remains a narrowly triggered architectural provision based on explicit failure attribution. Do not build generalized mechanism exhaustion, learned re-eligibility, or causal models for MVP.

### Priority override capture
Keep a single lightweight reason capture when a member changes the recommended focus. Do not turn this into a multi-step diagnostic modal. A small controlled category set plus optional note is enough.

### Evidence deepening
Keep only selection evidence that can change the chosen action and activation evidence that can materially affect fit/safety. Remove or reject questions whose only benefit is completeness.

### Decision traces / telemetry
Keep enough trace to reproduce why a focus/action/review decision occurred and debug human tests. Do not build an analytics platform around it before the tests produce real needs.

### Capacity
Use coarse capacity semantics. Do not build a general burden optimizer. One action by default is the main MVP burden control; two actions are the exception.

### Insights/history
Retain enough member-visible history to show progress and enough internal history to support Review. Advanced trends, prediction and elaborate scoring are not pre-human blockers.

## DEFER

The following are not valid reasons to delay controlled MVP testing unless a concrete current defect proves otherwise:

- learned ranking weights;
- probabilistic confidence calibration;
- generalized KnownFact/information-gain engine;
- sophisticated causal/hypothesis learning;
- generalized mechanism exhaustion and re-eligibility optimization;
- global eight-dimension optimization;
- large intervention catalogue expansion beyond adequate coverage for test scenarios;
- wearable integrations;
- broad external app integrations;
- predictive personalization;
- provider marketplace;
- community/social features;
- gamification/rewards;
- large educational content system;
- advanced scheduling/multiple simultaneous plans;
- autonomous clinical diagnosis or risk prediction.

## REMOVE / CLEAN UP BEFORE HUMAN TESTING

### Stale semantic fixtures
Tests and adapters that still mix legacy concern IDs such as `money_pressure` with canonical Baseline concern IDs such as `money` must be normalized at an explicit translation boundary. Tests must not force canonical production semantics backward to satisfy old fixtures.

### Browser infrastructure inside pure QA
Accelerated closed-loop tests must exercise pure readiness/activation contracts without importing browser-only Supabase/network infrastructure. Persistence integration can have a separate integration gate. This is test-boundary cleanup, not a reason to expand production architecture.

### Parallel/legacy contracts
Any remaining file that independently selects an intervention, invents a default plan, duplicates Safety semantics, or bypasses canonical Discovery/Planning should be removed or reduced to a compatibility adapter with no decision authority.

### QA sprawl
Canonical repository QA should gate the MVP contracts and regressions. Specialized integration tests may remain separate when they require external infrastructure, but pure core-loop behavior must run in the normal gate. Do not keep redundant tests that assert obsolete architecture.

## Current assessment

The architecture direction is correct. The main over-engineering risk is no longer the top-level component model; it is allowing increasingly elaborate logic to accumulate inside otherwise-correct components before human evidence exists.

Therefore the architecture should NOT be collapsed into one monolithic engine. Instead:
- freeze component responsibilities;
- simplify heuristics;
- finish semantic/test-boundary cleanup;
- require one active action by default;
- stop accepting future sophistication as a pre-human blocker without evidence.

## Immediate work order

1. Normalize stale concern-ID fixtures/adapters without changing canonical semantics.
2. Extract pure activation/readiness validation from browser persistence so Node E2E can test the closed loop.
3. Run canonical QA and fix only genuine MVP-boundary failures.
4. Search for remaining parallel decision authority/default-plan shortcuts and remove them.
5. Perform one final MVP-scoped adversarial review using this question: "Does any remaining issue create a credible safety failure or prevent a small controlled cohort from testing EL8's core closed-loop hypothesis? Do not recommend sophistication that can reasonably wait until after MVP validation."
6. If the answer is no and QA is green, proceed to controlled human testing.
