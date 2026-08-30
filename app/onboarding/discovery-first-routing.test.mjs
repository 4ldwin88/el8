import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {onboardingRoute} from './flow.js';

test('canonical onboarding begins with the Discovery snapshot',()=>{
 assert.equal(onboardingRoute({onboarding_status:'not_started'}),'discovery-snapshot.html');
 assert.equal(onboardingRoute({onboarding_status:'in_progress'}),'discovery-snapshot.html');
});

test('member journey does not present Baseline as a separate stage',()=>{
 for(const file of ['discovery-snapshot.html','discovery.html','proposed-priorities.html','plan-proposal.html']){
  const html=fs.readFileSync(new URL(`../../${file}`,import.meta.url),'utf8');
  assert.ok(!html.includes('<span>Baseline</span>'),`${file} must not present Baseline as a separate stage`);
 }
});
