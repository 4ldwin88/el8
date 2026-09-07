import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const home = await readFile(new URL('./home.js', import.meta.url), 'utf8');
const plan = await readFile(new URL('../plan/plan.js', import.meta.url), 'utf8');
const insights = await readFile(new URL('../insights/insights.js', import.meta.url), 'utf8');
const explore = await readFile(new URL('../explore/explore.js', import.meta.url), 'utf8');
const shell = await readFile(new URL('../shell/app-shell.js', import.meta.url), 'utf8');
const homeHtml = await readFile(new URL('../../home.html', import.meta.url), 'utf8');
const planHtml = await readFile(new URL('../../plan.html', import.meta.url), 'utf8');

for (const [name, source, active] of [
  ['Home', home, 'home'], ['Plan', plan, 'plan'], ['Insights', insights, 'insights'], ['Explore', explore, 'explore']
]) {
  assert.match(source, /import\s*\{\s*mountAppShell\s*\}\s*from\s*['"]\.\.\/shell\/app-shell\.js['"]/, `${name} must use the canonical app shell`);
  assert.match(source, /import\s*\{\s*mountTrackSheet\s*\}\s*from\s*['"]\.\.\/track\/track-sheet\.js['"]/, `${name} must use the canonical Track sheet`);
  assert.match(source, new RegExp(`active:\\s*['"]${active}['"]`), `${name} must identify its canonical shell surface`);
}

assert.doesNotMatch(home, /^mountAppShell\(/m, 'Home must not mount an extra shell during module evaluation');
assert.doesNotMatch(plan, /^mountAppShell\(/m, 'Plan must not mount an extra shell during module evaluation');

for (const [name, html, active] of [['Home', homeHtml, 'home'], ['Plan', planHtml, 'plan']]) {
  assert.match(html, new RegExp(`class="el8-app-shell"\\s+data-static-shell="${active}"`), `${name} must provide structural shell markup for first paint`);
  assert.match(html, /class="el8-shell-profile"/, `${name} structural shell must include Profile`);
  assert.match(html, /class="el8-shell-nav"/, `${name} structural shell must include primary navigation`);
  assert.match(html, /class="el8-shell-track"/, `${name} structural shell must include Track`);
}

assert.match(shell, /PROFILE_INITIAL_KEY=['"]el8-profile-initial['"]/, 'Shell must use one cached profile-initial key');
assert.match(shell, /rememberProfileInitial\(profileInitial\)/, 'Confirmed member initial must refresh first-paint cache');
assert.match(shell, /mountAppShell\(\{active:structuralPage,profileInitial:cachedProfileInitial\(\)\}\)/, 'All structural primary pages must use cached initial before profile fetch completes');

assert.match(home, /renderHomeRuntimeState/, 'Home module must render governed runtime states');
assert.match(homeHtml, /data-home-runtime/, 'Home HTML must provide a member-visible runtime status region');
assert.match(homeHtml, /RUNTIME_STATE\.LOADING/, 'Home must expose loading while member data resolves');
assert.match(homeHtml, /runtimeStateFromError/, 'Home must translate runtime failures through the governed resilience contract');
assert.match(homeHtml, /RUNTIME_STATE\.SAFETY_INTERRUPT/, 'Home must make Safety interruption explicit');
assert.match(homeHtml, /continue_discovery[^]*discovery\.html/, 'Home must provide a governed route back to Discovery');
assert.match(homeHtml, /reload[^]*location\.reload/, 'Home must provide retry or reload recovery without removing the static shell');

console.log('Member shell reconciliation regression: PASS');
