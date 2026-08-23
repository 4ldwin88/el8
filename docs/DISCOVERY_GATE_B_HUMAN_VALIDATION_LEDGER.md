# Discovery Gate B — Human Validation Ledger

Status: OPEN — Gate A passed; human validation not yet passed

Candidate commit: `cedf7c4c6b7f7d62a622418f9bec414c8ddffc99`

## Freeze rule

The Discovery engine is frozen during human testing. Do not tune the engine merely to improve a score. A change is permitted only after an observed human failure is classified as a legitimate reasoning defect. Every legitimate defect must become a permanent automated regression case before the candidate is retested.

## Validation order

1. Member Zero — natural use, not role-played to satisfy expected outputs.
2. Member Zero adversarial pass — selected scenarios from the canonical H1–H12 protocol.
3. Independent tester cohort — minimum 3 people who were not involved in designing the engine.
4. Defect reconciliation — classify each failure as engine, question-bank/content, interface, test-protocol, or non-defect preference.
5. Regression conversion — add every legitimate engine/content failure to automated QA.
6. Gate A rerun — full automated suite must pass again after any code/content change.
7. Targeted human rerun — affected scenario(s) plus H10 healthy control.
8. Gate B decision — merge only if all blocking criteria pass.

## Tester handling rules

- Do not coach testers toward an expected route.
- Record what the tester actually meant before inspecting the route trace when practical.
- Preserve the tester's wording verbatim for any confusing, repetitive, irrelevant, or missing question.
- Separate UI friction from reasoning defects.
- Do not count a tester preference as a defect unless it impairs comprehension, coverage, safety, or decision usefulness.
- Do not expose internal scoring/expected outcomes before a run.

## Member Zero — natural run

Status: NOT RUN

Record:

- Date/time:
- Starting intent/concern in member's own words:
- Questions asked:
- Answers given:
- Completion time:
- Exit reason:
- Top internal signals:
- Open/deferred member-raised signals:
- Responsive route: Pending
- Concern coverage: Pending
- False closure: Pending
- Contradiction handling: Pending / NA
- Repetition: Pending
- Burden: Pending
- Comprehensibility: Pending
- Tester confidence: Pending
- Verbatim friction/confusion:
- What felt unexpectedly useful:
- Defect classification: Pending

## Member Zero — adversarial scenarios

Run after the natural pass. Use the canonical `DISCOVERY_V2_HUMAN_ADVERSARIAL_VALIDATION.md` protocol. Prioritize H2, H3, H5, H6, H10, H11, and H12 because together they exercise upstream-driver detection, interacting concerns, contradiction handling, uncertainty recovery, healthy exit, opt-out, and fatigue ceiling.

| Scenario | Status | Blocking defect? | Notes |
|---|---|---:|---|
| H2 upstream concern | Not run | — | |
| H3 interacting concerns | Not run | — | |
| H5 contradiction | Not run | — | |
| H6 unsure member | Not run | — | |
| H10 healthy member | Not run | — | |
| H11 early opt-out | Not run | — | |
| H12 fatigue ceiling | Not run | — | |

## Independent tester cohort

Minimum cohort: 3 independent testers.

Each tester should complete:

- one natural run based on a real current or recent concern, or a healthy/no-concern state;
- one assigned adversarial scenario so the cohort covers materially different failure modes;
- a short debrief without seeing the expected route first.

| Tester | Natural run | Assigned adversarial | Blocking defect? | Overall |
|---|---|---|---:|---|
| T1 | Not run | TBD | — | Pending |
| T2 | Not run | TBD | — | Pending |
| T3 | Not run | TBD | — | Pending |

## Defect register

| ID | Source | Verbatim observation | Classification | Severity | Regression added? | Fixed? | Retested? |
|---|---|---|---|---|---:|---:|---:|
| — | — | — | — | — | — | — | — |

Severity:

- BLOCKER — false closure, silently lost material concern, stale-prior domination, fabricated material concern for healthy member, broken opt-out, >8 questions, or behavior that invalidates the route.
- MAJOR — materially wrong/irrelevant route, contradiction not handled, or repeated questioning that meaningfully harms usefulness.
- MINOR — wording/UI friction that does not materially alter reasoning or completion.

## Gate B acceptance

Gate B cannot pass until:

- no run exceeds eight questions;
- no important member-raised concern silently disappears;
- healthy-member testing does not manufacture a material concern;
- opt-out exits cleanly;
- all BLOCKER defects are fixed, converted to regression coverage, and retested;
- at least 90% of remaining applicable canonical checks pass;
- the complete Gate A automated suite passes on the final candidate after the last change;
- at least three independent testers have completed the required cohort pass.

## Current decision

**HOLD — do not merge.** Gate A evidence is sufficient to begin human validation, but Gate B has no human evidence yet.