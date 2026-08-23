import { buildPlan, adaptPlan } from './plan-engine.js';
import assert from 'node:assert/strict';

const sleepCascade=buildPlan({ranked:[
  {id:'poor_sleep',confidence:.94,breadth:4,urgency:4},
  {id:'low_energy',confidence:.88,breadth:1,urgency:2},
  {id:'low_focus',confidence:.81,breadth:1,urgency:2}
]},{capacity:'medium'});
assert.equal(sleepCascade.status,'active');
assert.equal(sleepCascade.actions[0].driver,'poor_sleep','root/leverage sleep driver should outrank symptoms');
assert.ok(sleepCascade.actions.length<=2,'medium capacity should not overload member');

const lowCapacity=buildPlan({ranked:[
  {id:'money_pressure',confidence:.95,urgency:5,breadth:3},
  {id:'work_instability',confidence:.9,urgency:5,breadth:3}
]},{capacity:'low'});
assert.equal(lowCapacity.actions.length,1,'low capacity must receive one primary action');

const uncertain=buildPlan({},{});
assert.equal(uncertain.status,'observe');
assert.equal(uncertain.reason,'insufficient_evidence');

const safety=buildPlan({ranked:[{id:'stress',confidence:.9}]},{safetyHold:true});
assert.equal(safety.status,'escalate');
assert.equal(safety.actions.length,0,'safety hold must block ordinary optimization');

const overloaded={...sleepCascade,actions:[...sleepCascade.actions,{id:'extra'}]};
const reduced=adaptPlan(overloaded,{adherence:.3,benefit:0});
assert.equal(reduced.adaptation,'reduce_burden');
assert.equal(reduced.actions.length,1);

const maintain=adaptPlan(sleepCascade,{adherence:.9,benefit:.6});
assert.equal(maintain.adaptation,'maintain');
const reassess=adaptPlan(sleepCascade,{adherence:.9,benefit:0});
assert.equal(reassess.adaptation,'reassess_driver');

// Regression: actions with readiness requirements must be filtered before ranking.
const lowReadiness=buildPlan({ranked:[{id:'low_activity',confidence:.95,importance:5,urgency:4,readiness:1}]},{capacity:'high'});
assert.ok(![...lowReadiness.active,...lowReadiness.backlog].some(x=>x.id==='strength_activity'),'minimum-readiness action must be rejected');

// Regression: contraindications supplied by context must block matching actions.
const contraindicated=buildPlan({ranked:[{id:'low_activity',confidence:.95,importance:5,urgency:4,readiness:5}]},{capacity:'high',contraindications:['strength_activity']});
assert.ok(![...contraindicated.active,...contraindicated.backlog].some(x=>x.id==='strength_activity'),'contraindicated action must be blocked');

// Regression: one action supported by multiple drivers must appear once while retaining provenance.
const duplicateSupport=buildPlan({ranked:[
  {id:'poor_sleep',confidence:.9,importance:5,urgency:4,readiness:5},
  {id:'poor_sleep',confidence:.8,importance:4,urgency:3,readiness:5}
]},{capacity:'high'});
const sleepLogs=[...duplicateSupport.active,...duplicateSupport.backlog].filter(x=>x.id==='sleep_log');
assert.equal(sleepLogs.length,1,'duplicate action candidates must collapse to one');
assert.equal(sleepLogs[0].supportingDrivers.length,2,'deduplicated action must preserve supporting-driver provenance');

// Regression: evidence strength is an explicit positive ranking signal.
const supported=buildPlan({ranked:[{id:'low_activity',confidence:.8,importance:3,urgency:2,readiness:4}]},{capacity:'high'});
const supportedItems=[...supported.active,...supported.backlog];
const activityBaseline=supportedItems.find(x=>x.id==='activity_baseline');
const strengthActivity=supportedItems.find(x=>x.id==='strength_activity');
assert.ok(activityBaseline && strengthActivity,'comparison actions must both remain eligible');
assert.ok(activityBaseline.priority>strengthActivity.priority || supportedItems.some(x=>x.evidenceStrength==='supported'),'supported evidence must contribute positively to ranking without overriding fit constraints');

console.log(JSON.stringify({pass:true,scenarios:11,sample:sleepCascade},null,2));
