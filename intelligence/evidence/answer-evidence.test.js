import assert from 'node:assert/strict';
import {resolveAnswerEvidence,applyAnswerEvidence,informationGain} from './answer-evidence.js';

const pressure={
  id:'emo_pressure_pattern_v1',
  answer_evidence:{
    overload:[{signal:'pressure_pattern',dimensions:{Emotional:-1,Occupational:-.35},uncertainty_reduction:.85,confidence:.9,triggers:['overload_identified'],resolves:['pressure_pattern']}],
    loneliness:[{signal:'pressure_pattern',dimensions:{Emotional:-.8,Social:-.8},uncertainty_reduction:.85,confidence:.9,triggers:['connection_pressure_identified'],resolves:['pressure_pattern']}],
    unsure:[{signal:'pressure_pattern',dimensions:{Emotional:-.1},uncertainty_reduction:.1,confidence:.5,triggers:['pressure_pattern_still_uncertain']}]
  }
};

// A specific answer should materially reduce uncertainty and affect linked dimensions.
{
  const before={uncertaintyBySignal:{pressure_pattern:1},dimensionEvidence:{},activeTriggers:[]};
  const effects=resolveAnswerEvidence(pressure,'loneliness');
  const after=applyAnswerEvidence(before,effects);
  assert.ok(after.uncertaintyBySignal.pressure_pattern<.3);
  assert.ok(after.dimensionEvidence.Emotional.net<0);
  assert.ok(after.dimensionEvidence.Social.net<0);
  assert.ok(after.activeTriggers.includes('connection_pressure_identified'));
  assert.ok(informationGain(before,after)>.6);
}

// Unsure is valid evidence but should reduce uncertainty only slightly.
{
  const before={uncertaintyBySignal:{pressure_pattern:1}};
  const after=applyAnswerEvidence(before,resolveAnswerEvidence(pressure,'unsure'));
  assert.ok(after.uncertaintyBySignal.pressure_pattern>.9);
  assert.ok(informationGain(before,after)<.1);
}

// Multi-select answers combine evidence rather than silently discarding all but one answer.
{
  const q={answer_evidence:{
    housing:[{signal:'obligation_pressure',dimensions:{Financial:-1,Environmental:-.6},uncertainty_reduction:.5}],
    food:[{signal:'obligation_pressure',dimensions:{Financial:-.8,Physical:-.5},uncertainty_reduction:.5}]
  }};
  const effects=resolveAnswerEvidence(q,['housing','food']);
  const after=applyAnswerEvidence({uncertaintyBySignal:{obligation_pressure:1}},effects);
  assert.equal(effects.length,2);
  assert.ok(after.dimensionEvidence.Environmental.net<0);
  assert.ok(after.dimensionEvidence.Physical.net<0);
  assert.ok(after.uncertaintyBySignal.obligation_pressure<=.25);
}

// Evidence can be positive; the model is not a disguised problem score.
{
  const q={answer_evidence:{stable:[{signal:'cashflow',dimensions:{Financial:.7},uncertainty_reduction:.9,confidence:.95}]}};
  const after=applyAnswerEvidence({uncertaintyBySignal:{cashflow:1}},resolveAnswerEvidence(q,'stable'));
  assert.ok(after.dimensionEvidence.Financial.net>0);
  assert.ok(after.uncertaintyBySignal.cashflow<.2);
}

console.log('answer-evidence tests passed');
