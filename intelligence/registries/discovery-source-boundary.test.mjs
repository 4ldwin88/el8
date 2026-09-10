import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import * as registries from './index.js';
import {getAnswer,getEffectsForAnswer} from './registry.js';
import Discovery from '../discovery/discovery-engine.js';

test('routing/direct-state registry values match the independent canonical Drive extraction',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../../docs/remediation/discovery-registry-source.json',import.meta.url)));
 for(const [name,expected] of Object.entries(manifest.collections)){
  assert.equal(registries[name].length,expected.count,name);
  assert.equal(createHash('sha256').update(JSON.stringify(registries[name])).digest('hex'),expected.sha256,name);
 }
});

test('current permanent answers keep governed parentage and cannot execute under the former conflicting question',()=>{
 assert.equal(getAnswer('A000574')['Parent Question ID'],'Q000094');
 assert.equal(getAnswer('A000574').Answer,'A lot of control');
 const s=Discovery.session();
 Discovery.answer(s,Discovery.BANK.find(q=>q.id==='Q000086'),'A000574');
 assert.equal(s.observationLog.length,0);assert.deepEqual(s.constructIds,[]);
 Discovery.answer(s,Discovery.BANK.find(q=>q.id==='Q000094'),'A000574');
 assert.equal(s.observationLog.length,1);
 const effect=s.observationLog[0].registryEvidence.effects[0];
 assert.equal(effect['Effect Type'],'STATE');assert.equal(effect['Target ID / Construct'],'FINANCIAL_CONTROL');
 assert.equal(effect.Value,'high');
 for(const id of ['A000594','A000605','A000629','A000630','A000635','A000654']){
  assert.equal(getAnswer(id),null,id);assert.deepEqual(getEffectsForAnswer(id),[],id);
 }
});

test('approved Values option routes only and missing canonical routes are never synthesized',()=>{
 assert.equal(getAnswer('A000568').Answer,'Priorities or values');
 const s=Discovery.session();Discovery.answer(s,Discovery.BANK.find(q=>q.id==='Q000092'),'A000568');
 assert.deepEqual(s.constructIds,['VALUES_CLARITY']);
 assert.equal(Discovery.trace(s).states[0].stateEvidence.length,0);
 assert.equal(Discovery.handoff(s).usable,false);
 const effects=getEffectsForAnswer('A000568');assert.equal(effects.length,1);
 assert.equal(effects[0]['Effect ID'],'EFX000458');assert.equal(effects[0]['Effect Type'],'ROUTE');
 for(const id of ['A000559','A000563','A000567'])assert.deepEqual(getEffectsForAnswer(id),[],id);
});
