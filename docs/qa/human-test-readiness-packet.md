# EL8 Human-Test Readiness Packet

Date: 2026-09-15
Branch: `reconcile/g02-intelligence`
Status: preparation only; EL8 is improved but blocked and not human-test-ready.

## Purpose

This packet defines useful offline work and the evidence package required before EL8 can resume human testing. It exists so the later gate-opening pass can move quickly once EL8 Supabase is active/readable again, without confusing documentation preparation for implementation readiness.

## Current boundary

- EL8 Supabase project `jprdsidxwjkgiqqakwpr` remains intentionally inactive while Jay reserves active Supabase slots for Sontu and Ridgewood.
- No Supabase activation, migration, function deployment, data write, branch creation, or live test is authorized from this packet.
- PR #144 remains Draft/open/unmerged.
- Current documentation-preparation heads are not newly tested implementation candidates.
- Last audited implementation head before 2026-09-15 documentation preparation: `9bbcf926ff518aff868168c4feb905f441e83452`.

## Best useful work while Supabase is inactive

Ranked by leverage for later human testing:

1. **Gate packaging** — keep README, PR #144, Drive status, source-ownership matrix, catalog SQL, and this packet aligned around one blocked candidate identity.
2. **Offline test readiness** — identify the exact non-live test commands, page import checks, fixture scenarios, and expected result format needed before backend reactivation.
3. **Synthetic scenario preparation** — prepare member journeys and expected observations that do not require live data or real members.
4. **Documentation contradiction cleanup** — mark stale docs that imply human testing can proceed before source ownership and backend catalog reconciliation.
5. **Branch/PR triage recommendations** — classify branches/PRs as active, historical evidence, superseded, or needs owner decision, without deleting or closing them yet.
6. **Implementation work** — defer unless a repository-only defect is already proven by existing tests and the fix does not depend on live Supabase truth.

## Human-test promotion gates

All gates must pass on one exact candidate before human testing is claimed ready.

| Gate | Required evidence | Offline-preparable now | Supabase required later | Failure action |
| --- | --- | --- | --- | --- |
| H0 Owner authorization | Jay explicitly approves the test scope, candidate, and any active-slot change | prepare checklist | yes for backend-backed test | stop if unclear |
| H1 Drive authority snapshot | relevant Drive authorities named and current status recorded | yes | no | update Drive/repo records before testing |
| H2 Source ownership | Edge Functions, DB objects, migrations, storage/cron surfaces mapped to repo and Drive | matrix prepared | yes to verify live | keep PR draft; repair source ownership |
| H3 Repository gate | full non-live suite and page import graph pass on exact candidate | yes | no | fix repo-only failures before backend work |
| H4 Backend catalog gate | read-only catalog/function/migration evidence matches repo or has approved forward path | SQL prepared | yes | stop before mutation; record blocker |
| H5 Disposable backend replay | approved baseline plus forward migrations replay in disposable environment | partly | no live EL8 required, but setup needed | fix migration/source drift |
| H6 Deployment gate | exact candidate deployed only through approved path and browser-smoked | prepare script | deployment approval required | do not test against unverified build |
| H7 Human script gate | script covers core journey, comprehension, burden, agency, safety, and defect capture | yes | no | revise script before testing |
| H8 Acceptance recording | results template separates human findings from automation and agent review | yes | no | do not convert notes into acceptance |

## Offline test-readiness package

Before Supabase reactivation, prepare or verify these repository-only items:

1. Full non-live test command owner: `npm test` remains the canonical repository gate unless superseded by a documented owner-approved command.
2. Page import graph owner: preserve a command or workflow that imports actual member/QA pages and fails on missing exports, deleted modules, or QA-only aliases.
3. Fixture scenario list: at minimum include one low-burden single-focus case, one mixed multi-focus case, one low-confidence/insufficient-evidence case, one Safety-interruption case, one Planning-deepening case, one no-autonomous-intervention case, one Review/learning case, and one correction/retraction case.
4. Evidence ledger format: every run should record exact commit SHA, tree/source fingerprint if available, command, environment, pass/fail counts, known skips, and whether the evidence is offline, disposable-backend, live-backend, browser, agent visual review, or human acceptance.
5. Failure routing: every failed gate gets one owner and one bounded repair slice. Do not reopen broad feature work from a failed gate without a concrete defect.

## Synthetic human-test scenario draft

These are not live-member scripts. They are scenario shells to convert into a human-test script after H1-H6 pass.

### Scenario A: ordinary single-focus Discovery

- Member starts with one clear everyday concern.
- Expected behavior: Discovery obtains enough evidence without requiring every dimension to be interrogated; Prioritization explains the Focus and alternatives; Planning proposes only decision-useful next steps.
- Watch for: unnecessary broad questioning, manufactured certainty, hidden Safety assumptions, unsupported Action selection.

### Scenario B: mixed multi-focus Discovery

- Member reports two plausible difficult areas with possible relationship but incomplete evidence.
- Expected behavior: EL8 keeps facts, hypotheses, member choices, and population priors separate; near-equivalent Focuses are presented without fake ranking.
- Watch for: cross-dimensional assumption leakage, lost low-confidence candidates, one Action being used without explicit cross-Focus coverage.

### Scenario C: Planning deepening

- Member confirms an outcome-oriented Focus that requires missing driver/context evidence.
- Expected behavior: Planning asks only decision-critical governed clarification, applies the answer to canonical Planning input, and remains blocked if no governed option exists.
- Watch for: dead-end UI, fabricated answer, generic outcome intervention, missing Toolkit explanation.

### Scenario D: Safety interruption

- Member gives an input that should trigger a conservative Safety route.
- Expected behavior: Safety interrupts ordinary optimization, provides appropriate scope/route, and does not allow ordinary ranking or confidence to override the interruption.
- Watch for: aggregate wellness/ranking reducing Safety priority or treating Safety as a normal Focus.

### Scenario E: Review and learning loop

- Member reports an attempted Action with burden, partial adherence, or unexpected outcome.
- Expected behavior: Review distinguishes adherence, outcome, burden, changed context, and learning; next step routes to Planning or focused Reassessment without rewriting history.
- Watch for: completion treated as improvement, Review choosing a replacement Action directly, old evidence erased.

## Human-test script requirements

A future human-test script must include:

- exact candidate SHA and deployment URL, if any
- Drive authority snapshot and PR/status link
- backend project/ref and evidence date, if backend-backed
- tester role and account type
- allowed actions and forbidden actions
- reset/cleanup expectations using synthetic records only
- required screenshots or observation notes
- defect severity definitions
- explicit acceptance criteria
- explicit non-acceptance criteria

Minimum acceptance criteria:

1. The tester can complete the intended journey without hidden operator intervention.
2. The tester understands why EL8 asks, recommends, blocks, or escalates.
3. Member agency is visible at Focus confirmation and Planning choices.
4. Evidence, uncertainty, Safety, and no-plan/deepen states are not hidden.
5. The system does not imply clinical, effectiveness, or validated-wellness claims.
6. Any backend-backed persistence is source-owned and verified against the exact candidate.

## Branch and PR cleanup recommendation

Current best recommendation: keep PR #144 as the visible active reconciliation container. Do not close, merge, or split it yet. It is large and not merge-ready, but it currently preserves the clearest visible thread of G-02 reconciliation state.

Later, after source ownership and exact gates are reconciled:

1. Create an owner-approved small candidate branch or replacement PR only if PR #144 is too broad to review safely.
2. Preserve unique evidence from old branches/PRs in Drive or repo docs before closing/deleting anything.
3. Retire branches only when they are superseded by a clearer candidate or explicitly rejected.
4. Merge to `main` only after Drive authority, repo candidate, tests, Supabase catalog/functions, deployment identity, and human-test readiness describe the same system.

## Current recommendation

The best useful work right now is repo-only gate packaging and stale-doc cleanup. The next concrete offline step should be to audit `docs/`, `README.md`, PR #144, and QA docs for any remaining wording that implies human testing, backend readiness, or release promotion can proceed without the source-ownership and Supabase-reactivation gates.

Do not start broad implementation until a specific repository-only failure is confirmed by existing tests or documented authority conflict.
