import test from 'node:test';
import assert from 'node:assert/strict';
import {activateCanonicalOnboarding} from './plan-activation-transaction.js';

const memberState={revision:2};
const next={revision:3};
const plan={status:'active'};
const applyPlan=()=>next;

test('persists plan then completes lifecycle',async()=>{const calls=[];const result=await activateCanonicalOnboarding({userId:'u1',memberState,plan,persisted:{revision:2,state:memberState},applyPlan,persistState:async x=>{calls.push(['persist',x.expectedRevision,x.state.revision]);return{revision:3,state:next}},completeOnboarding:async()=>calls.push(['complete'])});assert.equal(result,next);assert.deepEqual(calls,[['persist',2,3],['complete']])});

test('retry after completion failure does not replay stale plan persistence',async()=>{const calls=[];const result=await activateCanonicalOnboarding({userId:'u1',memberState,plan,persisted:{revision:3,state:next},applyPlan,persistState:async()=>{throw new Error('must not persist')},completeOnboarding:async()=>calls.push('complete')});assert.equal(result,next);assert.deepEqual(calls,['complete'])});

test('creates baseline state before plan when row does not exist',async()=>{const calls=[];await activateCanonicalOnboarding({userId:'u1',memberState:{revision:0},plan,applyPlan:()=>({revision:1}),persisted:null,persistState:async x=>{calls.push([x.expectedRevision,x.state.revision]);return x.expectedRevision===-1?{revision:0,state:x.state}:{revision:1,state:x.state}},completeOnboarding:async()=>{}});assert.deepEqual(calls,[[-1,0],[0,1]])});

test('rejects unrelated stored revision',async()=>{await assert.rejects(()=>activateCanonicalOnboarding({userId:'u1',memberState,plan,persisted:{revision:4,state:{revision:4}},applyPlan,persistState:async()=>{},completeOnboarding:async()=>{}}),/revision conflict/)});
