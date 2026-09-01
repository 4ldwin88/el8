import test from 'node:test';
import assert from 'node:assert/strict';
import * as Discovery from '../../intelligence/discovery/discovery-engine.js';
import { answerEffects } from '../../intelligence/discovery/observationNormalizer.js';
import { prioritizeCandidates } from '../../intelligence/prioritization/prioritization.js';
import { confirmFocus, focusConfirmationPlanningInput } from '../../intelligence/prioritization/focus-confirmation.js';
import { buildPlan } from '../../intelligence/planning/planningEngine.js';
import { reviewPlan } from '../../intelligence/review/review-engine.js';
import { routeReview } from '../../intelligence/review/adaptation-router.js';

function answerWithStateEvidence(question) {
  const establishing=question.options.find(option=>answerEffects(question,option.id).some(effect=>['EVIDENCE','STATE'].includes(String(effect['Effect Type']).toUpperCase())));
  return establishing?.id??question.options.find(option=>answerEffects(question,option.id).length>0)?.id??question.options[0]?.id;
}
function answerBaseline(session,matrix){for(const question of matrix.questions){const difficult=question.options.find(option=>option.text==='Difficult'),goingWell=question.options.find(option=>option.text==='Going well');Discovery.answer(session,question,String(question.dimension).toUpperCase()==='PHYSICAL'?difficult.id:goingWell.id)}}

test('E01 raw-input lifecycle reaches Review through production Intelligence transitions',()=>{
  const session=Discovery.session();
  let step=Discovery.next(session);assert.equal(step.type,'question');assert.equal(step.question.id,'Q000001');Discovery.answer(session,step.question,'A000013');
  step=Discovery.next(session);assert.equal(step.type,'matrix');assert.equal(step.interaction,'eight-dimension-baseline-matrix');answerBaseline(session,step);
  step=Discovery.next(session);assert.equal(step.type,'driver-triage');const physicalDriver=step.questions.find(question=>question.id==='Q000085');assert.ok(physicalDriver);const activity=physicalDriver.options.find(option=>option.id==='A000549');assert.ok(activity);Discovery.answer(session,physicalDriver,activity.id);assert.deepEqual(session.constructIds,['ACTIVITY_LEVEL']);

  let state=Discovery.trace(session).states.find(item=>item.constructId==='ACTIVITY_LEVEL');
  for(let guard=0;guard<8&&state?.resolutionState!=='sufficient';guard++){
    step=Discovery.next(session);assert.equal(step.type,'question',`expected evidence question, got ${step.type}`);const answerId=answerWithStateEvidence(step.question);assert.ok(answerId);Discovery.answer(session,step.question,answerId);state=Discovery.trace(session).states.find(item=>item.constructId==='ACTIVITY_LEVEL');
  }
  assert.ok(Number(state?.evidenceConfidence??0)>=.75,'raw Discovery must establish sufficient ACTIVITY_LEVEL evidence');
  assert.equal(state.resolutionState,'sufficient','production Discovery must own the sufficiency transition');
  Discovery.complete(session);

  const trace=Discovery.trace(session),established=trace.states.find(item=>item.constructId==='ACTIVITY_LEVEL');assert.ok(established.evidenceRefs.length>0);
  const memberStateRevision=0,prioritization=prioritizeCandidates({memberStateRevision,candidates:[{constructId:'ACTIVITY_LEVEL',evidenceRefs:established.evidenceRefs}]});assert.equal(prioritization.recommended[0].constructId,'ACTIVITY_LEVEL');
  const confirmation=confirmFocus({prioritization,decisions:[{constructId:'ACTIVITY_LEVEL',decision:'accepted',memberRank:1}],decidedAt:'2026-09-01T12:00:00Z'});assert.equal(confirmation.accepted[0].constructId,'ACTIVITY_LEVEL');
  const planningInput=focusConfirmationPlanningInput(confirmation,{evidenceRefs:established.evidenceRefs,safetyDisposition:'ordinary_flow'}),plan=buildPlan(planningInput,{now:'2026-09-01T12:01:00Z'});assert.equal(plan.status,'proposed');assert.ok(plan.proposedActions.length>=1);
  const activePlan={...plan,status:'active',activeActions:plan.proposedActions},review=reviewPlan({plan:activePlan,evidence:{adherence:'high',outcome:'improved',burden:'low',qaSimulated:true}}),route=routeReview({review,plan:activePlan});assert.equal(review.decision,'keep');assert.equal(route.route,'continue');assert.equal(route.preservePlan,true);
});
