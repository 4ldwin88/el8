import assert from 'node:assert/strict';
import { buildCanonicalPlan } from './canonical-plan-engine.js';
const focus=id=>({constructId:id,decision:'accepted',decidedAt:'2026-08-30T16:30:00Z'});
const input={memberStateRevision:8,focuses:[focus('SLEEP_QUALITY'),focus('ACTIVITY_LEVEL'),focus('FINANCIAL_STRAIN')],evidenceRefs:[],constraintRefs:['c1'],safetyDisposition:'ordinary_flow'};
let plan=buildCanonicalPlan(input,{now:'2026-08-30T16:31:00Z'});
assert.equal(plan.schemaVersion,'2.0.0');assert.equal(plan.status,'proposed');
assert.equal(plan.focusIds.length,3);assert.equal(plan.proposedActions.length,3); // no Primary + Supporting cap
assert.deepEqual(plan.uncoveredFocusIds,[]);
assert.ok(plan.proposedActions.every(a=>a.trackingRequirement));
assert.ok(plan.proposedActions.every(a=>a.iconKey));
assert.ok(plan.proposedActions.every(a=>a.permittedRationaleClaim));
assert.equal(plan.proposedActions.some(a=>a.intervention_id||a.problemId||a.problem_id),false);

const tight=buildCanonicalPlan(input,{burdenBudget:1,now:'2026-08-30T16:31:00Z'});
assert.ok(tight.proposedActions.length<3);assert.ok(tight.uncoveredFocusIds.length>0);assert.equal(tight.burden.budget,1);

const preferred=buildCanonicalPlan({memberStateRevision:1,focuses:[focus('ACTIVITY_LEVEL')],evidenceRefs:[],constraintRefs:[],safetyDisposition:'ordinary_flow'},{preferredActionIds:['PHY-006']});
assert.equal(preferred.proposedActions[0].actionId,'PHY-006');

const rejected=buildCanonicalPlan({memberStateRevision:1,focuses:[focus('ACTIVITY_LEVEL')],evidenceRefs:[],constraintRefs:[],safetyDisposition:'ordinary_flow'},{rejectedActionIds:['PHY-006','PHY-007']});
assert.equal(rejected.proposedActions.some(a=>['PHY-006','PHY-007'].includes(a.actionId)),false);

const blocked=buildCanonicalPlan(input,{registry:undefined});
assert.equal(blocked.status,'proposed');
const safety=buildCanonicalPlan({...input,safetyDisposition:'pause_ordinary_flow'});assert.equal(safety.status,'blocked');assert.equal(safety.reason,'safety_override');
assert.throws(()=>buildCanonicalPlan({...input,focuses:[{...focus('SLEEP_QUALITY'),decision:'rejected'}]}),/member-accepted Focus/);

const planLevel=buildCanonicalPlan({memberStateRevision:2,focuses:[focus('ACTIVITY_LEVEL')],evidenceRefs:[],constraintRefs:[],safetyDisposition:'ordinary_flow'},{planningConditions:['reduce_simultaneous_demands'],preferredActionIds:['XDM-001']});
assert.ok(planLevel.proposedActions.some(a=>a.actionId==='XDM-001'));

console.log('Canonical Planning v2 uses confirmed Focus, Action Registry, burden budget and no fixed count semantics');
