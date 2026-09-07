import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('./supabase-activation-runtime.js',import.meta.url),'utf8');

test('runtime uses canonical persistence boundaries',()=>{
  assert.match(source,/loadMemberState/);
  assert.match(source,/saveMemberState/);
  assert.match(source,/saveCanonicalPlan/);
  assert.match(source,/applyCanonicalBrowserPlan/);
  assert.match(source,/activateCanonicalOnboarding/);
  assert.match(source,/completeCanonicalOnboarding/);
});

test('runtime derives member identity from authenticated Supabase user',()=>{
  assert.match(source,/supabase\.auth\.getUser\(\)/);
  assert.match(source,/memberState\?\.memberId!==user\.id/);
  assert.doesNotMatch(source,/service_role|SERVICE_ROLE/);
});

test('browser activation exposes governed recoverable runtime states',()=>{
  assert.match(source,/activateCanonicalOnboardingRuntime/);
  assert.match(source,/runtimeStateFromError/);
  assert.match(source,/RUNTIME_STATE\.READY/);
  assert.match(source,/navigator\.onLine/);
});
