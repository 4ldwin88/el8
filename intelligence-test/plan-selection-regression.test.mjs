import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');
assert.match(html,/<strong>Track:<\/strong>/,'Plan action cards must state what is tracked or logged');
assert.doesNotMatch(html,/<strong>EL8 checks:<\/strong>/,'Plan cards must not hide member tracking behind vague EL8 checks copy');
assert.doesNotMatch(html,/if\(canonical\.activationStatus==='needs_plan_specific_assessment'\)/,'Plan must not redirect to activation deepening before the member selects actions');
assert.match(html,/if\(chosen\.activationStatus==='needs_plan_specific_assessment'\)/,'Selected actions may trigger plan-specific deepening after member confirmation');
assert.match(html,/\.group h2\{font-size:16px/,'Plan cards must retain compact action-title typography');
console.log('Planning selection UI regression passed');
