# Legacy → Canonical Planning Parity Audit

Status: replacement boundary complete. The canonical planner is architectural authority; the legacy planner is obsolete.

## Preserved in canonical Planning

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

## Moved out of Planning

- Problem sufficiency/confidence thresholding (`MIN_ACTION_CONFIDENCE=.55`) → Discovery owns sufficiency.
- Re-ranking which problem matters most → Prioritization owns ordering.
- Determining whether the member accepted the focus → Member State/member choice boundary.
- Outcome interpretation and Keep/Simplify/Replace/Deepen decisions → Feedback/Review owns disposition.
- Engagement-wide throttling decision → Feedback/Member State policy owns throttle; Planning obeys it.
- Cross-dimensional causal validation → Discovery/Feedback learning owns hypothesis validation and decay.

## Compatibility fields not canonized

- Legacy action IDs (`walk`, `sleep_log`, etc.).
- `driver` / `legacy_driver` naming.
- P01–P08 aliases as durable identity beyond the registry compatibility boundary.
- `confidence` copied onto plan components as if it were action authority.
- `evidenceUsed` containing Discovery hypotheses as a planner-owned sufficiency record.
- `coveredDrivers` / `uncoveredDrivers` compatibility fields.

## Replacement requirements — complete

1. COMPLETE — selection evidence discriminates mechanisms where registry eligibility changes.
2. COMPLETE — activation-specific `applyPlanDeepening` runs from canonical Planning without becoming a second Discovery engine.
3. COMPLETE — canonical plan results preserve earliest applicable review-window scheduling metadata.
4. COMPLETE — canonical plan-result → Member State adaptation is revision protected.
5. COMPLETE — Feedback/Review consumes canonical intervention measurement and review metadata.
6. COMPLETE — canonical scenario parity covers P01–P08 plus adaptation constraints.

## Replacement decision

All six requirements passed Canonical Repository QA before the deletion boundary. `buildPlan(discovery, context)` and its legacy-only tests are therefore obsolete and may be removed. Canonical Planning is `buildCanonicalPlan(...)`; no legacy field is preserved merely because an old test expected it.
