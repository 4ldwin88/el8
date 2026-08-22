# Discovery v2 — Human Adversarial Validation Protocol

Status: validation gate after automated regression

## Purpose

Automated QA verifies deterministic scenarios. This pass tests whether Discovery v2 behaves sensibly when a real person answers imperfectly: ambiguously, inconsistently, with multiple concerns, stale context, corrections, or fatigue.

The goal is not to prove that EL8 guessed a diagnosis. Discovery should identify enough of what the member actually raised to support the next useful decision without interrogating them or silently abandoning a concern.

## Human release gates

A run passes when all applicable conditions are met:

1. **Responsive route** — follow-up questions visibly react to the tester's answers rather than feeling like a fixed questionnaire.
2. **Concern coverage** — every material concern deliberately raised by the tester is either explored sufficiently, explicitly cleared, linked to another concern, or visibly deferred at the fatigue ceiling.
3. **No false closure** — Discovery does not stop while an important raised concern is still unexplored.
4. **Contradiction handling** — a later denial or correction can suppress an earlier/stale hypothesis instead of allowing it to dominate the route.
5. **Causal discrimination** — when a symptom and plausible upstream driver are both presented, the route makes a reasonable attempt to distinguish them.
6. **Uncertainty recovery** — “not sure” does not strand the member; the next question should make the problem easier to answer.
7. **Burden** — normal runs should generally finish in 3–6 questions; no run may exceed the 8-question fatigue ceiling.
8. **Comprehensibility** — questions and answer choices are understandable without knowing EL8 terminology.
9. **No needless repetition** — the member should not be asked substantially the same thing twice unless the second question genuinely resolves ambiguity.
10. **Graceful exit** — stopping early is possible after two questions and does not manufacture certainty from incomplete evidence.

## Adversarial human test set

Run the test page repeatedly and role-play each case. Do not try to reproduce synthetic answers exactly; answer naturally from the persona.

### H1 — Single obvious concern

Persona: “My job has become unstable and that is what is bothering me.”

Expected: work becomes the central route quickly; unrelated domains should not expand unnecessarily.

### H2 — Symptom hiding an upstream concern

Persona: “I have been sleeping badly, mostly because money has been on my mind.”

Expected: Discovery should not stop at sleep if financial pressure is clearly driving it.

### H3 — Multiple interacting concerns

Persona: “Work is unstable, money is tight, and the uncertainty is stressing me out.”

Expected: the system should keep the workspace bounded while still addressing the raised concerns. It should not treat every selected gateway as an independent problem requiring a full branch.

### H4 — Misleading first answer

Start by indicating relationships are a problem. When asked directly, clarify that the relationship itself is fine and that lack of support is the actual issue.

Expected: relationship strain should be suppressed/cleared and support should remain live.

### H5 — Contradiction

Initially indicate money is a concern. Later answer that money is not materially affecting you and make work instability clear.

Expected: the money hypothesis should lose priority rather than survive simply because it was selected first.

### H6 — Ambiguous / unsure member

Choose “Not sure” at the broad gateway, then answer subsequent questions naturally as someone who feels directionless but cannot initially name the problem.

Expected: the route should recover with easier discriminating questions and converge without penalizing uncertainty.

### H7 — Broad noisy selection

Select several plausible areas because “everything feels connected,” but make only one concrete problem real when follow-ups arrive.

Expected: Discovery should prune false leads instead of treating broad selection as proof of multiple problems.

### H8 — Stale prior

Role-play someone whose previous issue was work instability but whose work is now stable; the current issue is relationship strain.

Expected: current direct evidence should defeat stale context.

### H9 — Correction / changed mind

Answer a question one way, then intentionally reinterpret the concern and correct the earlier assumption where the interface/workflow permits.

Expected: the engine should be capable of reopening affected reasoning rather than locking the original conclusion. Record any UI limitation separately from engine behavior.

### H10 — Healthy member

Persona: no meaningful current concern.

Expected: verify that nothing important is being missed, then exit without inventing a problem.

### H11 — Early opt-out

Raise a real concern, answer at least two questions, then choose Stop for now.

Expected: clean opt-out; no implied resolution of the unfinished concern.

### H12 — Fatigue ceiling

Answer in a deliberately ambiguous way that keeps several plausible concerns alive.

Expected: never exceed eight questions. Remaining unresolved concerns should be deferred rather than falsely marked resolved.

## Recording each run

For every run record:

- Persona ID
- Questions asked
- Approximate completion time
- Exit reason
- Top internal signals
- Open/deferred member-raised signals
- Responsive route: Pass/Fail
- Concern coverage: Pass/Fail
- False closure: Pass/Fail
- Contradiction handling: Pass/Fail/NA
- Repetition: Pass/Fail
- Burden: Pass/Fail
- Tester confidence: High/Medium/Low
- Free-text note: what felt wrong or unexpectedly good

The developer route trace on `discovery-v2-test.html` already exposes the evidence needed for most of these fields.

## Human acceptance threshold

Do not merge based on an average score that can hide a structural failure. Require:

- 100%: no run exceeds eight questions.
- 100%: no important member-raised concern silently disappears.
- 100%: healthy-member test does not manufacture a material concern.
- 100%: opt-out exits cleanly.
- >= 90% of remaining applicable checks pass across the full set.
- Any failure involving false closure, stale-prior domination, or unresolved member-raised concerns is a blocking defect even if the aggregate rate remains above 90%.

## Decision rule

If the protocol passes, Discovery v2 is ready to merge as the current discovery-routing baseline. Remaining improvements should then be driven by observed member behavior rather than additional speculative complexity.

If it fails, fix the smallest underlying reasoning rule that explains the failure, add the failed case to automated regression, rerun the automated gate, and repeat only the affected human scenarios plus one healthy control.
