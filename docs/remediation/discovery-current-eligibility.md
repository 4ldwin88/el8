# Current Discovery eligibility — pre-implementation decision

Base: 53d6acd298920a371eb9ed88c6feb1984ca5cd04.
Fresh-read 02.01.02 Discovery Specification, modified 2026-09-06:
https://docs.google.com/document/d/1d0E7CnzbKC42dUploWPc33IM57oFxKOKL6NQXm6qGnE/edit
Discovery owns sufficiency; missing evidence and member deferral are distinct.
Current evidence may revise eligibility without deleting historical provenance.

Observed defect: discovery-member-state-adapter skips deferred/nonIssue/escalated,
excluded and unsupported states. When an earlier projection was eligible, these
explicit newer records leave it eligible. The adapter also duplicates part of the
handoff audit's sufficiency rule and can accept empty evidence references.

Invariant: every explicit current construct record updates the projection; inactive
or unresolved records cannot inherit stale Prioritization eligibility. Absence from
an incremental trace is not a retraction. Source facts and unrelated constructs stay
intact. Deferral does not invent negative evidence or a Focus decision.

Owners: sufficiency.js owns active-candidate and sufficient-evidence predicates;
the existing state adapter owns their projection and outgoing Prioritization input;
the existing reducer and lossless storage owner remain unchanged. A discoveryHandoff
snapshot carries the source resolutionState and exclusion flag because they affect
current downstream eligibility. It is a projection of the source disposition, not a
new concern lifecycle or a second decision engine. Canonical UNRESOLVED/ESTABLISHED/
DISMISSED concern resolution and correction provenance remain separate pending work.
For inactive records lacking an explicit sufficiency assessment, preserve unknown,
not an invented insufficient/negative assessment. Exclusion with explicit sufficient
evidence retains that sufficiency while separately preventing consideration.

Tests: previously eligible to each inactive/unknown/contradicted state; empty evidence;
reactivation; omitted unrelated construct; exact persisted round trip, immutable facts
and preserved uncertainty/disposition. Reject malformed explicit records rather than
silently skipping them. No Supabase mutation or storage-version migration is required.

## Verification and self-review

All four new tests failed before repair. After repair, 25 scoped tests pass,
including actual onboarding source handoff, immutable fact projection and the
SQL-backed run codec. Canonical npm test: 400 tests, 399 pass, one unchanged
mixed-Focus Plan failure, plus the same nine page-import failures. No old test
assertion was modified. No release or hosted-Auth receipt is claimed for this SHA.

Self-review retained one eligibility/sufficiency owner: the handoff audit and mapper
reuse the same predicates. The mapper's obsolete skip paths are removed. Explicit
invalid records abort atomically; absence is not fabricated retraction. Constructs
owned by other existing producers have no Discovery disposition snapshot and retain
their existing supported/sufficient contract; this is not an automatic historical
migration. Focus decisions, accepted source facts and storage writers are unchanged.
The authoritative three-state concern lifecycle is not declared implemented here.

The runtime fingerprint changed because its actual imported semantics changed.
Previously saved run records remain losslessly readable, but explicit resume with
an earlier runtime fingerprint still requires governed migration or reacquisition.
No staging/history record was rewritten to conceal this difference.

Manifest: sufficiency.js extracts the existing two predicates; the state adapter
updates explicit records and preserves the source disposition; the new regression
file protects nine invalidation cases, reactivation, evidence/history preservation
and malformed input; runtime-fingerprint.js records the new source identity; this
record explains authority, acceptance, limitations and next work.
Next: canonical concern resolution/correction and durable completion requirements,
then the trusted immutable baseline before Prioritization, in separate small slices.
