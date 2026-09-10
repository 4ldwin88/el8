# Server-backed Discovery run history — pre-implementation decision

Base: 3c5f0cc526d0e0b8d7bcbc55ac4f144a72ba01b0.
05.04 owns versioned assessments, source/interpretation separation, historical
integrity, transactions and duplicate-safe synchronization. 05.05 owns authenticated
isolation. 02.01.02 requires durable partial evidence and later explicit resume.
The current versioned run codec and fingerprint remain the single record owner.

Current evidence: original EL8 has two completed DISCOVERY-R3 / module_version 3
assessment records. Original and staging assessment policies allow ordinary
insert, and update/delete of non-completed records. No current repository Discovery
writer remains for that overloaded table; Review still writes a different module
type, and legacy HTML reads completed Discovery/baseline rows. Proposed dedicated
run-table names are absent in both projects. No historical payload was retrieved.

Selected boundary: new current Discovery working runs have one head and append-only
revisions, with stable run UUID, revision and request UUID. One owned RPC writes the
run aggregate; direct ordinary-member DML is denied. A saved working run is not
promoted Member State, a completed baseline, a Focus decision or a Plan. The existing
Member State writer remains unchanged. Original assessment rows and their consumers
are preserved pending the explicit browser/history migration gate.

The RPC binds ownership to auth.uid(), uses expected revision (-1 creates revision
0, then exactly +1), and returns the same accepted revision for an identical retry
with the same request ID. Reusing that ID for different content fails. Stale requests
cannot overwrite accepted progress. Previously accepted observations remain an
unchanged ordered prefix; correction must append explicit provenance, never edit
accepted source. A transaction updates head and appends history together; injected
failure after either statement must roll back the whole transition. Unrecognized
baseline objects or inherited ordinary write privileges abort migration.

The SQL boundary validates the record envelope, not clinical/product conclusions.
Any derived working flags remain untrusted until a later trusted completion command.
Ordinary load returns preserved records; explicit resume invokes the existing codec
and rejects another runtime fingerprint. This introduces no historical interpreter,
module identity alias, second Member State mapper, copied registry or completion RPC.

Acceptance: actual PostgreSQL 17 executes the migration, codec-generated records,
own-member/cross-member access, denied direct DML, first creation, +1, stale update,
identical/different retry, append-only evidence, malformed envelopes, rollback and
reload. Then replay the complete checkpoint/forward sequence, reconcile provenance
and independently capture staging fingerprints. Apply only to approved isolated
staging after local evidence and self-review; never mutate original EL8.

Recovery: failed DDL is transactional. Before synthetic-only staging replay, retain
its prior catalog fingerprint and migration inputs. A failed data transition retains
the prior head/history. Forward recovery preserves accepted revisions; no production
or historical data import is part of this slice. Human-test readiness remains blocked
until server completion/baseline, other semantic boundaries and the real UI pass.

## Verification and self-review


The eight new offline tests pass, alongside six existing run codec/fingerprint
checks and both checkpoint/provenance checks. Fault injection after head insertion,
revision insertion and head update rolls back the whole command. Unexpected views,
RPC overloads and inherited grants reject the migration transactionally. A transport
shim executes actual PostgreSQL SQL and verifies lost-acknowledgement retry; its
initial Date-versus-JSON timestamp mismatch was fixed in the shim's SQL serialization,
without normalizing the production storage mapper or weakening equality assertions.

The full checkpoint plus all four forward migrations replay on PostgreSQL 17.5.
The migration was applied only to independently verified synthetic staging
bqumsiqkpxkofjykgzqp (17.6). All eight independently captured staging catalog hashes
match replay. The original EL8 project was not mutated. Migration provenance remains
unapplied-candidate relative to original EL8; no old migration record was fabricated.

Self-review made the maintenance separation explicit by revoking the ordinary RPC
from service_role; privileged table maintenance remains separately granted. Supabase
advisors identify authenticated SECURITY DEFINER execution of this RPC: intentional,
with tested ownership and no ordinary table DML. Existing default-deny tables and
password-protection advisory remain outside this slice. See the official advisory:
https://supabase.com/docs/guides/observability/advisors?queryGroups=lint&lint=0029_authenticated_security_definer_function_executable

Canonical offline gate: 394 tests, 393 pass, one unchanged mixed-Focus Plan failure,
plus the same nine page-import failures. No release receipt. All 17 tests in the
separately controlled hosted suite passed: twelve existing Member State cases,
four new Discovery cases and the containing test. Real Auth/PostgREST confirmed
concurrent creation/update, one winner, stable identical retry, stale/request-ID
conflicts, two-member isolation, direct-write denial, lost acknowledgement and
fresh-session exact partial-run reload. The execution connection was initially
slow and a bounded health check timed out; the unchanged integration suite completed
successfully in 358 seconds. This was not a backend defect or an approval blocker.

This is a persistence foundation, not completed browser integration. The page
still needs its explicit pending-command/recovery UI, concern disposition and trusted
completion/baseline contract. Historical DISCOVERY-R3 rows and their consumers remain
untouched. A fresh read confirmed original EL8 still matches all eight baseline
fingerprints. Credentials and synthetic member payloads are excluded from Git.
