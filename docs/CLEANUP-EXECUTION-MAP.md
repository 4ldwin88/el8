# EL8 Cleanup Execution Map

Status: Active cleanup control document
Date: 2026-08-25

This document controls the current structural cleanup. Delete it when migration is complete and its continuing rules are represented by governance/architecture/tests.

## Objective

Produce an operational repository with independently deployable Stable and Development builds plus isolated Experiments. Preserve major proven capabilities from the legacy working prototype, merge them into the MVP shell, and remove obsolete files/documents rather than maintaining a museum of previous implementations.

## Current-state interpretation

### Preserve / merge capability
The following current areas contain capabilities that must be evaluated before retirement:

- root authentication/onboarding pages and `el8-client.js`;
- `app/auth/` and `app/onboarding/` candidate contracts/runtime;
- root Home/Plan/Insights/Explore/Profile pages plus their newer `app/*` modules;
- Track/quick-log implementation and `app/track/` candidate modules;
- daily/weekly check-ins;
- plan proposal/review/history;
- member history and evidence surfaces;
- safety/account-hold/privacy-data flows;
- Supabase-backed persistence behavior;
- canonical intelligence contracts/state/prioritization/planning/intervention/outcome/safety modules;
- Discovery question bank, selection logic and regression/adversarial knowledge;
- shared brand/UI assets.

### Move to Experiments
Until promoted:

- current Discovery candidate engine/question selection/human-test material;
- unresolved assessment variants;
- experimental daily-check-in variants;
- alternative intervention/adaptation work;
- bounded QA/research spikes that are still actively useful.

### Convert to permanent tests
Preserve failures/acceptance logic rather than old harness presentation where possible:

- canonical intelligence contract tests;
- state/prioritization/planning/intervention/outcome tests;
- Discovery adversarial/regression cases worth retaining;
- persistence integration checks;
- auth + dual-session environment isolation;
- stable/development smoke/readiness checks.

### Likely retire after dependency verification
Examples include:

- duplicate `*-v2.js` implementations after merge;
- old coverage/report HTML surfaces used only during development;
- accelerated/obsolete QA pages;
- recovery/CI trigger text files after workflows are normalized;
- duplicate human-test entry points;
- Member Zero one-off harnesses after regression value is captured;
- superseded MVP shells after the clean Development shell owns their useful behavior;
- migration checkpoints/matrices after migration completes;
- historical QA reports and version narratives after findings become code/tests;
- obsolete classification/cleanup documents.

## Migration batches

### Batch A — authority and inventory
- [x] Lock Stable / Development / Experiments model.
- [x] Lock separate-origin simultaneous-auth requirement.
- [x] Reconcile governance and target architecture.
- [ ] Complete file-by-file dependency/capability classification.
- [ ] Map public/deployment routes and GitHub Actions dependencies.

### Batch B — Development assembly
- [ ] Create clean Development environment structure.
- [ ] Merge MVP shell architecture into Development.
- [ ] Merge working authentication and persistence.
- [ ] Merge onboarding: signup -> baseline -> Discovery -> initial Plan -> preferences/introduction -> Home.
- [ ] Merge Home/Plan/Insights/Explore/Profile/Track capability.
- [ ] Merge supporting workflows: check-ins, history, safety, privacy/data.

### Batch C — Intelligence and Experiments
- [ ] Separate accepted intelligence from candidate Discovery.
- [ ] Move candidate Discovery into `experiments/discovery/` without losing validation knowledge.
- [ ] Integrate only accepted Discovery contracts/capability into Development.
- [ ] Remove competing decision engines.

### Batch D — Tests and backend
- [ ] Create permanent `tests/` structure.
- [ ] Move/convert durable tests.
- [ ] Add Development build smoke tests.
- [ ] Add Stable build smoke tests.
- [ ] Add simultaneous Stable Account A / Development Account B session test.
- [ ] Establish `supabase/shared`, `supabase/stable`, `supabase/development` source/config boundaries.

### Batch E — deployment isolation
- [ ] Configure Stable deployment origin.
- [ ] Configure Development deployment origin.
- [ ] Verify auth redirect URLs for each origin.
- [ ] Verify environment-labelled data/configuration.
- [ ] Verify simultaneous sessions in one browser.

### Batch F — promotion and deletion
- [ ] Run full Development regression/integration/smoke validation.
- [ ] Promote validated candidate to Stable.
- [ ] Verify Stable independently.
- [ ] Delete superseded root pages/scripts in broad batches.
- [ ] Delete obsolete docs/migration reports.
- [ ] Remove unused archive material.
- [ ] Review/delete stale branches.
- [ ] Delete this execution map when cleanup is complete.

## Promotion gate

Development may become the new Stable release only when:

1. Core member navigation and Track work.
2. Authentication/persistence work.
3. Onboarding through first usable Plan works.
4. Home/Plan/Insights/Explore/Profile retain required proven prototype capability.
5. Check-in/history/safety/privacy flows required by MVP work.
6. Intelligence tests pass.
7. Development has no runtime dependency on Experiments.
8. Stable/Development deployment origins are distinct.
9. Account A and Account B can remain simultaneously authenticated.
10. No high-value legacy capability is being deleted without replacement or an explicit decision that it is no longer required.

## Deletion principle

When a legacy artifact's useful behavior has been merged and its important failure modes are regression-protected, delete it. Git history is the recovery mechanism.