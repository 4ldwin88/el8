import assert from 'node:assert/strict';
import { aggregateEvidence, classifyConcern, focusEligibility } from './evidence-engine.js';
const E=(polarity,strength,extra={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...extra});
const S=(n,x={})=>E('supports',n,x), C=(n,x={})=>E('contradicts',n,x);
let checks=0; const check=f=>{f();checks++;};

// Support monotonicity: adding independent supportive evidence cannot reduce support/net or turn SUPPORTED into a weaker state.
for(const base of [[],[S(.2)],[S(.4)],[S(.8)],[S(.7),C(.2)]]) for(const add of [.05,.2,.5,1]) check(()=>{
  const a=aggregateEvidence(base), b=aggregateEvidence([...base,S(add,{observationId:`s-${add}-${base.length}`})]);
  assert.ok(b.support>=a.support); assert.ok(b.net>=a.net-1e-12);
  if(classifyConcern(base).state==='SUPPORTED') assert.equal(classifyConcern([...base,S(add,{observationId:`m-${add}`})]).state,'SUPPORTED');
});

// Contradiction monotonicity: independent contradiction cannot increase net support or create focus eligibility.
for(const base of [[],[S(.2)],[S(.6)],[S(1)],[S(.8),C(.1)]]) for(const add of [.05,.2,.5,1]) check(()=>{
  const a=aggregateEvidence(base), b=aggregateEvidence([...base,C(add,{observationId:`c-${add}-${base.length}`})]);
  assert.ok(b.contradiction>=a.contradiction); assert.ok(b.net<=a.net+1e-12);
  if(!focusEligibility(base).eligible) assert.equal(focusEligibility([...base,C(add,{observationId:`ce-${add}`})]).eligible,false);
});

// Irrelevant non-evidence effects must have exactly zero effect.
for(const noise of [
  {type:'importance',value:5},{type:'member-priority',value:'focus-first'},
  {type:'metadata',foo:'bar'},{},null
]) check(()=>{
  const base=[S(.8),C(.2)]; assert.deepEqual(aggregateEvidence([...base,noise]),aggregateEvidence(base));
});

// Equivalent representations: missing defaults equal explicit defaults.
for(const polarity of ['supports','contradicts']) for(const strength of [.1,.5,1]) check(()=>{
  const implicit={type:'evidence',polarity,strength};
  const explicit={type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'unknown'};
  assert.deepEqual(aggregateEvidence([implicit]),aggregateEvidence([explicit]));
});

// Splitting one observation into multiple effects with the same provenance must not amplify it.
for(const strength of [.2,.5,1]) for(const n of [2,5,10]) check(()=>{
  const one=S(strength,{observationId:'one'});
  const many=Array.from({length:n},()=>S(strength,{observationId:'one'}));
  assert.deepEqual(aggregateEvidence(many),aggregateEvidence([one]));
});

// Adding historical support can increase contextual support/confidence but cannot create current focus eligibility by itself.
for(const n of [1,5,20]) check(()=>{
  const effects=Array.from({length:n},(_,i)=>S(1,{temporality:'historical',observationId:`h${i}`}));
  assert.equal(focusEligibility(effects).eligible,false);
});

// Adding unrelated metadata to an evidence effect cannot alter its classification.
for(const extra of [{questionId:'Q1'},{label:'x'},{timestamp:123},{concernId:'energy'}]) check(()=>{
  assert.deepEqual(classifyConcern([S(.9)]),classifyConcern([S(.9,extra)]));
});

console.log(`EEV1 metamorphic validation: PASS (${checks} property checks)`);
