# Preserve member deferral during evidence updates

## Pre-implementation decision

Start: clean published 8395c0b9cb65235382be7e51945e84986945b88e on remediation/human-test-candidate. Fresh-read Discovery Specification (1d0E7CnzbKC42dUploWPc33IM57oFxKOKL6NQXm6qGnE) and 05.04 Data Architecture (1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4). Members may stop/defer with partial evidence preserved; deferral must not fabricate negative evidence. Contradictions stay explicit, and raw evidence, interpretation and member decisions remain distinct. Safety remains independently interruptible.

Inspection toward the canonical concern lifecycle exposed a smaller prerequisite: deriveStates unconditionally replaces resolution with triaged on conflict, including explicit member deferral. applyGovernedFocusedSufficiency likewise overwrites deferred with sufficient/triaged on an answer. The current UI's triage value 0 is labeled Not now; its existing member-decision path is submitDiscoveryTriage → Discovery.triage → setResolution. A positive re-triage is explicit member resumption. Evidence arrival alone is neither decision.

Selected invariant: new evidence and conflict interpretation cannot reverse an explicit Not now decision. Preserve the evidence and unresolved reasons without reactivating the deferred candidate. Explicit member re-triage can resume consideration, but does not itself resolve contradictory evidence. Safety must still interrupt, and global required gaps remain blocking.

Owners: discovery-engine's automatic focused-evidence update and orientation-session's derived-state projection. Existing sufficiency audit, run codec, Member State mapper and SQL writer consume the preserved result. No new lifecycle, disposition field, compatibility alias, copied registry, persistence mapper or writer. Keep the existing representation until canonical lifecycle semantics and consumers are coherently migrated; do not claim this prerequisite implements UNRESOLVED/ESTABLISHED/DISMISSED.

Acceptance before repair: ordinary STATE and UNCERTAINTY answers cannot reactivate Not now; conflict cannot erase deferral through projection; run and Member State round trips preserve deferral and evidence; explicit resumption does not erase conflict; Safety and required gaps still block; actual SQL reload retains the same disposition. No historical state reinterpretation or live mutation is needed.

Pre-implementation scope refinement during review: the graph mapper drops deferral, and landscape expansion, severity selection, leverage/deepening and candidate display can still schedule/present a deferred construct. The existing canonical driver-node disposition field can carry the decision separately from evidence status. Extend this same slice through driver-graph.js, driver-landscape.js, discovery-orchestrator.js, leverage-ranking.js and the runtime candidate view/engine stop output. Preserve deferred nodes and evidence for provenance, but exclude them from current investigation, re-offering and candidate presentation. Do not change numerical ranking rules for active nodes. Add an actual runtime-next regression before this repair.

The resumption test also reproduced an existing observation-identity collision: two distinct triage decisions in one millisecond receive the same ID and make interpretation reject the history. Use UUIDs for newly captured importance/triage observations in the existing owner, as required by 05.04 stable globally unique identity; preserve question, construct, time and value separately. No executable consumer parses those ID strings. A fixed-clock adversarial fixture proves distinct decisions remain distinct without sleeping or weakening the immutable-fact guard. Existing IDs are never rewritten.

Preserve all facts, unresolved reasons, global requirements and other constructs. Do not reinterpret nonIssue/escalated here: dismissal revalidation and Safety ownership belong to the remaining canonical lifecycle work. Retire only the two automatic overwrite paths. Remaining open: canonical three-state concern lifecycle, explicit deferral provenance beyond the existing triage observation, trusted completion/baseline and dependent correction/reassessment. Current numerical/legacy triage consumers also need coherent retirement. Older working runs remain losslessly readable but require governed migration/reacquisition on explicit resume after the runtime fingerprint changes.

## Verification and self-review

Three acceptance tests failed before repair; the added scheduling test independently exposed re-offering. The fixed-clock resumption case reproduced the duplicate-ID defect. After repair, all 35 scoped runtime, correction, completion, eligibility, requirements and actual SQL persistence tests pass. The full offline gate reports 417 tests, 416 passing and the unchanged mixed-focus-plan-regression failure, plus nine existing HTML/module import failures. No passing validation receipt is issued. Exact published-candidate verification is recorded in the companion execution checkpoint.

Self-review centralized deferred seed exclusion in the existing landscape builder rather than duplicating it in orchestration. Evidence status, graph provenance, unresolved requirements, Safety, active-node numerical calculations, historical IDs and storage contracts remain unchanged. No compatibility path, new writer, registry or schema was introduced; no assertions were weakened. Ordinary answer identity still uses its existing timestamp-derived IDs and needs a separately bounded consumer/identity review. No live or staging mutation was performed. Human-test readiness remains blocked.

## Change manifest

- intelligence/discovery/orientation-session.js: retain deferral while deriving conflicting evidence.
- intelligence/discovery/discovery-engine.js: prevent automatic evidence updates from resuming deferral, exclude deferred stop candidates, uniquely identify new triage/importance decisions.
- intelligence/discovery/driver-graph.js: carry the existing disposition independently of evidence support.
- intelligence/discovery/driver-landscape.js: exclude deferred seeds and expansion targets in the existing owner.
- intelligence/discovery/discovery-orchestrator.js: pass deferral into landscape construction and exclude deferred severity work.
- intelligence/discovery/leverage-ranking.js: exclude deferred hypotheses from investigation ranking.
- app/onboarding/discovery-runtime.js: omit deferred graph candidates from presentation.
- intelligence/discovery/runtime-fingerprint.js: regenerate implementation provenance.
- intelligence/discovery/deferral-preservation.test.mjs: four contract-derived runtime, evidence, reload, resumption and Safety regressions.
- tests/database/discovery-run-persistence.test.mjs: actual SQL round-trip regression.
- docs/remediation/discovery-deferral-preservation.md: decision, evidence, limitations and this manifest.
