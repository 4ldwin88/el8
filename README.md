# EL8

EL8 is a wellness product in MVP development. This repository contains the member prototype, canonical Intelligence Engine, backend integration boundaries and validation needed to prove the core closed loop before broader product expansion.

## Current objective: prove the MVP loop

The immediate engineering goal is a coherent, testable MVP—not maximum feature completeness or maximum architectural sophistication.

The MVP must prove that EL8 can:

`understand → prioritize → plan → support action → observe outcome → review → adapt`

A capability belongs in the MVP when it is necessary to make that loop useful, safe, testable or maintainable for early real-member validation. Capabilities that are merely plausible future improvements should not expand the production architecture yet.

The architecture should still leave clean seams for later personalization, integrations, longitudinal learning, professional services, richer analytics and other validated extensions. Git history preserves retired implementations; we do not keep duplicate executable systems as a future-code archive.

## Current build status

**Working Prototype:** `main` remains the accepted working prototype.

**Development Candidate:** `development` is the persistent integration line for the next coherent build.

**Stable Build:** not established yet. `main` is not Stable merely because Development exists.

Development flow:

`experiment/feature → development → automated + accelerated E2E + human validation → accepted Working Prototype`

A Stable release begins only after the release-readiness requirements in `docs/REPOSITORY-GOVERNANCE.md` are satisfied.

## Repository model

There is one canonical implementation per capability. Product logic is organized by domain. Git history is the archive; stale branches, duplicate source trees and parallel decision engines are not.

Read these documents in this order:

1. `README.md` — current product-development objective and repository orientation.
2. `intelligence/README.md` — authoritative MVP Intelligence boundaries and future-extension policy.
3. `docs/REPOSITORY-GOVERNANCE.md` — branch, promotion, cleanup and maintenance policy.
4. `docs/repository-target-architecture.md` — repository layout and ownership boundaries.
5. `docs/canonical-persistence-contract.md` — backend persistence authority.

Historical architecture documents must not override the current MVP boundaries above.

## Structure

Permanent implementation belongs in:

- `app/` — member-facing domain workflows and orchestration.
- `intelligence/` — canonical evidence/state and decision capabilities.
- `assets/` — shared product assets and UI styling.
- `supabase/` — repository-owned backend schema, functions and configuration.
- `tests/` — cross-domain/system validation when no natural domain owner exists; domain tests stay beside their owner.
- `docs/` — current governance, contracts and technical authority.

The root is intentionally deployment-oriented. Root HTML files are deployable page boundaries; shared implementation belongs with its owning domain.

## Member architecture

Primary member destinations are Home, Plan, Insights and Explore. Profile is entered through the avatar. Track is a global capture action rather than a primary navigation destination.

Canonical onboarding progression:

`Personal Information → Discovery (opening snapshot + adaptive investigation) → Focus confirmation → First Plan → Introduction → Home`

The opening life-status matrix is the first question of Discovery. It provides broad starting evidence; it is not an independent Baseline stage. When Discovery has sufficient evidence and the member confirms focus, the projection into canonical Member State establishes the immutable initial baseline snapshot. Later evidence updates current state without rewriting that historical baseline.

## Canonical MVP Intelligence loop

`Discovery → Member State → Prioritization → Planning → Action → Outcome evidence → Review → Planning / focused Reassessment`

Safety can interrupt ordinary routing through the canonical Safety contract.

The subsystem responsibilities are deliberately narrow:

- Discovery establishes what is happening and whether enough decision-relevant evidence exists. Its opening snapshot is broad evidence collection, not a separate decision engine.
- Member State stores durable truth and establishes the initial immutable baseline snapshot from completed Discovery evidence.
- Prioritization decides what matters now, with explicit member confirmation before Planning owns interventions.
- Planning chooses a small feasible action set.
- Outcomes record what happened.
- Review decides what should change next.
- Focused reassessment returns upstream only when evidence or circumstances genuinely require it.

Legacy aggregate wellness scores, numeric dimension truth, a separate Baseline decision stage, parallel adaptation engines and duplicate intervention-routing systems are not canonical MVP architecture.

## MVP decision rule

Before adding a subsystem, abstraction or persistent workflow, ask:

1. Is it required to prove the current member loop, safety, persistence or QA?
2. Does an existing canonical subsystem already own this decision?
3. Can the future need be served later through an existing clean contract instead of pre-building it now?
4. Will early-member evidence actually tell us how this capability should work?

If the answer points to later, leave the seam—not the machinery.

## Development workflow

Material new work starts from `development` on a short-lived `feat/`, `fix/`, `cleanup/` or `experiment/` branch. Validate the bounded objective, merge through a PR, then delete the temporary branch.

`development` is an integration line, not an experiment dump. `main` remains the accepted Working Prototype until the Development candidate passes applicable automated, persistence, safety, accelerated closed-loop, regression and human-validation gates and is explicitly promoted.

`npm test` is the repository-level canonical automated gate. Passing automation is necessary but does not by itself establish product validity or Stable status.

## Repository hygiene

- Permanent active lines are `main` and `development`.
- Temporary branches are short-lived and single-purpose.
- Every temporary branch ends by merge or explicit rejection, then deletion.
- No abandoned compatibility architecture.
- No duplicate Stable/Development source directories.
- No root dumping ground for temporary artifacts.
- Git history replaces archive branches and retired-code folders.
- Preserve future specifications only when they contain durable knowledge worth carrying forward.
- Documentation must be updated when MVP boundaries, lifecycle, persistence or release rules change.

The intended repository is deliberately boring: one obvious owner for each capability, a small canonical loop, durable behavioral tests, and enough clean boundaries to extend after the MVP teaches us what is actually needed.
