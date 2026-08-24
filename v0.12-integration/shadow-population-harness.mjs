import assert from 'node:assert/strict';
import LEGACY from '../discovery-v2-engine.js';
import {SCENARIOS} from '../discovery-v2-qa-expanded.js';
import ADV from '../discovery-v2-adversarial-additions.js';
import SHADOW from './shadow-session.js';

function choose(q,scenario){
 if(q.role==='gateway'){
  const valid=new Set(q.options.map(o=>o.id));
  const selected=scenario.presentation.filter(x=>valid.has(x));
  // Legacy synthetic fixtures use "other" as a routing sentinel even though it is
  // not a member-selectable G1 option. Do not inject that sentinel into the typed
  // v0.12 response contract. If it was the only fixture token, use UNSURE so the
  // hardened path creates no evidence while legacy routing can continue safely.
  return selected.length?selected:['unsure'];
 }
 let best=q.options[0],score=-Infinity;
 for(const o of q.options){let s=0;for(const [k,v] of Object.entries(o.effects??{})){if(scenario.truth.includes(k))s+=v*2;if(k==='__opt_out')s-=3;}if(s>score){score=s;best=o;}}
 return best.id;
}
function runShadow(sc){
 const s=SHADOW.session(sc.warm??{});let guard=0;
 while(guard++<30){const q=SHADOW.next(s);if(!q)break;const r=SHADOW.answer(s,q.id,choose(q,sc));if(!r.accepted)throw new Error(`shadow rejected ${sc.id}/${q.id}`);}
 const tr=SHADOW.trace(s);const legacyTop=tr.legacy.ranked.slice(0,3).map(x=>x.id),eev1=tr.eev1.eligibleFocusIds;
 const truth=new Set(sc.truth),legacyHits=legacyTop.filter(x=>truth.has(x)).length,eev1Hits=eev1.filter(x=>truth.has(x)).length;
 return {id:sc.id,class:sc.class,truth:sc.truth,legacyTop,eev1Eligible:eev1,legacyHits,eev1Hits,questions:tr.legacy.asked.length,shadowSteps:tr.shadowLog.length};
}
const rows=[...SCENARIOS,...ADV].map(runShadow);
const rejected=rows.filter(r=>r.shadowSteps!==r.questions);
const catastrophic=rows.filter(r=>r.legacyHits>0&&r.eev1Hits===0);
const improved=rows.filter(r=>r.eev1Hits>r.legacyHits).length,degraded=rows.filter(r=>r.eev1Hits<r.legacyHits).length,equal=rows.length-improved-degraded;
const byClass=Object.fromEntries([...new Set(rows.map(r=>r.class))].map(c=>[c,{n:rows.filter(r=>r.class===c).length,legacyHits:rows.filter(r=>r.class===c).reduce((a,r)=>a+r.legacyHits,0),eev1Hits:rows.filter(r=>r.class===c).reduce((a,r)=>a+r.eev1Hits,0)}]));
assert.equal(rejected.length,0,`shadow accounting mismatch ${JSON.stringify(rejected)}`);
assert.equal(catastrophic.length,0,`EEV1 lost all truth where legacy had signal ${JSON.stringify(catastrophic)}`);
console.log(JSON.stringify({version:'0.12-shadow',scenarioCount:rows.length,improved,degraded,equal,catastrophic:catastrophic.length,byClass,rows},null,2));
