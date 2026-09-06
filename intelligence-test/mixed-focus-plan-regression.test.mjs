import assert from 'node:assert/strict';
import fs from 'node:fs';

const planHtml=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');
assert.match(planHtml,/id="focusStatus"/,'Plan must expose a dedicated confirmed-Focus disposition surface');
assert.match(planHtml,/focusResolutions/,'Plan must render canonical per-Focus resolutions');
assert.match(planHtml,/does not have enough governed evidence for a safe autonomous Action/,'A governed no-action Focus must remain visible rather than silently disappearing');
assert.match(planHtml,/It remains part of your Member State rather than being silently dropped/,'Plan must explain preserved no-action Focus state');
assert.match(planHtml,/Action library does not yet have governed coverage/,'Coverage gaps must remain visible as QA defects');
assert.match(planHtml,/needs one decision-critical answer/,'Deepening dispositions must remain visible');
console.log('mixed-focus Plan regression passed');
