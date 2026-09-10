# Member State write boundary — Run F decision record

## Pre-implementation decision

Before implementation, `git rev-parse HEAD` returned exactly
`9bbcf926ff518aff868168c4feb905f441e83452` on the new isolated branch
`benchmark-f-el8-remediation`; `git status --short` was empty. Only that commit
was fetched. No other benchmark branch or report was read or incorporated.

1. **First defect:** the revision-checked Member State RPC is optional at the
   database boundary. Authenticated INSERT/UPDATE grants and policies expose a
   parallel writer. SQL CHECK expressions also accept missing envelope fields
   through NULL. Fake-client persistence tests do not exercise either defect.
2. **Invariants:** ordinary members read only their own state; all member writes
   use one authenticated RPC; creation is revision 0 with expected revision -1;
   updates atomically compare the stored revision and advance exactly once;
   stale/repeated requests cannot overwrite committed state; ownership, storage
   schema and numeric revision must agree with the JSON envelope. Missing,
   null, malformed or mismatched envelope values fail closed.
3. **Drive authorities read:** 00.00 governance; 00.01 Index (Authority Map,
   Member Record, Promotion Gates); 00.02 Dashboard/Roadmap; 00.TEMP
   reconciliation control; 05.03 Production Architecture (trust/backend/failure
   boundaries); 05.04 Data Architecture (transactions, conflict handling,
   schema evolution); 05.05 Identity/Authorization (default deny, ownership,
   privileged RPCs, cross-member negative tests). Product Discovery,
   Prioritization and Planning specifications were also consulted for scope.
   G-01 explicitly closes the older documentation freeze; the benchmark permits
   repository-only remediation and forbids live application of migrations.
4. **Repository owners:** `intelligence/state/supabase-persistence.js` calls
   `save_el8_member_state`; `app/auth/member-state-session.js` and
   `app/onboarding/supabase-activation-runtime.js` use it. Member State SQL
   migrations own the database boundary. Existing persistence tests substitute
   a fake RPC. The live concurrency test targets another Edge harness and
   would mutate live data, so it must not be run.
5. **Live objects inspected read-only:** `public.el8_member_state` columns,
   constraints, grants, RLS policies; `save_el8_member_state(integer,jsonb)`;
   `el8_guard_member_state_revision()` and its trigger. Current grants allow
   authenticated INSERT/UPDATE. The RPC is SECURITY INVOKER. A catalog search
   found no other public function body referencing this table. No member data
   was fetched. The project is EL8, `jprdsidxwjkgiqqakwpr`, PostgreSQL 17.
6. **Undermining paths:** direct table DML, old differently capitalized write
   policies and the obsolete bigint RPC present in repository migration replay.
   No current repository caller needs that old overload. Remove it with
   RESTRICT, not CASCADE. Unexpected dependencies must block migration.
7. **Preserve:** canonical RPC name/arguments/row return shape, own-row reads,
   storage schema 3.0.0, existing valid payloads/timestamps, immutable ownership,
   exact revision advancement and explicit conflict behavior. No reinterpretation
   or automatic correction of historical data.
8. **Retire/defer:** retire ordinary direct-write access and old RPC overload.
   Defer semantic history/baseline guards, legacy read normalization, plan
   activation atomicity, initial session-save revision mismatch and unrelated
   schema reconciliation. Those need separate vertical acceptance contracts.
9. **Acceptance:** execute actual repository SQL with PostgreSQL via PGlite;
   test roles, grants, RLS, malformed envelopes, stale/duplicate saves and
   unchanged state after rejection. Exercise both empty repository Member State
   migration replay and a synthetic live-shape checkpoint. Prove regression
   sensitivity against the old boundary. Run existing persistence, state and
   onboarding tests unchanged. PGlite has one connection: this is not proof of
   simultaneous multi-session locking or Supabase HTTP/JWT integration.
10. **Risks:** revoking table writes requires a narrowly privileged RPC, with
    fixed search path, explicit authenticated identity and no caller-selectable
    target owner. Existing invalid rows must abort migration, not be repaired.
    Full repository migration replay already has historical bootstrap/schema
    gaps; this slice validates the affected Member State chain only. Other
    aggregates and privileged operations remain outside the guarantee.

## Delivery boundary

Implement one forward migration, database acceptance tests, a pinned test-only
runtime, and a CI gate. Do not alter product logic or copy registries. The SQL
constraint is the envelope owner; the RPC delegates envelope validation to it.
The repository artifact is reviewable implementation, not a new product authority.
No live migration, data mutation, Edge deployment, application deployment, merge
or authoritative Drive edit is authorized. The standalone benchmark report is
the only requested new Drive artifact.

## Authority links

- [00.01 Index](https://docs.google.com/spreadsheets/d/1uaaCNEk_h0O23Yqjak1RFboEl7bCV9FDq3xhNet5IRo)
- [00.02 Roadmap](https://docs.google.com/spreadsheets/d/1s1tqiuz9AMt3iOQUV0w0cc8l8--lHC1fi7I_E0D60e0)
- [00.TEMP](https://docs.google.com/document/d/1EsIbH9F9BzV5x5uesD5oMPyeP4mkOybvbZIvZF7dR04)
- [05.03](https://docs.google.com/document/d/1alNDHLhvkgIrxkJEXJmS_iJmrbLDq5Ea9UIfpHuBKl8)
- [05.04](https://docs.google.com/document/d/1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4)
- [05.05](https://docs.google.com/document/d/1bR652PByAkjoDlZxSEUXM3iXngOFMahMPOauBwCsd6Q)

## Implementation evidence and self-review

Implemented `20260910102819_member_state_single_writer.sql`. The single
`save_el8_member_state(integer,jsonb)` RPC now owns ordinary member writes;
its narrowly scoped SECURITY DEFINER body pins an empty search path, targets
only `auth.uid()`, and delegates envelope validation to one table constraint.
Table and column client write privileges and all write policies are removed.
The old bigint overload and redundant envelope constraints are retired.
Unexpected overloads, inherited write privileges, invalid existing rows or
dependent objects cause migration failure rather than silent accommodation.

No application module changed. Existing JSON payload fields and timestamps
survive migration unchanged. This does not establish semantic validity of every
Member State field: the client still proposes whole-state documents. Baseline,
safety, decision-history and plan-transition authority need subsequent slices.
Privileged maintenance is outside the ordinary-member single-writer guarantee.

Self-review corrected two test/setup assumptions: RLS WITH CHECK already rejects
NULL for ordinary member writes; the old table CHECK loophole is reproducible
through a privileged writer. Repository replay also retained text-casting
envelope constraints; these were removed instead of weakening negative tests
to accept inconsistent validation paths. Later SQL migrations that reference
this boundary are included by the acceptance harness regardless of filename.
Dynamic SQL with concealed identifiers and other aggregates are not covered by
that discovery mechanism.

Final local checks after a clean lockfile install:

| Check | Result |
| --- | --- |
| `npm run test:database` | 25 passed, 0 failed |
| `npm run test:persistence` | 17 passed, 0 failed |
| `npm run test:state` | 29 passed, 0 failed |
| `npm run test:onboarding` | 41 passed, 0 failed; preceding render regression also passed |
| `git diff --check` | Passed |
| Constraint mutation experiment | Changing `IS TRUE` to `IS NOT FALSE` caused 13 failures in the then-24-test suite; original SQL restored |
| `npm test` | Stops at two existing Profile QA module-load failures |

The Profile failures import the removed `MEMBER_STATE_SCHEMA_VERSION` export
in `app/profile/qa-lifecycle.test.mjs` and `app/profile/qa-runner.test.mjs`.
`npm run test:profile` reproduces both failures in an independent archive of
the exact required starting commit. They are unrelated pre-existing stale
consumer/test dependencies, not evidence to restore an obsolete alias. Later
commands in the chained full suite did not execute. No failing old test was edited.

PGlite 0.5.8 executes PostgreSQL 18.3 in-process; local Node is 24.19.0, CI is
configured for Node 22. This proves SQL enforcement with a simulated auth
transport, not simultaneous multi-session locking, actual JWT verification,
PostgREST RPC resolution or live PostgreSQL 17 behavior. The workflow has no
live credentials and never calls a deployment or migration endpoint. Branch
protection configuration is unchanged; adding a workflow is not proof that its
status is required for merge.

## Remaining blockers and next safe work

Status: **IMPROVED BUT BLOCKED** for integrated EL8 readiness. The repository
candidate is ready for a separate non-production integration/semantic slice.
Before any eventual application, repeat preflight against the actual target,
rehearse on disposable PostgreSQL 17 with Supabase/PostgREST auth and concurrent
sessions, and resolve invalid historical envelopes without guessing their
meaning. Full repository schema bootstrap remains unreconciled; only the
affected Member State migration chain is covered here.

Next reconcile first-save/session revision semantics: an inspected session path
submits revision 1 with creation sentinel -1 while the existing SQL creation
contract requires 0; its fake-client test currently passes. Preserve the database
boundary and derive that repair from a real first-save acceptance test. Then
scope atomic plan activation and trusted semantic transitions separately. The
current onboarding transaction performs separate Plan and Member State writes.

Recovery: the candidate migration is transactional and changes no member rows.
A failure rolls back its DDL. After an eventual successful non-production
application, prefer a reviewed forward correction; do not reopen client DML or
silently restore v1 compatibility. Live application remains outside Run F.

Technical references: [PostgreSQL function security](https://www.postgresql.org/docs/current/sql-createfunction.html),
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[PGlite execution and single-connection limit](https://pglite.dev/docs/).
