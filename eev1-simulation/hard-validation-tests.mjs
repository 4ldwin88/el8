import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';
import { decisionSufficiency, actionEligibility, adaptPlan, DECISION_POLICY } from './decision-policy.js';

const ev=(polarity,strength,extra={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...extra});
const S=(n,e={})=>ev('supports',n,e), C=(n,e={})=>ev('contradicts',n,e);
let checks=0;
const check=(fn)=>{fn();checks++;};

// Contradiction gradients: near-balanced high-strength evidence must not manufacture certainty.
for(const [a,b] of [[1,.95],[.9,.85],[.8,.75],[.7,.65]]) check(()=>{
  const r=classifyConcern([S(a),C(b)]);
  assert.notEqual(r.state,'SUPPORTED');
  assert.ok(r.conflict>0);
});

// Evidence-volume attack: repeated weak inferred support cannot overwhelm direct definitive contradiction.
for(const n of [1,5,10,25,50]) check(()=>{
  const r=classifyConcern([...Array.from({length:n},()=>S(.08,{sourceType:'inferred'})),C(.9,{certainty:'definitive'})]);
  assert.notEqual(r.state,'SUPPORTED');
});

// Historical/old evidence cannot independently unlock a current focus.
for(const n of [1,3,10]) check(()=>{
  const effects=Array.from({length:n},()=>S(1,{temporality:'historical'}));
  assert.equal(focusEligibility(effects).eligible,false);
});

// Health/Energy independence in both directions.
check(()=>assert.deepEqual(Object.entries({health:[S(1)],energy:[C(1,{certainty:'definitive'})]}).filter(([,e])=>focusEligibility(e).eligible).map(([k])=>k),['health']));
check(()=>assert.deepEqual(Object.entries({health:[C(1,{certainty:'definitive'})],energy:[S(1)]}).filter(([,e])=>focusEligibility(e).eligible).map(([k])=>k),['energy']));

// Correlated clusters must remain discriminated when conflict is unresolved.
for(const cluster of [
  {money:[S(.6),C(.5)],work:[S(.6),C(.5)]},
  {sleep:[S(.65),C(.55)],energy:[S(.65),C(.55)]},
  {stress:[S(.7),C(.6)],focus:[S(.7),C(.6)]},
  {direction:[S(.6),C(.5)],work:[S(.6),C(.5)]}
]) check(()=>{
  const d=decisionSufficiency({concernEffects:cluster,questionsAsked:6});
  assert.equal(d.sufficient,false);
  assert.equal(d.next,'DISCRIMINATE_CONFLICT');
});

// A strong supported concern plus an unresolved secondary concern must not silently terminate discovery.
for(const secondary of ['work','energy','sleep','stress','focus']) check(()=>{
  const d=decisionSufficiency({concernEffects:{money:[S(1)],[secondary]:[S(.55),C(.45)]},questionsAsked:5});
  assert.equal(d.sufficient,false);
  assert.ok(['DISCRIMINATE_CONFLICT','ASK_HIGHEST_VALUE_QUESTION'].includes(d.next));
});

// At the burden ceiling, unresolved ambiguity must stop without inventing a focus.
check(()=>{
  const d=decisionSufficiency({concernEffects:{energy:[S(.5),C(.5)],sleep:[S(.5),C(.5)]},questionsAsked:DECISION_POLICY.maxQuestionBudget});
  assert.equal(d.sufficient,true);
  assert.equal(d.stopReason,'question-budget-reached');
  assert.equal(d.next,'NO_FOCUS_YET');
});

// Member agency cannot promote weak preference into evidentiary eligibility.
for(const strength of [.05,.15,.25,.35]) check(()=>assert.equal(focusEligibility([S(strength)]).eligible,false));

// Driver threshold boundary: below establishment stays explicitly hypothetical.
for(const strength of [.4,.55,.7,.79]) check(()=>{
  const d=evaluateDriverHypothesis([S(strength)]);
  assert.equal(d.established,false);
  assert.equal(d.residualUncertainty,true);
  assert.equal(d.presentationRule,'must-present-as-hypothesis');
});

// Mechanism-dependent plans remain blocked when driver is unresolved; learn/stabilize remain available.
for(const driver of [[S(.55),C(.45)],[S(.6)],[C(.8)]]) check(()=>{
  assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'resolve'}).eligible,false);
  assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'build'}).eligible,false);
  assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'learn'}).eligible,true);
  assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'stabilize'}).eligible,true);
});

// Late safety dominates every ordinary adaptation trajectory.
for(const adherence of ['low','high']) for(const outcome of ['better','unchanged','worse']) for(const level of [1,2,3]) check(()=>{
  const r=adaptPlan({adherence,outcome,newSafetyLevel:level,nonAdherenceReason:'access',driverWasHypothesis:false});
  assert.equal(r.decision,'PAUSE_OR_REFER');
  assert.equal(r.reopenHypothesis,true);
});

// High adherence without improvement must never be interpreted as successful validation of a hypothesis.
for(const outcome of ['unchanged','worse']) check(()=>{
  const r=adaptPlan({adherence:'high',outcome,driverWasHypothesis:true});
  assert.equal(r.reopenHypothesis,true);
  if(outcome==='worse') assert.equal(r.weakenPriorDriver,true);
});

// Non-adherence reason routing is deterministic and does not falsely blame intervention efficacy.
for(const [reason,decision] of [['burden','REDUCE_BURDEN'],['forgot','SIMPLIFY_CUE'],['access','REMOVE_BARRIER'],['irrelevant','REPLACE']]) check(()=>{
  assert.equal(adaptPlan({adherence:'low',outcome:'unchanged',nonAdherenceReason:reason}).decision,decision);
});

console.log(`EEV1 hard validation: PASS (${checks} adversarial checks)`);
