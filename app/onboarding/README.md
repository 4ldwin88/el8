# Member onboarding

Canonical new-member journey:

Sign up → Universal Baseline → Adaptive Discovery → member confirms starting focus → canonical Planning → plan-specific evidence only when required → Initial Plan confirmation → Account preferences → App introduction → Home

Returning authenticated members bypass authentication and resume the first incomplete required state; fully onboarded members go directly to Home.

## Responsibilities

- Authentication collects only required account identity/access fields.
- Universal Baseline is short and broad. It establishes approximate starting evidence across all eight dimensions and then routes to Discovery. Baseline does not select interventions.
- `discovery-runtime.js` adapts the canonical Discovery intelligence for onboarding rather than duplicating Discovery logic. Adaptive questioning, triage, priority resolution and concern-state projection stay in `intelligence/discovery/`.
- Discovery establishes concern/context evidence. It does not own intervention selection.
- The member confirms the starting focus before Planning. Member choice is explicit evidence, not an inferred ranking signal.
- `adaptive-plan.js` and the canonical Discovery → Planning handoff feed Discovery evidence into `intelligence/planning/plan-engine.js`. Planning alone owns intervention selection.
- Selection evidence is requested only when it can change which eligible intervention is selected. Activation/deepening evidence is separate and is requested only when the selected intervention requires additional evidence before safe/appropriate activation.
- Final confirmation rebuilds the plan from canonical inputs. `persistence.js` independently enforces activation readiness; unresolved selection/deepening requirements, non-active plans, missing interventions, or a Safety hold cannot be persisted as an active plan.
- The member accepts the plan before preferences/introduction.
- Account preferences are collected after plan acceptance.
- App introduction is brief and explains Home, Plan, Track, Insights and Explore.
- Home is the terminal onboarding destination.

## Safety authority

Safety is a cross-stage interrupt, not a normal sequential onboarding screen and not a Planning score. Ordinary Baseline/Discovery evidence may surface contextual indicators. Contextual indicators can require proportionate clarification but do not by themselves establish acute risk. Canonical Safety can pause ordinary Discovery, Planning, activation and Review. A negative direct confirmation does not erase unresolved contextual evidence. When canonical Safety requires escalation, ordinary recommendations cannot outrank it.

## Review and adaptation

After activation, execution/check-in evidence is interpreted by canonical Review. Review can keep, simplify, replace, deepen or reassess, while Safety pre-empts ordinary adaptation. Adaptation returns evidence to Planning or Discovery as appropriate; it must not silently mutate an active plan against stale assumptions.

## Tracking relationship

Tracking is not a separate onboarding stage. Discovery and the accepted plan determine what evidence is useful. After onboarding, the global Track surface remains available while plan-specific Quick Logs are derived from active-plan evidence needs.

Do not create parallel onboarding state machines or parallel intelligence semantics. `flow.js` is the canonical client routing contract; persisted profile, assessment and plan state remains authoritative. Legacy root pages may temporarily provide UI during migration, but Universal Baseline must not skip Discovery and jump directly to Planning or App Introduction.
