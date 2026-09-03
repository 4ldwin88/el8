import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');

// Protect governed Planning behavior and member agency, not incidental prototype copy/CSS.
assert.match(html,/EL8 recommends only Actions supported by your Focus and available evidence\./,'Plan must explain the evidence/Focus basis for recommendations');
assert.match(html,/data-id="\$\{id\}"/,'Plan must expose selectable Action cards by canonical Action identity');
assert.match(html,/selected\.has\(id\)\?'remove':'add'/,'Plan must let the member add or remove proposed Actions');
assert.match(html,/Choose an Action, or change your Focus\./,'Plan must not finish an Action-bearing proposal with no member-selected Action');
assert.match(html,/Change focus/,'Plan must let the member return to Focus selection');
assert.match(html,/No Plan is needed from this Discovery\./,'Plan must support a legitimate no-Plan Discovery outcome');
assert.match(html,/More understanding is needed first\./,'Plan must preserve unresolved insufficiency instead of manufacturing an Action');
assert.match(html,/id="testerNote"/,'Human QA must retain an accessible Plan note field');
assert.doesNotMatch(html,/recommendation\.fit|recommendation\.confidence|recommendation\.strength/,'Internal quantitative scores must not be shown as pseudo-precise member-facing numbers');

console.log('Planning selection behavioral regression passed');
