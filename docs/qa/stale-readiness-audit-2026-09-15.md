# Stale Readiness Audit — 2026-09-15

Status: repo-only documentation/test-gate audit while EL8 Supabase remains inactive.

## Scope

Audited current readiness language in:

- `README.md`
- `docs/qa/human-test-readiness-packet.md`
- `docs/supabase-reactivation-source-ownership.md`
- `supabase/read-only/reactivation-catalog-checks.sql`
- `docs/MVP-IMPLEMENTATION-AUDIT.md`
- `docs/qa/g02-v005-human-qa-findings.md`
- `docs/MVP-INTELLIGENCE-BOUNDARY.md`
- `docs/REPOSITORY-GOVERNANCE.md`

No Supabase project activation, query, mutation, migration, or deployment was performed.

## Corrections made

1. `docs/MVP-IMPLEMENTATION-AUDIT.md`
   - Marked as a historical implementation-boundary audit under the current 2026-09-15 readiness constraint.
   - Removed the misleading implication that green QA alone can move EL8 directly into controlled human testing.
   - Clarified that controlled human testing still waits for the human-test readiness packet, source-ownership resolution, owner-approved Supabase reactivation, read-only catalog/live-backend checks, and Jay's explicit approval.
   - Aligned the canonical loop wording with the current governance phrasing where Discovery captures opening/baseline evidence without creating a separate Baseline decision stage.

2. `docs/qa/g02-v005-human-qa-findings.md`
   - Added a status note that v0.05-v0.07 validation/deployment successes are historical evidence for exact named candidates only.
   - Clarified that those historical candidates do not make PR #144, `reconcile/g02-intelligence`, or EL8 generally human-test-ready now.

## Code-level wording pass

Additional repo-only audit performed after the documentation correction pass:

- inspected `.github/workflows/g02-intelligence-validation.yml`, `.github/workflows/pages.yml`, `.github/workflows/persistence-live.yml`, and `.github/workflows/qa.yml`;
- inspected `package.json` script names and the current `test:*` command map;
- inspected `scripts/write-intelligence-test-build-meta.mjs` and `app/research/intelligence-test-build.js`;
- inspected the `intelligence-test/` harness directory listing plus the entry/completion pages, QA chrome, submit path, and key harness regressions.

Low-risk wording corrections made in that pass:

1. `.github/workflows/pages.yml`
   - Renamed the workflow from a human-QA deployment label to a prototype QA harness publication label.
   - Renamed relevant steps so GitHub Pages publication is not mistaken for human-test authorization or release readiness.
   - Updated the build context from `github-pages` to `github-pages-prototype-qa`.

2. `.github/workflows/persistence-live.yml`
   - Renamed the workflow/job/step labels so the live persistence suite is clearly owner-approved and post-Supabase-reactivation only.
   - Did not change the command or backend behavior.

3. `app/research/intelligence-test-build.js` and `scripts/write-intelligence-test-build-meta.mjs`
   - Removed stale Netlify wording and replaced it with GitHub Pages/prototype-QA provenance wording.
   - Kept generated metadata semantics unchanged.

## Behavior-tied findings not changed

The `intelligence-test/` harness still posts telemetry and completion payloads to `https://jprdsidxwjkgiqqakwpr.supabase.co/functions/v1/intelligence-test`. Because EL8 Supabase is currently inactive and must not be touched, this is a readiness blocker/gate item, not a wording-only cleanup.

`intelligence-test/complete.html` still says the test, telemetry, and optional feedback have been submitted for development review. That copy should be revisited with the live telemetry behavior during the Supabase reactivation gate. Changing it now risks drifting from the actual submission/blocking contract without being able to verify the live endpoint.

The visible QA chrome still labels the page as an `EL8 human QA build version` and exposes the short deployed commit. This is acceptable for the internal harness, but it must not be treated as proof that the current PR head is human-test-ready.

## Compatible but not changed

`docs/MVP-INTELLIGENCE-BOUNDARY.md` still contains older pre-human-testing MVP gate language. It remains broadly compatible as an implementation boundary, but it should be read through the newer readiness packet and source-ownership records. If this file becomes active release guidance again, add a current status addendum rather than rewriting its original MVP scope.

`docs/REPOSITORY-GOVERNANCE.md` remains compatible because it already says automation alone does not establish the MVP, live persistence/backend checks are required where mocks cannot prove correctness, and historical documents do not override newer explicit MVP decisions.

The `package.json` `test:*` script names and `.github/workflows/qa.yml`/`.github/workflows/g02-intelligence-validation.yml` labels remain acceptable as repository validation labels. They do not, by themselves, claim human-test readiness.

## Remaining test-gate triage

A later checkout-backed pass should still audit the full source tree with local search once local shell access is available. That pass should verify that no hidden test command, workflow label, page copy, fixture, or comment implies:

- green repository QA equals human-test readiness;
- old v0.07 candidate success applies to the current PR head;
- Supabase-backed behavior has been refreshed after the 2026-09-15 inactive-project constraint;
- human testing may proceed before the source-ownership and reactivation gates pass.

Until that pass is complete, repository documentation and inspected workflow/harness wording are more coherent, but uninspected source-tree wording should not be treated as fully audited.