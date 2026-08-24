import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';
import { decisionSufficiency, actionEligibility, adaptPlan, DECISION_POLICY } from './decision-policy.js';

const ev=(polarity,strength,extra={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...extra});
const S=(n,e={})=>ev('supports',n,e), C=(n,e={})=>ev('contradicts',n,e);
let checks=0; const check=fn=>{fn();checks++;};
for(const [a,b] of [[1,.95],[.9,.85],[.8,.75],[.7,.65]]) check(()=>{const r=classifyConcern([S(a),C(b)]);assert.notEqual(r.state,'SUPPORTED');assert.ok(r.conflict>0);});
for(const n of [1,5,10,25,50]) check(()=>assert.notEqual(classifyConcern([...Array.from({length:n},()=>S(.08,{sourceType:'inferred'})),C(.9,{certainty:'definitive'})]).state,'SUPPORTED'));
for(const n of [1,3,10]) check(()=>assert.equal(focusEligibility(Array.from({length:n},()=>S(1,{temporality:'historical'}))).eligible,false));
check(()=>assert.deepEqual(Object.entries({health:[S(1)],energy:[C(1,{certainty:'definitive'})]}).filter(([,e])=>focusEligibility(e).eligible).map(([k])=>k),['health']));
check(()=>assert.deepEqual(Object.entries({health:[C(1,{certainty:'definitive'})],energy:[S(1)]}).filter(([,e])=>focusEligibility(e).eligible).map(([k])=>k),['energy']));
for(const cluster of [{money:[S(.6),C(.5)],work:[S(.6),C(.5)]},{sleep:[S(.65),C(.55)],energy:[S(.65),C(.55)]},{stress:[S(.7),C(.6)],focus:[S(.7),C(.6)]},{direction:[S(.6),C(.5)],work:[S(.6),C(.5)]}]) check(()=>{const d=decisionSufficiency({concernEffects:cluster,questionsAsked:6});assert.equal(d.sufficient,false);assert.equal(d.next,'DISCRIMINATE_CONFLICT');});
for(const secondary of ['work','energy','sleep','stress','focus']) check(()=>{const d=decisionSufficiency({concernEffects:{money:[S(1)],[secondary]:[S(.55),C(.45)]},questionsAsked:5});assert.equal(d.sufficient,false);assert.ok(['DISCRIMINATE_CONFLICT','ASK_HIGHEST_VALUE_QUESTION'].includes(d.next));});
check(()=>{const d=decisionSufficiency({concernEffects:{energy:[S(.5),C(.5)],sleep:[S(.5),C(.5)]},questionsAsked:DECISION_POLICY.maxQuestionBudget});assert.equal(d.sufficient,true);assert.equal(d.stopReason,'question-budget-reached');assert.equal(d.next,'NO_FOCUS_YET');});
for(const strength of [.05,.15,.25,.35]) check(()=>assert.equal(focusEligibility([S(strength)]).eligible,false));
for(const strength of [.4,.55,.7,.79]) check(()=>{const d=evaluateDriverHypothesis([S(strength)]);assert.equal(d.established,false);assert.equal(d.residualUncertainty,true);});
for(const driver of [[S(.55),C(.45)],[S(.6)],[C(.8)]]) check(()=>{assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'resolve'}).eligible,false);assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'build'}).eligible,false);assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'learn'}).eligible,true);assert.equal(actionEligibility({concernEffects:[S(1)],driverEffects:driver,actionIntent:'stabilize'}).eligible,true);});
for(const adherence of ['low','high']) for(const outcome of ['better','unchanged','worse']) for(const level of [1,2,3]) check(()=>{const r=adaptPlan({adherence,outcome,newSafetyLevel:level,nonAdherenceReason:'access',driverWasHypothesis:false});assert.equal(r.decision,'PAUSE_OR_REFER');assert.equal(r.reopenHypothesis,true);});
for(const outcome of ['unchanged','worse']) check(()=>{const r=adaptPlan({adherence:'high',outcome,driverWasHypothesis:true});assert.equal(r.reopenHypothesis,true);if(outcome==='worse')assert.equal(r.weakenPriorDriver,true);});
for(const [reason,decision] of [['burden','REDUCE_BURDEN'],['forgot','SIMPLIFY_CUE'],['access','REMOVE_BARRIER'],['irrelevant','REPLACE']]) check(()=>assert.equal(adaptPlan({adherence:'low',outcome:'unchanged',nonAdherenceReason:reason}).decision,decision));
const permutations=a=>a.length<2?[a]:a.flatMap((v,i)=>permutations([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]));
for(const evidenceSet of [[S(.8),C(.4),S(.3)],[S(.7),C(.7),S(.2)],[S(1),S(.2,{temporality:'historical'}),C(.3)]]) check(()=>{const baseline=classifyConcern(evidenceSet);for(const p of permutations(evidenceSet)){const r=classifyConcern(p);assert.equal(r.state,baseline.state);assert.equal(r.net,baseline.net);assert.equal(r.confidence,baseline.confidence);}});
for(const pair of [[.74,.75],[.79,.80],[.24,.25],[.59,.60]]) check(()=>{const [lo,hi]=pair,a=classifyConcern([S(lo)]),b=classifyConcern([S(hi)]);assert.ok(b.support>=a.support);assert.ok(b.confidence>=a.confidence);});
for(const n of [2,5,20]) check(()=>{const duplicate={...S(.2),observationId:'same-observation'};assert.equal(focusEligibility(Array.from({length:n},()=>({...duplicate}))).eligible,false);});
for(const prior of [.6,.8,1]) check(()=>assert.notEqual(classifyConcern([S(prior,{observationId:'answer-1'}),C(1,{certainty:'definitive',observationId:'answer-1-correction',supersedes:'answer-1'})]).state,'SUPPORTED'));

// Multi-step correction chains: only the latest non-superseded observation should govern.
check(()=>{const r=classifyConcern([S(1,{observationId:'a'}),C(1,{observationId:'b',supersedes:'a'}),S(1,{observationId:'c',supersedes:'b'})]);assert.equal(r.state,'SUPPORTED');});
check(()=>{const r=classifyConcern([C(1,{observationId:'a'}),S(1,{observationId:'b',supersedes:'a'}),C(1,{certainty:'definitive',observationId:'c',supersedes:'b'})]);assert.equal(r.state,'CLEARED');});

// Correction chains must be order independent: storage/order must not resurrect superseded evidence.
for(const chain of [[S(1,{observationId:'a'}),C(1,{observationId:'b',supersedes:'a'}),S(1,{observationId:'c',supersedes:'b'})],[C(1,{observationId:'a'}),S(1,{observationId:'b',supersedes:'a'}),C(1,{certainty:'definitive',observationId:'c',supersedes:'b'})]]) check(()=>{const expected=classifyConcern(chain);for(const p of permutations(chain))assert.equal(classifyConcern(p).state,expected.state);});

// A duplicate of a superseded observation cannot resurrect it.
check(()=>{const old=S(1,{observationId:'old'}),correction=C(1,{certainty:'definitive',observationId:'new',supersedes:'old'});const r=classifyConcern([old,correction,{...old},{...old}]);assert.equal(r.state,'CLEARED');});

// Cross-chain corrections remain independent; correcting one observation must not erase another independent signal.
check(()=>{const r=classifyConcern([S(.6,{observationId:'x'}),S(.6,{observationId:'y'}),C(1,{certainty:'definitive',observationId:'x2',supersedes:'x'})]);assert.ok(r.support>0,'independent observation y must survive correction of x');});

// Broken provenance references must not silently delete unrelated evidence.
check(()=>{const r=classifyConcern([S(1,{observationId:'real'}),C(.2,{observationId:'correction',supersedes:'missing'})]);assert.ok(r.support>0);});

console.log(`EEV1 hard validation: PASS (${checks} adversarial checks)`);
