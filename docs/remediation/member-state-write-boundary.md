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
