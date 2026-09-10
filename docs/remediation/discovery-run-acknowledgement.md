# Discovery run acknowledgement identity — bounded decision

Base: c7cbd8afcca2d52128cba0b6bb610302bf0bb902.
Fresh-read 05.04 EL8 Data Architecture & Canonical Schema (modified 2026-08-31):
stable identifiers, explicit server acknowledgement, idempotent synchronization and
preserved source/provenance govern this slice.
Authority: https://docs.google.com/document/d/1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4/edit

Observed defect: the existing run codec accepts uppercase standard-form UUID text.
PostgreSQL preserves the JSON record but emits UUID-typed receipt fields in lowercase.
The sole client mapper compares those fields case-sensitively and reports failure
following an accepted commit. PostgreSQL 17 documents this representation:
https://www.postgresql.org/docs/17/datatype-uuid.html

Invariant: an acknowledgement must match the submitted run and request UUID identities
and exact expected revision +1. Hexadecimal letter case in standard-form UUIDs cannot
cause a false failure. No source record or submitted command may be rewritten. Invalid
or different identifiers and incorrect revisions must still fail explicitly.

Owners: intelligence/discovery/supabase-run-persistence.js compares receipts;
run-record.js already owns the unchanged record codec; save_el8_discovery_run and
its two tables own unchanged authorization, CAS and immutable history. No SQL,
Supabase mutation, historical reinterpretation, alternative writer or product-semantic
change is needed. Tests execute the existing migration in PostgreSQL 17; adversarial
receipt corruption occurs only after a real successful SQL call.

Acceptance: uppercase/mixed-case run and request identities; duplicate retry; exact
record reload; unchanged input command; wrong/null/non-string identifiers and wrong
or non-integer receipt revisions rejected. Run existing run-boundary/codec tests and
the full canonical offline gate. Hosted SQL/Auth was already verified at c7cbd8a;
this representation-only slice does not claim a fresh hosted or full-journey receipt.

## Result and self-review

The new positive SQL fixture failed before repair; the negative fixture already
passed. After repair, all 16 scoped run/storage/codec/fingerprint tests pass.
Canonical npm test: 396 tests, 395 pass, one unchanged mixed-Focus Plan failure,
plus the same nine page-import failures. No release receipt or human readiness.
No assertions were weakened. No hosted service was mutated in this slice.

Self-review: one private identity comparator in the existing mapper, no record
normalization, no alternate UUID input syntax, no compatibility alias, no SQL or
runtime fingerprint change. Both identity fields remain mandatory strings; malformed
and different values fail. Revision comparison remains strict and unchanged. Actual
SQL proves retries leave one revision and preserve the original JSON/command exactly.

Change manifest: this decision record; the existing mapper's acknowledgement
comparison; two contract-derived tests in the existing SQL-backed persistence suite.
Next bounded slice: stale Discovery eligibility and durable concern handoff semantics.
