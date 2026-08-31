// Canonical EL8 onboarding routing contract.
// Discovery owns initial assessment and establishes the evidence used to create Member State.
// The database owns durable lifecycle status; page-specific progress remains client-side.

export const ONBOARDING_STATES=Object.freeze({NOT_STARTED:'not_started',IN_PROGRESS:'in_progress',COMPLETE:'completed',SAFETY_PAUSED:'safety_paused'});
export const ONBOARDING_ROUTES=Object.freeze({[ONBOARDING_STATES.NOT_STARTED]:'discovery.html',[ONBOARDING_STATES.IN_PROGRESS]:'discovery.html',[ONBOARDING_STATES.COMPLETE]:'home.html',[ONBOARDING_STATES.SAFETY_PAUSED]:'safety-hold.html'});
export function normalizeOnboardingState(value){if(value==='completed')return ONBOARDING_STATES.COMPLETE;if(value==='safety_paused')return ONBOARDING_STATES.SAFETY_PAUSED;if(value==='in_progress')return ONBOARDING_STATES.IN_PROGRESS;return ONBOARDING_STATES.NOT_STARTED}
export function onboardingRoute(profile={}){return ONBOARDING_ROUTES[normalizeOnboardingState(profile.onboarding_status)]}
export function nextOnboardingState(current){const state=normalizeOnboardingState(current);return state===ONBOARDING_STATES.NOT_STARTED?ONBOARDING_STATES.IN_PROGRESS:state}
export function reviewHorizonDays(value){const days=Number(value);return days<=7?7:14}
// Plan validity is structural. Canonical Planning owns Action count, burden and composition.
export function validInitialPlan(actions=[],reviewDays){return Array.isArray(actions)&&actions.length>=1&&actions.every(action=>Boolean(action?.actionId||action?.id))&&[7,14].includes(reviewHorizonDays(reviewDays))}
