# EL8

EL8 is a wellness product in MVP development. This repository contains the member prototype, canonical EL8 Intelligence implementation, persistence boundaries and validation needed to prove the product safely before broader expansion.

## Current objective

The current product-development gate is the member-facing onboarding decision path:

`Discovery → Member State → Prioritization / member confirmation → proposed Planning`

The complete canonical Intelligence loop remains:

`Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment`

Safety is a cross-cutting authority and may interrupt ordinary flow at any point. Stabilizing the entire post-plan loop is not a blocker for the next structured external Discovery test unless it exposes a Discovery-to-Planning contract failure.

A capability belongs in the current MVP when it is necessary to make the member loop useful, safe, testable or maintainable. Git history preserves retired implementations; duplicate executable systems and obsolete compatibility layers are not retained as archives.

## Repository authority

`main` is the sole permanent development line and authoritative repository state. Short-lived branches may be created for bounded work when useful and should be deleted after merge or explicit rejection.

There is one canonical implementation per capability. Repository code implements the current Drive-governed product and Intelligence contracts; repository documentation must not silently redefine those product authorities.

Useful repository-local technical references:

1. `README.md` — repository orientation and current implementation boundary.
2. `intelligence/README.md` — Intelligence implementation boundaries.
3. `docs/REPOSITORY-GOVERNANCE.md` — repository lifecycle and engineering policy.
4. `docs/repository-target-architecture.md` — target code ownership and dependency direction.
5. `docs/canonical-persistence-contract.md` — persistence boundary.

## Structure

Permanent implementation belongs in:

- `app/` — thin member-facing workflows and application orchestration.
- `intelligence/` — canonical Discovery, Member State, Prioritization, Planning, Outcomes/Tracking, Review/Learning and related contracts.
- `assets/` — shared product assets and UI styling.
- `supabase/` — repository-owned backend schema, functions and configuration.
- `tests/` — cross-domain/system validation when no natural domain owner exists; domain tests stay beside their owner.
- `docs/` — current engineering governance and technical contracts.

The root remains deployment-oriented while prototype pages are still required. Root pages must not become parallel owners of Intelligence logic.

## Member architecture

Permanent member jobs are organized around:

- Home / Today — what matters now, the next useful action and why.
- Plan — priorities, proposed or active interventions, schedule, reasoning and member choices.
- Track — the lowest-friction routes for supplying decision-useful evidence.
- Insights — condition, trends, relationships, outcomes, uncertainty and learned patterns.
- Explore — personalized learning, tools, programs, saved items and optional professional/expert discovery.
- Profile / More — identity, preferences, permissions, integrations, privacy/data, subscription, settings and administration.

Backend capability boundaries do not dictate member navigation.

Onboarding is one temporary coherent journey:

`Introduction / consent → Discovery opening snapshot → adaptive Discovery → priority recommendation and member choice → intervention choice → activation`

The opening snapshot is evidence collection within Discovery, not a separate Baseline stage. Completed Discovery evidence is projected into canonical Member State and establishes the immutable initial baseline before ordinary downstream decisions proceed. Later evidence updates longitudinal current state without rewriting that historical baseline.

## Canonical Intelligence responsibilities

- Discovery interprets evidence, uncertainty, contradictions and bounded hypotheses and determines semantic sufficiency. It does not choose Focus or Actions.
- Member State is the authoritative longitudinal member truth.
- Prioritization decides the smallest useful Focus set using supported evidence, materiality, member importance/choice, leverage, capacity, confidence, prior learning and material constraints. Safety remains independent; Action feasibility remains Planning authority.
- Member confirmation preserves agency before Planning.
- Planning owns Action eligibility, plan-specific deepening, quantitative internal Action Fit / Recommendation Confidence and the smallest useful manageable Action set.
- Tracking / Outcomes capture only decision-useful evidence with provenance.
- Review interprets adherence, outcomes, burden, barriers and changed circumstances, persists durable learning and routes to Planning or focused Reassessment.
- Safety owns deterministic interruption, scope and escalation behavior and cannot be reduced by ordinary wellness scoring or recommendation confidence.

Legacy aggregate wellness scores, numeric dimension truth, a separate Baseline decision stage, parallel adaptation engines, problem-registry-era decision authority and duplicate intervention-routing systems are not canonical architecture.

## Engineering rules

Before adding an engine, bridge, persistent state, service or major page, establish its unique responsibility, authoritative input/output, why an existing capability cannot own the behavior more simply, and how its necessity is proven end to end.

Compatibility mechanisms are temporary migration tools only. Canonical IDs and semantics should be used directly once controlled migration is complete. UI, persistence, telemetry and QA adapt to production contracts rather than redefine them.

`npm test` is the repository-level automated gate. Automated success is necessary but not sufficient for external testing or MVP validity. Before a manual/external candidate is used, the exact candidate must pass the applicable canonical regression and scenario/E2E gates and the deployed member path must be verified.

## Repository hygiene

- `main` is the only permanent branch.
- Temporary branches are bounded and short-lived.
- Git history is the code archive.
- No duplicate decision engines, retired-code folders or permanent compatibility architecture.
- No obsolete prototype terminology in active contracts.
- No QA-only reasoning that differs from production Intelligence.
- No vendor-specific persistence semantics inside canonical domain logic.
- Documentation changes follow the current Drive authorities rather than preserving superseded implementation history.

The target is deliberately simple: one authoritative owner for each responsibility, explicit contracts, traceable decisions, low member burden and enough clean boundaries to extend only when validation demonstrates the need.
