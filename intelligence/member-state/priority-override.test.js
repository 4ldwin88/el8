'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { capturePriorityOverride } = require('./priority-override');

test('unchanged member priorities need no override context', () => {
  const result = capturePriorityOverride({ recommendedPriorities: ['sleep'], confirmedPriorities: ['sleep'] });
  assert.equal(result.overridden, false);
  assert.deepEqual(result.constraints, []);
});

test('changed priorities retain allowed friction as canonical constraints', () => {
  const result = capturePriorityOverride({
    recommendedPriorities: ['sleep'],
    confirmedPriorities: ['movement'],
    frictions: ['time', { type: 'energy', note: 'too depleted' }, 'unsupported']
  });
  assert.equal(result.overridden, true);
  assert.deepEqual(result.constraints, ['time', 'energy']);
  assert.equal(result.capacitySignal, 'low');
  assert.equal(result.frictions[1].note, 'too depleted');
});

test('changed priorities without friction remain explicitly unresolved', () => {
  const result = capturePriorityOverride({ recommendedPriorities: ['sleep'], confirmedPriorities: ['movement'] });
  assert.equal(result.overridden, true);
  assert.equal(result.frictions.length, 0);
});
