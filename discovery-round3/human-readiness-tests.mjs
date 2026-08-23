import assert from 'node:assert/strict';
import Discovery from './round3-engine.js';

// Human flow must start broad, not with the whole ontology preactivated.
const s=Discovery.session();
assert.deepEqual(s.concernIds,[]);
const first=Discovery.next(s);
assert.equal(first.type,'question');
assert.equal(first.question.role,'gateway');

// Gateway answers activate only supported concerns.
const options=first.question.options??[];
const supported=options.filter(o=>Object.entries(o.effects??{}).some(([k,v])=>!k.startsWith('__')&&v>0)).slice(0,2).map(o=>o.id);
assert.ok(supported.length>0,'Gateway must contain concern-producing options');
Discovery.answer(s,first.question,supported);
assert.ok(s.concernIds.length>0);
assert.ok(s.concernIds.length<=supported.length*4,'Gateway should scope rather than activate entire ontology');

// More than three active concerns should triage only those active concerns.
const many=Discovery.session({concernIds:['money','sleep','home','support','direction']});
const t=Discovery.next(many);
assert.equal(t.type,'triage');
assert.deepEqual(t.question.concerns.map(x=>x.id),many.concernIds);

// Three or fewer concerns should narrow without forced triage.
const few=Discovery.session({concernIds:['sleep','home']});
const n=Discovery.next(few);
assert.notEqual(n.type,'triage');

console.log('Round 3 human readiness tests passed');
