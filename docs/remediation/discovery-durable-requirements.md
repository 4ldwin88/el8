# Durable Discovery completion requirements

## Pre-implementation decision

Start: clean published `515b2ac9ae8d293b6751d9234e461b27666ce98a`, remediation/human-test-candidate. Preserve all completed slices. Fresh-read Discovery Specification (1d0E7CnzbKC42dUploWPc33IM57oFxKOKL6NQXm6qGnE) and 05.04 Data Architecture (1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4). Discovery owns required versus optional evidence; partial evidence and unresolved requirements must survive stop/resume and handoff. Data Architecture owns source/version provenance and lossless durable representation.

Observed defect: run storage and trace retain unresolvedRequirements, but the Member State mapper omits them and reconstructs Prioritization input from sufficient constructs alone. Required gaps and optional uncertainty can disappear on reload. Current production callers of this mapper consume Discovery traces; it is not a general non-Discovery Prioritization mapper.

Invariant: preserve the exact ordered requirement snapshot with source run and runtime-contract identity, in the same Member State revision as its observations and constructs. Required or unclassified gaps block outgoing candidates; valid explicit optional gaps remain visible without blocking. Missing snapshot is unknown, never an implicit empty list. Omitted fields in incremental traces preserve the prior snapshot. An explicit replacement must identify the same run and contract; cross-run/cross-contract supersession requires a later governed command, not silent overwrite.

Implementation owners: Discovery sufficiency.js owns the one blocker classification; discovery-engine.trace supplies run/version provenance; Member State contract/reducer own the optional snapshot representation and transition; discovery-member-state-adapter owns projection and outgoing mapping; existing strict storage mapper and SQL RPC transport it unchanged. No new writer, table, requirement policy registry, automatic historical migration or stored derived usable flag.

Acceptance before repair: exact requirements survive encode/decode and actual SQL save/reload; required gaps cannot disappear; optional uncertainty retains order/context/provenance; missing metadata fails closed; explicit empty snapshot differs from omission; malformed and cross-run replacements fail atomically. Retain existing construct-evidence, immutable-fact, Safety and revision tests. Minimal old fixtures asserting positive global handoff without any requirement snapshot must supply an explicitly assessed empty snapshot; their construct-specific assertions stay intact.

Not in this slice: canonical concern lifecycle, full Safety projection, trusted completed-Discovery baseline, global requirement discharge authorization, new-run/reassessment supersession, Prioritization rule repair or browser UI. Client semantic legitimacy remains unproved until trusted promotion. Stored historical states without the new optional section remain readable without insertion, but do not establish a valid Discovery handoff. No live Supabase mutation is required; SQL already preserves the JSON envelope. The runtime fingerprint changes and older working runs still require explicit migration/reacquisition on resume.

## Results and self-review

Five new boundary tests failed before repair. The first scoped run had exactly five old positive-handoff failures across three fixture files: those fixtures supplied construct sufficiency without any global requirement assessment. Their existing assertions were preserved; fixtures now provide an explicit empty assessment and source identity. Missing-snapshot rejection is independently tested. Final scoped suite: 56/56 pass, including actual PostgreSQL migration/RPC save, reload and stale-write rejection. Full offline gate: 412 tests, 411 pass, one unchanged mixed-focus-plan-regression failure and the same nine HTML import failures. The exact published-SHA rerun is recorded in the checkpoint; no release validation receipt is claimed.

Self-review reproduced a partial-update source-confusion case: an explicit foreign run/contract could omit requirements and inherit the prior assessment. The mapper now checks explicit source metadata even on partial updates, using the same contract-owned source check as the reducer. Unknown/unclassified requirement entries are retained exactly and conservatively block; they are not normalized or dropped. Run UUID letter case is identity-equivalent without rewriting stored strings. Requirement ordering and nested provenance remain exact, and outgoing arrays do not alias stored data. A malformed snapshot fails validation rather than being treated as absent. Requirement capture, facts and constructs advance one revision together; prior input objects and immutable facts remain intact.

No copied requirement rules remain: the existing optional/blocking predicate was extracted within the same Discovery sufficiency owner and reused for the durable outgoing handoff. There is one Member State mapper, one reducer and one SQL writer. No schema/storage-version string was changed. The new optional section is documented and validated, but never inserted during ordinary reads. No historical data was interpreted or rewritten, no live/staging backend operation occurred, no Edge Function was changed, and no deployment or main merge occurred. Main, reconciliation and F refs were reverified unchanged remotely.

Scope limitation: this is a lossless handoff and application/reducer boundary, not trusted evidence-discharge authorization. The existing SQL envelope stores the snapshot unchanged but does not certify that a client was entitled to clear a requirement. Trusted completion/baseline validation must establish that before human testing. Likewise, eligible construct candidates are not proof that all concerns, Safety, positive-path completion and baseline requirements have passed. The complete Discovery audit remains the application pipeline gate; the trusted counterpart remains pending. Cross-run/contract replacement is deliberately rejected until a governed supersession/migration path exists.

## Change manifest

- `intelligence/discovery/discovery-engine.js`: include stable run and runtime-contract identity in the source trace.
- `intelligence/discovery/runtime-fingerprint.js`: regenerate import-graph provenance.
- `intelligence/discovery/sufficiency.js`: expose the existing requirement audit without copying its policy.
- `intelligence/state/member-state-contract.js`: validate optional, lossless requirement snapshots and source replacement identity.
- `intelligence/state/member-state-transition.js`: update the snapshot atomically through the existing reducer.
- `intelligence/state/discovery-member-state-adapter.js`: retain requirements and provenance, preserve omitted snapshots, reject source confusion and prevent unknown/required gaps from becoming eligible outgoing candidates.
- `intelligence/state/discovery-requirements-boundary.test.mjs`: protect durability, optional versus required gaps, source identity, omission, explicit replacement and malformed data.
- `intelligence/state/discovery-current-eligibility.test.mjs`: make the positive handoff fixture explicitly assess global requirements; retain all eligibility assertions.
- `intelligence/state/discovery-handoff-boundary.test.mjs`: provide an assessed-empty global snapshot while preserving optional construct-uncertainty assertions.
- `intelligence/state/discovery-member-state-adapter.test.mjs`: provide explicit global assessment in minimal fixtures; retain independent construct-sufficiency assertions.
- `tests/database/member-state-write-boundary.test.mjs`: verify requirements and facts survive one-revision SQL persistence, reload, explicit same-run clearance and stale rejection.
- `docs/remediation/discovery-durable-requirements.md`: record authority, predecision, fixture classification, validation, self-review and limits.
