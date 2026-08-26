// Canonical EL8 onboarding routing contract.
// The database owns durable lifecycle status; page-specific progress remains client-side.

export const ONBOARDING_STATES = Object.freeze({NOT_STARTED:'not_started',IN_PROGRESS:'in_progress',COMPLETE:'completed',SAFETY_PAUSED:'safety_paused'});
export const ONBOARDING_ROUTES = Object.freeze({[ONBOARDING_STATES.NOT_STARTED]:'assessment.html?v=3',[ONBOARDING_STATES.IN_PROGRESS]:'assessment.html?v=3',[ONBOARDING_STATES.COMPLETE]:'home.html',[ONBOARDING_STATES.SAFETY_PAUSED]:'safety-hold.html'});
const LEGACY_ROUTES=Object.freeze({new:'assessment.html?v=3',profile_complete:'assessment.html?v=3',baseline_required:'assessment.html?v=3',baseline_complete:'discovery.html',discovery_required:'discovery.html',discovery_complete:'plan-proposal.html',plan_required:'plan-proposal.html',plan_proposed:'plan-proposal.html',plan_acceptance_required:'plan-proposal.html',plan_accepted:'app-introduction.html',preferences_required:'app-introduction.html',preferences_complete:'app-introduction.html',introduction_required:'app-introduction.html',onboarded:'home.html',complete:'home.html'});
export function normalizeOnboardingState(value){if(value==='completed'||value==='complete'||value==='onboarded')return ONBOARDING_STATES.COMPLETE;if(value==='safety_paused')return ONBOARDING_STATES.SAFETY_PAUSED;if(value==='in_progress')return ONBOARDING_STATES.IN_PROGRESS;return ONBOARDING_STATES.NOT_STARTED}
export function onboardingRoute(profile={}){const raw=profile.onboarding_status;if(LEGACY_ROUTES[raw])return LEGACY_ROUTES[raw];return ONBOARDING_ROUTES[normalizeOnboardingState(raw)]}
export function nextOnboardingState(current){const state=normalizeOnboardingState(current);return state===ONBOARDING_STATES.NOT_STARTED?ONBOARDING_STATES.IN_PROGRESS:state}
export function reviewHorizonDays(value){const days=Number(value);return days<=7?7:14}
export function validInitialPlan(interventions=[],reviewDays){return interventions.length>=1&&interventions.length<=2&&[7,14].includes(reviewHorizonDays(reviewDays))}
