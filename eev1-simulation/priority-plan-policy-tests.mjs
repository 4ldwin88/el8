import assert from 'node:assert/strict';
import {orderPriorityCandidates,selectInitialFocuses,composeInitialPlan,PRIORITY_POLICY} from './priority-plan-policy.js';
const S=(strength=1)=>({type:'evidence',polarity:'supports',strength,sourceType:'direct',certainty:'graded',temporality:'current'});
let n=0;const t=f=>{f();n++;};
const base=[
 {id:'money',effects:[S(1)],functionalImpact:3,evidenceConfidence:.9,memberPreference:1,actionability:2},
 {id:'energy',effects:[S(.9)],functionalImpact:2,evidenceConfidence:.95,memberPreference:3,actionability:3},
 {id:'work',effects:[S(.9)],functionalImpact:3,evidenceConfidence:.8,memberPreference:3,actionability:2},
 {id:'weak',effects:[S(.1)],functionalImpact:3,evidenceConfidence:1,memberPreference:3,actionability:3}
];
t(()=>assert.deepEqual(orderPriorityCandidates(base).map(x=>x.id),['money','work','energy']));
t(()=>assert.equal(selectInitialFocuses(base).length,3));
t(()=>assert.equal(orderPriorityCandidates(base).some(x=>x.id==='weak'),false));
t(()=>{const c=[...base,{id:'health',effects:[S(.9)],functionalImpact:0,evidenceConfidence:.7,safetyConstraint:true}];assert.equal(orderPriorityCandidates(c)[0].id,'health');});
t(()=>{const c=[{id:'b',effects:[S(1)],functionalImpact:1,evidenceConfidence:.8},{id:'a',effects:[S(1)],functionalImpact:1,evidenceConfidence:.8}];assert.deepEqual(orderPriorityCandidates(c).map(x=>x.id),['a','b']);});
t(()=>{const c=[{id:'a',effects:[S(1)],functionalImpact:1,evidenceConfidence:.8,memberPreference:1},{id:'b',effects:[S(1)],functionalImpact:1,evidenceConfidence:.8,memberPreference:3}];assert.equal(orderPriorityCandidates(c)[0].id,'b');});
const focuses=selectInitialFocuses(base);
t(()=>{const p=composeInitialPlan({orderedFocuses:focuses,actionsByFocus:{money:[{id:'m1',eligible:true,burdenUnits:1}],work:[{id:'w1',eligible:true,burdenUnits:1}],energy:[{id:'e1',eligible:true,burdenUnits:1}]}});assert.equal(p.selected.length,3);assert.equal(p.totalBurdenUnits,3);assert.equal(p.withinBurdenCap,true);});
t(()=>{const p=composeInitialPlan({orderedFocuses:focuses,actionsByFocus:{money:[{id:'m1',eligible:true,burdenUnits:2}],work:[{id:'w1',eligible:true,burdenUnits:2}],energy:[{id:'e1',eligible:true,burdenUnits:1}]}});assert.deepEqual(p.selected.map(x=>x.focusId),['money','energy']);assert.equal(p.totalBurdenUnits,3);assert.equal(p.rejected[0].reason,'initial-burden-cap');});
t(()=>{const p=composeInitialPlan({orderedFocuses:focuses,actionsByFocus:{money:[{id:'bad',eligible:false,burdenUnits:1}],work:[{id:'w1',eligible:true,burdenUnits:1}]}});assert.equal(p.rejected.some(x=>x.focusId==='money'&&x.reason==='no-eligible-action'),true);});
t(()=>{const p=composeInitialPlan({orderedFocuses:[focuses[0]],actionsByFocus:{money:[{id:'heavy',eligible:true,burdenUnits:3},{id:'light',eligible:true,burdenUnits:1}]}});assert.equal(p.selected[0].actionId,'light');});
t(()=>assert.equal(PRIORITY_POLICY.maxInitialBurdenUnits,3));
console.log(`EEV1 priority/plan policy: PASS (${n} checks)`);
