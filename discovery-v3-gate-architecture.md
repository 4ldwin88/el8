# EL8 Intelligence — Hierarchical Gate Architecture

Status: IMPLEMENTATION CONTRACT

## Core loop
Every intelligence stage uses the same control contract:

`evaluate gate → identify unresolved subgate(s) → select highest-value evidence request → update state → reevaluate`

Question count is not the routing architecture. Question budgets are fatigue/safety ceilings only.

A major gate may PASS immediately from existing evidence. A subgate may PASS without asking a question. A gate must not PASS while a material member-raised signal remains unresolved.

## Major chain
Evidence → Discovery → Understanding → Prioritization → Decision → Delivery

Safety, confidence, correction, burden and longitudinal freshness operate across the chain.

## Standard subgate state
Each subgate tracks:
- `status`: unresolved | satisfied | dismissed | connected | fallback
- `confidence`: 0–1
- `evidence`: direct and inferred support
- `source`: member-raised | longitudinal | inferred
- `lastUpdated`
- `resolutionReason`

## Evidence gate
Subgates:
1. Sufficiency
2. Reliability
3. Recency
4. Contradiction
5. Critical missing evidence

PASS when enough trustworthy and sufficiently current evidence exists for Discovery. Do not ask for completeness when sufficiency is already met.

## Discovery gate
Subgates:
1. Signal capture — what is currently relevant?
2. Signal coverage — has each material member-raised signal been investigated or legitimately resolved?
3. Discrimination — which candidate explanations fit best?
4. Driver search — is an apparent state being produced by something upstream?
5. Relationship/causal check — how do concurrent signals relate?
6. Uncertainty/correction — can ambiguity or a rejected interpretation be resolved?

### Discovery PASS rule
PASS only when:
- every material member-raised signal is `satisfied`, `dismissed`, `connected`, or `fallback`;
- no unresolved signal exceeds the materiality threshold;
- the usable driver/state set meets minimum confidence OR the uncertainty fallback is explicit;
- correction/opt-out has been respected.

A single high-confidence hypothesis cannot close Discovery while another material opening signal remains unresolved.

### Resolution rules
A signal can resolve by:
- direct confirmation;
- direct contradiction/dismissal;
- sufficient discriminating evidence;
- being connected to a better-supported upstream driver;
- explicit member correction;
- explicit uncertainty fallback after reasonable questioning.

Resolution does not require equal question counts per signal.

## Understanding gate
Subgates:
1. State vs driver classification
2. Subdimension mapping
3. Dimension mapping
4. Interaction/causal mapping
5. Understanding confidence

## Prioritization gate
Subgates:
1. Importance/impact
2. Urgency
3. Dependency/upstream leverage
4. Member readiness
5. Burden/capacity
6. Priority confidence

## Decision gate
Subgates:
1. Objective
2. Candidate action
3. Suitability
4. Constraints/safety
5. Burden
6. Decision confidence

Intervention availability must not influence Discovery truth-seeking.

## Delivery
Delivery executes the selected decision in member language and records what was delivered, why, expected outcome, review condition and evidence needed for adaptation.

## Discovery v3 implementation rule
The first implementation proves this architecture inside Discovery only. Do not refactor the remaining major gates until Discovery passes simulator and human adversarial testing.

The selector ranks questions only within unresolved subgates. The gate controller decides whether any question is needed.

## Human-test failure that motivated this change
A member selected both health/energy and finance. Finance became highly confident after two follow-ups and the old global early-stop rule ended Discovery after three total questions without investigating the still-material health/energy signal. Under this architecture finance can resolve early, but Discovery remains open until the health/energy signal is also resolved, connected, dismissed, or explicitly left uncertain.
