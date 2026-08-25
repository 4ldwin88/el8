# EL8 Repository Classification Map

Status: Working migration authority for repository cleanup
MVP architecture frozen: 2026-08-24

This map classifies existing repository material against the frozen MVP before files are moved, consolidated, or retired. Classification does not itself authorize deletion. Dependency checks remain required before relocation or retirement.

## A. Canonical member surfaces

These are the destinations the member-facing implementation should converge toward.

- Home — current-day execution, EL8 requests, daily progress, richer expandable Home Quick Logs.
- Plan — complete Active Plan, rationale, interventions/actions, cadence/calendar, review state.
- Insights — Baseline vs Current, qualitative condition, trends, relationships, longitudinal interpretation.
- Explore — For You, Learn, Experts, Saved.
- Profile — avatar-accessed account/member record, assessments/history, achievements, connections, membership, privacy and settings.
- Track — global floating member-initiated capture action; customized speed-first Quick Logs first, then text/photo/file/audio.

`mvp-shell.html` is the current consolidated visual/interaction reference for this frozen information architecture. It is a temporary shell, not the final production implementation.

## B. Supporting member workflows

These are legitimate product flows but are not primary navigation destinations. Existing files in these families should be preserved until their behavior is reconciled with the canonical surfaces:

- onboarding / introduction
- Universal Baseline and assessment/reassessment
- assessments list/history
- daily and other check-ins
- dimension detail
- history and reporting
- plan review/history/detail
- account hold and other account states
- safety/escalation states
- privacy/data and consent flows

Examples currently visible in the repository include `app-introduction.html`, `assessment.html`, `assessments.html`, `daily-checkin.html`, `dimension.html`, `daily-report.html`, `daily-coverage.html`, and `account-hold.html`.

## C. Shared member infrastructure

Preserve and progressively consolidate reusable infrastructure that supports more than one surface. This includes:

- shared UI styling and components under `assets/`
- EL8 brand assets under `assets/brand/`
- shared navigation/client utilities
- evidence/logging components
- persistence and canonical-record handling
- provenance/confidence/correction behavior
- reusable assessment and plan data contracts

Home and Track must converge on one evidence model. Duplicate UI entry points are acceptable; duplicate evidence systems are not.

## D. Intelligence/domain infrastructure

The `intelligence/` area is domain infrastructure rather than page navigation. Preserve its separation from cosmetic screen architecture. Its current organization already reflects useful domain boundaries such as evidence, integration, model, planning, policy, question-bank, selection, and simulation.

Repository cleanup should improve naming or placement only when dependency-safe; it should not flatten these domains into page folders.

## E. Discovery / assessment validation

Discovery is active validation infrastructure and is protected during the cleanup. Preserve:

- `discovery-round3/`
- Discovery v2/v3 validation and QA material
- Discovery contracts, projection/resolution logic and test harnesses
- `.github/workflows/` jobs supporting Discovery validation
- related documentation such as `discovery-multisignal-resolution.md`

Do not move or rename active Discovery files merely to make the root visually cleaner while validation is ongoing. First stabilize/complete the active Discovery work, then perform a dedicated dependency-aware consolidation.

## F. QA, experiments and shadow implementations

Files whose names explicitly identify experiments, QA, readiness, shadow behavior, segmented-scale trials, synthetic tests or similar validation should be treated as non-production implementation unless proven otherwise.

Examples include the `daily-checkin-*` experiment/QA/shadow family and QA trigger/workflow material.

Target state: experiments and QA should be isolated from canonical member routes while remaining reproducible. Do not delete successful experiments until their accepted behavior has been incorporated into canonical implementation and tests.

## G. Legacy / migration candidates

Any existing page or script that assumes superseded primary navigation—especially Track as a destination, Profile as a bottom tab, absence of Plan, or broad pre-freeze screen responsibilities—is a migration candidate even if it still works.

Likely candidates include legacy `track*`, `plan*`, Home, Insights, Explore/Profile implementations and old navigation helpers. Their useful behavior should be extracted/reused where appropriate rather than preserving obsolete information architecture.

A working legacy file is not automatically canonical; a noncanonical file is not automatically safe to delete.

## H. Temporary reference artifacts

`mvp-shell.html` belongs here after implementation migration begins. It is currently the approved visual/interaction shell used to understand the frozen MVP. Once the real prototype has absorbed the approved architecture and the result has been validated, the shell should move to a clearly historical/reference location or be retired.

## I. Restricted/internal surfaces

`admin.html` and related administrative tools are internal/restricted surfaces. They must not influence normal member navigation. Keep authorization boundaries explicit.

## J. Archive candidates

A file becomes an archive/delete candidate only when all of the following are true:

1. It conflicts with or has been superseded by the frozen architecture or accepted implementation.
2. No active page, workflow, test, or CI job depends on it.
3. Any useful behavior, fixture, rationale, or test coverage has been migrated.
4. Historical retention is not needed for an active validation effort.
5. Removing it does not break GitHub Pages or external test links still in use.

## Migration order

1. Protect Discovery, QA, persistence, safety and intelligence infrastructure.
2. Establish the canonical shared shell/navigation primitives.
3. Migrate Home and Track together around one evidence model.
4. Migrate Plan and its calendar/review surfaces.
5. Migrate Insights and dimension/history interpretation.
6. Migrate Explore into For You / Learn / Experts / Saved.
7. Migrate Profile and supporting account/history/settings flows.
8. Reconcile onboarding, assessment and check-in entry/return paths with the new shell.
9. Isolate experiments and QA into clear non-production locations only after dependency checks.
10. Retire obsolete navigation/pages only after link/reference/CI checks pass.
11. Move the temporary MVP shell to historical/reference status after the real prototype matches the frozen architecture.

## Immediate dependency-audit targets

Before the first physical move, inspect references and behavior around these high-risk families:

- `home*`
- `track*` and `quick-log*`
- `plan*`
- `insights*`, `dimension*`, `history*`
- `explore*`, learning/content and saved/bookmark behavior
- `profile*`, settings/account/history/achievements
- `assessment*` and check-in families
- shared navigation and persistence clients
- Discovery workflows and their referenced paths

The first structural move should occur only after these families are mapped sufficiently to avoid breaking active routes or validation.