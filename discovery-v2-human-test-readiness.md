# Discovery v2 — Human Test Readiness Gate

Status: PRE-HUMAN QA

## Candidate baseline
Use the last verified passing Discovery v2 behavior as the human-test baseline. Experimental causal-ranking changes remain quarantined until independently validated.

## Required release gates
A human-test candidate must satisfy all of the following before pilot use:

- Synthetic true-driver Top-3 recovery remains at or above the established release threshold.
- Healthy-member early exit passes.
- Unsure/uncertainty recovery passes.
- Correction recovery passes.
- Active hypothesis overflow remains within threshold.
- Cross-class route overlap remains within threshold.
- No known multi-select exclusivity defects.
- No semantic mismatch between question wording and answer mode.
- Plain-language review completed for every member-facing question and option.
- Opt-out is respected immediately.
- Maximum question budget is enforced.
- Result language describes possible pressures/connections and does not diagnose conditions.

## Human pilot scope
First pilot: 3–5 testers. This is usability and discovery QA, not efficacy validation.

Each tester should complete at least:
1. One natural-response run without being told what EL8 is trying to detect.
2. One deliberately ambiguous or "Not sure" opening.
3. One run where more than one factor applies, if naturally possible.
4. A short post-run debrief.

## Observe during testing
Record:
- Completion time.
- Questions asked and selected answers.
- Whether the next question felt connected to the prior answer.
- Any repeated or near-duplicate question.
- Any question or option that required rereading.
- Any point where the tester wanted multiple answers but could not select them.
- Any answer set that did not fit the question.
- Whether EL8 surfaced the issue(s) the tester believed mattered.
- Whether EL8 missed a more important upstream driver.
- Whether the tester felt led toward a predetermined category.
- Whether the session should have stopped earlier or continued longer.

## Post-run questions
Ask every tester:
1. Did the questions feel like they were responding to your answers? Why or why not?
2. Did any question feel repetitive?
3. Was any wording confusing or unnecessarily complicated?
4. Were there times when more than one answer applied but you could not express that?
5. Did EL8 focus on the right issue or issues?
6. Did it miss anything important?
7. Did any question feel like EL8 was trying to force you into a category?
8. Did the session feel too short, about right, or too long?
9. Did the final interpretation feel accurate? What would you change?
10. Would you be comfortable answering questions like these during normal EL8 use?

## Stop / reject conditions
Stop the pilot and return to engineering if any of these appear repeatedly:
- Different member situations collapse into essentially the same route.
- Strong correction is ignored and the engine returns to the rejected hypothesis.
- A healthy/low-signal member is repeatedly over-questioned.
- The engine persistently ranks downstream symptoms above clearly evidenced upstream drivers.
- Question/answer semantics mismatch.
- Multi-select behavior corrupts or traps selections.
- Testers consistently describe the experience as interrogation, random, or predetermined.

## Pilot decision rule
Do not optimize from a single tester complaint unless it exposes an objective defect. After 3–5 testers, cluster failures by type and fix systemic issues first. Preserve transcripts and route traces so changes can be compared against the same failure cases.
