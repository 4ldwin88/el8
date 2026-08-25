import assert from 'node:assert/strict';
import {makeObservation} from './contracts.js';
import {deriveConcernState} from './concern-projection.js';
import {buildMemberPlan} from './member-plan.js';

const evidence=(id,questionId,concernId,polarity,strength)=>makeObservation({
  id,questionId,concernId,specificityLevel:2,
  effects:[{type:'evidence',target:concernId,polarity,strength,certainty:'graded',sourceType:'direct',temporality:'current'}],
});

// State is concern/evidence-derived. Evidence in one area must not mutate an unrelated area.
const log=[evidence('m1','M1','money','supports',.8),evidence('m2','M2','money','supports',.4)];
const money=deriveConcernState(log,'money');
const sleep=deriveConcernState(log,'sleep');
assert.ok(money.evidenceConfidence>0);
assert.equal(sleep.evidenceConfidence,0);
assert.equal(sleep.rawEvidenceScore,0);
assert.deepEqual(sleep.evidenceRefs,[]);

// Multiple observations accumulate while retaining traceable evidence references.
assert.equal(money.rawEvidenceScore,1.2);
assert.deepEqual(money.evidenceRefs,['M1','M2']);

// Contradictory evidence changes the projection without deleting the historical evidence trail.
const mixed=[...log,evidence('m3','M3','money','contradicts',.5)];
const revised=deriveConcernState(mixed,'money');
assert.equal(revised.rawEvidenceScore,.7);
assert.deepEqual(revised.evidenceRefs,['M1','M2','M3']);

// Member-facing planning is focused rather than forcing all eight dimensions into the active plan.
const states=[
  {...money,concernId:'money',resolutionState:'sufficient',driverKnown:true,memberImportanceRank:4,memberPrioritySelected:true,safetyEscalationLevel:0,excluded:false},
  {...sleep,concernId:'sleep',resolutionState:'narrowing',driverKnown:false,memberImportanceRank:1,memberPrioritySelected:false,safetyEscalationLevel:0,excluded:false},
  {...sleep,concernId:'stress',resolutionState:'narrowing',driverKnown:false,memberImportanceRank:1,memberPrioritySelected:false,safetyEscalationLevel:0,excluded:false},
];
const plan=buildMemberPlan(states,{maxConcerns:2,library:[]});
assert.equal(plan.focus.length,1);
assert.equal(plan.focus[0].concernId,'money');

console.log('Canonical Discovery state contract regressions passed');
