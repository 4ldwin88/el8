import assert from 'node:assert/strict';
import { selectDiscoveryQuestion, shouldStopDiscovery } from './adaptive-discovery-v1.js';

const q = (id, signal, extra={}) => ({id,signal,options:['yes','no'],information_value:4,actionability:4,burden:1,answer_evidence:{yes:{uncertainty_reduction:.7,confidence:.9},no:{uncertainty_reduction:.5,confidence:.9}},...extra});

const context = {
  activeTriggers:[], availableEvidence:[], completedQuestionIds:[], uncertainSignals:['sleep','stress'],
  decisionRelevantSignals:['sleep'], questionsAsked:0, burdenUsed:0, maxQuestions:3, maxBurden:3,
  hypotheses:[
    {id:'H_SLEEP_DRIVER',signals:['sleep'],confidence:.35,uncertainty:.65,status:'candidate'},
    {id:'H_STRESS_DRIVER',signals:['stress'],confidence:.65,uncertainty:.35,status:'candidate'}
  ]
};

{
  const result = selectDiscoveryQuestion([q('Q_STRESS','stress'),q('Q_SLEEP','sleep')], context);
  assert.equal(result.selected.question.id,'Q_SLEEP','higher unresolved, decision-relevant hypothesis should win');
}

{
  const result = shouldStopDiscovery({...context,questionsAsked:3}, [{score:.9}]);
  assert.deepEqual(result,{stop:true,reason:'question-budget'});
}

{
  const result = shouldStopDiscovery({...context,hypotheses:[{id:'H',signals:['sleep'],confidence:.9,uncertainty:.1}]}, [{score:.9}]);
  assert.deepEqual(result,{stop:true,reason:'sufficient-confidence'});
}

{
  const result = shouldStopDiscovery({...context,hypotheses:[]}, [{score:.05}]);
  assert.deepEqual(result,{stop:true,reason:'low-information-value'});
}

console.log('Adaptive Discovery v1 tests passed');
