import assert from 'node:assert/strict';
import {QA_DIMENSIONS,shouldResolveBlindQa,chooseOpeningProbe} from './blind-qa-policy.js';

const counts=n=>Object.fromEntries(QA_DIMENSIONS.map((d,i)=>[d,i<n?1:0]));
const values=n=>Object.fromEntries(QA_DIMENSIONS.map(d=>[d,n]));

// Healthy-looking dialogue must not declare success after a few reassuring answers.
assert.equal(shouldResolveBlindQa({turns:3,belief:values(.05),uncertainty:values(.3),evidenceCount:counts(3)}),false);
assert.equal(shouldResolveBlindQa({turns:8,belief:values(.05),uncertainty:values(.3),evidenceCount:counts(8)}),true);

// A confirmed problem may resolve after meaningful cross-dimensional coverage.
const belief=values(.05),uncertainty=values(.3);belief.Physical=.7;
assert.equal(shouldResolveBlindQa({turns:4,belief,uncertainty,evidenceCount:counts(3)}),false);
assert.equal(shouldResolveBlindQa({turns:4,belief,uncertainty,evidenceCount:counts(4)}),true);

// Bootstrap probes prefer an uncovered dimension rather than repeatedly sampling one dimension.
const matrix=QA_DIMENSIONS.map((d,i)=>({question_key:`q${i}`,question_family:'state',primary_dimension:d,prompt:d,expected_information_gain:3,burden:1}));
const q=chooseOpeningProbe({matrix,turns:[{q:{id:'q0'}}],evidenceCount:{Physical:1},cycle:1});
assert.notEqual(q.primary_dimension,'Physical');

console.log('blind QA policy tests passed');
