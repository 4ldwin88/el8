# EL8 Public Discovery Test Architecture

Status: implementation architecture for `PUBLIC-DISCOVERY-TEST-SPEC.md`

## Boundary

The public test is a research adapter around canonical EL8 intelligence. It must not import authenticated member persistence or require `getSessionOrRedirect()`.

### Canonical modules to reuse

- `app/onboarding/baseline-contract.js` for Baseline validation and normalization.
- `app/onboarding/baseline-discovery-handoff.js` for projecting Baseline evidence into Discovery concern seeds.
- `app/onboarding/discovery-runtime.js` for the canonical Discovery boundary, candidate priorities, and confirmed-priority intervention generation.
- `intelligence/discovery/**` for question bank, scheduling, evidence, sufficiency, prioritization, and intervention selection.

### Modules the public wrapper must not use for persistence

- authenticated profile mutation;
- `saveBaseline()` / `saveDiscovery()` / `acceptInitialPlan()` member writes;
- member onboarding-status routing;
- member active-plan tables.

The public harness can use the same pure transformation functions while supplying its own anonymous persistence adapter.

## Proposed repository structure

Keep the repository root clean. Public-test pages should live under one dedicated directory rather than adding another set of root-level onboarding pages.

```text
public-test/
  index.html                 # introduction / begin
  baseline.html
  discovery.html
  priorities.html
  plan.html
  complete.html
  public-test.js             # session + navigation utilities
  telemetry.js               # research-only client adapter
  tester-notes.js
  survey.js

app/research/
  public-test-contract.js    # event/session/survey validation
  public-test-version.js     # explicit version identifiers
  public-test-parity.test.mjs

docs/
  PUBLIC-DISCOVERY-TEST-SPEC.md
  PUBLIC-DISCOVERY-TEST-ARCHITECTURE.md
```

Do not duplicate canonical Discovery questions or intervention libraries under `public-test/`.

## Anonymous session model

Use a random browser-generated UUID as `test_session_id`. It is a research identifier only and must not map to an EL8 user account.

Session state required for navigation can be kept in `sessionStorage` so closing/restarting can intentionally create a clean run when appropriate. Durable research telemetry is sent separately to the constrained research backend.

Suggested lifecycle:

`created -> started -> baseline -> discovery -> priorities -> plan -> completed`

`abandoned` is inferred or explicitly finalized where possible; analytics must tolerate sessions that disappear without a final browser event.

`Try Again` clears public-test session state, generates a new UUID, and returns to `/public-test/`.

## Research persistence boundary

Preferred backend design: dedicated research tables and RPCs/functions in Supabase, callable without an authenticated EL8 member session but protected by narrowly scoped row-level/security-definer contracts.

Suggested logical entities:

### `el8_public_test_sessions`

- `id uuid primary key` (client-generated random session ID)
- `test_version text`
- `build_version text`
- `engine_version jsonb`
- `tester_mode text`
- `status text`
- `started_at timestamptz`
- `completed_at timestamptz`
- `last_stage text`
- `elapsed_ms bigint`
- coarse client/debug metadata

### `el8_public_test_events`

Append-only interaction events:

- `session_id`
- `sequence`
- `event_type`
- `stage`
- `screen_id`
- `question_id`
- `elapsed_ms`
- `payload jsonb`
- `created_at`

Use a `(session_id, sequence)` uniqueness rule to make retries idempotent.

### `el8_public_test_notes`

- `session_id`
- `stage`
- `screen_id/question_id`
- `elapsed_ms`
- `note_text`
- version metadata

### `el8_public_test_results`

One finalized research result per session:

- normalized Baseline result
- Discovery trace/output needed for analysis
- recommended candidate priorities
- tester-confirmed priorities
- proposed interventions/plan
- priority-accuracy measure
- optional survey payload
- completion duration
- version metadata

The exact schema should be finalized through a migration after reviewing current Supabase policies. Do not expose direct anonymous INSERT privileges to member tables.

## Write API

Prefer a small set of purpose-built RPCs/functions rather than broad table permissions:

- `el8_public_test_start(session_payload)`
- `el8_public_test_event(event_payload)`
- `el8_public_test_note(note_payload)`
- `el8_public_test_complete(result_payload)`

Each endpoint validates payload shape, allowed event/stage values, maximum free-text length, session identity, and version metadata. Completion must be idempotent.

Telemetry failures return to the client as non-blocking research errors. The canonical test flow remains usable.

## Kill switch

Provide a read-only public configuration endpoint or narrowly scoped RPC returning:

```json
{
  "enabled": true,
  "test_version": "...",
  "message": null
}
```

The introduction checks this before enabling `Begin Test`. If disabled, show a neutral paused/unavailable message. Do not depend on redeploying GitHub Pages to stop new research sessions.

## Timer

Creating/loading the introduction does not start the official timer. `Begin Test` records `started_at` and `performance.now()` reference state. Store elapsed milliseconds at important transitions/events and finalize total duration on submission.

Wall-clock timestamps support cross-event analysis; monotonic browser elapsed time supports accurate in-session duration.

## Tester Notes

A shared Tester Notes component should:

- appear at the bottom of each meaningful test screen;
- remind testers not to enter identifying information;
- save automatically when Continue/Next/Confirm is pressed;
- attach stage, screen/question ID, elapsed time, and versions;
- never block navigation if its telemetry write fails;
- preserve the typed note locally until acknowledged by the telemetry adapter.

## Baseline adapter

The public Baseline page should render the same current Baseline content/answer semantics and pass answers through `normalizeBaselineAnswers()` and `validateBaselineAnswers()`.

Instead of `saveBaseline()`, retain the normalized result in anonymous session state and emit research telemetry.

Use `baselineToConcernIds()` to seed Discovery exactly as authenticated onboarding does.

## Discovery adapter

Create the session through `createDiscoverySession()` and interact through the same canonical runtime boundary as authenticated onboarding.

The public page owns rendering and telemetry only. It must not implement independent branching rules.

Capture question shown, answer, answer changes, navigation, dwell time, and the resulting canonical trace/output.

## Priority adapter

Use `discoveryPriorityCandidates()` for candidate presentation. Confirm one or two priorities using the same constraints as authenticated onboarding.

Capture recommended/inferred/member-selected states and the tester's confirmed set.

After confirmation, ask the separate priority-accuracy research question before moving to the plan.

## Plan adapter

Use `actionsForConfirmedPriorities()` to generate interventions from the tester-confirmed priorities. Build the display model using the same canonical plan contract/pure helpers used by onboarding, but do not call `acceptInitialPlan()`.

The final plan page transitions into research feedback instead of member-plan activation.

## Survey contract

Survey data is optional. The client must allow final submission with an empty survey.

Keep the four core measures explicit and versioned. Deeper optional fields live under a separate survey section so future research-question changes do not silently alter the meaning of core longitudinal metrics.

## Privacy/minimization

- No authentication token is required or requested.
- Do not query the current EL8 profile even if a tester happens to be logged into EL8 in another tab.
- Do not store names/emails.
- Free-text prompts explicitly discourage identifying information.
- Device metadata is coarse and debugging-oriented.
- Define retention before broad distribution.
- Treat wellness responses as sensitive research data even without direct identity.

## QA strategy

### Pure parity test

Build a fixture representing canonical Baseline answers and a deterministic Discovery interaction path. Run the same canonical transformation/runtime functions used by both wrappers and assert identical candidate priorities and plan/intervention identifiers.

The parity test protects against accidental forked logic.

### Public wrapper contract tests

Test:

- new session UUID generation;
- timer starts only at Begin;
- Tester Notes contextual metadata;
- optional survey can be skipped;
- completion payload versioning;
- `Try Again` produces a different session ID;
- telemetry failure does not block navigation;
- kill-switch disabled state prevents a new run;
- public wrapper contains no authenticated member persistence calls.

### Existing gates

The feature branch must continue to pass Canonical Repository QA and Discovery Regression. Public-test-specific tests should be added to the canonical suite once implemented.

## Deployment

Initial public hosting can remain GitHub Pages under the existing EL8 repository, e.g. `/el8/public-test/`. That requires no GitHub account for visitors when the repository/pages site is publicly accessible.

The public-test URL is a research surface, not the future Stable Build. When EL8 later establishes separate Development and Stable deployments, the research harness should continue to track an explicitly selected development/test engine version rather than silently becoming the Stable product.
