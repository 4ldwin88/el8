# Tracking

Tracking is a canonical EL8 product capability and must survive repository retirement.

## Keep

1. Global Track action available from every primary member surface.
2. Plan-specific Quick Logs derived from the active plan rather than a permanent cluttered catalog.
3. Direct structured quick logging for useful low-friction measures, including water/hydration, sleep intervals, mood, energy and weight when relevant to the active plan.
4. Universal free-form capture by text.
5. Photo/image capture and image interpretation.
6. Voice-note recording and transcription.
7. Member review/correction before interpreted evidence is confirmed and saved.
8. Structured interpretation support already proven for food intake/nutrition estimates and expenses/receipts.
9. Evidence persistence with provenance sufficient for later Member State, plan review, Insights and Outcomes/Learning.
10. Timezone-aware local dates and sleep interval metadata.

## Canonical locations

- `app/track/track-sheet.js` — global capture surface.
- `app/track/track-sheet.css` — capture presentation.
- `app/track/quick-log.js` — canonical structured quick-log persistence/helpers.
- `app/home/plan-quick-logs.js` — derives which shortcuts are useful from the Active Plan.
- `track-review.html` — temporary deployed review surface until folded into `app/track/`.

The root `quick-log.js` and standalone sleep implementation are migration sources only and can be retired after their callers use the canonical module.

Tracking should remain low burden. EL8 should ask for evidence because it can affect the plan, Member State or review—not because a metric exists.