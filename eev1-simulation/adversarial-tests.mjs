import assert from 'node:assert/strict';
import { classifyConcern, evaluateDriverHypothesis, focusEligibility } from './evidence-engine.js';
import { decisionSufficiency, actionEligibility, adaptPlan } from './decision-policy.js';

const ev = (polarity, strength, extra={}) => ({ type:'evidence', polarity, strength, sourceType:'direct', certainty:'graded', temporality:'current', ...extra });

// 48 failure case 1: contradictory answers must not produce false support.
{
  const r = classifyConcern([ev('supports', .8), ev('contradicts', .7)]);
  assert.equal(r.state, 'UNRESOLVED');
}

// 48 failure case 2: many weak inferred observations must not overpower one high-quality contradiction.
{
  const weak = Array.from({length:5}, () => ev('supports', .12, {sourceType:'inferred'}));
  const r = classifyConcern([...weak, ev('contradicts', .8, {certainty:'definitive'})]);
  assert.notEqual(r.state, 'SUPPORTED');
}

// 48 failure case 3: a member-preferred focus still requires evidentiary eligibility.
{
  const lowEvidence = [ev('supports', .2)];
  assert.equal(focusEligibility(lowEvidence).eligible, false);
}

// 48 failure case 4: worsening despite high adherence reopens and weakens the hypothesis.
{
  const r = adaptPlan({adherence:'high', outcome:'worse', driverWasHypothesis:true});
  assert.equal(r.decision, 'REASSESS');
  assert.equal(r.reopenHypothesis, true);
  assert.equal(r.weakenPriorDriver, true);
}

// 48 failure case 5: downstream symptom cannot unlock mechanism-dependent action without driver support.
{
  const concern = [ev('supports', 1)];
  const unresolvedDriver = [ev('supports', .5), ev('contradicts', .5)];
  assert.equal(actionEligibility({concernEffects:concern, driverEffects:unresolvedDriver, actionIntent:'resolve'}).eligible, false);
  assert.equal(actionEligibility({concernEffects:concern, driverEffects:unresolvedDriver, actionIntent:'learn'}).eligible, true);
}

// 48 failure case 6: a late safety signal overrides an active plan.
{
  const r = adaptPlan({adherence:'high', outcome:'better', newSafetyLevel:2});
  assert.equal(r.decision, 'PAUSE_OR_REFER');
  assert.equal(r.reopenHypothesis, true);
}

// 48 failure case 7: repeated uncertainty cannot run forever or manufacture a focus.
{
  const r = decisionSufficiency({concernEffects:{energy:[]}, questionsAsked:18});
  assert.equal(r.sufficient, true);
  assert.equal(r.stopReason, 'question-budget-reached');
  assert.equal(r.next, 'NO_FOCUS_YET');
}

// 48 failure case 8: overlapping/correlated concerns remain separately unresolved until discriminated.
{
  const overlap = [ev('supports', .55), ev('contradicts', .45)];
  const r = decisionSufficiency({concernEffects:{money:overlap, work:overlap}, questionsAsked:6});
  assert.equal(r.sufficient, false);
  assert.equal(r.next, 'DISCRIMINATE_CONFLICT');
  assert.deepEqual(new Set(r.unresolved), new Set(['money','work']));
}

// Driver language invariant: unresolved drivers remain hypotheses.
{
  const r = evaluateDriverHypothesis([ev('supports', .6)]);
  assert.equal(r.established, false);
  assert.equal(r.residualUncertainty, true);
  assert.equal(r.presentationRule, 'must-present-as-hypothesis');
}

// Non-adherence must route from a reason rather than being treated as intervention failure.
{
  assert.equal(adaptPlan({adherence:'low', outcome:'unchanged', nonAdherenceReason:'burden'}).decision, 'REDUCE_BURDEN');
  assert.equal(adaptPlan({adherence:'low', outcome:'unchanged', nonAdherenceReason:'forgot'}).decision, 'SIMPLIFY_CUE');
  assert.equal(adaptPlan({adherence:'low', outcome:'unchanged'}).decision, 'CLARIFY_NON_ADHERENCE');
}

console.log('EEV1 adversarial suite: PASS');
