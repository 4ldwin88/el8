# Versioned Discovery run record — pre-implementation decision

Base: 230d1d2a7d2ab8aa8236d77726b2ec6a808c062c. Existing slices remain committed.
05.04 Assessment/Discovery and Derived Data sections require versioned runs,
source-linked answers, preserved gaps/uncertainty and reproducible interpretation.
02.01.02 requires partial/resume without fabricated evidence or a second durable
ordinary-concern lifecycle. Ordinary Member State reads must remain lossless.

Observed boundary: saveDiscoveryDraft serializes an unversioned working session;
loadDiscoveryDraft attaches today's Question Bank to any parsed object and silently
returns null after malformed JSON. A changed registry or interpreter can therefore
resume an old run under new semantics, or a malformed run can look absent.
This is an actual browser consumer, not a proposed parallel persistence path.

First bounded run slice: one explicit record format for the existing local working
run, with stable run identity and a fingerprint of the actual runtime import graph.
The canonical offline gate must recompute that graph fingerprint, detecting any
unacknowledged interpreter/registry change, including new imported modules. The
fingerprint is implementation provenance, not product authority or a copied registry.
Only an exact compatible record can resume with today's bank. Unsupported or
malformed records fail explicitly and remain available for governed recovery.
No automatic migration, defaults, historical interpretation or storage-key alias.

The record preserves the complete JSON working session except the executable bank,
which is restored only after the fingerprint matches. Required gaps, uncertainty,
member decisions, order, Safety context, timing and source observations must survive.
Current executable bank identity must match at capture; custom QA banks require a
separate explicitly identified contract rather than masquerading as production.

Owners: Discovery session creates run identity; a run-record codec owns its format;
existing discovery-runtime save/load delegates to it; one shared JSON representation
validator serves existing Member State storage and this record. A build/test helper
fingerprints the runtime import graph; it owns no product semantics.

This establishes the record needed for the next server-backed partial/resume slice.
It does not claim cross-device durability, complete concern lifecycle or baseline
establishment. The original assessment table has two completed Discovery records
(grouped read-only count); do not rewrite or infer a migration for them. Existing
assessment/Review consumers remain until their explicit migration obligation is met.

Acceptance before repair: current partial session round trip; required gap retained;
old/versionless, malformed or other-contract records reject without deletion;
non-JSON input cannot silently lose evidence; a changed runtime source or newly
imported dependency invalidates its recorded fingerprint.

## Verification and self-review

The three initial acceptance tests fail on 230d1d2. The final scoped gate passes
15/15: four draft-boundary tests, two actual-import-graph fingerprint tests and
nine existing lossless Member State storage tests. The round trip uses actual Sleep
and contributor answers and compares the complete working session, not only selected
fields. Source changes and newly imported modules both invalidate the fingerprint.

Self-review found that object-rest copying could invoke getters or discard hidden
properties before validation. Capture now preserves descriptors for validation and
rejects either case without invoking getters or replacing the prior saved bytes.
The shared JSON validator was moved unchanged from Member State persistence; its
existing lossless/historical-read guarantees continue to pass. No second validator,
registry, inference owner or historical-format compatibility path was introduced.

Final canonical gate: 386 tests / 385 pass / 1 fail / 0 skipped, with the unchanged
mixed-Focus Plan test and nine HTML import failures. No release receipt is emitted.
The existing HTML error/recovery presentation and authenticated server persistence
remain subsequent integration gates; local sessionStorage is not cross-device
or long-term durable storage. Fingerprints prove code compatibility, not member
authorization or legitimacy of a material state transition. Completed historical
assessment records in original EL8 were counted only, not read or rewritten.
