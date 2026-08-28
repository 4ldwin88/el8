# Intelligence E2E reconciliation

## Confirmed drift

- The old E2E modeled Baseline as the first Intelligence stage and routed Baseline → Discovery. Canonical architecture is Discovery-first; baseline is established in Member State from completed Discovery evidence.
- The old E2E imported `initialPlanProposal` from Discovery runtime although Discovery runtime does not own or export Planning.
- The old E2E's Priorities page still passes `baseline_handoff` into adaptive planning.
- Production onboarding already has a Discovery opening snapshot adapter and Discovery-first routing.
- Canonical Member State projection establishes `baseline.status = ESTABLISHED`, but the current browser projection requires confirmed priorities. That couples baseline establishment to a downstream member-focus decision and must be separated before the E2E can truthfully prove Discovery → baseline → Prioritization.
- Canonical accelerated review/adaptation already exists under `intelligence/review` and `app/profile/canonical-qa-runner.js`; the E2E should reuse it rather than simulate a separate loop.

## Reconciliation sequence

1. Replace E2E Baseline entry with the production-shaped Discovery opening snapshot and canonical Discovery runtime. DONE in this branch.
2. Remove Discovery-owned plan proposal behavior. DONE in this branch.
3. Split initial Member State projection from priority acceptance so completed Discovery establishes baseline before Prioritization.
4. Rewire E2E Priorities to canonical prioritization output and update Member State only after explicit member confirmation.
5. Rewire Plan/activation to canonical planning and activation transaction.
6. Attach accelerated outcome/review/adaptation to the same canonical Member State created by this journey.
7. Retire obsolete standalone `baseline.html`, `baseline-plan.html`, and redundant deepening pages only after their unique QA coverage is migrated.
8. Add import/route regression coverage for the complete browser E2E chain.
