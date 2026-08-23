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

console.log(JSON.stringify({pass:true,scenarios:7,sample:sleepCascade},null,2));
