import assert from 'node:assert/strict';
import {
  CONSTRUCT_IDS,
  CONSTRUCTS,
  CONSTRUCT_BY_ID,
  validateTaxonomy,
} from '../../registries/taxonomy/index.js';

assert.deepEqual(validateTaxonomy(), []);
assert.deepEqual(new Set(CONSTRUCTS.map(item => item.id)), new Set(CONSTRUCT_IDS));

for (const legacyId of [
  'poor_sleep','low_energy','low_activity','physical_condition','stress','relationship_strain',
  'low_support','lonely','low_focus','low_activation','work_instability','schedule_disruption',
  'money_pressure','home_instability','lack_direction',
]) {
  assert.equal(CONSTRUCT_BY_ID[legacyId], undefined, `legacy concern must not be canonical: ${legacyId}`);
}

assert.ok(CONSTRUCT_BY_ID.FINANCIAL_STRAIN);
assert.ok(CONSTRUCT_BY_ID.FINANCIAL_CONTROL);
assert.notDeepEqual(CONSTRUCT_BY_ID.FINANCIAL_STRAIN.topicIds, CONSTRUCT_BY_ID.FINANCIAL_CONTROL.topicIds);
assert.ok(CONSTRUCT_BY_ID.LONELINESS);
assert.ok(CONSTRUCT_BY_ID.SUPPORT_AVAILABILITY);
assert.ok(CONSTRUCT_BY_ID.RELATIONSHIP_STRAIN);
assert.ok(CONSTRUCT_BY_ID.MEANING_PURPOSE);
assert.ok(CONSTRUCT_BY_ID.DIRECTION_CLARITY);
assert.equal(CONSTRUCT_BY_ID.COGNITIVE_ENGAGEMENT.experimental, true);

console.log('Canonical taxonomy registry uses Drive-controlled constructs without legacy concern aliases');
