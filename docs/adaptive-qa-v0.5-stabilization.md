# Adaptive QA v0.5 stabilization

## Defects found

1. **Healthy-state premature termination.** After a reassuring opening answer, all dimension severity values can remain below the matrix selector's State threshold. The selector then returns no question, so blind QA can stop after one turn without establishing broad evidence.
2. **Coverage was not part of matrix ranking.** A State probe in an untested dimension had no explicit advantage over another eligible question.
3. **Resolution policy needs an explicit coverage invariant.** A blind QA cycle should not treat absence of detected pressure as evidence that all dimensions are healthy.

## v0.5 stabilization policy

- When no pressure has yet been confirmed, State questions remain eligible for dimensions not yet probed in the recent QA history.
- Unprobed dimensions receive a small ranking bonus so blind QA broadens coverage before repeating dimensions.
- The selector now records `probedDimensions` in its context for traceability.
- Regression tests require a healthy-state run to obtain one State probe in each of the eight dimensions before the selector can exhaust its candidates.
- A separate blind-QA resolution policy defines the intended stopping invariant: healthy-looking cycles require all eight dimensions to have evidence; problem cycles require at least four dimensions of coverage plus resolved uncertainty around active hypotheses.

## Remaining integration step

The current `qa-accelerated.html` runner still owns its legacy inline `resolved()` function. The new `blind-qa-policy.js` is intentionally isolated and tested first; the runner should import it in the next integration change so the stopping invariant is enforced by the UI as well as documented/tested at policy level.
