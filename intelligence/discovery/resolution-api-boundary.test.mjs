import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as Engine from './discovery-engine.js';
import * as Runtime from '../../app/onboarding/discovery-runtime.js';

test('public Discovery APIs cannot force a concern resolution without evidence',()=>{
 assert.equal(Object.hasOwn(Engine,'resolve'),false);
 assert.equal(Object.hasOwn(Engine.default,'resolve'),false);
 assert.equal(Object.hasOwn(Runtime,'resolveDiscoveryConstruct'),false);
});

test('actual QA Discovery page cannot promote a Yes preference through the retired resolution step',async()=>{
 const page=await readFile(new URL('../../intelligence-test/discovery.html',import.meta.url),'utf8');
 assert.doesNotMatch(page,/resolveDiscoveryConstruct|priority-resolution/);
});

test('activation and member importance do not discharge evidence, while Not now records a separate decision',()=>{
 const s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY']});
 assert.equal(Engine.handoff(s).usable,false);
 Runtime.submitDiscoveryTriage(s,{SLEEP_QUALITY:3});
 assert.equal(Engine.handoff(s).usable,false);
 assert.deepEqual(Engine.handoff(s).eligibleCandidateIds,[]);
 Runtime.submitDiscoveryTriage(s,{SLEEP_QUALITY:0});
 const output=Runtime.discoveryOutput(s),state=output.trace.states[0];
 assert.equal(state.resolutionState,'deferred');
 assert.equal(state.stateEvidence.length,0);
 assert.equal(state.negativeEvidence.length,0);
 assert.equal(s.observationLog.length,2);
 assert.equal(s.observationLog.at(-1).answerValue,0);
 assert.deepEqual(output.handoff.candidateIds,[]);
});
