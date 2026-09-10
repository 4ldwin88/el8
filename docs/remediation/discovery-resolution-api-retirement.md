# Retire the public Discovery resolution shortcut

## Pre-implementation decision

Resume clean published aee5f8bb630dee682bf1c645c282047985e55f97 on remediation/human-test-candidate. Fresh Discovery authority (1d0E7CnzbKC42dUploWPc33IM57oFxKOKL6NQXm6qGnE) requires evidence-governed concern resolution, preserves member decisions separately and reserves Safety escalation to Safety. Fresh 05.04 (1njiB-CpkGl-pr-23_Y4ds1NrVMpodYEIfWId-PV6Ir4) separates evidence, interpretation and decision provenance. Reports are evidence only.

The engine exports resolve and the browser runtime exports resolveDiscoveryConstruct, both passing arbitrary strings to a working-state setter. These can force sufficient or nonIssue without evidence. The QA Discovery page retains a priority-resolution handler that turns a Yes preference into established. No current engine, orientation or orchestration producer emits priority-resolution. Repository-wide caller inspection found only that stale handler and one correction test calling the public command. No persistence or hosted RPC uses these JavaScript exports.

Selected invariant: the public engine/browser APIs must not expose an arbitrary resolution command, and the actual QA page must not contain its obsolete preference-as-resolution branch. Existing evidence-answer, member triage, correction and independent Safety paths remain. This removes a callable bypass; it is not a trusted semantic boundary, and it does not establish the full UNRESOLVED/ESTABLISHED/DISMISSED contract. Mutable working sessions and the low-level orientation setter remain internal implementation/test dependencies pending coherent lifecycle migration.

Owners affected: discovery-engine.js, app/onboarding/discovery-runtime.js and intelligence-test/discovery.html. Migrate the correction test to actual member triage with immutable decision evidence. Add actual module-export and page-source retirement checks plus behavior checks for unresolved activation, explicit deferral and correction. No production behavior should depend on the dead step; the existing browser import gate detects stale imports.

Preserve existing SQL/storage contracts, historical runs and observations. Fingerprint changes require explicit historical resume handling; ordinary reads remain lossless. No schema, function, RLS, grants, migration or hosted backend change is required. The existing append-only run writer persists opaque working records; no claim of trusted concern resolution is made.

Inspection limitation: planning-pipeline.test.mjs manually supplies governed observations and forces sufficient through the low-level setter, including FINANCIAL_CONTROL, which has no maySatisfyFocusedEvidence runtime question. Those tests exercise downstream planning fixtures, not actual Discovery establishment or journey readiness. Retain assertions and record this evidence gap for the canonical concern-contract slice; do not invent a sufficiency rule to keep a test green. No founder decision is needed to delete the obsolete public API. Concern-specific sufficiency and dismissal rules must be inspected before the broader lifecycle repair.

## Verification and self-review

Two new API/page acceptance tests failed before deletion; the separate member-intent behavior test passed. The migrated correction fixture initially targeted the newly appended triage decision rather than the original answer. Corrected the fixture target and added immutable decision preservation; no assertion was weakened. Final scoped API, runtime, correction, deferral, downstream planning and actual SQL adapter tests pass 25/25. Full offline gate: 420 tests, 419 pass, the unchanged mixed-focus-plan regression fails; the same nine page-import failures remain. No validation receipt is emitted. Companion checkpoint records exact published-SHA rerun.

Self-review verified the QA HTML differs only by the obsolete import and handler; all remaining bytes match. No current producer emits the retired step. No alias or replacement arbitrary setter was introduced. Existing low-level working-state implementation, evidence interpretation, Safety, persistence and downstream assertions are unchanged. No browser journey, hosted validation or production readiness is claimed. Full three-state concern semantics and trusted baseline remain unimplemented.

## Change manifest

- intelligence/discovery/discovery-engine.js: remove named/default public resolve command.
- app/onboarding/discovery-runtime.js: remove public arbitrary resolution wrapper.
- intelligence-test/discovery.html: delete obsolete import and unreachable preference-as-resolution handler.
- intelligence/discovery/answer-correction.test.mjs: use real member triage, retain exact original correction target, assert immutable decision preservation.
- intelligence/discovery/resolution-api-boundary.test.mjs: prevent retired public API and QA handler recurrence; test evidence-free activation/importance and separate deferral.
- intelligence/discovery/runtime-fingerprint.js: regenerate runtime provenance after API retirement.
- docs/remediation/discovery-resolution-api-retirement.md: authority, predecision, consumer evidence, fixture limitations, verification and manifest.
