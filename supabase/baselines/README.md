# Observed schema checkpoint and isolated bootstrap

This directory records implementation evidence under 05.04 Data Architecture and
05.07 Environments & Release Architecture. It does not define product semantics.
The database schema checkpoint is unrelated to the member's immutable Discovery
baseline; that separate product decision is governed by 02.01.01/02.01.02.

## What is captured

`observed-public-20260910.sql` reconstructs the data-free public structure observed
read-only on EL8 project `jprdsidxwjkgiqqakwpr`, PostgreSQL 17.6. It includes 43 tables,
200 constraints, 46 non-constraint indexes, 4 sequence definitions, 45 functions,
67 policies, and 6 EL8 triggers (including the Auth-to-profile trigger). The second
read-only capture matched the first. Sequence positions and all member rows are
excluded. Sequence bounds are captured as decimal strings to avoid JS precision loss.

`inspect-public.sql` reads the same structural boundary. The JSON manifest stores
independently captured section fingerprints and the SQL/query hashes. The database
test compares an actual PostgreSQL replay with those observed fingerprints, then
applies the existing candidate Member State forward migration. Mutations to grants,
policies, functions, constraints and triggers must change the fingerprint.

Preserving a deployed function or table in this checkpoint does not approve it for
current application use. In particular, v2/v3 Plan writers, old lifecycle functions,
QA/public ingestion and administrative paths retain their observed definitions for
reconstruction and later reviewed retirement. They are not new compatibility shims.
The existing application still fails its release gate. Nothing is human-test-ready.

## History and attribution

`migration-provenance.json` records hashes for all 175 recovered live migration
records and all 27 repository migration files at capture. Statements were recovered
privately for comparison; their complete historical SQL is not republished or run
automatically. The ledger identifies repository files as historical artifacts or
unapplied candidates, without falsely claiming equal filenames mean equal SQL.

Examples of material mismatch: repository `20260830140344` embeds a creation fix
absent from that recorded version; repository `20260830140419` omits a recorded
constraint. Telemetry, initial Member State and QA migration identities also differ.
The duplicate `20260830141154` / `20260830141217` live entries remain distinct.
Do not relabel, overwrite or repair live migration history to hide these differences.

The old `supabase/migrations` directory is not a clean-environment bootstrap. It
remains preserved historical/candidate material. New environment construction uses
an explicitly identified checkpoint followed only by its reviewed forward changes.
The candidate migration fingerprint covers both directories, including provenance.

## Provisioned non-production environment

The founder approved and we provisioned `el8-remediation-staging` in the verified existing
EL8 organization `pqieapngqtigeblthqth`, region `us-east-2`. Use its own Auth, API keys
and database; copy no existing users, credentials, Vault secrets, Storage data,
scheduled jobs or Edge Functions. Supabase's provisioning quote on 2026-09-10 was
USD 0/month for a project. The connector requires organization/cost confirmation
before project creation; approval was received. Project `bqumsiqkpxkofjykgzqp`
was created on 2026-09-10, with PostgreSQL 17.6, empty public schema and no Auth
users before bootstrap. `supabase/environments/staging.json` owns its identity.
The initial two-project quota rejection was resolved by the founder explicitly
authorizing Ridgewood's pause. Ridgewood `leikcvdfvovycjcjtflq` is INACTIVE; its
data was not deleted. Supabase's 90-day restore window requires a recovery review
before 2026-12-09. Restoring it will require available free-tier capacity or paid
capacity; do not silently pause another project or upgrade billing.

Fresh project is preferred over cloning: recovered history schedules an HTTP call
to the original production project. An unverified branch bootstrap could inherit
operational configuration that is unrelated to the member journey. No production
call or historical schedule is necessary to rehearse the candidate database contract.

Before using a new project, inspect its actual platform version/configuration and
initial public objects. Require PostgreSQL 17 and source-attributed platform roles,
Auth and required extensions. The checkpoint intentionally fails if public tables,
sequences, views or non-extension functions already exist. Do not delete an unexpected
platform helper or weaken this precondition to get a green bootstrap; reconcile that
object's owner and definition first.

The checkpoint requires explicit session setting `el8.bootstrap_disposable=yes` and
executes transactionally. This is an accidental-execution guard, not authorization or
proof of environment identity. An executor must separately verify the destination is
the newly provisioned non-production project. Never run it on the original project.

Apply checkpoint, verify all captured fingerprints, then apply
`20260910102819_member_state_single_writer.sql` and
`20260910131723_member_state_conflict_response.sql` in that order. Exact input and
post-replay catalog fingerprints are in `supabase/environments/staging-replay.json`.
Both were rehearsed on the isolated hosted backend. The original EL8 schema and
migration history remain untouched. Re-run the Member State SQL contract,
then real Auth/PostgREST two-member, stale/concurrent/retry and failure-injection tests.
Use synthetic accounts only. Stop at any unexpected catalog/version difference.

Rollback/recovery: on bootstrap failure the transaction rolls back; discard/recreate
the empty disposable environment if recovery is uncertain. Once synthetic test data
exists, preserve failure evidence and rebuild from the same identified checkpoint and
forward migrations. No historical member data is transformed. Live promotion needs
its own authorized migration/data-impact/recovery review.

## Explicit limits

The local test uses PostgreSQL 17.5 PGlite with a minimal Auth transport fixture; it
does not prove Supabase Auth, JWT validation, PostgREST, independent connections,
Storage, Edge execution or a browser journey. It does not install platform event
triggers/default grants, restore registry/configuration rows, or execute any copied
function as evidence of behavioral correctness. Captured function
`rls_auto_enable()` is preserved as observed code; its event-trigger installation is
outside this checkpoint. Such platform prerequisites must be checked independently.

Source-attributed bootstrap, hosted PostgreSQL replay and authenticated Member State
acceptance are complete. The full journey's reproducible-backend gate remains open
until required Plan/lifecycle fixtures, configuration and integration are reconciled.

## Authenticated acceptance and recovery

`tests/persistence-concurrency.test.mjs` now calls actual Supabase Auth and the
Member State RPC through the pinned Supabase client. The old unrelated Edge
harness is no longer this test's implementation owner. Its historical page and
deployed function remain separate, pending consumer review; they are not evidence
for Member State correctness and were not deployed to staging.

Each run requires two fresh synthetic accounts. For automated provisioning without
email delivery, `tests/database/synthetic-auth-users.sql` is an explicit privileged
fixture script for the inspected PG17 Auth schema. Supply a private JSON array of
two random UUID/email/password objects through `el8.synthetic_accounts`, with
unique `@example.invalid` addresses and random passwords of at least 24 characters.
Set `el8.bootstrap_disposable=yes` only after verifying the destination project.
Never commit passwords or tokens. Existing identities cause failure; no upsert,
password reset, member-state deletion or broad database reset is performed.
This fixture is not proof of signup or email verification. Sign-in, JWT issuance,
PostgREST authentication and member ownership are exercised by the real services.

Run `npm run test:persistence:live` with `EL8_TEST_MUTATIONS=allow-synthetic`, the
exact staging `EL8_SUPABASE_URL`, its `EL8_SUPABASE_PUBLISHABLE_KEY`, and
`EL8_QA_EMAIL_A` / `EL8_QA_PASSWORD_A` / `EL8_QA_EMAIL_B` / `EL8_QA_PASSWORD_B`.
The transport refuses any other project and privileged keys. The manual workflow
uses separate staging secrets; those secrets have not been configured in GitHub.
No network tests run inside the canonical offline gate. A successful integration
run emits `.candidate/staging-member-state.json` with exact source identity and
limits; it is not an offline release receipt or human-test approval.

The first real API rehearsal exposed why SQL-only acceptance was insufficient:
the old `40001` business conflict maps to HTTP 500 in PostgREST. Concurrent
creation did not pass the API gate. The forward migration maps this one business
conflict to `PT409` (HTTP 409), retaining CAS/ownership and all other errors. It
checks the exact prior function definition and fails closed on drift. The SQL
acceptance first failed for the desired code, then passed after the correction;
a real duplicate HTTP request returned 409/PT409. Existing SQL assertions that
exercise the current forward chain now require that explicit conflict, with no
weakened stale-write or non-mutation assertions.
Reference: https://docs.postgrest.org/en/stable/references/errors.html

The corrected authenticated suite passed all 12 tests (11 contract cases plus the
parent test), including two-member ownership, six competing creates, three rounds
of five competing updates, duplicate/stale non-overwrite, malformed payloads,
denied direct DML, a dropped real commit acknowledgement and a failed pre-dispatch
write followed by reload/retry. A first ownership fixture was corrected because
its foreign member's revision exercised CAS before ownership; the final case uses
the caller's valid revision with a forged other-member identity. No invariant was
weakened. These results certify this boundary, not the remaining member journey.
