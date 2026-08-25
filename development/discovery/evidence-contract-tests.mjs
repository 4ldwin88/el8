import assert from 'node:assert/strict';
import {makeObservation} from './contracts.js';
import {deriveConcernState} from './concern-projection.js';
import {adaptQuestion,observationsForAnswer} from './question-bank-adapter.js';
import {DISCOVERY_QUESTION_BY_ID} from './questions/index.js';

// Specific answers must produce explicit, traceable evidence rather than opaque score mutation.
const stressDriver=adaptQuestion(DISCOVERY_QUESTION_BY_ID.ST2);
const workObs=observationsForAnswer(stressDriver,['work'],{timestamp:100});
assert.ok(workObs.length>0);
assert.ok(workObs.every(o=>o.questionId==='ST2'));
assert.ok(workObs.some(o=>o.effects.some(e=>e.type==='evidence'&&e.target==='work'&&e.polarity==='supports')));

// Cross-dimensional evidence remains explicit and attributable to the member answer that produced it.
const moneyDriver=adaptQuestion(DISCOVERY_QUESTION_BY_ID.M3);
const debtObs=observationsForAnswer(moneyDriver,['debt'],{timestamp:200});
const debtTargets=new Set(debtObs.flatMap(o=>o.effects.map(e=>e.target)));
assert.ok(debtTargets.has('money'));
assert.ok(debtTargets.has('stress'));
assert.ok(debtObs.every(o=>o.questionId==='M3'&&o.answerValue==='debt'));

// Multi-select answers combine substantive evidence; the adapter must not silently keep only one selection.
const multi=adaptQuestion({id:'MULTI',mode:'multi',role:'gateway',targets:['money_pressure','poor_sleep'],options:[{id:'money',label:'Money',effects:{money_pressure:.7}},{id:'sleep',label:'Sleep',effects:{poor_sleep:.8}}]});
const multiObs=observationsForAnswer(multi,['money','sleep'],{timestamp:300});
const multiTargets=new Set(multiObs.flatMap(o=>o.effects.map(e=>e.target)));
assert.ok(multiTargets.has('money'));
assert.ok(multiTargets.has('sleep'));

// Weak/unsure answers are retained as observations but cannot manufacture confidence.
const weakQuestion=adaptQuestion({id:'WEAK',mode:'single',role:'discriminator',targets:['stress'],options:[{id:'unsure',label:'Not sure',effects:{stress:.8}}]});
const weakObs=observationsForAnswer(weakQuestion,['unsure'],{timestamp:400});
assert.equal(weakObs.length,1);
assert.equal(weakObs[0].answerValue,'unsure');
assert.ok(weakObs[0].effects.every(e=>e.strength===0&&e.polarity==='neutral'));
assert.equal(deriveConcernState(weakObs,'stress').evidenceConfidence,0);

// Supporting and contradicting evidence can coexist; projection must remain traceable rather than overwrite history.
const mixed=[
  makeObservation({id:'support',questionId:'A',concernId:'sleep',timestamp:500,effects:[{type:'evidence',target:'sleep',polarity:'supports',strength:.8,certainty:'graded',sourceType:'direct',temporality:'current'}]}),
  makeObservation({id:'counter',questionId:'B',concernId:'sleep',timestamp:600,effects:[{type:'evidence',target:'sleep',polarity:'contradicts',strength:.3,certainty:'graded',sourceType:'direct',temporality:'current'}]}),
];
const mixedState=deriveConcernState(mixed,'sleep');
assert.equal(mixedState.rawEvidenceScore,.5);
assert.deepEqual(mixedState.evidenceRefs,['A','B']);

// Definitive contradiction explicitly excludes a concern rather than converting it into positive evidence.
const excluded=[makeObservation({id:'exclude',questionId:'C',concernId:'money',timestamp:700,effects:[{type:'evidence',target:'money',polarity:'contradicts',strength:1,certainty:'definitive',sourceType:'direct',temporality:'current'}]})];
const excludedState=deriveConcernState(excluded,'money');
assert.equal(excludedState.excluded,true);
assert.equal(excludedState.evidenceConfidence,0);

console.log('Canonical Discovery evidence contract regressions passed');
