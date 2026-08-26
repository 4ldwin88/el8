# EL8 Intelligence Test Specification

Status: Locked product/validation specification

## Naming

The public-facing name is **EL8 Intelligence Test**.

Use **Intelligence Test** in tester-facing UI and **intelligence-test** for repository paths, telemetry identifiers, and implementation names. Avoid abbreviations such as `Int Engine Test`; they are less clear to external testers. Internally, the test validates the EL8 Intelligence Engine, but the shorter public name is easier to understand.

## Purpose

The EL8 Intelligence Test is a permanent external validation harness for the canonical EL8 Intelligence Engine used during onboarding. It exists to answer three questions:

1. Does EL8 understand what matters to the tester?
2. Does EL8 turn that understanding into a useful, manageable proposed plan?
3. Does the experience create enough value that people would consider using and paying for EL8?

It is not a second onboarding implementation and must never become one.

## Core architecture rule: same intelligence, different wrapper

The Intelligence Test must import and execute the same canonical Baseline contract, Baseline-to-Discovery projection, Discovery runtime, priority-candidate logic, intervention selection, and plan-generation logic used by authenticated EL8 onboarding.

The Intelligence Test may have its own UI wrapper, anonymous session persistence, telemetry, tester-note collection, research survey, and completion experience. It must not fork or copy the underlying assessment, Discovery, prioritization, or planning intelligence.

A change to canonical intelligence therefore changes both authenticated onboarding and the Intelligence Test after normal QA gates pass.

## Public access

The test must:

- be reachable through a normal public URL;
- require no GitHub, Vercel, Supabase-user, or EL8 account/login;
- support repeated testing without database cleanup;
- create a fresh anonymous research session for every new run;
- never alter a tester's authenticated EL8 member profile or active plan;
- remain logically isolated from production member persistence.

## Flow

`Introduction -> Baseline -> Discovery -> Priority Confirmation -> Proposed Plan -> Optional Research Survey -> Thank You`

A `Try Again` action on the Thank You screen starts a completely new anonymous session and returns to Introduction.

## Introduction

The introduction should be concise and explain:

- EL8 is being developed as a wellness operating system that helps people understand what matters, identify priorities, and turn them into a manageable plan.
- The EL8 Intelligence Test evaluates whether EL8's intelligence can understand the answers it receives and respond with relevant priorities and a useful plan; the tester is testing EL8, not being graded by EL8.
- There are no right or wrong answers and testers should not try to guess what EL8 wants them to say.
- The experience is a prototype and is not medical advice.
- Participation is anonymous and responses/interactions are collected for product research; testers should avoid entering identifying information.
- A tester may answer truthfully as themselves or roleplay a fictional person if they do not want to provide truthful personal answers. If roleplaying, they should remain reasonably consistent.
- Testers should watch for questions that do not make sense given previous answers, irrelevant questions, repeated questions, missing important issues, awkward wording, incorrect recommendations, or apparent misunderstandings.
- Every meaningful step includes a `Tester Notes` box for bugs, confusion, repetition, comments, or other observations. Notes are automatically associated with that point in the test.
- The page should show an approximate completion-time expectation once enough telemetry exists to support one.

Before `Begin Test`, optionally ask:

**How are you testing today?**

- As myself
- Roleplaying someone
- Prefer not to say

The official elapsed-time clock starts only when `Begin Test` is pressed.

## Progress and interaction requirements

Baseline, Discovery, Priority Confirmation, and Proposed Plan must use a visible progress indicator consistent with authenticated onboarding.

Tester Notes must be present on every meaningful screen. Moving forward automatically persists the note; testers should not need a second submit action.

Tester Notes automatically attach contextual metadata such as session ID, stage, screen/question ID, elapsed time, test version, and engine/build identifiers.

The test should preserve normal EL8 interaction behavior so external testing evaluates the real experience rather than a simplified mockup.

## Priority validation

Before the plan is shown, the tester sees the same proposed priority candidates and confirmation behavior as authenticated onboarding.

After priorities are confirmed, capture a research measure such as:

**How accurately do these priorities reflect what you think this person needs help with?**

Use a 1-5 response scale plus an optional comment.

This measure is intentionally separate from plan-quality feedback so Discovery failures can be distinguished from Planning failures.

## Proposed Plan

Generate the proposed plan from the same canonical planning/intervention path used by authenticated onboarding.

The Intelligence Test must not show `Accept Plan`, because no member plan is being activated. Instead, the plan is the stimulus for the research survey.

## Optional post-plan research survey

The survey is optional but visually prominent. State plainly that it is optional and highly appreciated.

Show a small set of highest-value questions immediately rather than hiding the entire survey:

1. How well did EL8 understand what matters to you? (1-5)
2. How useful does this proposed plan feel? (1-5)
3. Did the process feel too long or burdensome? (Not at all -> Very)
4. Would you consider using EL8 based on this experience? (Definitely not -> Definitely)

Provide a noticeable `Help us improve EL8 (optional)` expansion for deeper questions, including:

- What felt confusing, repetitive, irrelevant, or missing?
- Would you trust EL8 enough to try following this plan?
- What did you like most?
- What did you like least?
- What would be the main reason you would NOT use EL8?
- How likely would you be to recommend EL8 if the finished product worked like this?
- Would you pay for EL8? (No / Maybe / Yes / Not sure)
- Monthly price sensitivity in CAD: $0 / under $5 / $5-9 / $10-14 / $15-19 / $20+ / Not sure.
- Additional comments.

Do not treat this lightweight price question as a definitive pricing study. A dedicated pricing study should follow when EL8's paid proposition is sufficiently defined.

The survey can be skipped without blocking submission.

## Completion

The final submission should:

- finalize telemetry and optional survey responses;
- show an explicit thank-you confirmation;
- tell the tester they may safely close the browser;
- offer `Try Again`;
- make `Try Again` generate a new anonymous session rather than reusing the previous session or answers.

## Anonymous telemetry

Telemetry should collect only information that materially helps evaluate the product. At minimum:

- random anonymous test-session ID;
- test version, application build/commit identifier, Baseline version, Discovery engine version, and planning/intervention version;
- self/roleplay/prefer-not-to-say test mode;
- official start, completion, abandonment, and total elapsed time;
- stage/screen/question entry and exit timing;
- answers and changed answers;
- backtracking/navigation events;
- validation errors and repeated-click/error events where useful;
- question path and branching decisions;
- priorities inferred/recommended versus priorities selected by tester;
- generated proposed plan and intervention/action identifiers;
- Tester Notes with contextual stage/question metadata;
- priority-accuracy rating;
- optional research survey responses;
- coarse device/browser class required for debugging.

Do not intentionally collect names, email addresses, account IDs, precise location, or other direct identifiers. Avoid retaining network/IP-style identifiers where the infrastructure permits. Free-text fields must remind testers not to include identifying information.

Wellness answers can still be sensitive even when anonymous. Research telemetry and wellness-answer payloads should be logically separated where practical, access-controlled, minimized, and governed by an explicit retention/deletion policy before broad external distribution.

## Telemetry reliability

Telemetry must be best-effort and must never prevent a tester from continuing through the test. Failed telemetry writes should be observable for developers but should not strand the tester.

Submission should be idempotent so retries do not create duplicate completed sessions.

Anonymous write access must be narrowly constrained to the research data contract. The browser must not receive general write access to member tables.

## Versioning

Every completed or abandoned session must be attributable to the exact logic being tested. Store at least:

- Intelligence Test UI version;
- repository commit/build identifier where practical;
- Baseline contract version;
- Discovery engine/question-bank version;
- intervention/planning version.

Research comparisons across versions must not silently combine materially different algorithms.

## Operational controls

The Intelligence Test requires:

- an internal enable/disable (kill-switch) mechanism for new sessions;
- a visible test version for debugging;
- a clear unavailable/paused screen when new sessions are disabled;
- no dependency on authenticated member onboarding state;
- no ability for public-test submissions to create or activate member plans.

## Success metrics

Primary validation metrics should include:

- completion and abandonment rate;
- median and distribution of total completion time;
- abandonment location;
- question-level dwell time and repeated/backtracked questions;
- Tester Notes by stage/question;
- priority-accuracy score;
- plan-usefulness score;
- perceived burden score;
- intent-to-use score;
- trust/follow-plan signal;
- major non-use objections;
- willingness-to-pay distribution;
- Discovery-to-plan failure patterns by test/build version.

No single metric is a release gate by itself. Qualitative evidence and failure modes must be reviewed alongside aggregate scores.

## Implementation gates

Before the public URL is shared externally:

1. Canonical Repository QA passes.
2. Discovery Regression passes.
3. A parity regression demonstrates that the Intelligence Test and authenticated onboarding produce equivalent priority/plan outputs from equivalent canonical inputs.
4. Anonymous telemetry writes are verified against the intended research-only persistence contract.
5. Repeated `Try Again` runs create independent sessions.
6. No login or member-account state is required.
7. No public path can mutate member profile or active-plan tables.
8. Kill switch is tested.
9. Mobile and desktop smoke tests pass.
10. At least one internal end-to-end run verifies telemetry, Tester Notes, survey, submission, and retry behavior.

## Change-control rule

Do not fix an Intelligence Test logic failure by patching only the public wrapper when the same failure exists in canonical EL8 intelligence. Repair the canonical intelligence, add a regression, pass gates, then let both authenticated onboarding and the Intelligence Test consume the correction.
