import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parse} from 'yaml';
import {checkBrowserModules} from './browser-import-smoke.mjs';
import {sourceIdentity} from './candidate-identity.mjs';

// Only exclusion: this test authenticates to and mutates a live backend.
const LIVE_TEST='tests/persistence-concurrency.test.mjs';
export function discoverTests(root=process.cwd()) {
  const files=[];
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      if(entry.name.startsWith('.')||entry.name==='node_modules') continue;
      const full=path.join(dir,entry.name),rel=path.relative(root,full).split(path.sep).join('/');
      if(entry.isDirectory()) walk(full);
      else if(/\.test\.(mjs|cjs|js)$/.test(entry.name)&&rel!==LIVE_TEST) files.push(rel);
    }
  }
  walk(root);
  return files.sort();
}
export function verifyWorkflows(workflows) {
  workflows??=Object.fromEntries(fs.readdirSync('.github/workflows').filter(f=>/\.ya?ml$/.test(f)).map(f=>[f,parse(fs.readFileSync(`.github/workflows/${f}`,'utf8'))]));
  const errors=[];
  for(const [file,workflow] of Object.entries(workflows)) {
    if(file==='persistence-live.yml') continue;
    for(const [name,job] of Object.entries(workflow.jobs??{})) {
      const steps=job.steps??[];
      if(job.uses) {if(job.uses!=='./.github/workflows/qa.yml'||job.if||job['continue-on-error']) errors.push(`${file}/${name}: unknown or optional validation owner`);continue;}
      const gate=steps.findIndex(s=>s.run==='npm test');
      for(const step of steps) {
        if(/npm run test:|node --test|\.test\.(m?js|cjs)/.test(step.run??'')) errors.push(`${file}: copied suite ownership`);
        if(step.run==='npm test'&&(step.if||step['continue-on-error']||job['continue-on-error'])) errors.push(`${file}: optional gate`);
      }
      const deploy=steps.some(s=>/upload-pages-artifact|deploy-pages/.test(s.uses??''));
      if(deploy) {
        const needs=Array.isArray(job.needs)?job.needs:[job.needs];
        if(!needs.includes('validate')||workflow.jobs.validate?.uses!=='./.github/workflows/qa.yml'||job.if) errors.push(`${file}: deployment bypasses required validation`);
        if(!steps.some(s=>s.run==='node scripts/build-candidate.mjs')) errors.push(`${file}: missing verified artifact build`);
      } else if(gate<0) errors.push(`${file}/${name}: missing canonical gate`);
    }
  }
  return errors;
}
export function verifyTestScripts(scripts,tests) {
  const errors=[];
  for(const [name,command] of Object.entries(scripts)) {
    if(!name.startsWith('test:')||name==='test:persistence:live') continue;
    for(const part of command.split(' && ')) {
      const nested=/^npm run (test:[\w:-]+)$/.exec(part);
      if(nested) {
        if(!Object.hasOwn(scripts,nested[1])||nested[1]==='test:persistence:live') errors.push(`${name}: missing or live nested test`);
        continue;
      }
      const node=/^node (?:--test )?(.+)$/.exec(part);
      if(!node||node[1].split(' ').some(file=>!tests.includes(file))) errors.push(`${name}: non-live tests must be discoverable .test.js/.mjs/.cjs files`);
    }
  }
  return errors;
}
export async function runGate() {
  fs.rmSync('.candidate/checks.json',{force:true});
  const before=sourceIdentity(),errors=verifyWorkflows(),tests=discoverTests();
  errors.push(...verifyTestScripts(JSON.parse(fs.readFileSync('package.json','utf8')).scripts,tests));
  if(errors.length) throw new Error(errors.join('\n'));
  let modules=0, moduleError;
  try { modules=await checkBrowserModules(); } catch(error) { moduleError=error; console.error(error.message); }
  const result=spawnSync(process.execPath,['--import','./scripts/offline-test-environment.mjs','--test','--test-concurrency=2',...tests],{stdio:'inherit'});
  if(result.status!==0||moduleError) throw new Error('Offline repository checks failed; no validation receipt emitted');
  const after=sourceIdentity();
  if(JSON.stringify(before)!==JSON.stringify(after)) throw new Error('Source changed during validation');
  fs.mkdirSync('.candidate',{recursive:true});
  fs.writeFileSync('.candidate/checks.json',JSON.stringify({status:'pass',...after,tests,htmlModuleRoots:modules,node:process.version},null,2)+'\n');
  console.log(`Canonical offline gate passed: ${tests.length} files, ${modules} HTML module roots. Release eligible: ${!after.dirty}.`);
}
if(process.argv[1]===fileURLToPath(import.meta.url)) await runGate();
