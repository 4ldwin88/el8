import assert from 'node:assert/strict';
import {ACTION_DEFINITIONS,createActionRegistry} from './action-registry.js';
import {assertGovernedActionId} from './action-contract.js';

assert.equal(ACTION_DEFINITIONS.length,41);
for(const action of ACTION_DEFINITIONS)assertGovernedActionId(action.actionId);
const registry=createActionRegistry();
assert.equal(registry.all().length,41);
assert.equal(registry.get('ACT000001')?.legacyAlias,'PHY-A01');
assert.ok(registry.forConstruct('SLEEP_QUALITY').some(a=>a.actionId==='ACT000001'));
assert.ok(!registry.forConstruct('RELATIONSHIP_STRAIN').some(a=>a.actionId==='ACT000015'),'unsupported experimental Action must not be autonomously available');
const plan=registry.eligibleFor({focusIds:['SLEEP_QUALITY'],planningConditions:['reduce_simultaneous_demands']});
assert.ok(plan.eligible.some(a=>a.actionId==='ACT000036'),'governed plan Action should resolve from Planning condition');
assert.throws(()=>registry.get('PHY-A01'),/non-governed Action ID/,'legacy aliases must not be runtime identity');
console.log('planning registry cutover: PASS');
