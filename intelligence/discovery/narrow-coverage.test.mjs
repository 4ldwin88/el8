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

// G001 coverage contract: every ordinary listed concern must have at least one
// eligible targeted interaction immediately after the member raises it. This is a
// structural guard against concern-specific dead ends; deeper semantic sufficiency
// remains covered by scenario tests rather than being replaced by a fixed question count.
const G001_CONCERNS=['money','work','health','energy','sleep','stress','relationships','support','home','focus','direction'];
for(const concern of G001_CONCERNS){
  const s=discovery.session({concernIds:[]});
  const g=discovery.next(s);
  assert.equal(g.question.id,'G1');
  discovery.answer(s,g.question,[concern]);
  const next=discovery.next(s);
  assert.equal(next.type,'question',`${concern}: must have a question after G001`);
  assert.notEqual(next.phase,'blocked',`${concern}: must not block immediately after G001`);
  assert.ok((next.question.concernIds||[]).includes(concern),`${concern}: first targeted question must cover the raised concern`);
}

console.log('Discovery Narrow member-raised concern coverage regression passed');
