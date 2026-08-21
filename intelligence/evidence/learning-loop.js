import { expectedInformationGain } from '../selection/question-selector.js';
import { resolveAnswerEvidence, applyAnswerEvidence, informationGain } from './answer-evidence.js';

const clamp01=n=>Math.max(0,Math.min(1,Number(n)||0));
const idOf=q=>q.id??q.question_key;

// Records what EL8 predicted before asking and what the answer actually taught it.
// This is calibration telemetry, not a member-facing score.
export function evaluateQuestionOutcome(question,answer,beforeState={},context={}){
  const expected=expectedInformationGain(question,context);
  const effects=resolveAnswerEvidence(question,answer);
  const afterState=applyAnswerEvidence(beforeState,effects);
  const realized=informationGain(beforeState,afterState);
  const expectedValue=expected==null?null:clamp01(expected);
  return {
    questionId:idOf(question),
    answer,
    expectedInformationGain:expectedValue,
    realizedInformationGain:realized,
    calibrationError:expectedValue==null?null:realized-expectedValue,
    effects,
    afterState
  };
}

export function updateQuestionLearning(prior={},outcome){
  const n=(prior.observations??0)+1;
  const mean=(prior.meanRealizedGain??0)+((outcome.realizedInformationGain??0)-(prior.meanRealizedGain??0))/n;
  const expected=outcome.expectedInformationGain;
  const meanError=expected==null?(prior.meanCalibrationError??0):(prior.meanCalibrationError??0)+((outcome.calibrationError??0)-(prior.meanCalibrationError??0))/n;
  const answerCounts={...(prior.answerCounts??{})};
  const answers=Array.isArray(outcome.answer)?outcome.answer:[outcome.answer];
  answers.filter(x=>x!=null).forEach(a=>answerCounts[a]=(answerCounts[a]??0)+1);
  return {observations:n,meanRealizedGain:mean,meanCalibrationError:meanError,answerCounts};
}

export function learnedAnswerProbabilities(learning={}){
  const counts=learning.answerCounts??{};
  const total=Object.values(counts).reduce((a,b)=>a+b,0);
  if(!total)return {};
  return Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v/total]));
}

// Conservative adjustment: empirical performance can refine authored information value,
// but never replace it. Requires enough observations before moving the prior.
export function calibratedInformationValue(question,learning={},options={}){
  const authored=clamp01((question.information_value??3)/5);
  const minObservations=options.minObservations??20;
  if((learning.observations??0)<minObservations)return authored;
  const empirical=clamp01(learning.meanRealizedGain??0);
  const empiricalWeight=Math.min(options.maxEmpiricalWeight??.35,(learning.observations-minObservations+1)/100);
  return authored*(1-empiricalWeight)+empirical*empiricalWeight;
}
