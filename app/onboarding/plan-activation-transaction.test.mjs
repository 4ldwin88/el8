import test from 'node:test';
import assert from 'node:assert/strict';
import {activateCanonicalOnboarding} from './plan-activation-transaction.js';

const memberState={revision:2,activePlan:{status:null}};
const next={revision:3,activePlan:{status:'ACTIVE'}};
const plan={status:'active'};
const applyPlan=()=>next;

test('persists plan then completes lifecycle',async()=>{const calls=[];const result=await activateCanonicalOnboarding({userId:'u1',memberState,plan,applyPlan,loadState:async()=>({revision:2,state:memberState}),persistState:async x=>{calls.push(['persist',x.expectedRevision,x.state.revision]);return{revision:3,state:next}},completeOnboarding:async()=>calls.push(['complete'])});assert.equal(result,next);assert.deepEqual(calls,[['persist',2,3],['complete']])});

test('same-session retry reloads durable active plan and only retries completion',async()=>{const calls=[];const result=await activateCanonicalOnboarding({userId:'u1',memberState,plan,applyPlan:()=>{throw new Error('must not reapply')},loadState:async()=>({revision:3,state:next}),persistState:async()=>{throw new Error('must not persist')},completeOnboarding:async()=>calls.push('complete')});assert.equal(result,next);assert.deepEqual(calls,['complete'])});

test('reload with already-active Member State only completes lifecycle',async()=>{const calls=[];const result=await activateCanonicalOnboarding({userId:'u1',memberState:next,plan,applyPlan:()=>{throw new Error('must not create another plan revision')},loadState:async()=>({revision:3,state:next}),persistState:async()=>{throw new Error('must not persist')},completeOnboarding:async()=>calls.push('complete')});assert.equal(result,next);assert.deepEqual(calls,['complete'])});

test('creates initial state before plan when row does not exist',async()=>{const calls=[];const initial={revision:0,activePlan:{status:null}},planned={revision:1,activePlan:{status:'ACTIVE'}};await activateCanonicalOnboarding({userId:'u1',memberState:initial,plan,applyPlan:()=>planned,loadState:async()=>null,persistState:async x=>{calls.push([x.expectedRevision,x.state.revision]);return{revision:x.state.revision,state:x.state}},completeOnboarding:async()=>{}});assert.deepEqual(calls,[[-1,0],[0,1]])});

test('rejects unrelated stored revision',async()=>{await assert.rejects(()=>activateCanonicalOnboarding({userId:'u1',memberState,plan,applyPlan,loadState:async()=>({revision:4,state:{revision:4,activePlan:{status:null}}}),persistState:async()=>{},completeOnboarding:async()=>{}}),/revision conflict/)});
