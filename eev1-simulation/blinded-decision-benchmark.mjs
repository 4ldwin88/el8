import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';
import { actionEligibility, decisionSufficiency, applyAgencyGate } from './decision-policy.js';
const E=(polarity,strength,extra={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...extra});
const S=(n,x={})=>E('supports',n,x), C=(n,x={})=>E('contradicts',n,x), D=(n,x={})=>S(n,{scope:'driver',...x});
const cases=[
 {id:'clear-current-money',effects:[S(1)],state:'SUPPORTED',focus:true,driver:false,intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'weak-current-energy',effects:[S(.2)],state:'UNKNOWN',focus:false},
 {id:'historical-health-only',effects:[S(1,{temporality:'historical'})],state:'CANDIDATE',focus:false},
 {id:'direct-conflict',effects:[S(.8),C(.8)],state:'UNRESOLVED',focus:false},
 {id:'definitive-clear',effects:[C(1,{certainty:'definitive'})],state:'CLEARED',focus:false},
 {id:'strong-driver',effects:[S(1)],driverEffects:[D(1)],state:'SUPPORTED',focus:true,driver:true,intents:{learn:true,stabilize:true,resolve:true,build:true}},
 {id:'supported-concern-uncertain-driver',effects:[S(.8)],driverEffects:[D(.6)],state:'SUPPORTED',focus:true,driver:false,intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'recurring-support',effects:[S(1,{temporality:'recurring'})],state:'SUPPORTED',focus:true},
 {id:'resolved-only',effects:[S(1,{temporality:'resolved'})],state:'UNKNOWN',focus:false},
 {id:'correction-clears',effects:[S(1,{observationId:'a'}),C(1,{certainty:'definitive',observationId:'b',supersedes:'a'})],state:'CLEARED',focus:false},
 {id:'correction-restores',effects:[C(1,{observationId:'a'}),S(1,{observationId:'b',supersedes:'a'})],driverEffects:[D(1)],state:'SUPPORTED',focus:true,driver:true},
 {id:'many-historical-still-not-current',effects:Array.from({length:12},(_,i)=>S(1,{temporality:'historical',observationId:`h${i}`})),state:'CANDIDATE',focus:false},
 {id:'health-current-supported',effects:[S(.9,{concernId:'health'})],state:'SUPPORTED',focus:true,driver:false},
 {id:'energy-current-supported',effects:[S(.9,{concernId:'energy'})],state:'SUPPORTED',focus:true,driver:false},
 {id:'energy-valid-sleep-driver-unresolved',effects:[S(.9)],driverEffects:[D(.55),C(.45,{scope:'driver'})],state:'SUPPORTED',focus:true,driver:false,intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'stress-valid-work-driver-unresolved',effects:[S(.9)],driverEffects:[D(.5),C(.5,{scope:'driver'})],state:'SUPPORTED',focus:true,driver:false,intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'very-strong-concern-not-cause',effects:[S(1),S(1,{observationId:'independent'})],state:'SUPPORTED',focus:true,driver:false,intents:{learn:true,stabilize:true,resolve:false,build:false}},
 {id:'corroborated-driver',effects:[S(.9)],driverEffects:[D(.8,{observationId:'d1'}),D(.8,{observationId:'d2'})],state:'SUPPORTED',focus:true,driver:true,intents:{learn:true,stabilize:true,resolve:true,build:true}},
 {id:'driver-contradicted',effects:[S(1)],driverEffects:[C(1,{scope:'driver',certainty:'definitive'})],state:'SUPPORTED',focus:true,driver:false,intents:{learn:true,stabilize:true,resolve:false,build:false}}
];
let assertions=0;
for(const tc of cases){const driverEffects=tc.driverEffects??tc.effects;const state=classifyConcern(tc.effects),focus=focusEligibility(tc.effects),driver=evaluateDriverHypothesis(driverEffects);assert.equal(state.state,tc.state,`${tc.id}: state`);assertions++;assert.equal(focus.eligible,tc.focus,`${tc.id}: focus`);assertions++;if(tc.driver!==undefined){assert.equal(driver.established,tc.driver,`${tc.id}: driver`);assertions++;}if(tc.intents)for(const [intent,expected] of Object.entries(tc.intents)){const r=actionEligibility({concernEffects:tc.effects,driverEffects,actionIntent:intent});assert.equal(r.eligible,expected,`${tc.id}: ${intent}`);assertions++;}}
const decisionCases=[
 {id:'one-clear-focus',input:{concernEffects:{money:[S(1)]},questionsAsked:4},next:'AGENCY_GATE',sufficient:true},
 {id:'conflict-needs-discrimination',input:{concernEffects:{money:[S(.8),C(.8)]},questionsAsked:4},next:'DISCRIMINATE_CONFLICT',sufficient:false},
 {id:'weak-needs-question',input:{concernEffects:{energy:[S(.2)]},questionsAsked:4},next:'ASK_HIGHEST_VALUE_QUESTION',sufficient:false},
 {id:'budget-no-focus',input:{concernEffects:{energy:[S(.2)]},questionsAsked:18},next:'NO_FOCUS_YET',sufficient:true},
 {id:'budget-focus-with-conflict',input:{concernEffects:{money:[S(1)],energy:[S(.8),C(.8)]},questionsAsked:18},next:'AGENCY_GATE_WITH_UNCERTAINTY',sufficient:true},
 {id:'safety-overrides',input:{concernEffects:{money:[S(1)]},questionsAsked:2,safetyEscalationLevel:2},next:'SAFETY_REVIEW',sufficient:true},
 {id:'money-work-both-supported',input:{concernEffects:{money:[S(1)],work:[S(.9)]},questionsAsked:6},next:'AGENCY_GATE',sufficient:true},
 {id:'health-energy-both-supported',input:{concernEffects:{health:[S(.9)],energy:[S(.9)]},questionsAsked:6},next:'AGENCY_GATE',sufficient:true},
 {id:'clear-plus-unresolved',input:{concernEffects:{money:[S(1)],work:[S(.7),C(.7)]},questionsAsked:8},next:'DISCRIMINATE_CONFLICT',sufficient:false},
 {id:'clear-plus-weak-alternative',input:{concernEffects:{money:[S(1)],work:[S(.15)]},questionsAsked:8},next:'AGENCY_GATE',sufficient:true},
 {id:'budget-supported-plus-unresolved',input:{concernEffects:{health:[S(.9)],energy:[S(.8),C(.8)]},questionsAsked:18},next:'AGENCY_GATE_WITH_UNCERTAINTY',sufficient:true},
 {id:'safety-overrides-multiple-focuses',input:{concernEffects:{money:[S(1)],work:[S(1)],health:[S(1)]},questionsAsked:10,safetyEscalationLevel:3},next:'SAFETY_REVIEW',sufficient:true}
];
for(const tc of decisionCases){const r=decisionSufficiency(tc.input);assert.equal(r.next,tc.next,`${tc.id}: next`);assert.equal(r.sufficient,tc.sufficient,`${tc.id}: sufficient`);assertions+=2;}

const agencyEvidence={money:[S(1)],work:[S(.9)],health:[S(.9)],energy:[S(.2)],spiritual:[S(.1)]};
const agencyCases=[
 {id:'accept-proposal',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'ACCEPT'},accepted:true,focuses:['money','work'],next:'PLAN'},
 {id:'decline-one',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'DECLINE',targetFocus:'work'},accepted:true,focuses:['money'],next:'PLAN'},
 {id:'decline-all',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'DECLINE'},accepted:true,focuses:[],next:'PLAN'},
 {id:'replace-with-supported-health',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'REPLACE',targetFocus:'work',replacementFocus:'health'},accepted:true,focuses:['money','health'],next:'PLAN'},
 {id:'reject-unsupported-energy-replacement',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'REPLACE',targetFocus:'work',replacementFocus:'energy'},accepted:false,focuses:['money','work'],next:'AGENCY_GATE'},
 {id:'reject-unsupported-spiritual-add',input:{proposedFocuses:['money'],concernEffects:agencyEvidence,operation:'ADD',replacementFocus:'spiritual'},accepted:false,focuses:['money'],next:'AGENCY_GATE'},
 {id:'add-supported-health',input:{proposedFocuses:['money'],concernEffects:agencyEvidence,operation:'ADD',replacementFocus:'health'},accepted:true,focuses:['money','health'],next:'PLAN'},
 {id:'respect-three-focus-cap',input:{proposedFocuses:['money','work','health'],concernEffects:agencyEvidence,operation:'ADD',replacementFocus:'health'},accepted:true,focuses:['money','work','health'],next:'PLAN'},
 {id:'reject-fourth-supported-focus',input:{proposedFocuses:['money','work','health'],concernEffects:{...agencyEvidence,relationships:[S(.9)]},operation:'ADD',replacementFocus:'relationships'},accepted:false,focuses:['money','work','health'],next:'AGENCY_GATE'},
 {id:'reject-replace-missing-target',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'REPLACE',targetFocus:'energy',replacementFocus:'health'},accepted:false,focuses:['money','work'],next:'AGENCY_GATE'},
 {id:'safety-overrides-accept',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'ACCEPT',safetyEscalationLevel:2},accepted:false,focuses:[],next:'SAFETY_REVIEW'},
 {id:'safety-overrides-replace',input:{proposedFocuses:['money','work'],concernEffects:agencyEvidence,operation:'REPLACE',targetFocus:'work',replacementFocus:'health',safetyEscalationLevel:3},accepted:false,focuses:[],next:'SAFETY_REVIEW'}
];
for(const tc of agencyCases){const r=applyAgencyGate(tc.input);assert.equal(r.accepted,tc.accepted,`${tc.id}: accepted`);assert.deepEqual(r.focuses,tc.focuses,`${tc.id}: focuses`);assert.equal(r.next,tc.next,`${tc.id}: next`);assertions+=3;}
console.log(`EEV1 blinded decision benchmark: PASS (${cases.length+decisionCases.length+agencyCases.length} predefined cases, ${assertions} assertions)`);
