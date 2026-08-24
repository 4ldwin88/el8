import assert from 'node:assert/strict';
import {run,RESOLUTION_SCENARIOS} from '../discovery-v2-synthetic-runner.js';
import {adaptLegacyTrace,classifyCompatibility} from './compatibility-adapter.js';

const rows=RESOLUTION_SCENARIOS.map(s=>{
 const legacy=run(s);const adapted=adaptLegacyTrace(legacy.trace);const comparison=classifyCompatibility(legacy,adapted);
 return {id:s.id,legacyTop3:legacy.top3,hardenedEligible:adapted.eligibleFocusIds,classification:comparison.classification,reason:comparison.reason};
});
const regressions=rows.filter(r=>r.classification==='REGRESSION');
const counts=rows.reduce((a,r)=>(a[r.classification]=(a[r.classification]??0)+1,a),{});
assert.equal(regressions.length,0,`Unexplained v0.12 regressions: ${JSON.stringify(regressions)}`);
console.log(JSON.stringify({version:'0.12-candidate',scenarioCount:rows.length,counts,pass:regressions.length===0,rows},null,2));
