import { buildPlan, adaptPlan } from './plan-engine.js';
import assert from 'node:assert/strict';

const sleepCascade=buildPlan({ranked:[{id:'poor_sleep',confidence:.94,breadth:4,urgency:4},{id:'low_energy',confidence:.88,breadth:1,urgency:2},{id:'low_focus',confidence:.81,breadth:1,urgency:2}]},{capacity:'medium'});
assert.equal(sleepCascade.status,'active');
assert.equal(sleepCascade.actions[0].driver,'poor_sleep','root/leverage sleep driver should outrank symptoms');
assert.ok(sleepCascade.actions.length<=2,'medium capacity should not overload member');
const lowCapacity=buildPlan({ranked:[{id:'money_pressure',confidence:.95,urgency:5,breadth:3},{id:'work_instability',confidence:.9,urgency:5,breadth:3}]},{capacity:'low'});
assert.equal(lowCapacity.actions.length,1,'low capacity must receive one primary action');
const uncertain=buildPlan({},{}); assert.equal(uncertain.status,'observe');
const safety=buildPlan({ranked:[{id:'stress',confidence:.9}]},{safetyHold:true}); assert.equal(safety.status,'escalate');
assert.equal(adaptPlan(sleepCascade,{adherence:.9,benefit:.6}).adaptation,'maintain');
assert.equal(adaptPlan(sleepCascade,{adherence:.9,benefit:0}).adaptation,'reassess');
assert.equal(adaptPlan(sleepCascade,{adherence:.3,benefit:0}).adaptation,'simplify_or_reschedule');
const lowReadiness=buildPlan({ranked:[{id:'low_activity',confidence:.95,importance:5,urgency:4,readiness:1}]},{capacity:'high'});
assert.ok(![...lowReadiness.active,...lowReadiness.backlog].some(x=>x.id==='strength_activity'));
const duplicateSupport=buildPlan({ranked:[{id:'poor_sleep',confidence:.9},{id:'poor_sleep',confidence:.8}]},{capacity:'high'});
assert.equal([...duplicateSupport.active,...duplicateSupport.backlog].filter(x=>x.id==='sleep_log').length,1);

// H1 human-test regressions: general rules, not Member Zero answer matching.
const h1=buildPlan({ranked:[
  {id:'work_instability',confidence:1.34},
  {id:'money_pressure',confidence:1.34},
  {id:'physical_condition',confidence:1.216},
  {id:'low_activity',confidence:.669},
  {id:'low_activation',confidence:.658},
  {id:'poor_sleep',confidence:.576},
  {id:'low_energy',confidence:.544},
  {id:'stress',confidence:.507},
  {id:'low_focus',confidence:.022},
  {id:'low_support',confidence:0},
  {id:'home_instability',confidence:0},
  {id:'lack_direction',confidence:0}
]},{capacity:'medium',recentAdherence:.6});
const h1Items=[...h1.active,...h1.backlog];
assert.ok(h1.evidenceUsed.every(x=>x.confidence>=0&&x.confidence<=1),'normalized confidence must remain on a 0–1 scale');
assert.ok(h1Items.every(x=>x.confidence>=.15),'backlog must contain plausible member-specific evidence, not zero-evidence library inventory');
assert.ok(!h1Items.some(x=>['support_map','home_stability_step','values_prompt'].includes(x.id)),'unsupported domains must not leak into backlog');
assert.ok(h1.active.some(x=>x.type==='intervention'),'high-confidence actionable evidence should normally surface at least one intervention rather than only measurements');
assert.ok(h1Items.find(x=>x.id==='income_action')?.priority > h1Items.find(x=>x.id==='work_barrier_snapshot')?.priority,'high-confidence work evidence should favor an actionable next step over redundant measurement');

console.log(JSON.stringify({pass:true,scenarios:15,sample:sleepCascade,h1Active:h1.active.map(x=>x.id)},null,2));
