# Run G — pre-implementation decision

Recorded before implementation on 2026-09-10. Status: proceed with the bounded
Member State persistence boundary; no live application or database change.

## Controlled start

Fetched only `9bbcf926ff518aff868168c4feb905f441e83452` from
`https://github.com/4ldwin88/el8.git`, without tags, into a new checkout.
Created `benchmark-g-el8-remediation` from that commit. `git rev-parse HEAD`
returned exactly that SHA and `git status --porcelain` was empty before source
changes. No other benchmark branches, reports or implementation were read.
The explicit pinned starting state overrides the prompt's generic current-HEAD
instruction. Current Drive and read-only Supabase evidence still govern analysis.

## Decision and authority

The smallest selected systemic defect is bypassable Member State compare-and-swap:
the application uses one revision-checked RPC, but authenticated clients can also
INSERT/UPDATE the table directly. The table's nullable JSON CHECK expressions
also accept unknown SQL truth values, and the RPC coerces revision strings.
Thus a correct browser adapter does not establish a durable persistence boundary.

Governing Drive sources, fresh-read on 2026-09-10:

- 00.00 Governance
  and 00.TEMP Reconciliation:
  implementation is evidence; eliminate competing owners and unjustified legacy paths.
- 00.01 Index
  identifies 05.03 Production Architecture,
  05.04 Data Architecture,
  and 05.05 Identity/RLS
  as owners of trusted persistence, explicit missingness/types, conflict detection,
  ownership and adversarial database tests.
- 00.02 Roadmap:
  DATA-01 calls for minimum canonical persistence before expansion; DATA-03.1
  calls for enforced, testable authorization. This benchmark authorizes repository
  remediation despite stale freeze wording in the Index; no Drive edits are made.

## Invariants and exact boundary

1. Ordinary members read only their own row under RLS. Anonymous callers cannot
   read or write; members cannot insert, update, upsert or delete directly.
2. One implementation owns ordinary writes. Preserve the current
   `public.save_el8_member_state(integer,jsonb)` API as an invoker facade over a
   narrowly scoped private definer function. The private function explicitly binds
   the row to `auth.uid()` and performs conditional writes; it cannot target a
   caller-supplied owner. No GUC/flag is treated as proof that a write is trusted.
3. Initial save requires expected revision -1 and payload revision 0. Subsequent
   saves require the exact current revision and advance it by one. Stale writes
   and duplicate creates fail atomically without replacing the accepted payload.
4. The storage envelope requires an object, schema `3.0.0`, matching member ID
   and a numeric integer revision. Missing, null, string and mismatched values fail
   closed at the trusted boundary and table constraint.
5. Preserve payload contents without normalization, generated defaults or new
   domain semantics. Storage schema is not the domain/taxonomy version.

Repository owners inspected: `intelligence/state/supabase-persistence.js`,
`member-state-contract.js`, `app/auth/member-state-session.js`, onboarding
activation runtime/transaction, and all Member State migrations. The ordinary
adapter already uses the selected RPC; no current direct-table writer was found.
Existing persistence tests use fakes. The live concurrency suite writes to a
different persistence-harness aggregate and cannot prove this boundary.

Read-only Supabase inspection covered the relevant schema, policies, grants,
functions and possible alternate writers. Detailed live findings remain in the
private benchmark report. The public repository's v1 migration defines a bigint
overload; no current repository consumer of that obsolete overload was found.

## Implementation and preservation

Add one forward migration; revoke ordinary table writes and retire their policies;
remove the obsolete bigint overload without CASCADE; harden the envelope and
move write ownership behind the preserved public RPC signature. The private
schema/function exists solely to close the direct-DML bypass. It is not a second
persistence model. Preserve SELECT RLS, foreign-key account cleanup, current
integer RPC callers, JSON payload contents, and existing privileged service-role
access. Privileged administrative access is outside the ordinary-member contract.

Do not rewrite applied historical migrations, migrate data, change live grants,
deploy functions, merge, deploy the app, or change product authorities.

## Acceptance and risks

Execute the actual proposed SQL against disposable PostgreSQL (PGlite), starting
from the pinned public Member State migrations plus explicit empty-database test
setup retiring the leftover v1 CHECK. This is a scoped v3 precondition, not
certification of the full migration chain; the incomplete cutover remains blocked. Test real
RLS, grants, constraints and PL/pgSQL, two member identities, anon, direct writes,
malformed/null envelopes, stale saves, duplicate creates, valid payload preservation,
adapter round trips and failed-migration rollback. Demonstrate that the unmodified
boundary violates the new invariants. Wire the suite into automatic repository QA.
PGlite does not prove simultaneous multi-backend races, JWT verification or
PostgREST routing; those remain deployment gates in an isolated Supabase environment.

Main risks: an unobserved ordinary direct writer would be blocked; definer ownership
must not permit cross-member access; invalid persisted envelopes must block migration
instead of being repaired by guessing. Test those boundaries and review the diff.
The full historical migration chain and wider schema are not certified by this slice.

## Deliberately deferred defects

- Baseline timing: current Discovery says completed Discovery establishes baseline
  before Prioritization; older governance says after confirmed focus. This slice
  changes neither. Reconcile that stage-specific conflict before baseline work.
- Client-submitted domain decisions/Safety, historical evidence preservation, and
  atomic Plan/Member State activation need a separate semantic transition contract.
  A protected persistence envelope is not proof that arbitrary member state is valid.
- Plan versioning and parallel plan ownership need separate reconciliation before
  changing activation; see the private report for live implementation findings.
- Historical v1/v3 migration replay is incomplete. Audit/reconcile the full migration
  history before applying any migration through the release path.
- Baseline `npm test` fails on two profile tests importing removed
  `MEMBER_STATE_SCHEMA_VERSION`. Do not resurrect the alias or weaken tests here.

Readiness target: improved but blocked. This is foundation remediation, not ordinary
feature-development readiness. Future application requires separately authorized
non-production validation and a reviewed release; this benchmark applies nothing live.

## Publication review — recorded after implementation

Automatic approval review blocked the initial push because this repository is public
and the proposed commit contained private Drive links and a live catalog snapshot.
The rejected commit is not published. Source identifiers and the catalog snapshot
are retained only in the private benchmark report/evidence. Public tests now execute
the existing repository-owned Member State migrations instead of copying live DDL.
An explicit empty test setup retires the orphaned v1 CHECK; this does not certify or
repair the complete historical migration chain. The final public commit starts
directly from the required base, excluding the rejected commit from its ancestry.
