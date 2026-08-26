import assert from 'node:assert/strict';
import {ONBOARDING_STATES,normalizeOnboardingState,onboardingRoute,nextOnboardingState} from './flow.js';

assert.equal(normalizeOnboardingState('completed'),ONBOARDING_STATES.COMPLETE,'database completed status must remain completed');
assert.equal(onboardingRoute({onboarding_status:'completed'}),'home.html','completed members must reopen directly into the main app');
assert.equal(onboardingRoute({onboarding_status:'not_started'}),'assessment.html?v=3','new members start at baseline');
assert.equal(onboardingRoute({onboarding_status:'in_progress'}),'assessment.html?v=3','durable in-progress onboarding resumes at the onboarding entry point');
assert.equal(onboardingRoute({onboarding_status:'safety_paused'}),'safety-hold.html','safety pause must remain durable');
assert.equal(onboardingRoute({onboarding_status:'onboarded'}),'home.html','legacy completed alias remains readable');
assert.equal(onboardingRoute({onboarding_status:'baseline_complete'}),'discovery.html','legacy granular states remain readable during migration');
assert.equal(nextOnboardingState('not_started'),'in_progress','starting onboarding uses the valid durable database state');
console.log('durable onboarding routing regression tests passed');
