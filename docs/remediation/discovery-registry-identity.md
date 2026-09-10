# Reconcile Discovery routing and direct-state identities

## Pre-implementation decision

Resume clean published 1e961f185b4ea7afd492bf921712cab9753289b7. Current canonical registry 1DUMbxIVaR7L5lQSOkjSQ826ng4T6g1Po44-Oy0bVuMA was fresh-read after the founder-approved A000568 restoration. That decision is resolved. Questions/Answers/Effects govern identity, parentage, wording, effect types and provenance; ID & Semantic Standard forbids recycling IDs. Discovery owns evidence semantics; routing is not sufficient evidence.

Observed defect: synthesized baseline-discriminators.js recycles A000569–A000593 for unrelated cross-dimensional answers; direct-state-probes.js allocates replacement A000630–A000654 and rewrites metadata. Example A000574 means Energy/Q000086 in the repository but A lot of control/Q000094 in Drive. Current tests protect this unsupported allocation. These are inherited defects, not newly approved authority.

Bounded slice: replace the two existing registry owners with exact source-attributed Drive rows for Q000085–Q000097 and their 47 answers/44 effects. No new registry owner, fallback, remapper or alias. Missing effects in canonical authority stay absent; do not synthesize routes for A000559, A000563 or A000567. Remove repository-only current answers/effects by replacing their owners. Keep the existing normalizer and sufficiency policy unchanged; route closure and semantic sufficiency remain separate gates.

Acceptance: exact source hashes for each collection; canonical parentage and typed effects; approved A000568 route-only meaning; retired invented IDs cannot execute. A synthetic historical run captured by the actual parent candidate demonstrates old A000574/Energy survives ordinary SQL reads and rejects implicit current resume. Current A000574/Financial Control must persist and reload separately. The existing run fingerprint supplies version separation; no historical payload is rewritten or interpreted from an ID alone.

A source manifest records collection hashes from the fresh Drive extraction independently of generated runtime files. Its role is verification/provenance, not alternate semantic authority. New fixtures protect actual behavior in addition to hashes. Existing expectations that require unapproved IDs/options will be classified against Drive before modification; no evidence or Safety assertions may be weakened.

Supabase boundary: existing owned append-only run writer and revision table store exact source JSON. No DDL, policy, grant, function or migration change is needed; no hosted operation or historical-data interpretation is authorized by this slice. SQL tests run in disposable PostgreSQL-compatible infrastructure. No human-readiness claim follows from this registry repair.

## Verification and self-review

All three new authority acceptance tests failed before repair. The first full gate exposed two additional obsolete fixtures: registry allocation/cardinality assertions and a Financial Q2 fixture requiring ungoverned cross-dimensional/escape options. Reconciled them to the exact current Drive parentage, counts and Financial strain route; retained unique-candidate, graph uncertainty, Safety and feasibility checks. Added full question/answer/effect referential integrity and unique effect IDs. The tests now reject the unapproved allocations rather than preserving them.

Final scoped source, runtime, deferral, correction and actual SQL tests:21/21 pass. Full offline:424 tests,423 pass, one unchanged mixed-focus Plan failure; nine unchanged page-import failures. No validation receipt. Exact published-candidate rerun is recorded in the companion checkpoint. No hosted operations or new hosted receipt.

Self-review: both existing owners now contain exact literal rows, preserving all source columns, including qualifier/provenance fields previously rewritten. No generated ID range, new alias, fallback or migration remains in these owners. The source hashes are independently derived from fresh Drive data. Tests exercise actual answer intake and actual SQL persistence, not only hashes. The historical fixture was captured with parent1e961f1 before repair; it is test-only and cannot be loaded as a current executable bank. No current record is decoded using old meanings and no old record is reinterpreted with new ones. Existing old-run migration/reacquisition remains explicitly required.

Deliberately not changed: full registry reconciliation outside Q000085–Q000097, missing canonical routing effects, concern establishment/dismissal and focused-sufficiency matcher, trusted baseline, priorities, Plan lifecycle, browser page imports or deployment. Reconciliation exposes narrower current routes; later work must resolve route coverage from authority rather than fabricate effects. No claim that this slice makes the full member journey executable.

## Change manifest

- intelligence/registries/baseline-discriminators.js: replace synthesized questions/options/routes with exact canonical rows.
- intelligence/registries/direct-state-probes.js: restore canonical answer IDs and full source semantics; remove invented allocation.
- docs/remediation/discovery-registry-source.json: independent source provenance and collection hashes/counts.
- intelligence/registries/discovery-source-boundary.test.mjs: three source/identity/routing acceptance tests.
- tests/fixtures/discovery-run-1e961f1.json: preserve synthetic historical conflicting-ID record captured from actual parent runtime.
- tests/database/discovery-run-persistence.test.mjs: prove old/new meanings survive actual SQL separately; incompatible historical resume fails.
- intelligence/registries/registry.test.mjs: replace obsolete ID assumptions; enforce authoritative parentage and global referential integrity.
- intelligence/discovery/discovery-runtime.test.mjs: use governed Financial route while preserving interaction/evidence/Safety assertions.
- intelligence/discovery/runtime-fingerprint.js: regenerate current implementation provenance.
- docs/remediation/discovery-registry-identity.md: predecision, scope, authority, classification, verification and manifest.
