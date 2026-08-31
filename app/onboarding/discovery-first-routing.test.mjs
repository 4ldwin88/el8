import test from 'node:test';
import assert from 'node:assert/strict';
import {onboardingRoute} from './flow.js';

test('canonical onboarding begins directly with Discovery',()=>{
 assert.equal(onboardingRoute({onboarding_status:'not_started'}),'discovery.html');
 assert.equal(onboardingRoute({onboarding_status:'in_progress'}),'discovery.html');
});
