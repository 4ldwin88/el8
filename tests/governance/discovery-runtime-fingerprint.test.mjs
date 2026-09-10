import test from 'node:test';
import assert from 'node:assert/strict';
import {discoveryRuntimeFingerprint} from '../../scripts/discovery-runtime-fingerprint.mjs';
import {DISCOVERY_CONTRACT_FINGERPRINT} from '../../intelligence/discovery/runtime-fingerprint.js';
test('Discovery run fingerprint covers its actual interpreter and imported registry graph',async()=>{
 const {fingerprint,files}=await discoveryRuntimeFingerprint();
 assert.equal(DISCOVERY_CONTRACT_FINGERPRINT,fingerprint,'runtime changed: explicitly update its provenance fingerprint; existing drafts must not silently resume');
 for(const file of ['intelligence/discovery/sufficiency.js','intelligence/discovery/construct-projection.js','intelligence/registries/effects.js','intelligence/discovery/run-record.js'])assert.ok(files.includes(file),file);
});

import {mkdtemp,mkdir,copyFile,appendFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
test('changed source and newly imported runtime dependencies invalidate the fingerprint',async()=>{
 const original=await discoveryRuntimeFingerprint(),root=await mkdtemp(join(tmpdir(),'el8-discovery-contract-'));
 try{
  for(const file of [...original.files,'intelligence/discovery/runtime-fingerprint.js']){await mkdir(dirname(join(root,file)),{recursive:true});await copyFile(file,join(root,file));}
  assert.equal((await discoveryRuntimeFingerprint(root)).fingerprint,original.fingerprint);
  await appendFile(join(root,'intelligence/registries/effects.js'),'\n// changed captured source contract\n');
  const changed=await discoveryRuntimeFingerprint(root);assert.notEqual(changed.fingerprint,original.fingerprint);
  await writeFile(join(root,'app/onboarding/new-contract-input.js'),'export const rule = 1;\n');
  await appendFile(join(root,'app/onboarding/discovery-runtime.js'),"\nimport './new-contract-input.js';\n");
  const added=await discoveryRuntimeFingerprint(root);assert.ok(added.files.includes('app/onboarding/new-contract-input.js'));assert.notEqual(added.fingerprint,changed.fingerprint);
  await writeFile(join(root,'app/onboarding/new-contract-input.js'),'export const rule = 2;\n');
  assert.notEqual((await discoveryRuntimeFingerprint(root)).fingerprint,added.fingerprint);
 }finally{await rm(root,{recursive:true,force:true});}
});
