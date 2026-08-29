# Member onboarding

Canonical new-member journey:

Sign up → Discovery opening snapshot → Adaptive Discovery → canonical Member State baseline → Prioritization + member decision → canonical Planning → plan-specific evidence only when required → Initial Plan confirmation → Account preferences → App introduction → Home

The opening snapshot and adaptive investigation are one Discovery process. Baseline is the immutable initial Member State snapshot established from completed Discovery before Prioritization; it is not a separate questionnaire or member-confirmation stage.

Returning authenticated members bypass authentication and resume the first incomplete required state; fully onboarded members go directly to Home.

## Responsibilities

- Authentication collects only required account identity/access fields.
- Discovery begins with a short broad life-status matrix. This preserves broad coverage without requiring members to understand the eight dimensions and without producing an aggregate wellness score.
- The opening snapshot seeds candidate concerns and context for adaptive Discovery. It does not select priorities or interventions.
- `discovery-runtime.js` adapts the canonical Discovery intelligence for onboarding rather than duplicating Discovery logic. Adaptive questioning, concern resolution, sufficiency and concern-state projection stay in `intelligence/discovery/`.
- Discovery establishes concern/context evidence and hands completed evidence/state forward. It does not own final prioritization or intervention selection.
- Projection of completed Discovery into canonical Member State establishes the immutable initial baseline snapshot before Prioritization. Subsequent observations update current state and history rather than rewriting that baseline.
- Canonical Prioritization determines the ordered supported problems using explicit evidence-backed decision factors. Member decisions are recorded separately: members can accept, reject, postpone or pause a proposed priority, and may choose no active plan rather than having readiness or capacity inferred from that choice.
- Canonical Planning alone owns intervention selection. Browser adapters translate canonical Member State/priorities into Planning inputs; they must not create a second planning engine or manufacture missing capacity/feasibility semantics.
- Selection evidence is requested only when it can change which eligible intervention is selected. Activation/deepening evidence is separate and is requested only when the selected intervention requires additional evidence before safe/appropriate activation.
- Final confirmation rebuilds the plan from canonical inputs. Persistence independently enforces activation readiness; unresolved selection/deepening requirements, non-active plans, missing interventions, or a Safety hold cannot be persisted as an active plan.
- The member accepts the plan before preferences/introduction when a plan is activated. Choosing no active plan must remain a valid member decision and must not block access to the member experience.
- Account preferences are collected after the plan decision.
- App introduction is brief and explains Home, Plan, Track, Insights and Explore.
- Home is the terminal onboarding destination.

## Safety authority

Safety is a cross-stage interrupt, not a normal sequential onboarding screen and not a Planning score. Ordinary Discovery evidence may surface contextual indicators. Contextual indicators can require proportionate clarification but do not by themselves establish acute risk. Canonical Safety can pause ordinary Discovery, Prioritization, Planning, activation and Review. A negative direct confirmation does not erase unresolved contextual evidence. When canonical Safety requires escalation, ordinary recommendations cannot outrank it.

## Review and adaptation

After activation, execution/check-in evidence is interpreted by canonical Review. Review can keep, simplify, replace, deepen or reassess, while Safety pre-empts ordinary adaptation. Adaptation returns evidence to Planning or focused Discovery/Reassessment as appropriate; it must not silently mutate an active plan against stale assumptions.

## Tracking relationship

Tracking is not a separate onboarding stage. Discovery and an active plan determine what evidence is useful. After onboarding, the global Track surface remains available while plan-specific Quick Logs are derived from active-plan evidence needs.

Do not create parallel onboarding state machines or parallel intelligence semantics. `flow.js` is the canonical client routing contract; persisted profile, Discovery, Member State and plan state remain authoritative. `assessment.html` is compatibility-only and must redirect to the Discovery snapshot rather than becoming a second assessment path.
