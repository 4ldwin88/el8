# Discovery confidence — pre-implementation decision

Base: e006599070c996d98dd3ae1083fa07af33c84f72.
Fresh authority: 02.01.09 (modified 2026-09-01T21:43:48.250Z), sections 3, 5, 11,
14 and 19; 02.01.09.01 (modified 2026-09-01T22:08:11.202Z), Sleep confidence rule;
02.01.02's separation of semantic sufficiency from experimental confidence formulas.
Higher confidence needs justified relevance/quality/independence/consistency/recency;
internal heuristics require validation before becoming authority.

The categorical interpretation slice retained the earlier automatic WELL_SUPPORTED
label whenever any direct STATE existed without a same-question conflict. Its
comment narrowed this to confidence in a report, but the mapper exposes that value
as canonical construct evidenceConfidence. That narrowing is not enforced and is
not a governed calibration. The rule must therefore be removed.

Minimum repair: current Discovery reports confidence UNKNOWN until an explicitly
governed assessment exists. STATE presence still establishes that a report exists;
explicit focused sufficiency remains independent, and conflicts remain unresolved.
No calibrated replacement category, numeric proxy or extra registry is invented.
Caller-supplied confidence on other independently governed inputs is not rewritten.
Only the construct projection and its actual runtime expectation change.

Acceptance: one report, repeated reports and corroborating context cannot invent
high confidence; actual sufficient direct Sleep evidence can cross the existing
pipeline with UNKNOWN confidence; a direct conflict still blocks completion.
No Supabase object or ordinary historical read changes.

## Verification and self-review

Both new tests failed before repair. Scoped Discovery/pipeline/adapter tests pass
43/43; adversarial loop plus new confidence cases pass 10/10. The initial full gate
found five additional failures, all from two shared assertions requiring automatic
WELL_SUPPORTED confidence in the G02 actual-Activity fixture. Those assertions
were classified as obsolete measurement expectations and changed to UNKNOWN.
All Safety, sufficient-state, member rejection, Plan hard-gate, contextual modifier,
zero-capacity, provenance and explainability assertions remain intact.

Final canonical gate: 380 tests / 379 pass / 1 fail / 0 skipped. The unchanged
mixed-Focus Plan test and nine HTML imports block the release receipt. Self-review
confirms that no other supplied confidence category is downgraded, ordinary stored
history is unchanged, explicit sufficiency remains independent, and no calibrated
replacement or new confidence owner is introduced. The earlier interpretation
slice's retained report-confidence comment is superseded by this correction.
