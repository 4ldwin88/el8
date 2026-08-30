import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');
assert.match(html,/<strong>Track:<\/strong>/,'Plan action cards must state what is tracked or logged');
assert.doesNotMatch(html,/<strong>EL8 checks:<\/strong>/,'Plan cards must not hide member tracking behind vague EL8 checks copy');
assert.match(html,/Choose the actions that fit\./,'Plan must preserve member Action selection');
assert.match(html,/Change focus/,'Plan must let the member return to Focus selection');
assert.match(html,/\.group h2\{font-size:16px/,'Plan cards must retain compact action-title typography');
assert.doesNotMatch(html,/recommendation\.fit|recommendation\.confidence|recommendation\.strength/,'Internal quantitative scores must not be shown as pseudo-precise member-facing numbers');
console.log('Planning selection UI regression passed');
