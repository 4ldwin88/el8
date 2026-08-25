# Member onboarding

Canonical new-member journey:

Sign up → Universal Baseline → Discovery → Plan proposal → Plan acceptance → Account preferences → App introduction → Home

Returning authenticated members bypass authentication and resume the first incomplete required state; fully onboarded members go directly to Home.

## Responsibilities

- Authentication collects only required account identity/access fields: name, email, birthdate, country/timezone, password and matching password confirmation.
- Universal Baseline is short and broad. It establishes an approximate starting condition across all eight dimensions.
- Discovery is adaptive. It uses baseline/member evidence to investigate what is important enough to affect prioritization and planning without unnecessary burden.
- Planning proposes a deliberately small first plan: normally 1–2 interventions/actions plus an explicit 1- or 2-week review horizon.
- The member accepts the plan before preferences/introduction.
- Account preferences are collected after plan acceptance.
- App introduction is brief and explains Home, Plan, Track, Insights and Explore.
- Home is the terminal onboarding destination.
- Safety is an interrupt across Baseline/Discovery rather than a normal sequential onboarding screen.

Do not create parallel onboarding state machines. `flow.js` is the canonical client routing contract; persisted profile/assessment/plan state remains authoritative.