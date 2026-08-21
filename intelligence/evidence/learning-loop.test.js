import assert from 'node:assert/strict';
import {evaluateQuestionOutcome,updateQuestionLearning,learnedAnswerProbabilities,calibratedInformationValue} from './learning-loop.js';

const question={id:'cashflow',signal:'cashflow',information_value:4,options:['stable','short'],answer_evidence:{stable:[{signal:'cashflow',dimensions:{Financial:.5},uncertainty_reduction:.9}],short:[{signal:'cashflow',dimensions:{Financial:-.8},uncertainty_reduction:.95,triggers:['cashflow_pressure']}]}};

// Prediction and realized gain are recorded together.
{
 const before={uncertaintyBySignal:{cashflow:1}};
 const out=evaluateQuestionOutcome(question,'short',before);
 assert.ok(out.expectedInformationGain>.8);
 assert.ok(out.realizedInformationGain>.9);
 assert.ok(out.afterState.activeTriggers.includes('cashflow_pressure'));
}

// Repeated outcomes build empirical answer probabilities.
{
 let learning={};
 for(const answer of ['stable','short','short','short']) learning=updateQuestionLearning(learning,evaluateQuestionOutcome(question,answer,{uncertaintyBySignal:{cashflow:1}}));
 const p=learnedAnswerProbabilities(learning);
 assert.equal(learning.observations,4);
 assert.equal(p.short,.75);
 assert.equal(p.stable,.25);
}

// Authored information value is protected until sufficient evidence exists.
{
 const authored=4/5;
 assert.equal(calibratedInformationValue(question,{observations:5,meanRealizedGain:.1}),authored);
}

// After enough observations, empirical gain can adjust—but not replace—the authored prior.
{
 const adjusted=calibratedInformationValue(question,{observations:60,meanRealizedGain:.2});
 assert.ok(adjusted<.8);
 assert.ok(adjusted>.2);
}

console.log('adaptive learning-loop tests passed');
