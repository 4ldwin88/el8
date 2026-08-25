# Member onboarding

Canonical new-member journey:

Sign up → Universal Baseline → Adaptive Discovery → Initial Plan proposal → Plan acceptance → Account preferences → App introduction → Home

Returning authenticated members bypass authentication and resume the first incomplete required state; fully onboarded members go directly to Home.

## Responsibilities

- Authentication collects only required account identity/access fields.
- Universal Baseline is short and broad. It establishes approximate starting evidence across all eight dimensions and then routes to Discovery.
- `discovery-runtime.js` adapts the proven Round 3 intelligence engine for onboarding rather than duplicating Discovery logic. Adaptive questioning, triage, priority resolution, concern-state projection and Member Plan generation stay in `intelligence/discovery/`.
- `plan-proposal-contract.js` converts Discovery's candidate actions into a deliberately small member-controlled first plan: 1–2 selected actions plus a 7- or 14-day review horizon.
- The member accepts the plan before preferences/introduction.
- Account preferences are collected after plan acceptance.
- App introduction is brief and explains Home, Plan, Track, Insights and Explore.
- Home is the terminal onboarding destination.
- Safety is an interrupt across Baseline/Discovery rather than a normal sequential onboarding screen.

## Tracking relationship

Tracking is not a separate onboarding stage. Discovery and the accepted plan determine what evidence is useful. After onboarding, the global Track surface remains available while plan-specific Quick Logs are derived from active-plan evidence needs.

Do not create parallel onboarding state machines. `flow.js` is the canonical client routing contract; persisted profile, assessment and plan state remains authoritative. Legacy root pages may temporarily provide UI during migration, but Universal Baseline must not skip Discovery and jump directly to App Introduction.
