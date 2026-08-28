# Intelligence QA

Canonical internal QA surface for Intelligence v0.1.

## Development order

Develop and validate the canonical product process **internally first**. The immediate product boundary is **Discovery → Member State → Prioritization/member choice → Planning → proposed Plan**. This is not an external-test implementation boundary; it is the real Intelligence process being hardened before publication.

The opening snapshot is evidence collection within Discovery, not a Baseline assessment. Completed Discovery establishes the immutable initial baseline snapshot inside canonical Member State. Prioritization and Planning occur afterward and must not establish or rewrite baseline.

Internal QA should answer: **Can EL8 understand the member well enough to recommend the right focus and a plan they would actually follow?** It must preserve enough telemetry to diagnose Discovery, Prioritization, and Planning separately: questions shown/skipped, answers, branching and resolution, evidence/provenance, Member State, recommendation factors, member choices/disagreement, proposed Plan, tester notes, timing, and relevant decision traces.

Internal QA may expose QA-only controls such as **Exit test**, notes, accelerated scenarios, and diagnostics. These controls are not part of the member-facing product process.

## External test snapshot

Only after the internal Discovery-to-Plan process is coherent, focused QA passes, and canonical repository QA passes should a frozen external test candidate be cut from that working process. The external test is a publication snapshot/adaptor of the validated canonical flow, not the place where the flow is developed.

The external snapshot should validate **Discovery → Member State → Prioritization/member choice → Planning → proposed Plan** and end there. It must not activate the plan or ask external testers to simulate Action/Outcome Evidence, Review, Learning, Adaptation, or Reassessment. It should not expose internal QA controls such as **Exit test**.

Once external testing begins, do not change that frozen candidate underneath testers; material changes require an intentional new Intelligence version.

## Internal full-loop E2E

The internal accelerated harness also preserves the complete canonical loop: **Discovery → Member State → Prioritization → Planning → Action/Outcome Evidence → Review → durable Learning → Planning or focused Reassessment** with Safety cross-cutting. Work already implemented beyond Planning is preserved, but further downstream expansion remains secondary until the internal Discovery-to-Plan process is reliable.

Do not add component-specific version labels or duplicate domain logic in this folder. QA pages are adapters over canonical modules; the canonical Intelligence implementation remains the authority.
