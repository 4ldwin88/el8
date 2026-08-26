import assert from 'node:assert/strict';
import {planningEvidenceFromDiscovery,buildOnboardingAdaptivePlan,onboardingPlanView} from './adaptive-plan.js';

const discoveryOutput={trace:{states:[
  {concernId:'money_pressure',evidenceConfidence:.82,memberImportance:3,feasibility:{values:{capacity:'medium'}}},
  {concernId:'poor_sleep',evidenceConfidence:.76,memberImportance:2,feasibility:{values:{capacity:'medium'}}},
  {concernId:'low_focus',evidenceConfidence:.2,memberImportance:1}
]}};

const evidence=planningEvidenceFromDiscovery(discoveryOutput,['money_pressure','poor_sleep']);
assert.deepEqual(evidence.map(x=>x.id),['money_pressure','poor_sleep']);
assert.equal(evidence[0].confidence,.82);

const plan=buildOnboardingAdaptivePlan({discoveryOutput,confirmedPriorities:['money_pressure','poor_sleep'],baselineHandoff:{signals:{feasibility:{overall_load:'Manageable'}}}});
assert.equal(plan.status,'active');
assert.ok(plan.active.length>=1&&plan.active.length<=2);
assert.ok(plan.active.every(action=>['money_pressure','poor_sleep'].includes(action.driver)));
assert.ok(['ready','needs_plan_specific_assessment','ready_with_optional_deepening'].includes(plan.activationStatus));
const view=onboardingPlanView(plan);
assert.equal(view.actions.length,plan.active.length);
assert.equal(view.deepening.required,Boolean(plan.deepening?.required));

const insufficient=buildOnboardingAdaptivePlan({discoveryOutput,confirmedPriorities:['low_focus']});
assert.equal(insufficient.status,'observe');
assert.equal(insufficient.reason,'insufficient_evidence');

const lowCapacity=buildOnboardingAdaptivePlan({discoveryOutput,confirmedPriorities:['money_pressure','poor_sleep'],capacity:'low'});
assert.ok(lowCapacity.active.length<=1);

console.log('onboarding → canonical Adaptive Plan bridge tests passed');
