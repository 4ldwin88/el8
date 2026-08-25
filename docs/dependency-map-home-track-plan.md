# Home / Track / Plan Dependency Map

Status: Phase 1 dependency audit
Date: 2026-08-24

This document assigns preliminary KEEP / MIGRATE / MERGE / HOLD / RETIRE actions to the highest-risk Home, Track and Plan family. These actions are dependency decisions, not immediate deletion instructions.

## Summary

The current Home already contains useful MVP-aligned behavior, especially its expandable Quick Log and live Active Plan loading, but its five-item navigation is obsolete. Current Track contains valuable universal text/image/voice interpretation and review infrastructure, but Track itself is incorrectly implemented as a primary page/destination. `quick-log.js` is useful working evidence-entry code, but it currently hardcodes a general catalog of water/sleep/mood/energy/weight rather than deriving shortcuts from the Active Plan. `plan-model.js` is a useful compatibility/domain helper and should be retained during migration. No canonical `plan.html` currently exists at the expected root path, so the new Plan destination must be built from existing plan data/model behavior rather than assumed to exist.

## 1. `home.html` — MIGRATE + MERGE

### Preserve
- authenticated session/profile loading;
- theme/profile handling;
- safety-pause redirect;
- production Active Plan query;
- `planFocus`, `planInterventions`, and `isProductionPlan` integration;
- expandable Quick Log pattern;
- plan rationale/focus rendering;
- Home coverage integration where still valid.

### Replace / reconcile
- five-item bottom navigation (`Home / Explore / Track / Insights / Profile`);
- Track-as-navigation treatment and EL8-mark Track affordance;
- old information hierarchy/text where it conflicts with the approved MVP shell;
- direct page-specific shell markup that should become reusable shell primitives.

### Target
Move useful behavior into `app/home/` after canonical shared shell primitives exist. Home remains the richer, progress-aware evidence surface.

## 2. `track.html` — MERGE, then RETIRE page route

### Preserve
- universal natural-language text capture;
- camera/photo capture;
- existing image attachment behavior;
- voice recording and transcription;
- image preprocessing;
- interpretation calls;
- review-before-persistence flow via `track-review.html` / interpretation ID;
- explicit failure handling and no-success-before-persistence behavior where implemented downstream.

### Replace / reconcile
- Track as a standalone primary destination;
- five-item bottom navigation;
- text-first hierarchy;
- image-only attachment restriction if the governed MVP requires general file attachment;
- absence of plan-derived Quick Logs at the top of the Track interaction.

### Target
Extract/merge valid capture and interpretation behavior into `app/track/` as a global modal/sheet launched from the persistent floating Track action. After all callers and public/test links are migrated, retire the standalone `track.html` member route unless a compatibility redirect is temporarily required.

## 3. `quick-log.js` — MIGRATE + REFACTOR

### Preserve
- same-day log loading;
- existing Supabase `el8_quick_logs` persistence contract until deliberately superseded;
- local-date/timezone handling;
- water cumulative-progress behavior;
- sleep-duration display;
- qualitative mood/energy controls where plan-required;
- weight structured entry where plan-required;
- reusable add/render behavior concepts.

### Problem
The current implementation always constructs a general catalog of Water, Sleep, Mood, Energy and Weight. The frozen MVP requires Quick Logs to be derived from the member's Active Plan/evidence requirements rather than exposing a permanent wellness-tracker catalog.

### Target
Split the current behavior into reusable evidence/logging primitives plus plan-derived configuration. Home can render richer progress-aware variants; Track can render minimal speed-first variants from the same evidence definitions/contracts.

## 4. `plan-model.js` — KEEP, then MIGRATE when domain ownership is clear

### Preserve
- `planFocus()`;
- `planInterventions()`;
- `planDimensionNames()`;
- `isProductionPlan()`;
- legacy fallback normalization during migration.

This is domain/model compatibility logic rather than page UI. Do not duplicate it inside Home or the future Plan screen. Its eventual home should be determined alongside existing `intelligence/planning/` contracts to avoid creating two plan-domain layers.

## 5. Canonical Plan destination — BUILD / MIGRATE FROM EXISTING DATA

A root `plan.html` was not found at the expected path during this audit. The frozen MVP nevertheless requires Plan as a primary destination.

The canonical Plan implementation should consume the same production Active Plan source used by Home and expose:
- current plan cycle/summary;
- priorities/focus dimensions;
- active interventions/actions;
- rationale / why this plan;
- cadence/schedule;
- compact calendar/schedule view;
- review state and next review;
- member-facing proposed adaptation/review context;
- history/detail links as secondary flows where appropriate.

Do not create a second independent plan store for this screen.

## 6. `track-review.html` family — HOLD pending direct audit

Current `track.html` explicitly routes successful interpretation into `track-review.html` using `sessionStorage` with an interpretation ID and interpretation payload. Therefore `track-review.html` is a live dependency and cannot be moved/retired with Track until its persistence/review behavior is audited and migrated atomically.

## 7. `home-coverage.js` / daily coverage — HOLD pending direct audit

`home.html` imports and mounts `home-coverage.js`. This makes Home coverage a live dependency. Determine whether it is canonical daily progress, diagnostic/QA coverage, or obsolete visualization before moving Home.

## 8. Shared client / Supabase — HOLD / KEEP

Both Home and Track depend directly on `el8-client.js` and Supabase-backed member/profile/plan/evidence services. These are migration-critical infrastructure. UI reorganization must not casually change persistence contracts.

## 9. Navigation dependency

The current Home and Track independently hardcode the old five-destination navigation. This is exactly the duplication the target `app/shell/` is intended to eliminate.

First physical UI migration should therefore establish shared shell/navigation primitives before rewriting Home and Track. Otherwise the obsolete navigation will simply be copied into new folders.

## 10. First safe implementation batch

1. Audit `track-review.html`, `home-coverage.js`, `el8-client.js`, and any Track navigation/helper scripts.
2. Audit existing plan-related root files and `intelligence/planning/` to determine canonical plan contracts.
3. Define a shared evidence input contract that both Home and Track can call without changing persisted semantics prematurely.
4. Establish the canonical shell/navigation primitives.
5. Migrate Home and Track behavior into the new shell while retaining compatibility routes during validation.
6. Build Plan against the existing Active Plan source/model.
7. Only then retire obsolete Track-as-page navigation and duplicated root shell markup.

## Preliminary action table

| File/family | Action | Reason |
| --- | --- | --- |
| `home.html` | MIGRATE + MERGE | Useful live behavior; obsolete shell/navigation |
| `track.html` | MERGE → RETIRE route | Valuable capture engine; wrong primary IA |
| `quick-log.js` | MIGRATE + REFACTOR | Useful persistence/UI logic; hardcoded tracker catalog conflicts with frozen MVP |
| `plan-model.js` | KEEP | Useful normalization/domain compatibility |
| canonical Plan page | BUILD | Required by frozen MVP; expected root page absent |
| `track-review.html` | HOLD | Live dependency of Track |
| `home-coverage.js` | HOLD | Live dependency of Home |
| `el8-client.js` | KEEP/HOLD | Shared auth/profile/persistence infrastructure |
| old five-tab nav markup | RETIRE after migration | Superseded by frozen four-destination shell + avatar Profile + global Track |

No physical move or deletion in this family should occur until the HOLD items above are audited.