# Financial recall-period decision — implementation record

The founder approved the recommendation in this remediation conversation:
Q000056 uses its existing **past 30 days** wording for new Financial-pressure
evidence. Retire the conflicting 7-day semantic key from new evidence. Preserve
historical observations exactly. This records the founder decision; it does not
make repository implementation evidence a product authority.

Pre-implementation decision: change only the Key on EFX000267–EFX000271 from
money_pressure_frequency_7d to money_pressure_frequency_30d. Question, Answer and
Effect IDs, answer values and wording remain unchanged. These effects already
belong to the existing 30-day question; this corrects inconsistent metadata rather
than assigning an existing identifier to a different question. Exact Question /
Answer / Effect snapshots in accepted facts remain immutable. No ordinary read
rewrites earlier keys or infers what window a historical observation represented.
No SQL migration, data mutation or version-string workaround is needed.

Fresh Drive read: canonical structured registry 02.01.06.01 still contains the
old effect key; the explicit founder decision resolves that conflict. Proposed
Drive reconciliation is the five-cell key correction with this decision retained
as provenance; authoritative Drive material is not edited by this repository slice.
Relevant owners: effects.js (one executable registry), observationNormalizer
(snapshot capture), discovery-member-state-adapter (fact mapping), and the existing
lossless persistence mapper. No alias or second registry is introduced.

Acceptance: all five actual answers preserve the 30-day question and effect key
through the real observation/projection/storage path; the unknown answer must not
create STATE evidence; an accepted historical snapshot with the old key stays
byte-equivalent on ordinary round trip; no current executable effect uses the
retired key. Run source, registry and canonical tests; retain unrelated failures.

Verification: new-period test failed before repair; historical-preservation case
already passed. After repair, source/registry acceptance passes 8/8. Canonical
offline gate: 356 tests, 355 pass, one unchanged mixed-Focus Plan failure and the
same nine HTML import failures. No validation receipt. Self-review confirms exactly
five effect-key edits; no changed values, identity reuse, migration, aliases,
persistence fallback or historical rewrite. New evidence is captured by the
existing registry owner. Current-state persistence and fact immutability remain
unchanged. Original and staging RPC definitions were read-only checked separately.
