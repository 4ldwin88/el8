# EL8 Canonical Persistence Contract v0.2

Status: Working implementation contract for Member Zero / Member 1 persistence integrity.

## Purpose

Define the minimum persistence semantics the canonical EL8 backend must satisfy before external Member 1 testing. The current prototype uses Supabase/Postgres as the canonical transactional backend. Google Sheets may remain useful for founder reporting, analysis or exported evidence, but it is not the canonical write store.

## Canonical record classes

EL8 does not force every record type into one identifier shape. Each material record must have a backend-enforced immutable identity appropriate to its class.

- Tracking entries: `entry_id`, with submission provenance where applicable.
- Capture submissions: `submission_id`.
- Assessment sessions: immutable session `id` once completed.
- Daily and Weekly Check-ins: immutable row `id` once submitted, with user/date or user/week uniqueness enforced where required.
- Revisions/corrections: immutable revision identity linked to the canonical record being corrected.
- Safety, plan and administrative records: stable backend identity plus actor/time/provenance appropriate to the record class.

Personal names must never be database keys.

## Required provenance

Material records must preserve enough provenance to reconstruct what happened. Depending on record class this includes:

- member/user identity;
- canonical record identity;
- source/input type;
- creation/submission timestamp;
- local timezone or local date where the record depends on a member-local period;
- confirmation status when interpretation or inference requires member confirmation;
- payload fingerprint/hash where idempotency or optimistic correction requires it;
- source submission identity when a capture produces a derived canonical record.

Missing fields are not silently converted to zero, normal or false.

## Canonical tracking create semantics

For canonical tracking entries, the create operation must behave as `create_once(entry_id, payload)` and return one of:

1. `created` — the ID did not exist and the canonical record was durably created.
2. `duplicate_safe` — the ID already existed and the stored payload is materially identical. No second canonical record is created.
3. `conflict` — the ID already existed but the incoming payload materially differs. Existing canonical data is not silently replaced.
4. `failed` — durability is not confirmed. The member must not be told the data was saved.

Retries after timeout or ambiguous acknowledgement must therefore be safe.

## Atomicity and uniqueness

- Canonical uniqueness is enforced by Postgres constraints/indexes, not only application checks.
- Concurrent requests with distinct identities persist independently.
- Same-identity identical retries cannot create duplicate canonical records.
- Same-identity conflicting writes cannot silently overwrite canonical data.
- Periodic records such as Daily Check-ins use backend uniqueness appropriate to the product rule rather than relying on a prior browser read.
- The application must never depend on a previously observed “next empty row.”

## Immutability by record type

Historical self-report and assessment records are point-in-time evidence.

- Completed assessment sessions are immutable.
- Submitted Daily Check-ins are immutable.
- Submitted Weekly Check-ins are immutable.
- Canonical tracking entries are not directly rewritten or destructively deleted by members.
- Plan check-ins, plan reviews, focus clarifications and deepening submissions are append-only historical observations where implemented as evidence records.
- Administrative and safety audit history must remain reconstructable.

Later change is represented by a later observation, reassessment or governed correction—not by silently rewriting what the member reported earlier.

## Tracking correction semantics

Material tracking corrections must be reconstructable.

- Canonical `entry_id` remains stable.
- A correction creates an attributable immutable revision/audit event.
- The revision preserves actor, timestamp, previous payload/hash, new payload/hash and reason.
- Optimistic concurrency prevents a stale correction from overwriting a newer correction.
- No correction silently destroys the prior state.

## Persistence acknowledgement rule

Member approval and persistence success are separate states. The UI or conversational layer may say “saved,” “logged,” “recorded,” or equivalent only after the canonical backend confirms success.

Ambiguous write status must be presented as pending or failed rather than success. Where practical, critical writes should use returned canonical rows, RPC result contracts or equivalent verification rather than assuming success from a button press.

## Normalization requirements

Canonical persistence normalizes at write time:

- dates as canonical date values;
- timestamps with explicit timezone/UTC semantics;
- numeric values as numeric types where appropriate;
- governed enumerations rather than uncontrolled near-duplicates;
- confidence, confirmation, coverage, source and approximation as distinct concepts;
- legacy display vocabulary may be normalized at presentation boundaries without rewriting immutable historical source records.

For the current condition model, member-facing condition vocabulary is **Attention · Stable · Healthy · Thriving**. `Beyond` is legacy and may be normalized to `Thriving` for display when encountered in older records.

## Media lifecycle

Capture media and the structured record derived from it are separate persistence concerns.

- Ordinary capture media is temporary unless the member explicitly chooses to retain the original.
- Text, transcripts, interpretations and confirmed structured records may be retained according to their record class.
- Temporary media cleanup must not destroy the confirmed canonical structured record.
- Discarded or failed submissions must not be presented as confirmed tracking history.

## Required backend integrity cases

The canonical implementation should continue to test:

1. overlapping distinct tracking IDs persist independently;
2. overlapping identical same-ID tracking requests remain duplicate-safe;
3. same-ID conflicting payloads surface conflict without silent overwrite;
4. repeated retry rounds remain idempotent;
5. ambiguous/failure simulation never produces false-success UI;
6. correction preserves prior state and rejects stale optimistic writes;
7. completed assessments reject mutation;
8. submitted Daily/Weekly Check-ins reject mutation;
9. member access cannot read or mutate another member’s protected records;
10. administrative and service-role pathways are explicitly privileged rather than accidentally exposed to ordinary authenticated clients.

## Current storage roles

**Supabase/Postgres** is the canonical transactional backend for the working prototype.

**Supabase Storage** holds capture media subject to the temporary/retained media lifecycle.

**Google Sheets/Drive** may be used for founder operations, reporting, planning, exports and Member Zero evidence, but must not be treated as the authoritative concurrency or transaction layer for product writes.

## Member 1 persistence gate

Persistence integrity is not passed merely because the interface appears to work. Before Member 1, the actual canonical path must demonstrate:

- backend uniqueness and idempotency;
- RLS/authorization isolation;
- immutable historical records where specified;
- reconstructable corrections;
- truthful write acknowledgement;
- media lifecycle behavior;
- normalization and provenance;
- retry/failure handling;
- no founder repair required for ordinary successful use.

The browser harness remains useful regression evidence, but the canonical Supabase path is the system that must satisfy this contract.