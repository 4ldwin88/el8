import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';
import { actionEligibility, decisionSufficiency } from './decision-policy.js';
const E=(polarity,strength,extra={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...extra});
const S=(n,x={})=>E('supports',n,x), C=(n,x={})=>E('contradicts',n,x);

// Expected outcomes are authored before engine execution. Cases describe evidence only; assertions encode the intended policy outcome.
const cases=[
 {id:'clear-current-money', effects:[S(1)], state:'SUPPORTED', focus:true, driver:false, intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'weak-current-energy', effects:[S(.2)], state:'UNKNOWN', focus:false},
 {id:'historical-health-only', effects:[S(1,{temporality:'historical'})], state:'CANDIDATE', focus:false},
 {id:'direct-conflict', effects:[S(.8),C(.8)], state:'UNRESOLVED', focus:false},
 {id:'definitive-clear', effects:[C(1,{certainty:'definitive'})], state:'CLEARED', focus:false},
 {id:'strong-driver', effects:[S(1)], state:'SUPPORTED', focus:true, driver:true, intents:{learn:true,stabilize:true,resolve:true,build:true}},
 {id:'supported-concern-uncertain-driver', effects:[S(.8)], state:'SUPPORTED', focus:true, driver:false, intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'recurring-support', effects:[S(1,{temporality:'recurring'})], state:'SUPPORTED', focus:true},
 {id:'resolved-only', effects:[S(1,{temporality:'resolved'})], state:'UNKNOWN', focus:false},
 {id:'correction-clears', effects:[S(1,{observationId:'a'}),C(1,{certainty:'definitive',observationId:'b',supersedes:'a'})], state:'CLEARED', focus:false},
 {id:'correction-restores', effects:[C(1,{observationId:'a'}),S(1,{observationId:'b',supersedes:'a'})], state:'SUPPORTED', focus:true, driver:true},
 {id:'many-historical-still-not-current', effects:Array.from({length:12},(_,i)=>S(1,{temporality:'historical',observationId:`h${i}`})), state:'SUPPORTED', focus:false}
];
let assertions=0;
for(const tc of cases){
 const state=classifyConcern(tc.effects), focus=focusEligibility(tc.effects), driver=evaluateDriverHypothesis(tc.effects);
 assert.equal(state.state,tc.state,`${tc.id}: state`); assertions++;
 assert.equal(focus.eligible,tc.focus,`${tc.id}: focus`); assertions++;
 if(tc.driver!==undefined){assert.equal(driver.established,tc.driver,`${tc.id}: driver`);assertions++;}
 if(tc.intents){for(const [intent,expected] of Object.entries(tc.intents)){const r=actionEligibility({concernEffects:tc.effects,driverEffects:tc.effects,actionIntent:intent});assert.equal(r.eligible,expected,`${tc.id}: ${intent}`);assertions++;}}
}

const decisionCases=[
 {id:'one-clear-focus',input:{concernEffects:{money:[S(1)]},questionsAsked:4},next:'AGENCY_GATE',sufficient:true},
 {id:'conflict-needs-discrimination',input:{concernEffects:{money:[S(.8),C(.8)]},questionsAsked:4},next:'DISCRIMINATE_CONFLICT',sufficient:false},
 {id:'weak-needs-question',input:{concernEffects:{energy:[S(.2)]},questionsAsked:4},next:'ASK_HIGHEST_VALUE_QUESTION',sufficient:false},
 {id:'budget-no-focus',input:{concernEffects:{energy:[S(.2)]},questionsAsked:18},next:'NO_FOCUS_YET',sufficient:true},
 {id:'budget-focus-with-conflict',input:{concernEffects:{money:[S(1)],energy:[S(.8),C(.8)]},questionsAsked:18},next:'AGENCY_GATE_WITH_UNCERTAINTY',sufficient:true},
 {id:'safety-overrides',input:{concernEffects:{money:[S(1)]},questionsAsked:2,safetyEscalationLevel:2},next:'SAFETY_REVIEW',sufficient:true}
];
for(const tc of decisionCases){const r=decisionSufficiency(tc.input);assert.equal(r.next,tc.next,`${tc.id}: next`);assert.equal(r.sufficient,tc.sufficient,`${tc.id}: sufficient`);assertions+=2;}
console.log(`EEV1 blinded decision benchmark: PASS (${cases.length+decisionCases.length} predefined cases, ${assertions} assertions)`);
