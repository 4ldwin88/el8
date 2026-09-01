import test from 'node:test';
import assert from 'node:assert/strict';
import * as Discovery from '../../intelligence/discovery/discovery-engine.js';
import { answerEffects } from '../../intelligence/discovery/observationNormalizer.js';
import { prioritizeCandidates } from '../../intelligence/prioritization/prioritization.js';
import { confirmFocus, focusConfirmationPlanningInput } from '../../intelligence/prioritization/focus-confirmation.js';
import { buildPlan } from '../../intelligence/planning/planningEngine.js';
import { reviewPlan } from '../../intelligence/review/review-engine.js';
import { routeReview } from '../../intelligence/review/adaptation-router.js';

function answerWithExecutableEvidence(question) {
  return question.options.find(option => answerEffects(question, option.id).length > 0)?.id ?? question.options[0]?.id;
}

function answerBaseline(session, matrix) {
  for (const question of matrix.questions) {
    const difficult = question.options.find(option => option.text === 'Difficult');
    const goingWell = question.options.find(option => option.text === 'Going well');
    Discovery.answer(session, question, String(question.dimension).toUpperCase() === 'PHYSICAL' ? difficult.id : goingWell.id);
  }
}

test('E01 raw-input lifecycle reaches Review through production Intelligence transitions', () => {
  const session = Discovery.session();

  // Raw Discovery begins at the governed opening rather than preconstructed downstream state.
  let step = Discovery.next(session);
  assert.equal(step.type, 'question');
  assert.equal(step.question.id, 'Q000001');
  Discovery.answer(session, step.question, 'A000013');

  step = Discovery.next(session);
  assert.equal(step.type, 'matrix');
  assert.equal(step.interaction, 'eight-dimension-baseline-matrix');
  answerBaseline(session, step);

  step = Discovery.next(session);
  assert.equal(step.type, 'driver-triage');
  const physicalDriver = step.questions.find(question => question.id === 'Q000085');
  assert.ok(physicalDriver);
  const activity = physicalDriver.options.find(option => option.id === 'A000549');
  assert.ok(activity);
  Discovery.answer(session, physicalDriver, activity.id);
  assert.deepEqual(session.constructIds, ['ACTIVITY_LEVEL']);

  // Continue through governed adaptive questions. The harness may accelerate only the
  // sufficiency acknowledgement once production evidence has actually established it.
  let state = Discovery.trace(session).states.find(item => item.constructId === 'ACTIVITY_LEVEL');
  for (let guard = 0; guard < 8 && Number(state?.evidenceConfidence ?? 0) < .75; guard++) {
    step = Discovery.next(session);
    assert.equal(step.type, 'question', `expected evidence question, got ${step.type}`);
    const answerId = answerWithExecutableEvidence(step.question);
    assert.ok(answerId);
    Discovery.answer(session, step.question, answerId);
    state = Discovery.trace(session).states.find(item => item.constructId === 'ACTIVITY_LEVEL');
  }
  assert.ok(Number(state?.evidenceConfidence ?? 0) >= .75, 'raw Discovery must establish sufficient ACTIVITY_LEVEL evidence');
  Discovery.resolve(session, 'ACTIVITY_LEVEL', 'sufficient', { driverKnown: true });
  Discovery.complete(session);

  const trace = Discovery.trace(session);
  const established = trace.states.find(item => item.constructId === 'ACTIVITY_LEVEL');
  assert.equal(established.resolutionState, 'sufficient');
  assert.ok(established.evidenceRefs.length > 0);

  const memberStateRevision = 0;
  const prioritization = prioritizeCandidates({
    memberStateRevision,
    candidates: [{ constructId: 'ACTIVITY_LEVEL', evidenceRefs: established.evidenceRefs }]
  });
  assert.equal(prioritization.recommended[0].constructId, 'ACTIVITY_LEVEL');

  const confirmation = confirmFocus({
    prioritization,
    decisions: [{ constructId: 'ACTIVITY_LEVEL', decision: 'accepted', memberRank: 1 }],
    decidedAt: '2026-09-01T12:00:00Z'
  });
  assert.equal(confirmation.accepted[0].constructId, 'ACTIVITY_LEVEL');

  const planningInput = focusConfirmationPlanningInput(confirmation, {
    evidenceRefs: established.evidenceRefs,
    safetyDisposition: 'ordinary_flow'
  });
  const plan = buildPlan(planningInput, { now: '2026-09-01T12:01:00Z' });
  assert.equal(plan.status, 'proposed');
  assert.ok(plan.proposedActions.length >= 1);

  const activePlan = { ...plan, status: 'active', activeActions: plan.proposedActions };
  const review = reviewPlan({
    plan: activePlan,
    evidence: { adherence: 'high', outcome: 'improved', burden: 'low', qaSimulated: true }
  });
  const route = routeReview({ review, plan: activePlan });
  assert.equal(review.decision, 'keep');
  assert.equal(route.route, 'continue');
  assert.equal(route.preservePlan, true);
});
