# Decision: lossless current Member State storage

Recorded before implementation, 2026-09-10. Scope: benchmark remediation only.
Base: `9bbcf926ff518aff868168c4feb905f441e83452` (`reconcile/g02-intelligence`).

## Authority and decision

This is an implementation decision, not a new product authority. Fresh reads of
[05.04 Data Architecture](https://docs.google.com/document/d/1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4/edit)
(Canonical Data Principles, Derived Data, Schema Evolution),
[02.01.01 Intelligence Architecture](https://docs.google.com/document/d/1XSdzRrPXwNUlh2BsVIoTSvSUDClbzUTiP__fxUiLeNk/edit)
(20.7 and 20.9), and
[02.01.03 Prioritization](https://docs.google.com/document/d/1P_RRL4mGwVhdHjP4k05g7JQ-Q3BSLlT0tf2VQMAcQyY/edit)
(Member Confirmation, Blocking Invariants) require preserved evidence/decisions
and explicit semantic transitions. A storage read has no authority to make one.

The existing `intelligence/state/supabase-persistence.js` remains the sole current
Member State storage owner. Current storage version remains `3.0.0`; domain state
remains unversioned. Do not invent another schema or change the database.

For every admitted JSON-compatible current domain state S:

`decode(JSON.parse(JSON.stringify(encode(S))))` must deeply equal S.

Neither direction mutates its input or repairs semantic fields. Unsupported or
missing envelope versions and invalid/lossy values fail explicitly. Ordinary
session opening uses this same strict reader, never a historical converter.

## Evidence and alternatives

The old current reader calls the 3.x migration helper, which rebuilds
`activeFocusIds` from accepted decisions and adds context defaults. A fresh probe
changed an empty active-Focus list into `SLEEP_QUALITY` on reload. The fallback
also accepted an invented `99.0.0` version. The session opener calls a migration
loader, making this compatibility path available during ordinary use.

Fresh read-only Supabase inspection found `el8_member_state` empty; its columns,
CHECK, RLS and `save_el8_member_state` use storage `3.0.0`. The UPDATE trigger
enforces owner/version immutability and revision +1, not nested domain semantics.
No current persisted population requires these runtime legacy converters. Retire
them and their conversion-expectation tests; Git history preserves their evidence.
Unknown historical data, if discovered later, requires a separately approved,
explicit offline migration. It must not be guessed into current truth at login.

Rejected alternatives: another versioned domain model; a second mapper; broad
Plan/schema reconciliation; changing Discovery readiness; silently repairing
corrupt rows. These either duplicate ownership or require unresolved wider work.

## Tests, preservation and risk

Test actual domain transitions through the actual codec and JSON wire format,
including Focus ordering/reacceptance, no active Focus, provenance, uncertainty,
Safety, Plan references, and history. Reject unsupported/malformed envelopes and
values JSON would silently drop or alter. Test session entry and zero RPC calls
on rejected input. Retain optimistic-conflict, network-error and retry assertions.
Run existing state, persistence, onboarding and full repository gates; classify
failures rather than changing their expectations automatically.

Preserve all governed IDs, domain transition owners, current storage marker,
Supabase objects, and valid current payloads. Older/incomplete records will fail
closed rather than being repaired at read time. JSON-unsafe producer values may
now surface an error; that is intentional evidence preservation, not permission
to silently coerce them. Tests of old conversion behavior are obsolete because
the conversion capability is being retired, not because a test happened to fail.

## Boundary and follow-up

No live writes/migrations, deployment, Edge Function changes, authority edits,
main merge, Plan changes, or new semantic validation rules are authorized by this
decision. Client codec checks are not server authorization or trusted domain
enforcement. Existing database-envelope and activation defects remain blockers.
The user explicitly authorized this isolated benchmark slice despite older Drive
freeze text; that does not lift release or human-QA gates.

Rollback is a revert of this isolated commit before promotion; no database
rollback is needed. Reintroducing an implicit converter is not an acceptable
future compatibility strategy. Next: reproduce the current Member State RPC
contract in disposable Postgres and establish trusted transition enforcement,
before attempting a coherent atomic Member State/Plan activation slice.
