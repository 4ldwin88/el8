# EL8 Intelligence Test Architecture

Status: implementation architecture for `PUBLIC-DISCOVERY-TEST-SPEC.md`

The public-facing product name is **EL8 Intelligence Test**. Implementation paths and identifiers use `intelligence-test`.

## Boundary

The Intelligence Test is a research adapter around the canonical EL8 Intelligence Engine. It must not import authenticated member persistence or require `getSessionOrRedirect()`.

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

The Intelligence Test can use the same pure transformation functions while supplying its own anonymous persistence adapter.

## Proposed repository structure

Keep the repository root clean. Intelligence Test pages live under one dedicated directory rather than adding another set of root-level onboarding pages.

```text
intelligence-test/
  index.html                 # introduction / begin
  baseline.html
  discovery.html
  priorities.html
  plan.html
  complete.html
  intelligence-test.js       # session + navigation utilities
  telemetry.js               # research-only client adapter
  tester-notes.js
  survey.js

app/research/
  intelligence-test-contract.js
  intelligence-test-version.js
  intelligence-test-parity.test.mjs

docs/
  PUBLIC-DISCOVERY-TEST-SPEC.md
  PUBLIC-DISCOVERY-TEST-ARCHITECTURE.md
```

The document filenames remain temporarily stable to avoid churn while this feature branch is being built; tester-facing and implementation naming is canonicalized to Intelligence Test.

Do not duplicate canonical Discovery questions or intervention libraries under `intelligence-test/`.

## Anonymous session model

Use a random browser-generated UUID as `test_session_id`. It is a research identifier only and must not map to an EL8 user account.

Session state required for navigation can be kept in `sessionStorage`. Durable research telemetry is sent separately to the constrained research backend.

Suggested lifecycle:

`created -> started -> baseline -> discovery -> priorities -> plan -> completed`

`abandoned` is inferred or explicitly finalized where possible; analytics must tolerate sessions that disappear without a final browser event.

`Try Again` clears Intelligence Test session state, generates a new UUID, and returns to `/intelligence-test/`.

## Research persistence boundary

Use dedicated Intelligence Test research tables and RPCs/functions in Supabase, callable without an authenticated EL8 member session but protected by narrowly scoped contracts. They must not expose member persistence.

Suggested logical entities:

- `el8_intelligence_test_sessions`
- `el8_intelligence_test_events`
- `el8_intelligence_test_notes`
- `el8_intelligence_test_results`

Use a `(session_id, sequence)` uniqueness rule for event idempotency and one finalized result per session.

## Write API

Prefer purpose-built RPCs/functions rather than broad table permissions:

- `el8_intelligence_test_config()`
- `el8_intelligence_test_start(session_payload)`
- `el8_intelligence_test_event(event_payload)`
- `el8_intelligence_test_note(note_payload)`
- `el8_intelligence_test_complete(result_payload)`

Each endpoint validates payload shape, allowed event/stage values, maximum free-text length, session identity, and version metadata. Completion must be idempotent.

Telemetry failures are non-blocking to the tester.

## Kill switch

`el8_intelligence_test_config()` returns an enabled flag, test version, and optional message. Introduction checks it before enabling `Begin Test`. Disabling new sessions must not require a GitHub Pages redeploy.

## Timer

Loading Introduction does not start the official timer. `Begin Test` records the start. Important transitions/events record elapsed milliseconds, and submission finalizes total duration.

## Tester Notes

A shared Tester Notes component:

- appears at the bottom of each meaningful test screen;
- reminds testers not to enter identifying information;
- saves automatically when Continue/Next/Confirm is pressed;
- attaches stage, screen/question ID, elapsed time, and versions;
- never blocks navigation if telemetry fails;
- preserves typed text locally until acknowledged.

## Baseline adapter

Render current Baseline answer semantics and pass answers through `normalizeBaselineAnswers()` and `validateBaselineAnswers()`. Do not call authenticated `saveBaseline()`. Retain normalized answers in anonymous session state and use `baselineToConcernIds()` to seed Discovery exactly as member onboarding does.

## Discovery adapter

Create the session through `createDiscoverySession()` and interact through the same canonical runtime boundary as authenticated onboarding. The Intelligence Test owns rendering and telemetry only; it must not implement independent branching rules.

## Priority adapter

Use `discoveryPriorityCandidates()` for candidate presentation. Confirm one or two priorities using the same constraints as authenticated onboarding. Capture recommended/inferred states and the tester-confirmed set, then ask the separate priority-accuracy research question.

## Plan adapter

Use `actionsForConfirmedPriorities()` to generate interventions from tester-confirmed priorities. Build the display model from canonical plan helpers but never call `acceptInitialPlan()`.

## Survey contract

Survey data is optional. The client must allow final submission with an empty survey. Keep the four core measures explicit and versioned; deeper optional fields remain separate.

## Privacy/minimization

- No authentication token is required or requested.
- Do not query the current EL8 profile even if the tester is logged into EL8 elsewhere.
- Do not store names/emails.
- Free-text prompts discourage identifying information.
- Device metadata is coarse and debugging-oriented.
- Define retention before broad distribution.
- Treat wellness responses as sensitive research data even without direct identity.

## QA strategy

A parity fixture must prove equivalent canonical inputs produce equivalent priority and intervention outputs between authenticated onboarding and the Intelligence Test.

Wrapper contract tests cover new-session generation, timer start, Tester Notes metadata, optional survey skipping, completion versioning, Try Again isolation, telemetry failure tolerance, kill switch, and absence of authenticated member persistence calls.

Canonical Repository QA and Discovery Regression remain mandatory.

## Deployment

Initial public hosting can remain GitHub Pages under `/el8/intelligence-test/`, requiring no GitHub account for visitors when Pages is public.

The Intelligence Test is a research surface, not the future Stable Build. Once separate Development and Stable deployments exist, it should track an explicitly selected development/test engine version rather than silently becoming Stable.
