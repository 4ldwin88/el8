import assert from 'node:assert/strict';
import {projectOnboardingMemberState} from './member-state-projection.js';
import {canonicalPlanningInputFromBrowser} from './browser-planning-adapter.js';

const discoveryOutput={
 baselineHandoff:null,
 trace:{states:[{
  concernId:'money',resolutionState:'established',excluded:false,
  evidenceRefs:['M3','M9'],
  feasibility:{constraints:['limited_budget'],supports:[],values:{costSensitivity:'high'},evidenceRefs:['M9']}
 },{
  concernId:'health',resolutionState:'established',excluded:false,
  evidenceRefs:['PH0','PH2A'],
  feasibility:{constraints:['limited_budget','mobility_accessibility'],supports:[],values:{costSensitivity:'high',accessibilityNeeds:true},evidenceRefs:['PH2A']}
 }]}
};

const member=projectOnboardingMemberState({memberId:'qa-member',discoveryOutput,now:'2026-08-29T00:00:00.000Z'});
assert.equal(member.profile.preferences.costSensitivity,'high','interactive Discovery cost sensitivity must reach Member State');
assert.ok(member.profile.constraints.includes('limited_budget'),'interactive Discovery budget constraint must reach Member State');
assert.ok(member.profile.constraints.includes('mobility_accessibility'),'interactive Discovery accessibility constraint must reach Member State');
assert.ok(member.profile.accessibilityNeeds.includes('mobility_accessibility'),'interactive Discovery accessibility need must be explicit in Member State');

const planning=canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities:['problem:financial_strain','problem:low_activity'],memberStateRevision:member.revision});
assert.equal(planning.constraints.feasibility.costSensitivity,'high','interactive Discovery cost sensitivity must reach Planning');
assert.equal(planning.constraints.feasibility.accessibilityNeeds,true,'interactive Discovery accessibility signal must reach Planning');
assert.ok(planning.constraints.profile.includes('limited_budget'),'interactive Discovery budget constraint must reach Planning');
assert.ok(planning.constraints.profile.includes('mobility_accessibility'),'interactive Discovery accessibility constraint must reach Planning');
console.log('Discovery interactive feasibility propagates through Member State into Planning');
