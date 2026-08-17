# EL8 Canonical Persistence Contract v0.1

Status: Working implementation contract for Member Zero / Member 1 Gate 1.

## Purpose

Define the minimum persistence semantics that the actual canonical EL8 backend must satisfy before Gate 1 — Canonical Data Integrity can receive a full Pass.

The browser Persistence Concurrency Harness proves that these semantics are achievable in the prototype. It does not prove that Google Sheets or any future backend automatically provides them.

## Required write identity

Every material record must have:

- `entry_id` — globally unique immutable record identity.
- `submission_id` — required when one member submission can create one or more records; otherwise a direct-entry provenance identity may be used.
- `payload_hash` or equivalent canonical payload fingerprint — used to distinguish an identical retry from a conflicting same-ID request.
- `created_at` — backend timestamp.
- `source` — structured provenance label.
- `confirmation_status` — separate from persistence state.

Personal names must never be database keys.

## Canonical create semantics

The backend create operation is `create_once(entry_id, payload)`.

It must return exactly one of:

1. `created` — the ID did not exist and the canonical record was durably created.
2. `duplicate_safe` — the ID already existed and the canonical stored payload is materially identical. No second row is created.
3. `conflict` — the ID already existed but the incoming payload materially differs. Existing canonical data is not silently replaced. The conflict is surfaced for resolution.
4. `failed` — durability is not confirmed. The member must not be told the data was saved.

A retry after timeout or ambiguous acknowledgement must therefore be safe.

## Atomicity / uniqueness requirements

- `entry_id` must be enforced by the canonical backend as a unique or primary key, not merely checked in application code.
- Concurrent requests with different IDs must all persist independently without row collision or overwrite.
- Concurrent requests with the same ID and identical payload must produce exactly one canonical record.
- Concurrent requests with the same ID and different payloads must preserve one canonical record and surface at least one explicit conflict.
- The application must not rely on a previously observed "next empty row".

## Update and correction semantics

Material corrections must be reconstructable.

Preferred model:

- Canonical record identity remains stable.
- Corrections create an attributable immutable revision / audit event containing actor, timestamp, previous value or hash, new value or hash, reason, and confirmation provenance.
- No material correction silently destroys prior history.

## Persistence acknowledgement rule

Member approval and persistence success are separate states.

The UI or conversational layer may say "saved", "logged", "recorded", or equivalent only after the backend has confirmed durable success. Where technically practical, material writes should receive read-after-write or equivalent verification.

Ambiguous write status must be presented as pending/failed, not success.

## Normalization requirements

Canonical persistence normalizes at write time:

- dates as canonical date values / ISO-compatible backend date representation;
- timestamps with timezone/UTC semantics explicitly defined;
- numeric values as numeric types;
- enumerations from governed vocabularies;
- confidence, confirmation, coverage, source and approximation as distinct fields;
- missing data remains missing and is never converted to zero, normal, or false.

## Required backend harness cases

The backend implementation must pass the same classes exercised by `persistence-harness.html`:

1. 20 overlapping distinct IDs → exactly 20 canonical records.
2. 20 overlapping identical same-ID requests → exactly 1 canonical record; 19 safe duplicates or equivalent.
3. Overlapping same-ID conflicting payloads → exactly 1 canonical record; conflict surfaced; no silent overwrite.
4. 10 repeated overlapping retry rounds → every round remains duplicate-safe.
5. Ambiguous/failure simulation → no false-success message; retry does not duplicate.
6. Correction test → previous state remains reconstructable.

## Current Google Sheets role

The Member Zero workbook remains the current longitudinal test record and evidence surface. It is not considered sufficient evidence of database-level uniqueness or transactional concurrency guarantees by itself.

For Member 1, EL8 needs either:

- a transactional canonical backend implementing this contract, with Sheets used only as reporting/export/test evidence; or
- another explicitly approved architecture that demonstrably provides equivalent guarantees.

## Gate 1 rule

Gate 1 cannot receive full Pass until the actual canonical write path—not only the browser harness—passes the required concurrency, retry, verification, normalization, reconciliation and correction tests without founder repair.
