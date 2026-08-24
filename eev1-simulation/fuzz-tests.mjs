import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';
import { decisionSufficiency, actionEligibility, adaptPlan, DECISION_POLICY } from './decision-policy.js';

// Deterministic pseudo-random generator: failures can be reproduced from seed.
function rng(seed=0xE18F022) {
  let x=seed>>>0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x>>>0) / 0x100000000;
  };
}
const random=rng();
const pick=a=>a[Math.floor(random()*a.length)];
const maybe=(p=.5)=>random()<p;
const strength=()=>Math.round(random()*100)/100;
const evidence=()=>({
  type:'evidence',
  polarity:pick(['supports','contradicts']),
  strength:strength(),
  sourceType:pick(['direct','derived','inferred']),
  certainty:pick(['definitive','graded']),
  temporality:pick(['current','recurring','historical','resolved','unknown'])
});

const VALID_STATES=new Set(['UNKNOWN','CANDIDATE','SUPPORTED','CLEARED','UNRESOLVED']);
const VALID_NEXT=new Set(['SAFETY_REVIEW','AGENCY_GATE','AGENCY_GATE_WITH_UNCERTAINTY','NO_FOCUS_YET','DISCRIMINATE_CONFLICT','ASK_HIGHEST_VALUE_QUESTION']);
let cases=0;

// Evidence-engine invariants across noisy and contradictory evidence sets.
for(let i=0;i<5000;i++){
  const effects=Array.from({length:Math.floor(random()*9)},evidence);
  const a=classifyConcern(effects);
  const b=classifyConcern(effects);
  assert.deepEqual(a,b,'classification must be deterministic');
  assert.ok(VALID_STATES.has(a.state));
  assert.ok(a.confidence>=0 && a.confidence<=1);
  assert.ok(a.conflict>=0 && a.conflict<=1);
  assert.ok(a.support>=0 && a.contradiction>=0);

  const focus=focusEligibility(effects);
  assert.equal(focus.eligible,focus.state==='SUPPORTED' && focus.confidence>=0.60);
  if(focus.eligible) assert.equal(focus.state,'SUPPORTED');

  const driver=evaluateDriverHypothesis(effects);
  if(driver.established){
    assert.equal(driver.state,'SUPPORTED');
    assert.ok(driver.confidence>=0.80);
    assert.ok(driver.conflict<0.30);
    assert.equal(driver.residualUncertainty,false);
  } else {
    assert.equal(driver.residualUncertainty,true);
    assert.equal(driver.presentationRule,'must-present-as-hypothesis');
  }
  cases++;
}

// Decision-policy invariants across synthetic populations.
const ids=['sleep','health','energy','money','work','focus','stress','direction'];
for(let i=0;i<2500;i++){
  const concernEffects={};
  for(const id of ids) if(maybe(.55)) concernEffects[id]=Array.from({length:1+Math.floor(random()*5)},evidence);
  const questionsAsked=Math.floor(random()*(DECISION_POLICY.maxQuestionBudget+5));
  const safetyEscalationLevel=maybe(.04)?1+Math.floor(random()*3):0;
  const d=decisionSufficiency({concernEffects,questionsAsked,safetyEscalationLevel});
  assert.ok(VALID_NEXT.has(d.next));
  if(safetyEscalationLevel>0){
    assert.equal(d.sufficient,true);
    assert.equal(d.next,'SAFETY_REVIEW');
  }
  if(d.next==='AGENCY_GATE') assert.ok((d.eligible?.length??0)>=1);
  if(d.next==='NO_FOCUS_YET'){
    assert.ok(questionsAsked>=DECISION_POLICY.maxQuestionBudget);
    assert.equal(d.eligible.length,0);
  }
  cases++;
}

// Agency/action guard: unsupported concerns cannot yield actions; unresolved drivers
// cannot yield mechanism-dependent resolve/build actions.
for(let i=0;i<1500;i++){
  const concernEffects=Array.from({length:Math.floor(random()*6)},evidence);
  const driverEffects=Array.from({length:Math.floor(random()*6)},evidence);
  const intent=pick(['learn','stabilize','resolve','build']);
  const result=actionEligibility({concernEffects,driverEffects,actionIntent:intent});
  const concern=focusEligibility(concernEffects);
  const driver=classifyConcern(driverEffects);
  if(!concern.eligible) assert.equal(result.eligible,false);
  if(concern.eligible && ['resolve','build'].includes(intent) && driver.state!=='SUPPORTED') assert.equal(result.eligible,false);
  cases++;
}

// Safety must dominate adaptation regardless of otherwise-positive progress.
for(const adherence of ['low','high']) for(const outcome of ['better','unchanged','worse']) for(const level of [1,2,3]){
  const result=adaptPlan({adherence,outcome,newSafetyLevel:level,nonAdherenceReason:'burden',driverWasHypothesis:true});
  assert.equal(result.decision,'PAUSE_OR_REFER');
  assert.equal(result.reopenHypothesis,true);
  cases++;
}

// Regression: Health and Energy remain independently classifiable.
const strong=e=>[{type:'evidence',polarity:e,strength:1,sourceType:'direct',certainty:'definitive',temporality:'current'}];
assert.equal(focusEligibility(strong('supports')).eligible,true);
assert.equal(classifyConcern(strong('contradicts')).state,'CLEARED');

console.log(`EEV1 deterministic fuzz suite: PASS (${cases} generated cases)`);
