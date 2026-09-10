# Discovery evidence repair — execution decision

The founder authorized the expanded evidence-projection/completion repair after
the five diagnostics recorded against 8cc7e12a100cf21745c5d131a7c1a6097534598d.
This is implementation evidence, not product authority.

## First slice: retain source evidence in one atomic projection

Fresh-read Drive authority: 02.01.02 Discovery (modified 2026-09-06),
02.01.01 Architecture (2026-09-10), 02.01.06 Question/Signal specification
(2026-09-03), and 02.01.06.01 structured registry (2026-09-03).
STATE values remain construct-specific observations; contributor evidence is a
reported hypothesis, not a causal fact. Uncertainty, constraints and control
answers must survive without manufacturing condition evidence. Initial baseline
establishment remains separate from account creation and precedes Prioritization.

Starting branch: remediation/human-test-candidate at 8cc7e12a100cf21745c5d131a7c1a6097534598d,
clean. Remote main, reconciliation and F still match the prior recorded refs.
Original EL8 and isolated staging public catalogs were freshly read, without data
mutation. The existing JSONB Member State fact map and single writer can hold
these records without a new table or storage-version change. The existing SQL
writer also needs a forward append-only fact guard: otherwise a caller bypassing
the JS transition could delete or rewrite accepted observation provenance.
This migration must refuse an unexpected prior function definition or malformed
existing fact map, preserve grants/ownership, replay before staging application,
and never run on the original project. Historical data is not interpreted.

Invariants: selected answer values and their exact Question/Answer/Effect record
provenance survive projection and storage; immutable observation IDs cannot be
reused for different evidence; a whole projection advances exactly one revision;
any invalid event rejects the whole in-memory command; database CAS remains +1.
JSON object-key order is not a factual difference; array/evidence order is.

Owners: observationNormalizer captures selected registry provenance; existing
Discovery observations own acquisition; discovery-member-state-adapter maps each
observation into the existing immutable fact store; member-state-transition owns
atomic event application/revision; supabase-persistence remains the sole mapper.
An observation fact asserts what was reported, not the truth of a contributor or
derived hypothesis. Its value retains the source observation, and reliability
remains unknown. Registry snapshots are historical provenance for that answer,
never a second executable registry or a read-time source of semantic defaults.

Acceptance before repair: actual opposite Sleep answers must remain distinct;
relationship/uncertainty/non-construct-target effects must survive; all current
executable answer mappings must retain their selected records; changed evidence
under an existing ID must fail; real SQL must accept the full projection at +1,
preserve it on reload, and reject stale repeats/cross-member access.

Preserve existing acquisition consumers during this first slice: construct
projection, Discovery completion, planning-pipeline and the two priorities pages.
Their lossy derived interpretations remain explicitly unresolved and will be
replaced in the next slice; retaining source evidence does not certify their
decisions. No compatibility path is added. Do not migrate old assessments, infer
missing historical answers, establish a baseline from partial state, or claim
browser readiness. No production mutation or deployment is authorized here.

## Verification and self-review

The first source-evidence acceptance run failed four of five tests; the existing
atomic-invalid-command case already passed. After repair all five pass, including
all current Question/Answer/Effect mappings. The real-SQL acceptance test first
failed because the prior RPC accepted an evidence rewrite; after the forward
migration it passes, along with definition drift, malformed baseline, privilege
preservation and repeat-application refusal. Scoped SQL/evidence tests: 39/39.
The full offline run: 351 tests, 350 pass, one unchanged mixed-Focus Plan failure;
nine actual HTML import graphs still fail. No release receipt is emitted.

The exact migration was applied only to bqumsiqkpxkofjykgzqp after SQL replay.
Only the expected function catalog section changed; all seven other sections
matched the prior capture. The staging replay manifest now owns the forward
sequence, and an omission test requires every supported candidate migration.
The original EL8 remains unchanged. Privileged maintenance is still separate;
ordinary fact mutation conflicts without overwriting any accepted state.
Recovery is a reviewed forward correction or reconstructing disposable staging
from its checkpoint and complete forward sequence, not silently restoring the
weaker writer. Existing observations are neither inferred nor backfilled.

Self-review: one fact map, one event reducer, one SQL writer, no new table/version.
Observation facts identify their source as Discovery acquisition, so seeded or
inferred observations are not falsely labeled direct member reports. Selected
registry snapshots are immutable provenance, not an executable inventory.
Object-key-order equality fixes real JSONB reload without relaxing ordered values.
Single-event consumers delegate to the same reducer; only a coherent multi-event
command advances once. The old derived-state/readiness defects remain explicit
and are the next slice. Authenticated staging tests now include actual Discovery
projection, evidence-rewrite denial and reload; exact candidate receipts remain
separate from the red full release gate.

Authenticated working-tree acceptance: 13/13 PASS (12 subcases plus parent),
including the real Discovery projection, append-only evidence guard and fresh
Auth-session reload. The first attempt was stopped by automatic approval review
because staging identity was not established to that reviewer. Fresh Supabase
project metadata and read-only counts proved the distinct project had only ten
declared synthetic users and zero Storage objects. The explicit-target retry
then passed; no rejection was bypassed and no original EL8 mutation occurred.
