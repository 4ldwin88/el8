# Discovery handoff repair — execution decision

This is execution evidence, not product authority. The founder has authorized
sequential bounded repairs of Discovery interpretation and completion.

## Slice: do not promote evidence in the Member State adapter

Starting candidate: 00504d36989398f6b184e891a8a059254cdf9273, clean.
Drive 02.01.02 Discovery owns semantic sufficiency: candidate consideration is
separate from satisfaction of required evidence; optional uncertainty may cross
with its provenance intact. Confidence is not sufficiency. 02.01.06 and its
structured registry own evidence meaning. Existing source snapshots are retained.

Observed defect: discovery-member-state-adapter treats any handoff candidate ID
as sufficient and erases unresolved reasons. Its outgoing input then discards
confidence, uncertainty and other available decision context. Two existing tests
explicitly require this promotion; those expectations contradict current authority.

Minimum boundary: the existing adapter remains the only mapper. A supported
candidate remains represented in Member State even when insufficient; listing it
in any handoff/stop metadata cannot establish sufficiency. Only the explicit
Discovery resolution result supplies sufficiency at this adapter boundary.
Reasons and available semantic context are copied without interpretation or
invented values, including when Discovery explicitly permits optional uncertainty.
Outgoing eligible candidates retain those fields. An empty eligible set must not
claim sufficient evidence. This does not certify the upstream resolution producer;
its semantic completion repair is the next independently gated change.

Affected owner: intelligence/state/discovery-member-state-adapter.js. Consumers
remain planning-pipeline.js, proposed-priorities.html and intelligence-test/priorities.html.
No new persistence path, schema version, population confidence rule or Plan rule.
The existing lossless mapper and SQL envelope accept these JSON fields; no backend
migration or historical read-time reinterpretation is needed. Original Supabase
remains unchanged. Current consumer narrowing of metadata remains a later gate.

Acceptance before repair: candidate/stop IDs never promote triaged state; explicit
reasons remain present; optional uncertainty remains present on a sufficient
candidate; confidence, relationships, feasibility, evidence/provenance and their
ordering survive the actual storage mapper and outgoing handoff; an unresolved
candidate remains stored but ineligible. Reconcile only the two directly
contradictory tests after demonstrating the new failures. Run existing adapter,
state, SQL and canonical tests; retain unrelated failures.

## Verification and self-review

All three acceptance tests failed against the starting implementation after
correcting a test import to use the existing mapper API. After repair: scoped
adapter/source/state/actual SQL suite 49/49 PASS. Full canonical gate: 354 tests,
353 PASS, one unchanged mixed-Focus Plan failure; the same nine HTML import graphs
fail. The canonical gate discovered the new file automatically. No full release
receipt is emitted. No SQL migration or staging mutation was needed for this slice.

The two contradictory adapter tests were reconciled to current authority, with
stronger assertions that preserve both candidate identity and independent
sufficiency. No production alias, fallback or duplicate evaluator was introduced.
Handoff metadata no longer has an implementation path that promotes sufficiency.
The existing atomic reducer, fact immutability and lossless mapper remain intact.
Outgoing records are detached copies, preserving available context and array order.

Limits found in self-review: upstream resolution still uses an invalid confidence
proxy; the orchestrator/runtime still duplicate completion decisions and can call
question exhaustion ready. Existing excluded/deferred projection skips can leave
stale eligible state on reassessment. Those disposition/partial-state semantics
require the next coherent lifecycle repair, not an invented status translation in
this adapter slice. Numeric Prioritization, immutable baseline establishment,
trusted Safety/Focus/Plan transitions and actual browser consumers remain gates.
This slice removes candidate-ID promotion; it does not certify upstream sufficiency
or the complete Discovery-to-Planning journey.
