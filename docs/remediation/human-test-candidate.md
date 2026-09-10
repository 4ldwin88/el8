# Controlled human-test remediation

## Integration decision — 2026-09-10, before implementation

Fresh-read authorities: 00.00 governance; 00.01 index / 00.02 execution dashboard;
02.01.01 Intelligence Architecture (2026-09-03); 02.03 OS Architecture
(2026-09-07); 05.03 Production Architecture; 05.04 Data Integrity; 05.05 Security;
05.07 Environments & Release Management (technical documents 2026-08-31).
Drive remains semantic authority. This file records implementation evidence only.

Verified remote refs before edits:
- main: cb21bedea4ef48bd040e1a38de48e945419805f4
- reconcile/g02-intelligence: 9bbcf926ff518aff868168c4feb905f441e83452
- benchmark-f-el8-remediation: 1ca7a5f03906f90eb99d5f2ee9bb0891d5485a87
- F parent: c0c22eabb6cb465ff5598ee9d4f0393ed17f1fea; its parent is reconciliation.
- G: 55d4d165f2635412dc82ee25efe6987fc4af63de
- C mechanism, actual branch benchmark/member-state-boundary-20260910:
  aedaa2a42bbd104dae46f55c9ca1d0a36ba176c5
- D mechanism, actual branch benchmark/release-gate-boundary-sol-20260910:
  d513fe18154c6d5e3f5f208c74f48d2e017f0269

The requested C/D branch spellings do not exist. Their inspected actual branches
start directly at reconciliation and contain the described mechanisms. GitHub
compare verifies reconciliation is 628 commits ahead of main and zero behind.
No main change needs integration. A single linear branch,
remediation/human-test-candidate, starts at verified F. No benchmark merge.

Read-only live EL8 catalog inspection confirms PostgreSQL 17.6, the original
invoker Member State RPC, ordinary INSERT/UPDATE policies/grants, and both v2/v3
Plan activation functions. F remains unapplied. Catalog definitions, constraints,
policies, grants and migration names were fetched without member data.

## Slice 1 decision: one enforceable repository candidate gate

Authority: 05.07 reproducible release/validation; 05.04 integrity; 02.03 real
runtime/persistence validation. Invariant: every repository non-live test and
browser entry module must be checked by one offline command; release workflows
consume that command; failed checks cannot produce a deployable artifact; the
artifact records the exact checked source. Live-mutating tests stay separate.

Affected owners: package.json; scripts/browser-import-smoke.mjs; QA, G-02,
Member State database and Pages workflows; build provenance script. Observed
defects: copied suite lists; omitted tests; path-only import checking; Pages
deploys without tests and uploads the whole repository. D's central-gate idea
is useful but its script-name reachability does not discover new test files,
and workflow text ordering alone cannot establish job dependencies. Reimplement
those mechanisms with file discovery and structural workflow checks.

Acceptance before repair: run all discovered non-live test files; add adversarial
gate fixtures for new tests, live-test exclusion, missing exports, bypassed
validation and changed source identity. Preserve substantive test assertions.
Known removed domain-version imports in QA must be migrated to the current
versionless contract, never restored by aliases. Other newly exposed failures
are classified before changing code or expectations.

This slice does not claim browser journey, database replay, concurrency or
human readiness. Storage, trusted writes, backend reproduction and semantic
handoffs remain separately gated slices. No live mutation or deployment.

### Slice 1 verification and self-review

Gate mechanism acceptance: 5/5 tests passed, including newly discovered tests,
missing-export rejection, optional/bypassed workflow rejection and stale/dirty
candidate refusal. The initial acceptance run failed before implementation.
All 82 original offline test files were run: 297 pass / 6 fail. Two failing
Profile files imported a removed domain-version constant; independently verified
D's current-contract correction (versionless Member State, confirmation timestamp
preserved) was incorporated. Those 15 Profile tests now pass.

The candidate-wide gate correctly remains RED: four other baseline failures
(legacy question aliases, two legacy Action ID fixtures, and missing mixed-Focus
disposition UI) plus broken module graphs on nine HTML pages. These are retained
as blockers, not excluded tests. Gate self-tests passing is evidence only for the
gate mechanism, never for the candidate journey. No receipt/artifact is produced
on failure. The backend/lifecycle slices must resolve these before promotion.

Self-review improvements: include new/untracked files in source fingerprint;
verify the built public artifact's import graph as well as source; preserve the
taxonomy directory required by browser imports; remove the old independent build
metadata writer; reject optional reusable validation jobs; deny accidental remote
connections in offline tests. Non-live files are discovered automatically. The
old extra Member State CI owner is retired in favor of the shared gate. Pages
promotion is explicit/manual, requires the same workflow validation receipt and
does not upload SQL, tests, documentation, dependency packages or workflow code.
No workflow or production deployment was executed.

## Slice 2 decision: lossless ordinary Member State storage

Authority: 02.03 September 7 persistence rule, 02.01.01 evidence/decision ownership,
05.04 no guessed historical migration. Invariant: decode(encode(current)) equals
current, including order, missing/unknown values, uncertainty, history and member
decisions. Neither loading nor saving may create semantic defaults or infer Focus
activation. Unsupported representations stop explicitly before domain consumption.

Affected owners: intelligence/state/supabase-persistence.js and its session caller.
C's strict JSON boundary and tests are independently reviewed and useful. Current
read-time normalizers reconstruct Focus ordering and add defaults; an accepted
decision can become an active Focus solely by loading. This violates ownership.
The contract-derived original object is the equality oracle, not another mapper.

C's wholesale removal of historical reader sources is not adopted without proving
history obligations. Disconnect ordinary session reads first. Retained historical
code must be mechanically excluded from application imports and identified as
unapproved migration evidence, not a callable current migration service. No
historical rows will be interpreted or rewritten. Creation/revision semantics
remain a separate SQL-backed slice. The release-wide blockers above remain open;
only this storage slice's independent invariant gate permits its commit.

Pre-edit history check: read-only grouped live query returns zero Member State
rows (2026-09-10). Repository references prove the session opener is the only
ordinary caller of the historical loader; the normalizers have no other current
consumer. Therefore retire those implementations/tests after migrating the caller;
their source remains in Git history. This supersedes the provisional retention
decision above using fresh evidence, not an assumption that history is disposable.
This does not claim other environments/backups have no history: unsupported imports
must fail and any future data migration requires its own reviewed provenance.

Slice 2 result: new fixtures failed 7/8 against F before repair. Final storage,
session and actual SQL-boundary suite: 48/48 pass. State suite: 35/35 pass.
SQL JSONB round-trip includes deliberate Focus ordering, an accepted dormant
decision, missing optional context and nested unknown evidence; it preserves the
original object exactly. No defaults, read migration, aliases or second mapper.
Retired four normalizer/migration source/test files and migrated all callers.
Self-review: no ordinary migration imports remain; no test assertion was weakened
to preserve old semantic defaults. First-save mismatch remains explicitly open.

## Slice 3 decision: PostgreSQL fidelity and fail-closed writer migration

Authority: 05.03 trusted boundaries; 05.04 replay/integrity; 05.05 ownership;
05.07 migration rehearsal. G's PostgreSQL 17 PGlite pin is useful: verified 0.3.15
runs PostgreSQL 17.5, matching live's major version (live is 17.6). This remains
an embedded single-session database, not proof of JWT/PostgREST or concurrency.
Use it in the canonical gate, not a new database workflow.

Keep F's single qualified definer body, strict null-safe table constraint,
overload retirement and inherited privilege checks. G's extra private wrapper
does not remove an observed ambiguity and is not incorporated. G's name-only
policy retirement and missing inherited-grant/overload postconditions are weaker.

Observed F gap: it can accept an unexpected baseline read policy or trigger.
Add preflight checks for the exact supported table columns, known policies and
revision trigger before any DDL; reject unexpected additions rather than silently
removing unknown policy behavior. Prove rollback and two-member SELECT isolation.
This is an edit to F's still-unapplied candidate migration, recorded in a new Git
commit; no applied live migration is rewritten. Supabase has no development
branches and the live writer is unchanged. Repository historical migrations stay
byte-for-byte intact.

Slice 3 result: the unexpected-baseline acceptance failed before repair. The
PostgreSQL 17 suite now checks extra policies, permissive replacement of the
known SELECT policy, extra columns, additional triggers and changed revision-guard
body. Baseline guard source fingerprint matches both repository and read-only live
definition. All F privilege, envelope, invalid-history rollback, overload and SQL
round-trip invariants remain required. No G wrapper or second writer was added.

## Backend reproduction investigation / creation-slice decision

Read-only Supabase evidence: 175 applied migration records, all retaining SQL
statements; repository has 27 migration files. No Supabase development branch
exists. These are not interchangeable histories. Do not relabel repository
migrations or fabricate historical files. The next backend gate must recover and
classify the recorded migration statements, identify retained versus experimental
objects, and compare a replayed schema/function/policy fingerprint with current
catalog. No complete bootstrap is claimed by the scoped Member State fixture.

The native runtime has no Docker/Postgres and no process capabilities; the
embedded PostgreSQL 17 environment is available, but cannot prove independent
connections or real authenticated PostgREST. A provisioned non-production backend
is still required for those gates.

Creation invariant is already fixed by the inspected SQL: expected=-1 creates
revision 0; each accepted update is exactly +1. Session code currently sends
revision 1 with expected=-1; its fake accepts this invalid combination. Repair
that mismatch without changing the database contract: on explicit first-save,
persist the revision-0 predecessor, then persist the single next revision. A
failure between writes leaves a valid recoverable predecessor; ambiguous success
is resolved by reload, never a blind overwrite. Positive/failure cases run through
the same JS session owner into actual SQL. Duplicate requests retain the RPC's
explicit conflict behavior. This does not initialize or decide immutable baseline
timing and does not make the later Plan activation transaction safe.

Creation slice: real SQL first-save acceptance failed before repair, exposing the
fake/SQL contradiction. Session now creates revision 0 before exactly one update.
Both persistence fakes enforce expected+1 as the SQL does; they no longer accept
revision 1 for creation. Tests inject failure before the update and after its
commit/before acknowledgement. Reload exposes the durable predecessor or committed
success respectively; a guarded retry succeeds only when appropriate. Duplicate
requests conflict; another member sees no row. Skipped revisions and history-prefix
rewrites are rejected before writes. No automatic read mutation or silent rebasing.

## Gate fixture reconciliation decision

The newly discovered question test expects retired GEN001 aliases; Planning tests
pass PHY-A01/PHY-A04 despite the governed opaque Action ID contract. Fresh-read
02.01.06 and the 02.01.07 Action Library identify ACT000001 and ACT000004 as the
current identities, with old labels explicitly limited to design/migration use.
Update only these fixtures to current identities and assert alias rejection.
Keep their substantive routing, preference/evidence and rejection assertions.
The mixed-Focus test is a valid no-silent-loss requirement and stays failing until
its real UI/Planning boundary is repaired. It is not an obsolete expectation.

After correcting the Action identities, one old assertion exposed a second
obsolete expectation: it treated two uncalibrated numeric challenger inputs as
authoritative evidence and expected them to override an otherwise eligible member
choice. 02.01.04's September 1 calibration rule explicitly assigns those numbers
to Subcon, while eligible member replacement remains permitted. Split the test:
prove the challenger prefers ACT000001 but cannot override the eligible choice
ACT000004; separately prove that a preferred ACT000004 with missing required
evidence cannot be selected and retains the hard-gate rejection reason. Production
Planning is unchanged and its broader comparison/relationship gaps remain open.
Creation suite final: 46/46 pass. This does not claim true simultaneous connections.

## Resolved stop: immutable baseline timing (founder approved 2026-09-10)

The founder approved establishment at completed Discovery, before Prioritization.
Fresh reads verified unchanged Git refs and the pre-remediation live SQL boundary.
02.01.01 now explicitly owns the trigger, immutable evidence/uncertainty snapshot,
separate Focus decision, linked later evidence/corrections, and separation from
account creation/revision 0. Verified targeted updates reconciled 00.00, 02.04,
00.01 Decision Register C13:G13 and Member Record Standard G4. D-012 is marked
approved / implementation pending; its former wording remains in a cell note and
Drive history. 02.01.02 already states the approved timing and was not rewritten.
The following describes the former stop and is retained as decision provenance.

Fresh current Drive evidence is materially inconsistent:
- 02.01.02, Discovery Outputs: completed Discovery establishes the immutable initial
  baseline before Prioritization; member confirmation does not establish it.
- 00.01, approved D-012 and Member Record Standard: completed Discovery plus
  confirmed Focus establishes that baseline.
- 00.00 canonical semantics and 02.04 Discovery architecture repeat the latter rule.

00.01's Source of Truth Matrix assigns Member State and cross-stage semantics to
02.01.01, and detailed acquisition/handoff to Discovery. The current parent
architecture requires immutable baseline/history but does not settle this timing
or explicitly supersede D-012. Choosing solely by modification date would silently
promote one contradictory statement over an approved cross-stage decision. Choosing
the governance summary alone could instead overrule the current specialized
Discovery contract. A founder decision is required before baseline establishment
and its correction/reassessment dependents can be implemented coherently.

Decision requested: freeze the immutable initial baseline at completed Discovery,
or after member Focus confirmation? Record the chosen owner/trigger in the current
authority and explicitly reconcile the conflicting references. No authoritative
Drive text was changed by this remediation. The independent preservation/write
work above establishes neither choice and remains valid under both.

Current readiness: IMPROVED BUT BLOCKED / NOT HUMAN-TEST-READY. Full offline gate
still rejects the candidate for the valid mixed-Focus disposition regression and
nine broken HTML import graphs. No validation receipt, candidate deployment or
human-test accounts were issued. Full backend replay, JWT/PostgREST ownership,
independent concurrent sessions, atomic Plan activation, semantic handoffs and
actual member lifecycle remain unproven. No production/live Supabase mutation.

Final self-review also added npm test-script discovery enforcement and corrected
the offline socket guard for Node's normalized argument arrays; seven gate tests
pass, including a no-network transport probe. No retained assertion grants
production authority to uncalibrated challenger scores.

Proposed execution-status updates (not applied to authoritative trackers): record
the one canonical remediation line; mark lossless storage and scoped writer/session
acceptance complete; mark overall release gate RED; add the baseline-timing decision
and full backend replay as blocking; retain G-02/human-test readiness as blocked.
Do not mark architectural migration, beta, external testing or production ready.

## Next slice decision: source-attributed disposable backend foundation

Authority: fresh 05.04 historical integrity and schema evolution, 05.07 isolated
environments and reproducible implementation, plus the founder's remediation order.
Invariant: recorded migration SQL, observed runtime schema and candidate forward
changes must remain distinguishable. A disposable bootstrap must not execute
production-bound schedules, copy member data/secrets, or claim historical files
were applied verbatim when their bodies differ.

Read-only recovery found 175 migration records with retained statements (236,937
characters). Repository history has 26 pre-F files and one unapplied F migration.
The recorded 20260830140344 function differs materially from its repository copy;
20260830140419 also contains a constraint missing from that repository file.
Several additional mismatches concern comments, wrapping, names or timestamps.
Do not alter either history to hide these facts.

Diagnostic replay of the first 14 recorded migrations succeeds in PostgreSQL 17;
the next requires Supabase Storage. This uses explicit platform stubs and is not
full replay evidence. Later history enables pg_net/cron and schedules an HTTP call
to the production project using Vault references. Blind historical replay or an
unverified project clone is not an acceptable non-production bootstrap.

Prepare a data-free, source-attributed public-schema checkpoint outside the automatic
migration directory, retaining current constraints/RLS/functions as evidence rather
than endorsing their semantics. Bootstrap only a fresh isolated environment with
independent Supabase platform services, no cloned Edge Functions, schedules, secrets
or member data; then apply the single candidate forward-writer migration. Historical
records stay untouched. Native Supabase/Auth/PostgREST and real simultaneous-session
verification remain required after local SQL rehearsal.

Affected owners: repository backend bootstrap/provenance artifacts and database
acceptance tests; candidate identity must fingerprint bootstrap inputs as well as
forward migrations. No application semantics change in this slice. Test before
repair: absence of a reconstructable checkpoint; checkpoint replay and catalog
equality; fail on an occupied destination, unapproved execution or source drift;
verify the existing writer migration against the complete captured public boundary.

### Checkpoint slice verification and self-review

The new checkpoint acceptance failed before the artifact existed. The identity
acceptance also failed before bootstrap inputs were included in the migration
fingerprint. Final scoped database/gate suite: 40/40 pass. The checkpoint restores
all eight independently captured catalog sections, rejects execution without the
explicit disposable setting and rejects a second bootstrap into an occupied schema.
Actual catalog mutations prove detection of policy, grant, function, constraint and
trigger drift. The complete captured public schema accepts the existing F forward
migration, with one ordinary-member writer and no direct table DML grants.

Full canonical gate: 83 files, 340 tests, 339 pass / 1 fail / 0 skipped; the same
valid mixed-Focus UI regression and nine broken page import graphs remain. No
receipt or deployment was produced. Existing historical migration files were not
edited. No additional benchmark mechanism or semantic implementation was added.

Self-review: sequence bigint bounds initially passed through JSON numbers during
inspection. Re-read them as decimal strings before constructing/fingerprinting the
checkpoint; exact 9223372036854775807 bounds now survive. A second live read matches
every captured section. Historical SQL containing environment-bound scheduling stays
outside automatic replay. No captured public function contains an HTTP endpoint,
Vault/net reference or credential literal. The checkpoint retains observed legacy
objects for explicit later classification/retirement, without asserting current
application consumption or approved semantics. The bootstrap is outside the
automatic migration directory and excludes platform event-trigger/configuration,
Auth/Storage implementation, data, secrets, schedules and Edge deployment.

Next prerequisite: independent Supabase Auth/PostgREST/native connection environment.
Concrete proposal: fresh `el8-remediation-staging`, existing EL8 organization
`pqieapngqtigeblthqth`, region `us-east-2`, quoted provisioning cost USD 0/month.
Supabase's project creation/confirmation tools require explicit organization and
cost confirmation. Await that confirmation before creating infrastructure. This is
not a renewed product-semantic decision and does not authorize any live mutation.
# Isolated backend and API acceptance continuation

Authority fresh-read: 05.07 requires isolated synthetic validation and source-owned
reconstruction; 05.04 requires provenance, lossless persistence and recoverable
material writes. The original EL8 project remains read-only. The founder explicitly
authorized pausing Ridgewood after the free-project quota blocked new staging.
Ridgewood is paused and retains a 90-day restore obligation. New staging identity
is owned by `supabase/environments/staging.json`; no production users, secrets,
cron, Storage objects or Edge Functions were copied.

Decision before schema replay: reconstruct the existing observed checkpoint in the
verified empty PG17 staging project, compare its independent catalog, then rehearse
the F writer and prove actual Auth/PostgREST ownership and CAS. Preserve historical
migration provenance. Do not advance the semantic journey on SQL-only green tests.

The API rehearsal exposed the writer's use of `40001`, which PostgREST maps to HTTP
500. The forward conflict-response migration uses PT409/HTTP 409 for ordinary CAS
conflicts. An exact prior-definition check prevents rewriting an unknown writer;
tests prove all other function text, ownership and privileges remain unchanged.
The acceptance test first failed for PT409, then passed with the forward migration.
No existing shared migration was rewritten and no second writer was introduced.

Completed boundary evidence: all eight original public catalog sections matched
before the forward changes; repository PG17 replay matches the independently read
post-forward staging catalog; 12 real authenticated tests passed. The first live
ownership fixture accidentally used the foreign revision and reached CAS first;
it was corrected to hold the caller revision valid without weakening ownership.
The live test now targets Member State itself and rejects all unapproved endpoints,
replacing the unrelated Edge-harness test path and its original-project fallback.

The full offline gate remains red: 344 tests, 343 pass, one valid mixed-Focus
failure and nine page import failures. No release receipt, deployment, human-test
package or ordinary-development readiness is claimed. The next bounded slice is
Discovery-to-Member-State semantic preservation and the confirmed Discovery
baseline, followed by the remaining ordered contracts. Actual browser persistence
must also reconcile multi-transition domain revisions with the +1 write contract.

Self-review: one mapper/writer retained; only the business conflict response changed;
real account setup remains a privileged synthetic fixture; no mock JWTs, service
keys in tests, production defaults, legacy aliases or copied semantic registries
added. Pinned Supabase SDK and lockfile make the integration client reproducible.
The original harness page/function remain historical consumers pending retirement
review; neither is used to certify Member State or deployed to staging. The actual
browser still uses an unpinned SDK URL and remains outside this accepted boundary.
