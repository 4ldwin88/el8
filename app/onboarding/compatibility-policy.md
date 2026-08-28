# Onboarding compatibility policy

Canonical onboarding begins at `discovery-snapshot.html`. `assessment.html` exists only as a legacy URL redirect and must not contain assessment logic, decision logic, or member-facing Baseline-stage semantics.

Legacy onboarding status aliases in `flow.js` are read-only migration inputs. They may route an existing profile into the canonical Discovery → Focus → Plan journey, but they must not define new lifecycle states or decision authority.

The legacy `el8_baseline_discovery_handoff` session fallback has been retired. Discovery now reads only `el8_discovery_snapshot_handoff`. Legacy persisted evidence shapes may still be interpreted by explicitly bounded compatibility adapters where required, but obsolete browser-session keys must not be reintroduced.
