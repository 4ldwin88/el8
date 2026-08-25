# Discovery experiment

Status: Candidate / isolated from deployable Development

The current proven-but-not-yet-promoted Discovery implementation is preserved under `candidate/` as a complete dependency-safe snapshot of the former `intelligence/discovery/` subtree. This is intentional: moving the subtree as a unit preserves question modules, adaptive selection, concern resolution, Member Plan generation, human-test surfaces and regression/adversarial knowledge while we classify what deserves permanent promotion.

Development must not import `experiments/discovery/candidate/*` directly. Promotion occurs through the Development Discovery port after the candidate behavior is accepted.

## Cleanup inside this experiment

The candidate snapshot still contains migration-era clutter such as recovery/trigger files and overlapping QA runners. These are preserved temporarily only so the relocation itself cannot lose evidence. The next experiment cleanup converts durable failures into `tests/` and deletes disposable harness artifacts.

The original `intelligence/discovery/` remains temporarily as a compatibility donor until imports/workflows are repointed. It is not a second canonical Discovery implementation and will be deleted after dependency verification.
