# Adaptive QA v0.7 — Hierarchical Intelligence Model

## Product hierarchy
EL8 keeps the member-facing Insights hierarchy intentionally simple while allowing deeper internal intelligence:

1. **Overall Insights** — whole-person wellness summary across all eight dimensions.
2. **Individual Dimension Insights** — one dimension at a time, with its state, trend, evidence and relevant guidance.
3. **Detailed Dimension Insights** — the selected dimension decomposed into its subdimensions.

Subdimensions are therefore not a replacement for the eight dimensions and should not crowd the top-level experience. They are the evidence-bearing layer underneath dimension state.

## Intelligence hierarchy
`observation / answer -> subdimension signal -> dimension aggregate -> overall state`

A predefined answer should eventually write primarily to a named subdimension. Dimension state is derived from subdimension evidence rather than repeatedly mutated by generic answer text.

Cross-dimensional effects remain allowed, but must be explicit evidence relationships rather than accidental keyword matches.

## Canonical v0.7 taxonomy
- Physical: Sleep, Energy, Movement, Nutrition, Medical Health, Substance Exposure
- Emotional: Mood, Stress, Regulation, Resilience, Self Perception, Manageability
- Social: Connection, Support, Belonging, Relationship Quality, Isolation
- Spiritual: Meaning, Purpose, Values Alignment, Inner Peace, Practice
- Intellectual: Focus, Clarity, Learning, Curiosity, Cognitive Load, Decision Capacity
- Occupational: Employment Stability, Workload, Satisfaction, Direction, Development, Income Stability
- Financial: Income Adequacy, Expense Load, Debt Burden, Liquidity, Security, Financial Control
- Environmental: Safety, Stability, Comfort, Organization, Access, Environmental Stress

This taxonomy is controlled but versionable. A subdimension should be added only when it represents a meaningfully distinct state that can change question selection, insight explanation, or intervention choice.

## Scoring and display
Internal subdimension state may remain quantitative with confidence, uncertainty and evidence counts. Member-facing UI does not need to expose raw numeric scores. The existing EL8 principle remains: internal quantitative intelligence can support external qualitative presentation.

Overall and dimension views should summarize rather than average blindly. Aggregation policy will need to account for severity, confidence, recency and evidence coverage before production use.

## v0.7 implementation sequence
1. Establish canonical taxonomy and state representation.
2. Add subdimension metadata to the Question & Signal Matrix.
3. Map predefined question-option pairs to explicit subdimension evidence.
4. Derive dimension hypotheses from subdimension evidence.
5. Change adaptive selection to coverage-first, then justified deepening.
6. Add anti-tunneling limits at dimension and subdimension levels.
7. QA against hidden subdimension truth as well as dimension truth.

## Data cost
The taxonomy is intentionally small: roughly 45 subdimensions. Current-state storage is trivial relative to event history, media, voice/image processing and model inference. Store current state compactly and retain evidence events separately where historical auditability is required.
