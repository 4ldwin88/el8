# Shared Evidence / Planning Dependency Map

Status: Phase 1 dependency audit
Date: 2026-08-24

This pass resolves the HOLD items identified by the Home / Track / Plan dependency map far enough to determine the first safe restructuring batch.

## 1. `track-review.html` — MIGRATE + KEEP BEHAVIOR

`track-review.html` is a live part of the Track evidence-confirmation contract, not obsolete UI.

Preserve:
- interpretation ID handoff;
- explicit member review before confirmation;
- editable summary/dimension/category;
- structured food correction;
- structured expense correction;
- confidence display;
- confirm vs discard choice;
- `confirm-track` persistence call;
- removal of temporary review state after confirm/discard.

Reconcile:
- return path currently hardcoded to `track.html`;
- page styling/shell should eventually become a secondary Track workflow within the canonical app shell;
- structured review types should remain evidence-driven rather than expand into an uncontrolled tracker catalog.

Action: MIGRATE into the future Track workflow, retaining a compatibility route until the global Track sheet and review flow are validated.

## 2. `home-coverage.js` — HOLD as experimental/diagnostic evidence summary

This file is more than cosmetic Home UI. It calls `el8_member_daily_signals`, combines Track and Daily Check-in evidence, maps signals into plan dimensions, evaluates daily evidence coverage, and links to `daily-coverage.html` / `daily-checkin.html`.

It is useful validation/intelligence scaffolding, but the current member-facing presentation (“Today’s coverage”, Acceptable/Minimal, mapped gaps) is not automatically part of the frozen Home architecture.

Preserve:
- evidence aggregation/mapping ideas;
- daily-signal RPC dependency;
- plan-relevance mapping;
- distinction between event evidence and whole-day context.

Do not automatically preserve:
- current coverage labels or card as a canonical Home section;
- assumption that every active focus dimension requires a dedicated daily mapping.

Action: HOLD until evidence/review requirements are reconciled with the frozen MVP. Do not block Home shell migration on retaining this exact card.

## 3. `el8-client.js` — KEEP, later SPLIT BY RESPONSIBILITY

This is shared infrastructure for:
- Supabase client creation;
- auth/session gating;
- profile retrieval/cache;
- sign-out.

The final block also contains a legacy Track-page-specific dynamic import of `track-nav.js`. That is presentation/navigation coupling inside the shared client and should not survive the canonical shell migration.

Action:
- KEEP auth/profile/Supabase behavior during migration;
- REMOVE the Track-specific navigation hook only when Track no longer relies on it;
- eventually place shared client infrastructure in an appropriate common infrastructure location without changing its public behavior in the same step.

## 4. `track-nav.js` — RETIRE after canonical shell migration

This file exists solely to rewrite Track’s old five-destination navigation and therefore encodes superseded information architecture.

It contains no evidence, interpretation or persistence logic.

Action: RETIRE once the global Track interaction is running inside the canonical shell and `el8-client.js` no longer imports it.

## 5. `plan-model.js` vs `intelligence/planning/` — KEEP BOTH TEMPORARILY; DO NOT DUPLICATE FURTHER

`plan-model.js` is a thin member-app compatibility adapter for persisted Active Plan records. It normalizes current and legacy plan shapes for UI consumption.

`intelligence/planning/` is the actual planning domain and already contains substantial engine/test/library infrastructure, including `plan-engine.js`, `intervention-library.js`, end-to-end assessment/planning material, and adversarial validation.

These are not duplicates at the same abstraction level:
- `intelligence/planning/` creates/tests governed planning behavior;
- `plan-model.js` currently adapts persisted plan records for legacy member UI.

Action:
- KEEP `intelligence/planning/` in place;
- KEEP `plan-model.js` during UI migration;
- later replace legacy fallback fields only after stored plan contracts are stable;
- if a shared view-model adapter remains necessary, move it to an explicit app/domain adapter location rather than into the planning engine.

## 6. Evidence architecture finding

Current evidence is split across at least three mechanisms:

1. `el8_quick_logs` — direct structured Quick Log persistence used by `quick-log.js`.
2. interpreted Track evidence — `interpret-track` → member review → `confirm-track`.
3. daily signal aggregation — `el8_member_daily_signals` consumed by Home coverage.

The frozen MVP requires one coherent evidence model from the member/product perspective, but this does not mean these storage/processing mechanisms should be collapsed blindly. They may represent capture, confirmation and normalized-read layers.

Before refactoring persistence, document the canonical lifecycle:

capture/input → interpretation/normalization where needed → member confirmation where materially uncertain → canonical evidence persistence → normalized daily/longitudinal read model → plan/review/Insights consumption.

Quick Logs that are deterministic structured inputs may not require the same interpretation step as free text/photo/audio, but both must ultimately become compatible canonical evidence for review and Insights.

## 7. First safe physical restructuring batch

The audit now supports creating new canonical UI structure without moving active legacy files yet.

Safe first batch:

1. Create `app/shell/` shared shell/navigation module(s) implementing Home / Plan / Insights / Explore, avatar Profile access, and a global Track trigger.
2. Create `app/home/`, `app/plan/`, `app/insights/`, `app/explore/`, `app/profile/`, `app/track/`, and `app/workflows/` as destination modules only when real implementation files are added (Git does not retain empty folders).
3. Keep existing root pages as compatibility implementation while canonical modules are introduced.
4. Do not move `el8-client.js`, `plan-model.js`, `quick-log.js`, `track-review.html`, Discovery, or planning engine files in this first batch.
5. Wire the canonical shell into one migrated surface at a time, starting with Home + global Track.
6. Remove `track-nav.js` only after no active Track path depends on it.

This approach gives the repository a real target implementation without breaking current GitHub Pages URLs or active testing.

## 8. Updated action table

| File/family | Action | Notes |
| --- | --- | --- |
| `track-review.html` | MIGRATE + KEEP behavior | Canonical member-confirmation workflow |
| `home-coverage.js` | HOLD | Useful evidence experiment; exact Home card not frozen |
| `el8-client.js` | KEEP | Shared infrastructure; later remove Track-nav coupling |
| `track-nav.js` | RETIRE later | Pure obsolete five-tab navigation patch |
| `plan-model.js` | KEEP temporarily | UI adapter / legacy normalization |
| `intelligence/planning/` | KEEP | Actual planning domain + tests |
| `quick-log.js` | MIGRATE + REFACTOR | Structured deterministic capture; must become plan-derived |
| `el8_quick_logs` contract | HOLD | Do not change storage casually |
| Track interpretation/confirmation | KEEP | Required uncertainty/review path |
| `el8_member_daily_signals` read model | KEEP/HOLD | Useful normalized evidence aggregation; validate semantics before refactor |

## 9. Next operation

Proceed to the first physical restructuring batch by introducing canonical shared shell code and migration scaffolding while leaving current public routes functional. Then migrate Home + Track behavior incrementally against that shell.