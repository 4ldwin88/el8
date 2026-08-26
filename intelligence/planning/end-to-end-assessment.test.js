import assert from 'node:assert/strict';
import { runAssessment, reviewAssessmentPlan } from './end-to-end-assessment.js';
import { createOutcome } from '../outcomes/outcomes.js';

function firstUseful(q,preferred=[]){for(const id of preferred)if(q.options.some(o=>o.id===id))return id;return q.options.find(o=>!['unsure','other'].includes(o.id))?.id||q.options[0]?.id;}

const workMoney=runAssessment(q=>firstUseful(q,['work','money','hard','major','yes','expenses']),{capacity:'medium'});
assert.equal(workMoney.assessment.coherent,true);
assert.ok(workMoney.assessment.questionsAsked>0);
assert.ok(['active','observe'].includes(workMoney.plan.status));
assert.ok((workMoney.plan.actions||[]).length<=2);
assert.ok(workMoney.assessment.rankedDrivers.every(x=>x.confidence==null||(x.confidence>=0&&x.confidence<=1)));

const uncertainty=runAssessment(q=>q.options.some(o=>o.id==='unsure')?'unsure':firstUseful(q),{capacity:'low'});
assert.equal(uncertainty.assessment.coherent,true);
assert.ok((uncertainty.plan.actions||[]).length<=1);

const safety=runAssessment(q=>firstUseful(q,['stress','hard','yes']),{capacity:'medium',safetyHold:true});
assert.equal(safety.plan.status,'escalate');
assert.equal((safety.plan.actions||[]).length,0);

const active={plan:{status:'active',active:[{id:'walk'}],actions:[{id:'walk'}]}};
const poor=createOutcome({outcomeId:'o1',interventionId:'walk',concernId:'low_activity',status:'completed',adherence:.9,benefitDirection:'unchanged',measurementSufficient:true});
assert.equal(reviewAssessmentPlan(active,poor).plan.adaptation,'reassess');
assert.equal(reviewAssessmentPlan(active,poor).plan.failureAttribution,'action_or_hypothesis');

const safetyOutcome=createOutcome({outcomeId:'o2',interventionId:'walk',concernId:'low_activity',status:'partially_completed',safetyChanged:true});
const escalated=reviewAssessmentPlan(active,safetyOutcome).plan;
assert.equal(escalated.status,'escalate');
assert.equal(escalated.active.length,0);

console.log(JSON.stringify({pass:true,scenarios:5},null,2));
