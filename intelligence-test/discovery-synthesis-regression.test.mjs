import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./discovery.html',import.meta.url),'utf8');

assert.match(html,/<strong>Health:<\/strong>/,'Discovery handoff must use a capitalized member-facing Health label');
assert.match(html,/physical condition or how your body feels is part of what you want to improve/,'Discovery handoff must explain reported body or physical-condition evidence');
assert.match(html,/activity or movement is also part of the health picture/,'Discovery handoff must explain reported activity evidence');
assert.match(html,/next steps need to stay low-cost/,'Discovery handoff must surface low-cost plan-fit constraints');
assert.match(html,/<strong>Plan fit:<\/strong>/,'Discovery handoff must distinguish plan-fit constraints from the understanding summary');
assert.doesNotMatch(html,/<strong>health:<\/strong> this is an area you want EL8 to take into account/,'Discovery handoff must not fall back to the old generic lowercase health summary');

console.log('Discovery member-facing synthesis regression passed');
