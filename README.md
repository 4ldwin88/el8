# EL8

EL8 is a wellness operating system currently in prototype development. This repository contains the member prototype, canonical Intelligence Engine, backend integration boundaries, automated validation, and current technical authority.

## Current build status

**Working Prototype:** available and usable for ongoing product development and testing.

**Stable Build:** not established yet.

The current `main` branch is the canonical working prototype while EL8 remains in prototype development. A stable release line must not be declared merely because the prototype works. Stable begins only after the prototype reaches an agreed release-readiness threshold and passes the required technical, persistence, safety, regression, human-validation, and deployment gates.

When Stable is established, EL8 will use separate deployment lines without duplicating source trees:

`experiment/feature → development candidate → validation gates → stable promotion`

See `docs/REPOSITORY-GOVERNANCE.md` for the authoritative protocol.

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

Never develop substantial changes directly on the stable release line. During the current prototype phase, use a short-lived branch from `main`, validate the change, merge through a PR, then delete the branch. Keep only active work branches.

Once a dedicated Development/Stable split is activated, new work starts from Development, not Stable. Stable receives only promoted release candidates that have passed the defined gates. Failed experiments are fixed or discarded in Development/feature branches and never patched experimentally in Stable.

`npm test` is the repository-level canonical automated gate. Focused workflows may add stricter domain gates. Passing automation is necessary but does not by itself make a build Stable.

## Repository hygiene

- `main` is the only permanent branch during the current prototype phase.
- Feature/fix/experiment branches are short-lived and single-purpose.
- Every branch must end by merge or explicit rejection, then deletion.
- No abandoned draft PRs or indefinite compatibility branches.
- No duplicate Stable/Development source directories.
- No root dumping ground for temporary scripts, reports, experiments, or documents.
- Temporary artifacts must have an owner and exit condition.
- Git history replaces archive branches.
- Documentation is updated when architecture, lifecycle, persistence, or release procedures change.

The intended repository is deliberately boring: one obvious owner for each capability, few branches, a small deployment-oriented root, clear build states, and enough durable tests to make deletion safe.
