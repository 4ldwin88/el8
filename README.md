# EL8 Prototype Repository

EL8 is a wellness operating system prototype. This repository contains the member prototype, canonical Intelligence Engine, validation assets, backend integration boundaries, and current technical documentation.

## Repository strategy

The repository is converging on one canonical implementation per capability. Product domains live in directories; release state is handled through Git branches and distinct deployment origins rather than duplicated Stable/Development source trees. Git history is the default archive.

Read these documents in this order:

1. `docs/REPOSITORY-GOVERNANCE.md` — authoritative lifecycle, environment, promotion, cleanup and maintenance policy.
2. `docs/CLEAN-BUILD-PLAN.md` — active execution strategy while structural cleanup remains in progress.
3. `docs/repository-target-architecture.md` — target domain layout.
4. `intelligence/README.md` — canonical Intelligence Engine boundaries.

## Canonical target

Permanent implementation belongs in:

- `app/` — accepted member-facing product and supporting workflows.
- `intelligence/` — accepted Discovery, state/evidence, Prioritization, Planning, Interventions, Outcomes/Learning and Safety logic.
- `assets/` — accepted shared product assets.
- `admin/` — restricted accepted surfaces.
- `supabase/` — repository-owned backend schema/functions/configuration when present.
- `tests/` — cross-domain/system validation when a test has no natural domain owner; domain-specific tests stay beside their owner.
- `docs/` — current repository governance and technical authority.

Branches and deployments represent Stable, candidate Development, and isolated experimental work. An `experiments/` directory is optional, not a required permanent environment tree.

## Approved member architecture

The member experience converges on four primary destinations: Home, Plan, Insights and Explore. Profile is entered through the avatar. Track is a global capture action rather than a primary navigation destination. Authentication, onboarding, assessment, check-in, history, safety and privacy/account flows are supporting workflows.

## Canonical Intelligence chain

Discovery → Evidence / Member State → Prioritization → Planning → Interventions → Outcomes / Learning

Safety can interrupt ordinary routing through the canonical Safety contract. Legacy aggregate wellness scores, numeric dimension truth, signal-score routing and parallel decision engines are not canonical.

## Validation

`npm test` is the repository-level canonical gate. Discovery also retains focused regression validation. Structural retirement occurs only after replacement capability is canonical, unique durable test value is preserved, and applicable validation passes.

## Cleanup rule

Bring forward capabilities, not historical layouts. Once canonical code owns a required capability and no deployment/CI dependency remains, superseded root implementations, experiments, migration helpers, QA harnesses and historical documents should be retired rather than preserved indefinitely.

The desired end state is deliberately boring: one obvious home for each capability, a small deployment-oriented root, branch/configuration-based environment isolation, and enough durable tests to make deletion safe.
