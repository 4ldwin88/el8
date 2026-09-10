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

## Next slice: one explicit completion evaluator

Pre-implementation decision at 9a06056b11714bfa43ea7a47de5d51c9f7d600f5:
02.01.02 forbids treating question count/exhaustion, driver knowledge or aggregate
confidence as semantic sufficiency. Required unresolved evidence and Safety block
ordinary handoff; explicitly optional uncertainty remains visible. Partial and
no-active-concern outcomes must remain distinguishable.

Observed owners: sufficiency.js uses confidence/specificity/driver proxies;
discovery-orchestrator.js declares readiness when no question remains; the engine
and onboarding runtime can independently overwrite that result. No current caller
uses coverageAudit, stoppingDecision or DEFAULT_EFFICIENCY_BENCHMARK outside their
own module; retire those unconsumed parallel completion exports. Keep one
handoffAudit owner. All callers must preserve its candidates, unresolved records
and blockers. Unknown unresolved-requirement formats fail closed; an explicitly
non-blocking record requires a reason rather than silently treating every gap as
optional. This is a contract field for an observed ambiguity, not a new policy
registry. No question-specific rule is copied out of Drive.

The direct-probe producer must require an actual selected STATE effect before
using its existing governed focused-sufficiency permission, and must not invent
known drivers. This does not yet replace all construct interpretation or provide
full concern-specific requirement coverage. Baseline establishment remains next.
Acceptance: required/unknown gaps block despite an empty bank or forged ready flag;
optional uncertainty survives; confidence/specificity cannot make triaged evidence
sufficient; a QA guardrail stays incomplete; Safety interrupts all ordinary cases;
actual direct Sleep uncertainty cannot satisfy state evidence. Preserve legitimate
explicit sufficient and no-concern paths. Reconcile obsolete proxy fixtures only
against these authority rules. No SQL change is required.

### Prior pause: Financial evidence-period authority conflict

Fresh canonical Drive registry read confirms Q000056 / FIN001 asks about the
past 30 days, while EFX000267–EFX000271 all use the semantic key
money_pressure_frequency_7d. Both Questions and Effects are current canonical
structured tables; neither is merely a historical/source-bank tab. The workbook
identifies semantic keys as metadata, and identifies these rows as direct state
on the question's named scale; no current rule declares the 7d suffix inert or
chooses a replacement recall period. 02.01.06 requires the construct, intended
evidence, recall window and response model to be defined together. The founder
must resolve that ambiguity before a Financial semantic acceptance fixture can
be promoted. No historical evidence period is inferred or rewritten.

Separately, the runtime focused-sufficiency regex omits the Scheduling / Stage
column containing FIN001's permission. That is an implementation defect; fixing
its detection must not silently choose between the conflicting period metadata.

Draft completion acceptance: six new tests failed before repair and all six pass
after the draft. The latest focused existing/new run is 9/10: the Financial
fixture fails because the existing focused-probe flag cannot find that question.
The earlier full draft gate had 360 tests, with the existing Plan failure and two
obsolete Discovery fixtures failing; the partial fixture reconciliation was not
followed by a full release PASS. This draft is NOT a completed slice and must not
advance the canonical branch. It is preserved as an unapplied patch at the exact
9a06056b11714bfa43ea7a47de5d51c9f7d600f5 base, alongside its evidence.

Further draft review remains necessary after the decision: coverage validation
currently accepts any nonempty state label; partial-state resume can retain an
incomplete flag; explicit current-state uncertainty after a prior sufficient
answer and contradictory reports need governed correction handling. The old
excluded/deferred projection skip and upstream generic effect reduction remain.
No claims of complete sufficiency coverage, immutable baseline or readiness.

### Resumed after founder decision

The founder approved the 30-day period for new evidence. The separately committed
financial-recall-decision.md records the correction and historical-preservation
tests. This saved completion patch was restored without restarting completed
phases. Its earlier STOP and failed fixtures above are historical execution
evidence, not an active permission request. The existing focused-probe lookup now
reads Scheduling / Stage as well as Decision Use and Registry Notes; FIN001 keeps
its source-owned permission rather than receiving a new special-case fallback.

### Completion slice verification after resumption

The resumed completion slice passes 18/18 scoped tests. The five additional
adversarial cases first failed against the saved draft and now pass: resume after
required evidence arrives, orientation-finish bypass, replacement uncertainty,
invalid/duplicate coverage, and graph-default promotion. Explicit unknown coverage
is allowed internally by Drive; it is not reintroduced as a first-matrix answer.
The Financial probe fixture now uses the actual current question/answer path.
Full canonical gate: 367 tests, 366 pass, one unchanged mixed-Focus Plan failure;
the same nine HTML module imports fail. No full validation receipt is emitted.

Self-review: one handoffAudit evaluator, no confidence/depth/driver completion
proxy, and no graph-ready override. Unconsumed parallel completion exports were
removed after consumer search. Optional requirements require an explicit nonblocking
classification, stable requirement ID and reason; ambiguous records block. Runtime
Safety presentation consumes the actual canonical interruption fields. A QA cap
remains incomplete; ordinary resume re-evaluates evidence instead of keeping a
sticky incomplete flag. Graph candidate metadata defaults missing member confidence
to UNKNOWN and missing resolution to unresolved; moderate confidence is labeled
moderate, not sufficient. Two obsolete completion fixtures and one misleading
confidence label expectation were reconciled, with added negative assertions.

Remaining gates: full concern-specific interpretation/requirement coverage,
contradictory evidence and explicit corrections, stale eligibility on deferred or
dismissed reassessment, durable global requirements, full initial baseline and its
trusted immutable establishment, population/member relationship separation,
Prioritization and the Plan/lifecycle/browser journey. This slice validates explicit
completion inputs; it does not claim all upstream semantic producers are repaired.
