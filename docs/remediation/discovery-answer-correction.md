# Bounded Discovery answer correction

## Pre-implementation decision

Fresh-read authority: Discovery Specification (1d0E7CnzbKC42dUploWPc33IM57oFxKOKL6NQXm6qGnE) and 05.04 Data Architecture (1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4), 2026-09-10. Explicit member correction supersedes the earlier report for current use, preserves historical evidence, and requires dependent interpretation to be re-evaluated. Mere later answers do not imply correction or resolve contradictions by voting. Safety history remains independently governed.

Starting candidate: 8dc1a93e7d6a294c5d99434c733531676f350512; clean remediation/human-test-candidate. Existing completed slices are preserved.

Observed defect: construct-projection interprets every raw answer as current. There is no correction identity/link. Engine answer() also owns mutable resolution and cached orchestration, so filtering the projection alone is insufficient.

Selected boundary: explicit correction of a single ordinary focused answer in an unfinished Discovery run. Only governed single-answer focused questions whose entire effect family is STATE/UNCERTAINTY qualify. Reject other question families and completed runs until their dependent-state correction contracts are implemented. Resolve the question from the existing bank, never caller-supplied rules. Require a stable correction UUID, exact target, replacement answer and timestamp. Append; never edit previous observations. Identical retries are no-ops; identity reuse, stale/foreign targets and malformed links fail before mutation.

Owners: contracts (observation-link validation/current selection), construct-projection (current interpretation with full provenance), discovery-engine (command and dependent working-state invalidation), onboarding runtime (application entry point), run-record (explicit resume validation), existing Member State mapper and existing SQL run store (lossless evidence transport). No second writer, mapper, table or semantic registry.

Preserve all source records and Member State facts, unrelated evidence, explicit deferral and Safety state. Invalidate cached orchestration, re-evaluate focused sufficiency, and reopen ready/incomplete working flow after correction. Completed baseline, Focus and Plan correction is deliberately unavailable through this command.

Acceptance: explicit correction versus independent contradiction, correction chains, unknown replacement, independent disposal, exact retries, invalid-link/identity rejection without mutation, application entry point, immutable Member State facts and actual SQL append/reload/resume. Ordinary reads remain lossless; explicit resume validates links. Existing migration already stores ordered append-only JSONB history; no SQL or hosted mutation required.

Risks/next boundary: broader concern lifecycle, orientation/multi-answer/Safety corrections, completed-run dependent decisions and UI are still unresolved. This slice does not establish human-test readiness or implement retraction without replacement. A runtime fingerprint change requires explicit migration/reacquisition for prior working runs; no historical record is rewritten.

## Verification and self-review

Five new command/projection acceptance tests failed before implementation. Self-review added a malformed cross-construct/source-parent case that failed before link validation was tightened. Final scoped command/interpretation/current-eligibility/real-SQL adapter suite: 22/22 pass. Full reviewed offline run: 406 tests, 405 pass, one unchanged `intelligence-test/mixed-focus-plan-regression.test.mjs` failure and the existing nine page-import failures. No test assertion was weakened. The exact published-SHA gate is recorded in the continuation checkpoint; no green release receipt or new hosted Auth receipt is claimed.

Self-review: use one current-observation selector for projection and explicit resume; preserve every raw observation as an immutable Member State fact; preserve historical provenance references; require backward, same-question, same-construct source links; reject duplicates/ambiguous history rather than guessing. Exact command retries work after JSONB key reordering and after a later correction. Unknown replacements clear current STATE evidence, preserve uncertainty, and invalidate cached orchestration. Independent answer conflicts remain unresolved. Member deferral remains separate. A positive Safety interruption survives ordinary correction and still interrupts next(). Ordinary SQL reads do not call projection or resume validation.

No migration, Supabase mutation, deployment, main update, benchmark merge or authority edit occurred. Main, reconciliation, F and the candidate parent were reverified remotely before publication. Existing raw fact objects intentionally remain immutable; current interpretation references select usable evidence. The legacy generic-evidence question-eligibility helper and numerical semantic-coverage reliability behavior remain separate known paths, not used to reinterpret this command's STATE/UNCERTAINTY observations; they need consumer audit before retirement.

The working-run command is not a trusted material-state transition and does not certify client-supplied semantics. Server run storage validates ownership, revision and append-only history; final authoritative promotion/baseline validation remains a later gate. Previous completed runs, confirmed Focuses and Plans cannot be corrected by this command. The actual browser correction surface remains to be wired during the journey slice.

## Change manifest

- `app/onboarding/discovery-runtime.js`: expose the single bounded correction command to the application.
- `intelligence/discovery/contracts.js`: validate explicit supersession links and select current observations without editing history.
- `intelligence/discovery/construct-projection.js`: interpret current observations and retain historical provenance.
- `intelligence/discovery/discovery-engine.js`: validate and append correction commands, handle exact retry and invalidate dependent working decisions.
- `intelligence/discovery/run-record.js`: reject ambiguous correction history during explicit capture/resume; ordinary SQL reads unchanged.
- `intelligence/discovery/runtime-fingerprint.js`: regenerate runtime provenance.
- `intelligence/discovery/answer-correction.test.mjs`: protect correction, conflicts, immutable facts, uncertainty, retry, Safety and malformed history.
- `tests/database/discovery-run-persistence.test.mjs`: prove append/reload, original revision preservation, lost acknowledgement and command retry against migration SQL.
- `docs/remediation/discovery-answer-correction.md`: record authority, scope, predecision, validation and limitations.
