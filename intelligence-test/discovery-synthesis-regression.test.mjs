import assert from 'node:assert/strict';
import fs from 'node:fs';
const discovery=fs.readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
const priorities=fs.readFileSync(new URL('./priorities.html',import.meta.url),'utf8');
const plan=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const chrome=fs.readFileSync(new URL('./chrome.js',import.meta.url),'utf8');
assert.match(index,/location\.href='discovery\.html'/,'Intelligence Test must enter Discovery directly');
assert.match(discovery,/class="progress"/,'Discovery must retain unobtrusive progress feedback');
assert.match(priorities,/class="progress"/,'Focus confirmation must retain unobtrusive progress feedback');
for(const [name,html] of [['Discovery',discovery],['Focus',priorities],['Plan',plan]]){
  assert.doesNotMatch(html,/<span>Discovery<\/span><span>Prioritize<\/span><span>Focus<\/span><span>Plan<\/span>/,`${name} must not expose internal Intelligence stage labels as member UI`);
  assert.match(html,/id="testerNote"/,`${name} must keep the internal QA note field visible during human validation`);
  assert.doesNotMatch(html,/<details class="qa">/,`${name} QA notes must not be collapsible`);
}
assert.match(discovery,/createDiscoverySession\(\)/,'Discovery must create its own session without an upstream assessment dependency');
assert.doesNotMatch(index,/baseline/i,'Intelligence Test entry must not reference the retired pre-Discovery stage');
assert.doesNotMatch(discovery,/initialPlanProposal/,'Discovery must not select Actions or construct a Plan');
assert.match(discovery,/function renderMatrix\(/,'Repeated shared ordered scales must have a dedicated matrix renderer');
assert.match(discovery,/className='response-matrix'/,'Repeated-scale Discovery interactions must render as a matrix');
assert.match(discovery,/if\(current\.type==='matrix'\)\{renderMatrix\(/,'Matrix steps must route to the matrix renderer');
assert.doesNotMatch(discovery,/if\(current\.type==='matrix'\)\{renderComposite/,'Matrix steps must not fall back to generic grouped choices');
assert.match(discovery,/COMPACT_CHOICE_THRESHOLD=8/,'Distinct answer sets must remain stacked through seven choices and become compact at eight or more');
assert.match(discovery,/if\(\(q\.options\|\|\[\]\)\.length>=COMPACT_CHOICE_THRESHOLD\)host\.classList\.add\('compact'\)/,'Choice density must apply the governed eight-choice threshold');
assert.match(discovery,/if\(states\.length>=COMPACT_CHOICE_THRESHOLD\)options\.classList\.add\('choice-set','compact'\)/,'Focus triage choices must use the same governed density threshold');
assert.match(chrome,/triage-answers\.choice-set:not\(\.compact\)/,'Non-compact grouped choices must remain stacked full-width');
assert.match(chrome,/z-index:2147483647/,'Global QA Exit must remain above page content and dead-end states');
assert.match(chrome,/document\.documentElement\.appendChild\(chrome\)/,'Global QA Exit must be mounted outside page layout containers');
console.log('Discovery interaction-density and QA architecture regression passed');
