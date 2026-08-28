# Onboarding compatibility policy

Canonical onboarding begins at `discovery-snapshot.html`. `assessment.html` exists only as a legacy URL redirect and must not contain assessment logic, decision logic, or member-facing Baseline-stage semantics.

Legacy onboarding status aliases in `flow.js` are read-only migration inputs. They may route an existing profile into the canonical Discovery → Focus → Plan journey, but they must not define new lifecycle states or decision authority.

The legacy `el8_baseline_discovery_handoff` session key is a temporary read fallback for sessions created before the Discovery snapshot rename. New writes use `el8_discovery_snapshot_handoff`. Delete the fallback after the compatibility window closes and no supported session can still depend on the old key.
