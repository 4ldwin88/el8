# Intelligence QA

Canonical QA surface for Intelligence v0.1.

## Immediate validation boundary

The external Intelligence Test validates **Discovery → Member State → Prioritization/member choice → Planning → proposed Plan**. It ends at the proposed Plan. It does not ask external testers to simulate activation, Action/Outcome Evidence, Review, Learning, Adaptation, or Reassessment.

The opening snapshot is evidence collection within Discovery, not a Baseline assessment. Completed Discovery establishes the immutable initial baseline snapshot inside canonical Member State. Prioritization and Planning occur afterward and must not establish or rewrite baseline.

The external test should answer: **Can EL8 understand the member well enough to recommend the right focus and a plan they would actually follow?**

External-test telemetry must preserve enough information to diagnose Discovery, Prioritization, and Planning separately: questions shown/skipped, answers, branching and resolution, evidence/provenance, Member State, recommendation factors, member choices/disagreement, proposed Plan, tester notes, timing, and relevant decision traces. Every active test page must provide an Exit test control.

Freeze a candidate only after focused internal regression/adversarial QA and canonical repository QA pass. Once external testing begins, do not change that candidate underneath testers; material changes require an intentional new Intelligence test version.

## Internal full-loop E2E

The internal accelerated harness remains responsible for the complete canonical loop: **Discovery → Member State → Prioritization → Planning → Action/Outcome Evidence → Review → durable Learning → Planning or focused Reassessment** with Safety cross-cutting. Work already implemented beyond Planning is preserved, but further downstream expansion is secondary until the external Discovery-to-Plan candidate is reliable.

Do not add component-specific version labels or duplicate domain logic in this folder. Pages are presentation/test adapters over canonical modules.
