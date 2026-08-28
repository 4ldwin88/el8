import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync(new URL('../../discovery.html',import.meta.url),'utf8');
assert.ok(html.includes("testVersion:'1.7'"));
assert.ok(html.includes("recordOnboardingEvent('discovery_initialized'"));
assert.ok(html.includes('render();if(!qa&&!review&&!fromSnapshot){auth().then'));
assert.ok(!html.includes('try{const auth=await getSessionOrRedirect()'));
assert.ok(!html.includes('Loading Discovery…'));
console.log('Discovery renders local state before remote auth/recovery');
