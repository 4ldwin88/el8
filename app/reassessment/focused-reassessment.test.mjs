import assert from 'node:assert/strict';
import { createFocusedReassessment, reassessmentFromReview, correctionToReassessment } from './focused-reassessment.js';

const actionFit = createFocusedReassessment({ reason:'Action fit changed.', decisionAtStake:'current action eligibility', affectedActionIds:['ACT-1'], affectedConstructIds:['C-1'], actionFitOnly:true, knownEvidence:['existing fact'], requestedEvidence:['one missing constraint'] });
assert.equal(actionFit.scope, 'concern');
assert.equal(actionFit.returnTo, 'planning');
assert.deepEqual(actionFit.knownEvidence, ['existing fact']);

const focusChange = createFocusedReassessment({ reason:'Material context changed.', decisionAtStake:'current focus', affectedDimensionIds:['physical'], focusMayChange:true });
assert.equal(focusChange.scope, 'priority_set');
assert.equal(focusChange.returnTo, 'prioritization');

const broad = createFocusedReassessment({ reason:'Broad material change.', decisionAtStake:'whole-person direction', broadMaterialChange:true });
assert.equal(broad.scope, 'whole_person');
assert.equal(broad.returnTo, 'targeted_discovery');

const insufficient = reassessmentFromReview({ reviewResult:{ actionId:'ACT-1', constructIds:['C-1'], adjustment:{ route:'review-deepening', disposition:null }, review:{status:'INCONCLUSIVE'} }, requestedEvidence:['outcome'] });
assert.equal(insufficient.returnTo, 'targeted_discovery');
assert.deepEqual(insufficient.requestedEvidence, ['outcome']);

const correctedFact = correctionToReassessment({ correctionType:'fact', targetRef:'FACT-OLD', materialEffects:['plan','eligibility'] });
assert.equal(correctedFact.returnTo, 'planning');
assert.deepEqual(correctedFact.affectedEvidenceRefs, ['FACT-OLD']);

const correctedInterpretation = correctionToReassessment({ correctionType:'interpretation', targetRef:'HYP-1', materialEffects:['focus'], clarificationNeeded:true });
assert.equal(correctedInterpretation.returnTo, 'targeted_discovery');
assert.equal(correctedInterpretation.scope, 'priority_set');

const safety = correctionToReassessment({ correctionType:'preference_constraint', targetRef:'CTX-1', materialEffects:['plan'], safetyRequired:true });
assert.equal(safety.returnTo, 'safety');
assert.equal(safety.canDefer, false);

assert.throws(() => createFocusedReassessment({ reason:'x' }), /decision at stake required/);
console.log('Focused reassessment and correction routing regression: PASS');
