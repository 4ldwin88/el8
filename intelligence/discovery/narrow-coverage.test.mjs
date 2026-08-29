import assert from 'node:assert/strict';
import * as discovery from './discovery-engine.js';

const session=discovery.session({concernIds:[]});
let step=discovery.next(session);
assert.equal(step.question.id,'G1');
discovery.answer(session,step.question,['money','health']);

step=discovery.next(session);
assert.equal(step.phase,'narrow');
assert.equal(step.type,'question');
const firstTargets=new Set(step.question.concernIds||[]);
const firstSelected=firstTargets.has('money')?'money':firstTargets.has('health')?'health':null;
assert.ok(firstSelected,'first Narrow interaction must target a member-raised concern');
const firstAnswer=firstSelected==='money'?'expenses':'body';
discovery.answer(session,step.question,firstAnswer);

step=discovery.next(session);
assert.equal(step.phase,'narrow','Narrow must not advance while another member-raised concern has not received a targeted interaction');
assert.equal(step.type,'question');
const secondTargets=new Set(step.question.concernIds||[]);
const remaining=firstSelected==='money'?'health':'money';
assert.ok(secondTargets.has(remaining),`second Narrow interaction must cover remaining member-raised concern: ${remaining}`);

console.log('Discovery Narrow member-raised concern coverage regression passed');
