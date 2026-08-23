import assert from 'node:assert/strict';
import { runAssessment } from './end-to-end-assessment.js';

function firstUseful(q, preferred=[]) {
  for (const id of preferred) if (q.options.some(o=>o.id===id)) return id;
  return q.options.find(o=>!['unsure','other'].includes(o.id))?.id || q.options[0]?.id;
}

const workMoney = runAssessment(q => firstUseful(q,['work','money','hard','major','yes','expenses']), {capacity:'medium'});
assert.equal(workMoney.assessment.coherent,true);
assert.ok(workMoney.assessment.questionsAsked>0);
assert.ok(['active','observe'].includes(workMoney.plan.status));
assert.ok(workMoney.plan.actions.length<=2);

const uncertainty = runAssessment(q => q.options.some(o=>o.id==='unsure') ? 'unsure' : firstUseful(q), {capacity:'low'});
assert.equal(uncertainty.assessment.coherent,true);
assert.ok(uncertainty.plan.actions.length<=1);

const safety = runAssessment(q => firstUseful(q,['stress','hard','yes']), {capacity:'medium',safetyHold:true});
assert.equal(safety.plan.status,'escalate');
assert.equal(safety.plan.actions.length,0);

console.log(JSON.stringify({pass:true,scenarios:3,workMoney,uncertainty,safety},null,2));
