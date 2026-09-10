import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {discoverTests, verifyWorkflows,verifyTestScripts} from '../../scripts/candidate-gate.mjs';
import {checkBrowserModules} from '../../scripts/browser-import-smoke.mjs';
import {assertValidatedIdentity} from '../../scripts/candidate-identity.mjs';

function fixture(t, files) {
  const root=mkdtempSync(path.join(tmpdir(),'el8-gate-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  for(const [file,content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root,file)),{recursive:true});
    writeFileSync(path.join(root,file),content);
  }
  return root;
}
test('a new non-live test is included without editing a suite registry',t=>{
  const root=fixture(t,{'app/new.test.mjs':'','tests/persistence-concurrency.test.mjs':'','node_modules/vendor.test.js':''});
  assert.deepEqual(discoverTests(root),['app/new.test.mjs']);
  writeFileSync(path.join(root,'app/later.test.js'),'');
  assert.deepEqual(discoverTests(root),['app/later.test.js','app/new.test.mjs']);
});
test('browser graph rejects an existing module missing the requested export',async t=>{
  const root=fixture(t,{'index.html':'<script type="module">import {removed} from "./owner.js"; window.x=removed;</script>','owner.js':'export const current=1;'});
  await assert.rejects(checkBrowserModules(root));
  writeFileSync(path.join(root,'index.html'),'<script type="module">import {current} from "./owner.js"; window.x=current;</script>');
  assert.equal(await checkBrowserModules(root),1);
});
test('workflows cannot own copied suites or deploy after ignored validation',()=>{
  const valid={jobs:{test:{steps:[{run:'npm ci --ignore-scripts'},{run:'npm test'}]}}};
  assert.deepEqual(verifyWorkflows({'qa.yml':valid}),[]);
  assert.ok(verifyWorkflows({'qa.yml':{jobs:{test:{steps:[{run:'npm run test:state'}]}}}}).length);
  assert.ok(verifyWorkflows({'qa.yml':{jobs:{test:{steps:[{run:'npm test','continue-on-error':true}]}}}}).length);
  assert.ok(verifyWorkflows({'qa.yml':valid,'pages.yml':{jobs:{deploy:{steps:[{uses:'actions/deploy-pages@v4'}]}}}}).length);
  assert.ok(verifyWorkflows({'g02.yml':{jobs:{validate:{uses:'./.github/workflows/qa.yml',if:'false'}}}}).length);
});
test('repository workflows share the required gate',()=>{
  assert.deepEqual(verifyWorkflows(),[]);
});
test('a newly named npm test cannot hide an undiscovered test or reach live mutations',()=>{
  assert.deepEqual(verifyTestScripts({'test:x':'node --test app/x.test.js'},['app/x.test.js']),[]);
  assert.ok(verifyTestScripts({'test:x':'node scripts/hidden-check.js'},[]).length);
  assert.ok(verifyTestScripts({'test:x':'npm run test:persistence:live'},[]).length);
});
test('artifact promotion rejects stale, dirty or failed validation',()=>{
  const identity={sha:'a',tree:'t',sourceHash:'s',migrationFingerprint:'m',dirty:false};
  const receipt={status:'pass',...identity};
  assert.doesNotThrow(()=>assertValidatedIdentity(receipt,identity));
  for(const key of ['sha','tree','sourceHash','migrationFingerprint']) assert.throws(()=>assertValidatedIdentity(receipt,{...identity,[key]:'different'}));
  assert.throws(()=>assertValidatedIdentity(receipt,{...identity,dirty:true}));
  assert.throws(()=>assertValidatedIdentity({...receipt,status:'fail'},identity));
});
test('offline transport guard handles Node normalized socket arguments without making connections',()=>{
  execFileSync(process.execPath,['--input-type=module','-e',`
    import net from 'node:net'; import assert from 'node:assert/strict';
    net.Socket.prototype.connect=function(){throw new Error('local transport reached');};
    await import('./scripts/offline-test-environment.mjs');
    assert.throws(()=>net.createConnection({host:'example.invalid',port:443}),/Offline/);
    assert.throws(()=>new net.Socket().connect([{host:'example.invalid',port:443}]),/Offline/);
    assert.throws(()=>fetch('https://example.invalid'),/Offline/);
    assert.throws(()=>new net.Socket().connect({host:'127.0.0.1',port:5432}),/local transport reached/);
  `]);
});
