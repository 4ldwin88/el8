# Onboarding Discovery handoff — pre-implementation decision

Base: 9e2244b896cc9dbbb9456a128955b1de77c97d66.
Drive 02.01.02 and 02.01.06 require evidence/provenance preservation and explicit
completion before Prioritization. The single completion owner is handoffAudit via
Discovery.handoff; question counts cannot establish production completion.

Observed current consumer defect: planning-pipeline builds its own reduced trace,
containing only states. It omits actual observations, requirements and Safety and
never asks the completion owner whether this assessment can hand off. Its snapshot
factory also silently supplies a production maximum of 14 questions.

Minimum coherent consumer repair: use the actual Discovery session and trace;
require the actual handoff audit before constructing Prioritization input. Incomplete
sessions fail explicitly, preserving the caller-owned session for continued evidence
collection. Complete sessions project all source observations through the existing
single Member State mapper. Remove the implicit question maximum; preserve an
explicitly supplied QA guardrail. Do not introduce another checkpoint, persisted
lifecycle, fallback trace or completion evaluator.

Owners affected: app/onboarding/planning-pipeline.js consumes the existing Discovery
engine, Member State mapper and Prioritization owner. No other semantic owner or
Supabase object changes. The existing hosted writer stores the same canonical JSON
envelope and immutable facts. Other HTML consumers, durable global-requirement
storage, concern disposition, immutable baseline and trusted semantic validation
remain subsequent gates; this slice does not claim to resolve them.

Acceptance before repair: real source observations reach Member State facts through
the production pipeline; missing requirements, direct-state conflicts and Safety
cannot produce Prioritization input; missing production guardrail remains null.
Existing successful Planning-chain assertions must continue to pass.

## Verification and self-review

All three boundary tests failed on 9e2244b. After repair, the 21-test scoped gate
passes, including all existing successful Planning chains. The canonical gate
reports 378 tests / 377 pass / 1 fail / 0 skipped, with the unchanged mixed-Focus
Plan test and nine HTML import failures. Actual disposable SQL replay and writer
checks pass. No new hosted Auth result or release receipt is claimed.

Self-review: the pipeline now delegates both trace and completion, rather than
reconstructing either. It retains every observation and checks actual evidence
references against persisted facts. A failed handoff does not mutate the session;
its explicit error includes the audit for callers. No Plan selection/activation,
Focus decision, registry content, storage schema or backend mutation changed.
HTML callers that bypass this pipeline and durable partial/resume requirements
remain explicitly open; this consumer repair is not the full member journey gate.
