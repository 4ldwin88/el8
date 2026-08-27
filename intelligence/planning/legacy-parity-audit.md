# Legacy → Canonical Planning Parity Audit

Status: migration decision record. The legacy planner is not architectural authority.

## Preserve in canonical Planning

- Safety preemption before ordinary planning.
- Explicit member acceptance/consent before activation.
- Intervention-selection evidence deepening after the problem/focus is established.
- Registry eligibility and contraindication/rejection filtering.
- Capacity-sensitive active-plan limits.
- One purposeful component per accepted focus before adding secondary components.
- Intervention burden, action templates, measurement and review-rule metadata.
- Replanning constraints such as lower burden or a genuinely different intervention/mechanism.
- Earliest applicable review window as scheduling metadata.
- Traceability from intervention → accepted priority → supported problem → evidence.

## Move out of Planning

- Problem sufficiency/confidence thresholding (`MIN_ACTION_CONFIDENCE=.55`) → Discovery owns sufficiency.
- Re-ranking which problem matters most → Prioritization owns ordering.
- Determining whether the member accepted the focus → Member State/member choice boundary.
- Outcome interpretation and Keep/Simplify/Replace/Deepen decisions → Feedback/Review owns disposition.
- Engagement-wide throttling decision → Feedback/Member State policy owns throttle; Planning obeys it.
- Cross-dimensional causal validation → Discovery/Feedback learning owns hypothesis validation and decay.

## Compatibility only; do not canonize

- Legacy action IDs (`walk`, `sleep_log`, etc.).
- `driver` / `legacy_driver` naming.
- `problem_id` P01–P08 aliases as the durable domain identity.
- `confidence` copied onto plan components as if it were action authority.
- `evidenceUsed` containing Discovery hypotheses as a planner-owned sufficiency record.
- `coveredDrivers` / `uncoveredDrivers` compatibility fields.

## Still required before legacy replacement

1. Preserve intervention mechanism discrimination derived from selection evidence where it changes registry eligibility.
2. Preserve activation-specific deepening (`applyPlanDeepening`) without letting it become a second Discovery engine.
3. Preserve review-window scheduling metadata.
4. Add a canonical plan-result → Member State adapter with revision protection.
5. Prove Feedback can consume canonical intervention measurement/review metadata.
6. Run canonical scenario parity across P01–P08 and adaptation cases.

## Replacement criterion

The legacy `buildPlan(discovery, context)` entry point may be removed only when the six requirements above pass canonical QA. No legacy field is preserved merely because an old test expects it.
