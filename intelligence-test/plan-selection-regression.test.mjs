import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./plan.html',import.meta.url),'utf8');

// Protect governed Planning behavior and member agency, not incidental prototype copy/CSS.
assert.match(html,/These Actions are supported by your confirmed Focus and the evidence EL8 has so far\./,'Plan must explain the evidence/Focus basis for recommendations');
assert.match(html,/data-id="\$\{esc\(id\)\}"/,'Plan must expose selectable Action cards by canonical Action identity');
assert.match(html,/selected\.has\(id\)\?'remove':'add'/,'Plan must let the member add or remove proposed Actions');
assert.match(html,/Choose an Action, or change your Focus\./,'Plan must not finish an Action-bearing proposal with no member-selected Action');
assert.match(html,/Change focus/,'Plan must let the member return to Focus selection');
assert.match(html,/No Plan is needed from this assessment\./,'Plan must support a legitimate no-Plan assessment outcome without exposing internal stage language');
assert.match(html,/More evidence is needed\./,'Plan must preserve unresolved decision-critical insufficiency instead of manufacturing an Action');
assert.match(html,/Planning coverage gap detected\./,'Plan must expose supported-Focus Action coverage defects as QA failures');
assert.match(html,/Why this\?/,'Plan must expose progressive evidence explanation for each recommendation');
assert.match(html,/evidenceBasis/,'Evidence explanation must be driven by the canonical recommendation evidence basis');
assert.match(html,/QA provenance/,'Internal human QA must be able to inspect recommendation provenance');
assert.match(html,/id="testerNote"/,'Human QA must retain an accessible Plan note field');
assert.doesNotMatch(html,/recommendation\.fit|recommendation\.confidence|recommendation\.strength/,'Internal quantitative scores must not be shown as pseudo-precise member-facing numbers');

console.log('Planning selection behavioral regression passed');
