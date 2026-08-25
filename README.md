# EL8 Prototype Repository

EL8 is a wellness operating system prototype. This repository contains the member prototype, canonical Intelligence Engine, validation assets, backend integration, and repository technical documentation.

## Current repository strategy

The repository is undergoing a clean-build consolidation. The goal is not to preserve every historical implementation. We are converging on the smallest clean implementation that contains the approved MVP and canonical Intelligence capabilities, validating it, and then retiring superseded repository structure.

Read these documents in this order:

1. `docs/REPOSITORY-GOVERNANCE.md` — authoritative lifecycle, environment, promotion, cleanup and maintenance policy.
2. `docs/CLEAN-BUILD-PLAN.md` — active execution strategy for completing the clean build and retiring legacy material.
3. `docs/repository-target-architecture.md` — target domain layout.
4. `docs/repository-classification.md` — historical/current-state classification guidance where still useful.
5. `intelligence/README.md` — canonical Intelligence Engine boundaries.

## Canonical target

Permanent implementation belongs in:

- `app/` — accepted member-facing product: Home, Plan, Insights, Explore, Profile, Track and supporting workflows.
- `intelligence/` — accepted Discovery, evidence/state, Prioritization, Planning, Interventions, Outcomes/Learning and Safety logic.
- `tests/` — durable validation and regression protection.
- `assets/` — accepted shared product assets.
- `supabase/` — backend schema/functions/configuration.
- `admin/` — restricted accepted surfaces.
- `docs/` — repository governance and technical documentation.

`development/` is temporary initiative space, not a parallel permanent product. Git history is the default historical archive.

## Approved member architecture

The member experience converges on four primary destinations: Home, Plan, Insights and Explore. Profile is entered through the avatar. Track is a global capture action rather than a primary navigation destination. Supporting onboarding, assessment, check-in, history, safety and privacy/account flows are secondary workflows.

## Canonical Intelligence chain

Discovery → Evidence / Member State → Prioritization → Planning → Intervention → Outcomes / Learning

Safety can interrupt ordinary routing through the canonical Safety contract. Legacy aggregate wellness scores, numeric dimension truth, signal-score routing and parallel decision engines are not canonical.

## Validation

`npm test` is the repository-level canonical Intelligence gate. Discovery also retains dedicated regression validation. Structural retirement should occur only after the replacement capability is represented canonically and the applicable validation boundary passes.

## Cleanup rule

Bring forward capabilities, not legacy file layouts. Once the clean build demonstrably owns a required capability and no deployment/CI dependency remains, superseded root implementations, experiments and QA harnesses should be retired in broad batches rather than preserved indefinitely.

The desired end state is deliberately boring: one obvious home for each capability, a small deployment-oriented root, no Active dependency on Development or historical engines, and enough tests to make deletion safe.
