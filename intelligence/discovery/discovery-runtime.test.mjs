import assert from 'node:assert/strict';
import * as discovery from './discovery-engine.js';
import {DISCOVERY_BANK} from './observationNormalizer.js';
import {createDiscoverySession,nextDiscoveryStep,answerDiscoveryInteraction} from '../../app/onboarding/discovery-runtime.js';

const positive=createDiscoverySession({constructIds:[]});
let matrix=nextDiscoveryStep(positive);
assert.equal(matrix.type,'matrix');
assert.equal(positive.questionsAsked,1);
let answers={};
for(const q of matrix.questions)answers[q.id]=q.options.find(o=>o.text==='Going well')?.id;
answerDiscoveryInteraction(positive,matrix,answers);
let step=nextDiscoveryStep(positive);
assert.equal(step.type,'finish');
assert.equal(step.stop.reason,'baseline-complete-no-active-concern');

const narrowed=createDiscoverySession({constructIds:[]});
matrix=nextDiscoveryStep(narrowed);
answers={};
for(const q of matrix.questions)answers[q.id]=q.options.find(o=>o.text==='Going well')?.id;
const financial=matrix.questions.find(q=>String(q.dimension).toUpperCase()==='FINANCIAL');
answers[financial.id]=financial.options.find(o=>o.text==='Difficult')?.id;
answerDiscoveryInteraction(narrowed,matrix,answers);
step=nextDiscoveryStep(narrowed);
assert.equal(step.type,'driver-triage');
assert.equal(step.interaction,'compact-driver-relationship-screen');
assert.equal(narrowed.questionsAsked,2);
assert.equal(step.presentation.compactWrappingButtons,true);
assert.ok(step.questions.some(q=>String(q.dimension).toUpperCase()==='FINANCIAL'));
assert.equal(narrowed.asked.includes('Q000001'),false);

// The obsolete post-triage dropdown relationship stage must never be emitted.
for(let i=0;i<4;i++){
 if(step.type!=='driver-triage')break;
 const response={};
 for(const q of step.questions){const first=q.options?.[0];if(first)response[q.id]=q.responseMode==='multi'?[first.id]:first.id}
 answerDiscoveryInteraction(narrowed,step,response);
 step=nextDiscoveryStep(narrowed);
 assert.notEqual(step.type,'relationship-screen');
}
assert.equal(typeof discovery.relate,'undefined');
assert.equal(typeof discovery.skipRelationships,'undefined');
assert.ok(DISCOVERY_BANK.some(q=>q.role==='baseline-discriminator'));
console.log('Discovery contract: orientation is interaction 1; compact wrapping driver/relationship narrowing is interaction 2; targeted Deepen follows; no separate dropdown relationship stage.');