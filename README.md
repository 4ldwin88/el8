# EL8 Prototype Repository

EL8 is a wellness operating system prototype. This repository contains the member prototype, canonical Intelligence Engine, backend integration boundaries, automated validation, and current technical authority.

## Repository model

The repository uses one canonical implementation per capability. Product logic is organized by domain, Git branches represent release/candidate work, and Git history is the archive. Historical Stable/Development source-tree duplication is not part of the architecture.

Read these documents in this order:

1. `docs/REPOSITORY-GOVERNANCE.md` — authoritative lifecycle, promotion, cleanup, and maintenance policy.
2. `docs/CLEAN-BUILD-PLAN.md` — temporary execution plan while the current structural cleanup remains open.
3. `docs/repository-target-architecture.md` — target repository layout and ownership boundaries.
4. `intelligence/README.md` — canonical Intelligence Engine boundaries.

## Structure

Permanent implementation belongs in:

- `app/` — member-facing domain logic and supporting workflows.
- `intelligence/` — Discovery, evidence/state, Prioritization, Planning, Interventions, Outcomes/Learning, and Safety logic.
- `assets/` — shared product assets and UI styling.
- `supabase/` — repository-owned backend schema, functions, and configuration.
- `tests/` — cross-domain/system validation when no natural domain owner exists; domain-specific tests stay beside their owner.
- `docs/` — current repository governance, contracts, and technical authority.

The repository root is intentionally deployment-oriented. Root HTML files are deployable page boundaries such as member destinations, onboarding steps, account/privacy flows, internal QA, and Safety interruption/reconciliation. Shared implementation should move into its owning domain rather than accumulating in the root.

## Member architecture

The primary member destinations are Home, Plan, Insights, and Explore. Profile is entered through the avatar. Track is a global capture action rather than a primary navigation destination.

Supporting routes include authentication, Personal Information, Baseline assessment, Discovery, first-plan proposal, Introduction, check-ins, history/account controls, Safety, and internal QA. Route names should describe their permanent purpose rather than the development phase that created them.

Canonical onboarding progression is:

`Personal Information → Baseline → Discovery → First Plan → Introduction → Home`

## Intelligence chain

`Discovery → Evidence / Member State → Prioritization → Planning → Interventions → Outcomes / Learning`

Safety can interrupt ordinary routing through the canonical Safety contract. Legacy aggregate wellness scores, numeric dimension truth, signal-score routing, and parallel decision engines are not canonical.

## Validation

`npm test` is the repository-level canonical gate. Discovery retains a focused regression workflow. Live persistence validation is isolated from ordinary repository QA because it requires authenticated backend access; it must not be made public merely to simplify CI.

Structural retirement occurs only after replacement capability is canonical, unique durable test value is preserved, and applicable validation passes.

## Cleanup rule

Bring forward capabilities, not historical layouts. Once canonical code owns a required capability and no deployment or CI dependency remains, superseded implementations, experiments, migration helpers, duplicate QA harnesses, compatibility routes, and historical documents should be retired rather than preserved indefinitely.

`docs/CLEAN-BUILD-PLAN.md` and any temporary validation bridge are cleanup artifacts, not permanent architecture. They should be removed when their exit conditions are satisfied.

The intended end state is deliberately boring: one obvious owner for each capability, a small deployment-oriented root, branch/configuration-based environment isolation, consistent route vocabulary, and enough durable tests to make deletion safe.
