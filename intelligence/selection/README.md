# Adaptive Question Selection v0.1

The selector is intentionally deterministic and pure. It does not query Supabase or mutate member state. Callers assemble a member-context snapshot and candidate questions, then the selector returns a ranked list plus a small selected set.

## Inputs

Member context can include active triggers, available evidence, uncertain signals or explicit uncertainty by signal, evidence age, recently asked questions/signals, current friction, current capacity, candidate dimensions, and a question/burden ceiling.

## Guardrails

- Default maximum: 2 ordinary questions per selection event.
- Low capacity reduces the ordinary burden budget.
- Recently asked questions/signals are penalized.
- Missing dependencies make a question ineligible.
- Trigger mismatch makes ordinary questions ineligible.
- Safety-relevant questions can override the ordinary burden ceiling.
- Success does not increase the question budget.
- Inactive/test questions are excluded unless the caller explicitly enables them.

## Scoring

Value is multiplicative across uncertainty need, information value, actionability, freshness need and trigger fit. Burden, redundancy and member friction are penalties. Multiplication is deliberate: a question should not rank highly merely because one metadata field is high while its current relevance is weak.

Weights and thresholds are experimental. Member Zero testing should evaluate whether selected questions actually change decisions while keeping check-ins quiet.
