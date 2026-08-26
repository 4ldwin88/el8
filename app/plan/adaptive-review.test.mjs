import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewAction,memberReviewCopy} from './adaptive-review.js';

const plan={interventions:[{id:'walk',concern_id:'low_activity',action:'Go for a walk'}]};

test('adequate adherence and improvement maintains one action',()=>{const r=reviewAction({plan,actionId:'walk',status:'completed',adherence:.9,benefitDirection:'improved',measurementSufficient:true,recordedAt:'2026-08-26T12:00:00Z'});assert.equal(r.decision.adaptation,'maintain');assert.equal(r.outcome.interventionId,'walk');});
test('low adherence is not mislabeled action failure',()=>{const r=reviewAction({plan,actionId:'walk',status:'partially_completed',adherence:.3,benefitDirection:'unchanged',barrierCodes:['schedule']});assert.equal(r.decision.attribution,'adherence_or_barrier');});
test('poor outcome after adequate adherence triggers reassessment',()=>{const r=reviewAction({plan,actionId:'walk',status:'completed',adherence:.9,benefitDirection:'unchanged',measurementSufficient:true});assert.equal(r.decision.adaptation,'reassess');assert.equal(r.decision.attribution,'action_or_hypothesis');});
test('context and safety changes outrank ordinary adaptation',()=>{assert.equal(reviewAction({plan,actionId:'walk',status:'unknown',contextChanged:true}).decision.adaptation,'reprioritize');assert.equal(reviewAction({plan,actionId:'walk',status:'unknown',safetyChanged:true}).decision.adaptation,'escalate');});
test('review requires action concern provenance',()=>{assert.throws(()=>reviewAction({plan:{interventions:[{id:'x'}]},actionId:'x',status:'completed'}),/originating concern/);});
test('member copy explains rather than silently mutates',()=>{assert.match(memberReviewCopy({adaptation:'reassess'}).detail,/review/i);});
