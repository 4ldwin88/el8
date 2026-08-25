# Canonical Intelligence Migration Checkpoint

Status: **VERTICAL SPIKE VALIDATED**

The early end-to-end validation checkpoint is complete. This checkpoint exists to prevent the repository migration from drifting back into file-by-file cleanup without a proven target architecture.

## Proven canonical chain

The mandatory QA suite now exercises:

1. Discovery Observation
2. canonical Observation/Evidence references
3. canonical Member State projection
4. Prioritization
5. Planning
6. Intervention candidate
7. Outcome

The chain preserves provenance and does not reintroduce aggregate wellness scoring.

## Adversarial cases already proven

- contradictory evidence remains unresolved rather than being silently collapsed;
- weak evidence cannot become a supported plan item;
- Safety can block ordinary Prioritization, Planning, and Intervention flow;
- non-evidence effects do not masquerade as Evidence;
- Outcome creation does not directly mutate Member State.

## Validation gate

Commit `b7a04aa1749d6d7c83b9f65b9cf24a0e99c23e7e` passed:

- Canonical Repository QA
- Discovery Development Regression

## Migration rule from this point

Do not continue expanding thin vertical-slice modules merely to add architecture.

Resume bounded legacy classification against the now-proven canonical chain. Classification is capability-based, not filename-based.

Allowed dispositions:

- **MIGRATE** — capability is still required and belongs in a canonical subsystem.
- **RETAIN TEMPORARILY** — uncertain, still referenced, or replacement not yet proven. This is the default for ambiguity.
- **RETIRE LATER** — clearly superseded, but deletion waits until replacement coverage and dependency checks are complete.
- **KEEP NONCANONICAL** — useful repository tooling/test/support capability that is not part of the runtime Intelligence architecture.

No legacy file is deleted during the classification pass.

## First classification scope

Classify the legacy Intelligence areas that can now be judged against the proven slice, starting with:

1. `intelligence/selection/**`
2. `intelligence/model/**`
3. `intelligence/integration/**`
4. `intelligence/simulation/**`

Then inspect remaining legacy directories only as needed. Ambiguous items default to **RETAIN TEMPORARILY** rather than expanding the audit indefinitely.
