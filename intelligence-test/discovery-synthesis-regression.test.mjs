import assert from 'node:assert/strict';
import fs from 'node:fs';
const discovery=fs.readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
const priorities=fs.readFileSync(new URL('./priorities.html',import.meta.url),'utf8');
const plan=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
assert.match(index,/location\.href='discovery\.html'/,'Intelligence Test must enter Discovery directly');
assert.match(discovery,/class="progress"/,'Discovery must retain unobtrusive progress feedback');
assert.match(priorities,/class="progress"/,'Focus confirmation must retain unobtrusive progress feedback');
assert.match(plan,/class="progress"/,'Planning must retain unobtrusive progress feedback');
for(const [name,html] of [['Discovery',discovery],['Focus',priorities],['Plan',plan]]){
  assert.doesNotMatch(html,/<span>Discovery<\/span><span>Prioritize<\/span><span>Focus<\/span><span>Plan<\/span>/,`${name} must not expose internal Intelligence stage labels as member UI`);
  assert.match(html,/aria-label="Internal QA note"/,`${name} must keep internal QA notes visible during human validation`);
  assert.doesNotMatch(html,/<details class="qa">/,`${name} QA notes must not be collapsible`);
}
assert.match(discovery,/createDiscoverySession\(\)/,'Discovery must create its own session without an upstream assessment dependency');
assert.doesNotMatch(index,/baseline/i,'Intelligence Test entry must not reference the retired pre-Discovery stage');
assert.doesNotMatch(discovery,/baseline/i,'Discovery must not depend on or reference the retired pre-Discovery stage');
assert.doesNotMatch(discovery,/initialPlanProposal/,'Discovery must not select Actions or construct a Plan');
console.log('Discovery-first production-representative browser architecture regression passed');
