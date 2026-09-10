import test from 'node:test';
import assert from 'node:assert/strict';
import {createDiscoverySession,saveDiscoveryDraft,loadDiscoveryDraft,answerDiscoveryQuestion} from './discovery-runtime.js';
const KEY='el8_onboarding_discovery_v7';
function storage(){const data=new Map();globalThis.sessionStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};return data;}
test('partial Discovery saves a versioned stable run without losing required gaps or order',()=>{
 const data=storage(),s=createDiscoverySession({constructIds:['SLEEP_QUALITY'],unresolvedRequirements:[{requirementId:'required:1',reason:'Missing required evidence',evidenceRefs:['second','first']}]});
 answerDiscoveryQuestion(s,s.questionBank.find(q=>q.id==='Q000020'),'A000129');
 answerDiscoveryQuestion(s,s.questionBank.find(q=>q.id==='Q000021'),'A000132');
 saveDiscoveryDraft(s);const raw=JSON.parse(data.get(KEY));
 assert.equal(raw.format,'el8.discovery-run.v1');assert.match(raw.contractFingerprint,/^[a-f0-9]{64}$/);assert.ok(raw.runId);
 const restored=loadDiscoveryDraft();assert.equal(restored.runId,raw.runId);assert.deepEqual(restored.unresolvedRequirements,s.unresolvedRequirements);
 assert.deepEqual(restored.observationLog,s.observationLog);
 const withoutBank=({questionBank,...data})=>data;assert.deepEqual(withoutBank(restored),withoutBank(s));
 saveDiscoveryDraft(restored);assert.equal(JSON.parse(data.get(KEY)).runId,raw.runId);
});
test('versionless, malformed and other-contract drafts fail explicitly without destroying stored evidence',()=>{
 const data=storage();
 for(const raw of ['{',JSON.stringify({constructIds:['SLEEP_QUALITY']}),JSON.stringify({format:'el8.discovery-run.v1',contractFingerprint:'0'.repeat(64),runId:'old',session:{}})]){
  data.set(KEY,raw);assert.throws(()=>loadDiscoveryDraft(),/record|draft|format|contract|JSON/i);assert.equal(data.get(KEY),raw);
 }
});
test('saving cannot silently discard a non-JSON evidence value or impersonate the governed bank',()=>{
 storage();const invalid=createDiscoverySession();invalid.facts={lost:undefined};assert.throws(()=>saveDiscoveryDraft(invalid),/JSON/i);
 const custom=createDiscoverySession({questionBank:[]});assert.throws(()=>saveDiscoveryDraft(custom),/bank|contract/i);
});

test('capture never invokes evidence getters or discards hidden properties',()=>{
 const data=storage(),s=createDiscoverySession();saveDiscoveryDraft(s);const before=data.get(KEY);let calls=0;
 Object.defineProperty(s,'hiddenEvidence',{enumerable:true,get(){calls++;return 'reported';}});
 assert.throws(()=>saveDiscoveryDraft(s),/JSON/i);assert.equal(calls,0);assert.equal(data.get(KEY),before);
 const hidden=createDiscoverySession();Object.defineProperty(hidden,'hiddenEvidence',{value:'reported',enumerable:false});
 assert.throws(()=>saveDiscoveryDraft(hidden),/JSON/i);assert.equal(data.get(KEY),before);
});
