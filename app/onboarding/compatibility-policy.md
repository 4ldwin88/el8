# Onboarding compatibility policy

Canonical onboarding begins at `discovery-snapshot.html`. `assessment.html` exists only as a legacy URL redirect and must not contain assessment logic, decision logic, or member-facing Baseline-stage semantics.

The production profile table was audited before retiring granular onboarding-status aliases: all persisted profiles used the canonical `completed` state. `flow.js` therefore accepts only the canonical lifecycle states (`not_started`, `in_progress`, `completed`, `safety_paused`); unknown or obsolete values safely normalize to `not_started` rather than restoring historical stage routing.

The legacy `el8_baseline_discovery_handoff` session fallback has been retired. Discovery now reads only `el8_discovery_snapshot_handoff`. Obsolete browser-session keys must not be reintroduced.

Production assessment history was audited before narrowing evidence compatibility. Two historical completed Universal Baseline sessions remain persisted (`UNI-BASE-004` and `UNI-BASE-PROVISIONAL`) and contain `condition_baseline`; canonical `DISCOVERY-R3` sessions do not. `discovery-snapshot-handoff.js` may therefore read legacy dimension-shaped evidence only as a bounded historical compatibility path. New Discovery snapshots must emit signal-native evidence and must not write `condition_baseline`, `baseline_summary`, or other Baseline-stage output shapes. The historical adapter can be deleted only after those persisted records are migrated or intentionally retired and no supported reader depends on them.
