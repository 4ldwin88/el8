import {readFileSync,writeFileSync,mkdirSync,rmSync,copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {sourceIdentity,assertValidatedIdentity,hash} from './candidate-identity.mjs';
import {checkBrowserModules} from './browser-import-smoke.mjs';
const receipt=JSON.parse(readFileSync('.candidate/checks.json','utf8'));
assertValidatedIdentity(receipt,sourceIdentity());
if(process.env.GITHUB_SHA&&receipt.sha!==process.env.GITHUB_SHA) throw new Error('Workflow candidate differs from validated candidate');
const dest='.candidate/site';
rmSync(dest,{recursive:true,force:true}); mkdirSync(dest,{recursive:true});
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const publicRoots=new Set(['app','assets','intelligence','intelligence-test','registries']);
const hashes={};
for(const file of files) {
  if(file.includes('/')&&!publicRoots.has(file.split('/')[0])) continue;
  if(!/\.(html|js|mjs|css|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|webmanifest)$/.test(file)||file.includes('.test.')) continue;
  mkdirSync(path.dirname(`${dest}/${file}`),{recursive:true});
  copyFileSync(file,`${dest}/${file}`);
  hashes[file]=hash(readFileSync(file));
}
const metadata='app/research/intelligence-test-build.js';
const generated=`// Generated from the validated candidate.\nexport const INTELLIGENCE_TEST_DEPLOYED_COMMIT=${JSON.stringify(receipt.sha)};\nexport const INTELLIGENCE_TEST_DEPLOY_CONTEXT="controlled-candidate";\nexport const INTELLIGENCE_TEST_DEPLOY_BUILD_ID=${JSON.stringify(receipt.sourceHash)};\n`;
writeFileSync(`${dest}/${metadata}`,generated); hashes[metadata]=hash(generated);
writeFileSync(`${dest}/candidate-manifest.json`,JSON.stringify({...receipt,artifactFiles:hashes,humanTestReady:false},null,2)+'\n');
await checkBrowserModules(path.resolve(dest));
console.log(`Built validated ${receipt.sha}. Human-test readiness requires the backend and journey gate.`);
