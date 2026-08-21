# EL8 Adaptive Question Bank

This directory defines reusable evidence questions for EL8's adaptive intelligence.

## Architectural rule

Questions collect evidence. The central intelligence layer interprets evidence and decides whether a plan should be created, maintained, reduced, clarified, or changed. Individual question modules must not independently manufacture or replace member plans.

Formal assessments (for example, the Universal Baseline and future reassessments) remain separate immutable point-in-time instruments. Adaptive clarification and deepening draw selectively from this question bank and should stop when additional information is unlikely to change the decision.

## Core metadata

Each question should define, where applicable:

- `id`: stable question identifier
- `dimension`: primary EL8 dimension
- `secondary_dimensions`: other dimensions that may receive evidence, without assuming causality
- `signal`: the construct being measured
- `prompt`: member-facing question
- `response_type`: single choice, multi choice, ordered scale, number, text, etc.
- `options`: allowed responses when structured
- `information_value`: relative expected value for resolving uncertainty (1–5)
- `burden`: relative member effort (1–5)
- `actionability`: likelihood the answer can change a near-term decision (1–5)
- `triggers`: situations in which the question becomes eligible
- `dependencies`: evidence that should already exist, or prior answers that make the question useful
- `cooldown_days`: minimum time before asking again absent a material change
- `stale_after_days`: when old evidence should lose decision confidence
- `safety_relevant`: whether safety rules can override ordinary burden limits
- `source`: origin/version of the question

The numeric metadata is an internal prioritization aid, not a member-facing wellness score.

## Selection principle

Question priority should consider information value, actionability, current uncertainty, evidence freshness, member capacity/friction, redundancy and burden. Success must not automatically increase question volume. Deepening is a behavior of the intelligence system, not a fixed questionnaire or page.
