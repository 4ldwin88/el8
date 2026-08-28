# Onboarding compatibility policy

Canonical onboarding begins at `discovery-snapshot.html`. `assessment.html` exists only as a legacy URL redirect and must not contain assessment logic, decision logic, or member-facing Baseline-stage semantics.

The production profile table was audited before retiring granular onboarding-status aliases: all persisted profiles used the canonical `completed` state. `flow.js` therefore accepts only the canonical lifecycle states (`not_started`, `in_progress`, `completed`, `safety_paused`); unknown or obsolete values safely normalize to `not_started` rather than restoring historical stage routing.

The legacy `el8_baseline_discovery_handoff` session fallback has been retired. Discovery now reads only `el8_discovery_snapshot_handoff`. Legacy persisted evidence shapes may still be interpreted by explicitly bounded compatibility adapters where required, but obsolete browser-session keys must not be reintroduced.
