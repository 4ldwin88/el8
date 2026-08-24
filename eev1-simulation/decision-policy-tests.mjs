import assert from 'node:assert/strict';
import { decisionSufficiency, actionEligibility, adaptPlan } from './decision-policy.js';
const ev=(polarity,strength,overrides={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...overrides});
const tests=[]; const test=(n,f)=>tests.push([n,f]);

test('supported focus can stop questioning',()=>assert.equal(decisionSufficiency({concernEffects:{money:[ev('supports',1)]},questionsAsked:5}).next,'AGENCY_GATE'));
test('conflict forces discrimination',()=>assert.equal(decisionSufficiency({concernEffects:{energy:[ev('supports',.8),ev('contradicts',.6)]},questionsAsked:5}).next,'DISCRIMINATE_CONFLICT'));
test('question budget prevents unsure loop',()=>assert.equal(decisionSufficiency({concernEffects:{energy:[ev('supports',.3)]},questionsAsked:18}).stopReason,'question-budget-reached'));
test('safety overrides ordinary discovery',()=>assert.equal(decisionSufficiency({concernEffects:{money:[ev('supports',1)]},questionsAsked:3,safetyEscalationLevel:2}).next,'SAFETY_REVIEW'));
test('unresolved driver blocks resolve action',()=>assert.equal(actionEligibility({concernEffects:[ev('supports',1)],driverEffects:[ev('supports',.3)],actionIntent:'resolve'}).eligible,false));
test('unresolved driver still permits learn action',()=>assert.equal(actionEligibility({concernEffects:[ev('supports',1)],driverEffects:[],actionIntent:'learn'}).eligible,true));
test('worsening despite adherence reopens hypothesis',()=>assert.equal(adaptPlan({adherence:'high',outcome:'worse'}).reopenHypothesis,true));
test('non-adherence burden reduces burden rather than blaming intervention',()=>assert.equal(adaptPlan({adherence:'low',outcome:'unchanged',nonAdherenceReason:'burden'}).decision,'REDUCE_BURDEN'));
test('late safety signal pauses active plan',()=>assert.equal(adaptPlan({adherence:'high',outcome:'better',newSafetyLevel:2}).decision,'PAUSE_OR_REFER'));
let failures=0;for(const[n,f]of tests){try{f();console.log(`PASS ${n}`)}catch(e){failures++;console.error(`FAIL ${n}: ${e.message}`)}}console.log(`\nDecision policy: ${tests.length-failures}/${tests.length} passed`);if(failures)process.exit(1);
