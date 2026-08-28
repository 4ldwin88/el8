# Canonical Repository / Prototype Reconciliation Audit — 2026-08-27

Status: implementation pass in progress

## Authority tested

Canonical member loop:

`Discovery → Member State → Prioritization → Planning → Action → Outcome Evidence → Review → Planning or focused Reassessment`

Safety may interrupt ordinary flow.

Discovery owns the opening broad life snapshot and adaptive investigation. The initial baseline is an immutable Member State snapshot established from completed Discovery evidence; it is not a separate assessment stage.

## Findings and reconciliation

### Discovery / baseline boundary

Found:
- new/in-progress onboarding still routed to `assessment.html`;
- signup copy and direct signup navigation still described/entered a separate baseline;
- adaptive Discovery displayed four stages (`Baseline / Discovery / Focus / Plan`);
- Focus and Plan screens retained the same four-stage model;
- onboarding and target-architecture documents described Universal Baseline as a separate stage;
- architecture cleanup ledger still defined the canonical loop as `Baseline / Discovery → ...`.

Reconciled on this branch:
- new/in-progress onboarding routes to `discovery-snapshot.html`;
- the retained opening life-status matrix remains the first Discovery surface;
- adaptive Discovery, Focus and Plan present one three-stage journey: `Discovery → Focus → Plan`;
- Member State remains the authority that establishes immutable initial baseline state;
- root/onboarding/target-architecture/cleanup documentation now states the same ownership model.

### Member agency / Prioritization

Confirmed:
- Discovery produces candidates rather than interventions;
- member explicitly confirms starting focus before Planning;
- starting scope defaults to one or two focuses, with a tightly bounded exceptional third focus;
- member-facing focus screen uses qualitative evidence language.

Reconciled:
- removed copy implying multiple focuses necessarily share a causal relationship; Planning coordination is described without inventing a shared driver.

### Planning

Confirmed:
- browser Planning calls the canonical plan engine;
- plan-specific selection/deepening evidence remains downstream of confirmed focus;
- final activation requires explicit member acceptance;
- Member State revision checks remain at persistence/activation boundaries.

Reconciled:
- plan screens now use canonical preference/rejection session keys with read-only fallback for legacy keys;
- plan confirmation uses friendly focus names and defensive measurement rendering;
- telemetry path now records `discovery_focus_plan`, not the retired baseline-first journey.

### Review / accelerated QA

Confirmed:
- tester QA runs the real Discovery-first browser journey;
- accelerated lifecycle exercises keep, replace, simplify, deepen, reassess and safety-hold outcomes through canonical Review/Planning adapters;
- QA state distinguishes Discovery opening snapshot from completed adaptive Discovery without representing the snapshot as an independent intelligence stage.

### Transitional artifacts

Allowed temporarily:
- `assessment.html`: compatibility redirect only; it must not contain an independent assessment flow.
- baseline-named evidence-shape adapters/tests: may remain while they read/migrate old completed evidence shapes, but must not own routing, prioritization or intervention selection.

Deletion condition: remove these compatibility names/surfaces once no supported persisted state or external route depends on the old Baseline terminology/shape.

## Remaining acceptance gates

1. Run Canonical Repository QA on the exact final branch head.
2. Fix any regression exposed by that run rather than weakening the gate.
3. Merge only after exact-head QA passes.
4. Verify post-merge Canonical Repository QA and GitHub Pages deployment on the merge commit.
5. Run accelerated manual browser E2E from the tester QA console. Architecture cleanup is not complete until this passes.
