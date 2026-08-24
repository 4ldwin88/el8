import assert from 'node:assert/strict';
import { classifyConcern, evaluateDriverHypothesis, focusEligibility } from './evidence-engine.js';

const ev = (polarity, strength, overrides={}) => ({ type:'evidence', polarity, strength, sourceType:'direct', certainty:'graded', temporality:'current', ...overrides });

const cases = [];
function test(name, fn){ cases.push([name, fn]); }

test('no evidence stays UNKNOWN', () => assert.equal(classifyConcern([]).state, 'UNKNOWN'));
test('strong direct current evidence becomes SUPPORTED', () => assert.equal(classifyConcern([ev('supports',1)]).state, 'SUPPORTED'));
test('weak evidence remains CANDIDATE', () => assert.equal(classifyConcern([ev('supports',0.4)]).state, 'CANDIDATE'));
test('meaningful contradiction creates UNRESOLVED conflict', () => assert.equal(classifyConcern([ev('supports',0.8),ev('contradicts',0.6)]).state, 'UNRESOLVED'));
test('definitive contradiction can clear weak candidate', () => assert.equal(classifyConcern([ev('contradicts',1,{certainty:'definitive'})]).state, 'CLEARED'));
test('historical inferred signal cannot easily become supported', () => assert.notEqual(classifyConcern([ev('supports',1,{sourceType:'inferred',temporality:'historical'})]).state, 'SUPPORTED'));
test('focus requires supported evidence above confidence floor', () => assert.equal(focusEligibility([ev('supports',1)]).eligible, true));
test('candidate cannot enter focus set', () => assert.equal(focusEligibility([ev('supports',0.4)]).eligible, false));
test('driver remains explicitly uncertain below driver floor', () => assert.equal(evaluateDriverHypothesis([ev('supports',0.8)]).residualUncertainty, true));
test('conflicted driver cannot be presented as established', () => assert.equal(evaluateDriverHypothesis([ev('supports',1),ev('contradicts',0.5)]).established, false));

let failures=0;
for(const [name,fn] of cases){try{fn();console.log(`PASS ${name}`)}catch(error){failures++;console.error(`FAIL ${name}`);console.error(error.message)}}
console.log(`\nEEV1 simulation: ${cases.length-failures}/${cases.length} passed`);
if(failures) process.exit(1);
