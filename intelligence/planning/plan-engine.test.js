import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, respondToItem, recordProgress, adaptPlan } from './plan-engine.js';

test('buildPlan creates a bounded active plan and backlog',()=>{
 const plan=buildPlan({ranked:[{id:'sleep_irregularity',confidence:.9,memberImportance:5,readiness:4},{id:'low_activity',confidence:.8,memberImportance:4,readiness:4}]},{capacity:'medium'});
 assert.equal(plan.status,'active'); assert.ok(plan.active.length<=2); assert.ok(plan.evidenceUsed.length===2);
});
test('low capacity limits active commitments',()=>{
 const plan=buildPlan({ranked:[{id:'sleep_irregularity',confidence:.9},{id:'low_activity',confidence:.8}]},{capacity:'low'});
 assert.equal(plan.active.length,1);
});
test('safety hold prevents routine planning',()=>{
 const plan=buildPlan({ranked:[{id:'sleep_irregularity',confidence:.9}],safetyHold:true},{});
 assert.equal(plan.status,'escalate'); assert.equal(plan.active.length,0);
});
test('insufficient evidence stays observational',()=>{ assert.equal(buildPlan({},{}).status,'observe'); });
test('respondToItem moves completed item to history and promotes backlog',()=>{
 const plan=buildPlan({ranked:[{id:'sleep_irregularity',confidence:.9},{id:'low_activity',confidence:.8}]},{capacity:'medium'});
 const id=plan.active[0].id; const next=respondToItem(plan,id,{decision:'complete'},{});
 assert.ok(next.history.some(x=>x.id===id)); assert.ok(!next.active.some(x=>x.id===id));
});
test('recordProgress completes cadence target',()=>{
 const plan=buildPlan({ranked:[{id:'sleep_irregularity',confidence:.9}]},{capacity:'low'}); const item=plan.active[0];
 const next=recordProgress(plan,item.id,item.cadence.target,{capacity:'low'}); assert.ok(next.history.some(x=>x.id===item.id));
});
test('adaptPlan responds to adherence and benefit',()=>{
 const plan=buildPlan({ranked:[{id:'sleep_irregularity',confidence:.9}]},{});
 assert.equal(adaptPlan(plan,{adherence:.3}).adaptation,'simplify_or_reschedule');
 assert.equal(adaptPlan(plan,{adherence:.8,benefit:.5}).adaptation,'maintain');
 assert.equal(adaptPlan(plan,{adherence:.8,benefit:0}).adaptation,'reassess');
});
test('Discovery feasibility changes the friction budget used for an action',()=>{
 const base={ranked:[{id:'sleep_irregularity',confidence:.9,readiness:4}]};
 const low=buildPlan({ranked:[{...base.ranked[0],feasibility:{values:{capacity:'low'},constraints:[],supports:[]}}]},{});
 const high=buildPlan({ranked:[{...base.ranked[0],feasibility:{values:{capacity:'high'},constraints:[],supports:[]}}]},{});
 assert.ok(low.active[0].friction.budget < high.active[0].friction.budget);
 assert.equal(low.active[0].feasibilityUsed.values.capacity,'low');
});
test('Discovery feasibility is preserved in plan evidence provenance',()=>{
 const feasibility={values:{scheduleFlexibility:'low'},constraints:['limited_schedule'],supports:['partner_support'],evidenceRefs:['q-fit-1']};
 const plan=buildPlan({ranked:[{id:'low_activity',confidence:.8,readiness:4,feasibility}]},{});
 assert.deepEqual(plan.evidenceUsed[0].feasibility,feasibility);
});
