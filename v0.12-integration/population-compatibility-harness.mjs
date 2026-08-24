import assert from 'node:assert/strict';
import {run} from '../discovery-v2-synthetic-runner.js';
import {SCENARIOS} from '../discovery-v2-qa-expanded.js';
import ADVERSARIAL_SCENARIOS from '../discovery-v2-adversarial-additions.js';
import {adaptLegacyTrace,classifyCompatibility} from './compatibility-adapter.js';

const scenarios=[...SCENARIOS,...ADVERSARIAL_SCENARIOS];
const rows=scenarios.map(s=>{const legacy=run(s),adapted=adaptLegacyTrace(legacy.trace),comparison=classifyCompatibility(legacy,adapted);return{id:s.id,class:s.class,asked:legacy.asked.length,legacyTop3:legacy.top3,hardenedEligible:adapted.eligibleFocusIds,classification:comparison.classification,reason:comparison.reason};});
const counts=rows.reduce((a,r)=>(a[r.classification]=(a[r.classification]??0)+1,a),{});
const regressions=rows.filter(r=>r.classification==='REGRESSION');
const byClass=Object.fromEntries([...new Set(rows.map(r=>r.class))].map(c=>[c,rows.filter(r=>r.class===c).reduce((a,r)=>(a[r.classification]=(a[r.classification]??0)+1,a),{})]));
assert.equal(regressions.length,0,`Unexplained v0.12 population regressions: ${JSON.stringify(regressions)}`);
console.log(JSON.stringify({version:'0.12-candidate',scenarioCount:rows.length,counts,byClass,pass:regressions.length===0,rows},null,2));
