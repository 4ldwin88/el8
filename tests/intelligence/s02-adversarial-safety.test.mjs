import test from 'node:test';
import assert from 'node:assert/strict';
import { safetyGate, assertSafetyAllowsOrdinaryFlow } from '../../intelligence/safety/gate.js';

const gate=(contextualSignals,confirmation=null)=>safetyGate({
 stage:'review', contextualSignals, confirmation,
 observationRefs:['OBS000001'], evidenceRefs:['EVD000001'], constructRefs:['SLEEP_QUALITY']
});

test('S02 unknown or malformed contextual values cannot masquerade as positive Safety evidence',()=>{
 for(const value of [undefined,null,'0.99','true',{},[],NaN,Infinity,-Infinity]){
  const r=gate({functionalDeterioration:value});
  assert.equal(r.status,'clear_for_ordinary_flow');
  assert.equal(r.pauseOrdinaryFlow,false);
 }
});

test('S02 threshold boundary is deterministic and does not drift',()=>{
 assert.equal(gate({functionalDeterioration:.899999}).status,'clear_for_ordinary_flow');
 assert.equal(gate({functionalDeterioration:.9}).status,'confirmation_required');
 assert.equal(gate({functionalDeterioration:.649999,severeSleepChange:.649999}).status,'clear_for_ordinary_flow');
 assert.equal(gate({functionalDeterioration:.65,severeSleepChange:.65}).status,'confirmation_required');
});

test('S02 explicit concern cannot be diluted by contradictory benign context',()=>{
 const r=gate({explicitSafetyConcern:true,functionalDeterioration:0,severeSleepChange:0});
 assert.equal(r.status,'confirmation_required');
 assert.equal(r.pauseOrdinaryFlow,true);
 assert.throws(()=>assertSafetyAllowsOrdinaryFlow(r));
});

test('S02 contradictory direct confirmation resolves conservatively to escalation',()=>{
 const r=gate({explicitSafetyConcern:true},{immediateDanger:false,intent:true,canStaySafe:true});
 assert.equal(r.status,'escalate');
 assert.equal(r.pauseOrdinaryFlow,true);
 assert.ok(r.disposition.rationaleCodes.includes('direct_confirmation_positive'));
});

test('S02 cannot-stay-safe overrides denials of danger and intent',()=>{
 const r=gate({explicitSafetyConcern:true},{immediateDanger:false,intent:false,canStaySafe:false});
 assert.equal(r.status,'escalate');
 assert.equal(r.pauseOrdinaryFlow,true);
});

test('S02 incomplete direct confirmation cannot be treated as a completed negative confirmation',()=>{
 const r=gate({explicitSafetyConcern:true},{immediateDanger:false});
 assert.equal(r.status,'confirmation_required');
 assert.equal(r.pauseOrdinaryFlow,true);
 assert.equal(r.disposition,null);
 assert.throws(()=>assertSafetyAllowsOrdinaryFlow(r));
});

test('S02 non-boolean confirmation values cannot clear a Safety interruption',()=>{
 const r=gate({explicitSafetyConcern:true},{immediateDanger:'false',intent:'false',canStaySafe:'true'});
 assert.equal(r.status,'confirmation_required');
 assert.equal(r.pauseOrdinaryFlow,true);
 assert.equal(r.disposition,null);
});

test('S02 Safety signal preserves opaque evidence and canonical construct provenance',()=>{
 const r=gate({functionalDeterioration:.9});
 assert.equal(r.status,'confirmation_required');
 assert.deepEqual(r.contextual.signals[0].observationRefs,['OBS000001']);
 assert.deepEqual(r.contextual.signals[0].evidenceRefs,['EVD000001']);
 assert.deepEqual(r.contextual.signals[0].constructRefs,['SLEEP_QUALITY']);
 assert.equal('concernRefs' in r.contextual.signals[0],false);
});
