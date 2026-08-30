# Member onboarding

Canonical new-member journey:

Sign up → Discovery (Orient → Narrow → Deepen/Fit → Sufficient/Handoff) → member confirms starting Focus → canonical Planning → plan-specific evidence only when required → Initial Plan confirmation → Account preferences → App introduction → Home

Discovery begins immediately after sign-up. There is no separate pre-Discovery assessment or onboarding stage. Broad opening questions are part of Discovery itself. Historical reference measurements may be recorded longitudinally after evidence is established; they are not an entry gate or a separate decision stage.

Returning authenticated members bypass authentication and resume the first incomplete required state; fully onboarded members go directly to Home.

## Responsibilities

- Authentication collects only required account identity/access fields.
- Discovery begins with broad orientation and narrows adaptively. This preserves broad coverage without requiring members to understand the eight dimensions and without producing an aggregate wellness score.
- Opening Discovery evidence can activate candidate concerns and context. It does not select priorities or interventions.
- `discovery-runtime.js` adapts the canonical Discovery intelligence for onboarding rather than duplicating Discovery logic. Adaptive questioning, triage, resolution and concern-state projection stay in `intelligence/discovery/`.
- Discovery establishes concern/context evidence and evidence confidence. It does not own intervention selection.
- Prioritization identifies the smallest useful Focus set; the member confirms the starting Focus before Planning. Member agency is an explicit gate.
- Completed Discovery plus confirmed Focus projects into canonical Member State. Subsequent observations update current state and longitudinal history without inventing precision.
- Canonical Planning alone owns Action selection. Browser adapters translate Discovery/Member State into canonical Planning inputs; they must not create a second planning engine.
- Selection evidence is requested only when it can change which eligible Action is selected. Activation/deepening evidence is separate and is requested only when the selected Action requires additional evidence before safe/appropriate activation.
- Final confirmation rebuilds the Plan from canonical inputs. Persistence independently enforces activation readiness; unresolved selection/deepening requirements, non-active plans, missing Actions, or a Safety hold cannot be persisted as an active Plan.
- The member accepts the Plan before preferences/introduction.
- Account preferences are collected after Plan acceptance.
- App introduction is brief and explains Home, Plan, Track, Insights and Explore.
- Home is the terminal onboarding destination.

## Safety authority

Safety is a cross-stage interrupt, not a normal sequential onboarding screen and not a Planning score. Ordinary Discovery evidence may surface contextual indicators. Contextual indicators can require proportionate clarification but do not by themselves establish acute risk. Canonical Safety can pause ordinary Discovery, Planning, activation and Review. A negative direct confirmation does not erase unresolved contextual evidence. When canonical Safety requires escalation, ordinary recommendations cannot outrank it.

## Review and adaptation

After activation, execution/check-in evidence is interpreted by canonical Review. Review can keep, simplify, replace, deepen or reassess, while Safety pre-empts ordinary adaptation. Adaptation returns evidence to Planning or focused Discovery/Reassessment as appropriate; it must not silently mutate an active Plan against stale assumptions.

## Tracking relationship

Tracking is not a separate onboarding stage. Discovery and the accepted Plan determine what evidence is useful. After onboarding, the global Track surface remains available while plan-specific Quick Logs are derived from active-Plan evidence needs.

Do not create parallel onboarding state machines or parallel intelligence semantics. `flow.js` is the canonical client routing contract; persisted profile, Discovery, Member State and Plan state remain authoritative.
