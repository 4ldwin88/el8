import assert from 'node:assert/strict';
import {planningEvidenceFromDiscovery,buildOnboardingAdaptivePlan,onboardingPlanView} from './adaptive-plan.js';

const discoveryOutput={trace:{states:[
  {concernId:'money_pressure',evidenceConfidence:.82,memberImportance:3,feasibility:{values:{capacity:'medium'}}},
  {concernId:'poor_sleep',evidenceConfidence:.76,memberImportance:2,feasibility:{values:{capacity:'medium'}}},
  {concernId:'low_focus',evidenceConfidence:.2,memberImportance:1}
]}};
const priorities=['money_pressure','poor_sleep'];
const baselineHandoff={signals:{feasibility:{overall_load:'Manageable'}}};

const evidence=planningEvidenceFromDiscovery(discoveryOutput,priorities);
assert.deepEqual(evidence.map(x=>x.id),priorities);
assert.equal(evidence[0].confidence,.82);

const needsSelectionEvidence=buildOnboardingAdaptivePlan({discoveryOutput,recommendedPriorities:priorities,confirmedPriorities:priorities,baselineHandoff});
assert.equal(needsSelectionEvidence.status,'deepen');
assert.equal(needsSelectionEvidence.reason,'selection_evidence_required');
assert.equal(needsSelectionEvidence.active.length,0);
assert.deepEqual(needsSelectionEvidence.selectionDeepening.requirements.map(x=>x.evidenceKey).sort(),['baseline.sleep_pattern','financial.current_snapshot']);
const deepenView=onboardingPlanView(needsSelectionEvidence);
assert.equal(deepenView.status,'deepen');
assert.equal(deepenView.actions.length,0);
assert.equal(deepenView.selectionDeepening.required,true);
assert.equal(deepenView.selectionDeepening.requirements.length,2);

const selectionEvidence={'financial.current_snapshot':'Increase income','baseline.sleep_pattern':'Usually 5–6 hours with an inconsistent bedtime'};
const plan=buildOnboardingAdaptivePlan({discoveryOutput,recommendedPriorities:priorities,confirmedPriorities:priorities,baselineHandoff,selectionEvidence});
assert.equal(plan.status,'active');
assert.ok(plan.active.length>=1&&plan.active.length<=2);
assert.ok(plan.active.every(action=>priorities.includes(action.driver)));
assert.deepEqual(plan.selectionEvidence,selectionEvidence);
assert.ok(['ready','needs_plan_specific_assessment','ready_with_optional_deepening'].includes(plan.activationStatus));
const view=onboardingPlanView(plan);
assert.equal(view.actions.length,plan.active.length);
assert.equal(view.deepening.required,Boolean(plan.deepening?.required));
assert.deepEqual(view.selectionEvidence,selectionEvidence);

const insufficient=buildOnboardingAdaptivePlan({discoveryOutput,recommendedPriorities:['low_focus'],confirmedPriorities:['low_focus']});
assert.equal(insufficient.status,'observe');
assert.equal(insufficient.reason,'insufficient_evidence');

const lowCapacity=buildOnboardingAdaptivePlan({discoveryOutput,recommendedPriorities:priorities,confirmedPriorities:priorities,capacity:'low',selectionEvidence});
assert.equal(lowCapacity.status,'active');
assert.ok(lowCapacity.active.length<=1);

// The onboarding bridge must not drop Review's simple replanning constraints.
const activityDiscovery={trace:{states:[{concernId:'low_activity',evidenceConfidence:.9,memberImportance:3,feasibility:{values:{capacity:'medium'}}}]}};
const activityEvidence={'baseline.activity_level':'Some intentional activity'};
const first=buildOnboardingAdaptivePlan({discoveryOutput:activityDiscovery,recommendedPriorities:['low_activity'],confirmedPriorities:['low_activity'],selectionEvidence:activityEvidence,capacity:'low'});
assert.equal(first.status,'active');
const old=first.active[0];
const replacement=buildOnboardingAdaptivePlan({discoveryOutput:activityDiscovery,recommendedPriorities:['low_activity'],confirmedPriorities:['low_activity'],selectionEvidence:activityEvidence,capacity:'low',rejectedActionIds:[old.id],adaptationConstraint:'different_mechanism',previousMechanisms:[old.mechanism]});
assert.equal(replacement.status,'active');
assert.notEqual(replacement.active[0].id,old.id);
assert.notEqual(replacement.active[0].mechanism,old.mechanism);
const simpler=buildOnboardingAdaptivePlan({discoveryOutput:activityDiscovery,recommendedPriorities:['low_activity'],confirmedPriorities:['low_activity'],selectionEvidence:activityEvidence,capacity:'high',adaptationConstraint:'reduce_burden',previousMaxEffort:Number(old.effort)});
assert.equal(simpler.status,'active');
assert.ok(Number(simpler.active[0].effort)<=Number(old.effort));

console.log('onboarding → canonical Adaptive Plan selection-deepening and Review-constraint tests passed');
