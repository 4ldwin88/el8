# EL8

EL8 is a wellness operating system currently in prototype development. This repository contains the member prototype, canonical Intelligence Engine, backend integration boundaries, automated validation, and current technical authority.

## Current build status

**Working Prototype:** `main` remains the accepted working prototype.

**Development Candidate:** `development` is now the persistent integration line for the next coherent build.

**Stable Build:** not established yet. `main` is not to be relabeled Stable merely because Development has been activated.

EL8 now uses the active development flow:

`experiment/feature → development → validation gates → accepted working prototype/release promotion`

Until a true Stable release is declared, promotion from Development to `main` means accepting a new Working Prototype, not declaring production stability. Stable begins only after the complete release-readiness gate in `docs/REPOSITORY-GOVERNANCE.md` is satisfied.

## Repository model

There is one canonical implementation per capability. Product logic is organized by domain. Git history is the archive; stale branches and duplicate Stable/Development source folders are not.

Read these documents in this order:

1. `docs/REPOSITORY-GOVERNANCE.md` — authoritative branch, build, promotion, cleanup, and maintenance policy.
2. `docs/repository-target-architecture.md` — target repository layout and ownership boundaries.
3. `docs/canonical-persistence-contract.md` — backend persistence authority.
4. `docs/adaptive-plan-contract.md` — adaptive planning contract.
5. `intelligence/README.md` — canonical Intelligence Engine boundaries.

## Structure

Permanent implementation belongs in:

- `app/` — member-facing domain logic and workflows.
- `intelligence/` — Discovery, evidence/state, Prioritization, Planning, Interventions, Outcomes/Learning, and Safety logic.
- `assets/` — shared product assets and UI styling.
- `supabase/` — repository-owned backend schema, functions, and configuration.
- `tests/` — cross-domain/system validation when no natural domain owner exists; domain-specific tests stay beside their owner.
- `docs/` — current repository governance, contracts, and technical authority.

The root is intentionally deployment-oriented. Root HTML files are deployable page boundaries. Shared implementation belongs in its owning domain rather than accumulating in the root.

## Member architecture

The primary member destinations are Home, Plan, Insights, and Explore. Profile is entered through the avatar. Track is a global capture action rather than a primary navigation destination.

Canonical onboarding progression is:

`Personal Information → Baseline → Discovery → First Plan → Introduction → Home`

## Intelligence chain

`Discovery → Evidence / Member State → Prioritization → Planning → Interventions → Outcomes / Learning`

Safety can interrupt ordinary routing through the canonical Safety contract. Legacy aggregate wellness scores, numeric dimension truth, signal-score routing, and parallel decision engines are not canonical.

## Development workflow

Material new work starts from `development` on a short-lived `feat/`, `fix/`, or `experiment/` branch. Validate the bounded objective, merge it back to Development through a PR, then delete the temporary branch.

`development` is an integration line, not an experiment dump. It should contain only accepted-in-progress work intended for the next coherent prototype/release candidate.

`main` remains the accepted Working Prototype until a Development candidate passes the applicable integration, persistence, safety, regression, and human-validation gates and is explicitly promoted. Do not experiment directly on `main`.

Once Stable is formally declared, the same experiment → Development → validation → Stable discipline continues, with Stable deployed separately.

`npm test` is the repository-level canonical automated gate. Focused workflows may add stricter domain gates. Passing automation is necessary but does not by itself make a build Stable.

## Repository hygiene

- Permanent active lines are currently `main` (accepted Working Prototype) and `development` (next-build integration).
- Feature/fix/experiment branches are short-lived and single-purpose.
- Every temporary branch must end by merge or explicit rejection, then deletion.
- No abandoned draft PRs or indefinite compatibility branches.
- No duplicate Stable/Development source directories.
- No root dumping ground for temporary scripts, reports, experiments, or documents.
- Temporary artifacts must have an owner and exit condition.
- Git history replaces archive branches.
- Documentation is updated when architecture, lifecycle, persistence, or release procedures change.

The intended repository is deliberately boring: one obvious owner for each capability, few branches, a small deployment-oriented root, clear build states, and enough durable tests to make deletion safe.
