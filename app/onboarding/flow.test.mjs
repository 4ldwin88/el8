import assert from 'node:assert/strict';
import {ONBOARDING_STATES,normalizeOnboardingState,onboardingRoute,nextOnboardingState} from './flow.js';

assert.equal(normalizeOnboardingState('completed'),ONBOARDING_STATES.COMPLETE,'database completed status must remain completed');
assert.equal(onboardingRoute({onboarding_status:'completed'}),'home.html','completed members must reopen directly into the main app');
assert.equal(onboardingRoute({onboarding_status:'not_started'}),'discovery-snapshot.html','new members start with the opening Discovery snapshot');
assert.equal(onboardingRoute({onboarding_status:'in_progress'}),'discovery-snapshot.html','durable in-progress onboarding resumes at the Discovery entry point');
assert.equal(onboardingRoute({onboarding_status:'safety_paused'}),'safety-hold.html','safety pause must remain durable');
assert.equal(onboardingRoute({onboarding_status:'onboarded'}),'discovery-snapshot.html','obsolete completed aliases fail safely to canonical Discovery entry');
assert.equal(onboardingRoute({onboarding_status:'baseline_complete'}),'discovery-snapshot.html','obsolete granular states cannot restore historical stage routing');
assert.equal(nextOnboardingState('not_started'),'in_progress','starting onboarding uses the valid durable database state');
console.log('durable onboarding routing regression tests passed');
