// Canonical EL8 onboarding routing contract.

export const ONBOARDING_STATES = Object.freeze({
  BASELINE: 'baseline_required',
  DISCOVERY: 'discovery_required',
  PLAN: 'plan_required',
  PLAN_ACCEPTANCE: 'plan_acceptance_required',
  PREFERENCES: 'preferences_required',
  INTRO: 'introduction_required',
  COMPLETE: 'complete',
  SAFETY_PAUSED: 'safety_paused'
});

export const ONBOARDING_ROUTES = Object.freeze({
  [ONBOARDING_STATES.BASELINE]: 'baseline.html',
  [ONBOARDING_STATES.DISCOVERY]: 'discovery.html',
  [ONBOARDING_STATES.PLAN]: 'plan-proposal.html',
  [ONBOARDING_STATES.PLAN_ACCEPTANCE]: 'plan-proposal.html',
  [ONBOARDING_STATES.PREFERENCES]: 'preferences.html',
  [ONBOARDING_STATES.INTRO]: 'app-introduction.html',
  [ONBOARDING_STATES.COMPLETE]: 'home.html',
  [ONBOARDING_STATES.SAFETY_PAUSED]: 'safety-hold.html'
});

export function normalizeOnboardingState(value) {
  const aliases = {
    new: ONBOARDING_STATES.BASELINE,
    profile_complete: ONBOARDING_STATES.BASELINE,
    baseline_required: ONBOARDING_STATES.BASELINE,
    baseline_complete: ONBOARDING_STATES.DISCOVERY,
    discovery_required: ONBOARDING_STATES.DISCOVERY,
    discovery_complete: ONBOARDING_STATES.PLAN,
    plan_required: ONBOARDING_STATES.PLAN,
    plan_proposed: ONBOARDING_STATES.PLAN_ACCEPTANCE,
    plan_acceptance_required: ONBOARDING_STATES.PLAN_ACCEPTANCE,
    plan_accepted: ONBOARDING_STATES.PREFERENCES,
    preferences_required: ONBOARDING_STATES.PREFERENCES,
    preferences_complete: ONBOARDING_STATES.INTRO,
    introduction_required: ONBOARDING_STATES.INTRO,
    onboarded: ONBOARDING_STATES.COMPLETE,
    complete: ONBOARDING_STATES.COMPLETE,
    safety_paused: ONBOARDING_STATES.SAFETY_PAUSED
  };
  return aliases[value] || ONBOARDING_STATES.BASELINE;
}

export function onboardingRoute(profile = {}) {
  return ONBOARDING_ROUTES[normalizeOnboardingState(profile.onboarding_status)];
}

export function reviewHorizonDays(value) {
  const days = Number(value);
  if (days <= 7) return 7;
  return 14;
}

export function validInitialPlan(interventions = [], reviewDays) {
  return interventions.length >= 1 && interventions.length <= 2 && [7, 14].includes(reviewHorizonDays(reviewDays));
}
