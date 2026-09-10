import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function sourceIdentity(root=process.cwd()) {
  const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
  const files=git('ls-files','--cached','--others','--exclude-standard','-z').split('\0').filter(Boolean).sort();
  const hashes=Object.fromEntries(files.map(file=>[file,existsSync(`${root}/${file}`)?hash(readFileSync(`${root}/${file}`)):null]));
  return {sha:git('rev-parse','HEAD'),tree:git('rev-parse','HEAD^{tree}'),dirty:git('status','--porcelain').length>0,sourceHash:hash(JSON.stringify(hashes)),contractHashes:Object.fromEntries(Object.entries(hashes).filter(([f])=>/contract|registries\//.test(f)&&!f.includes('.test.'))),migrationFingerprint:hash(JSON.stringify(Object.entries(hashes).filter(([f])=>/^supabase\/(migrations|baselines|environments)\//.test(f))))};
}
export function assertValidatedIdentity(receipt,current) {
  if(receipt.status!=='pass'||receipt.dirty||current.dirty) throw new Error('A clean validated candidate is required');
  for(const key of ['sha','tree','sourceHash','migrationFingerprint']) if(receipt[key]!==current[key]) throw new Error(`Candidate ${key} changed after validation`);
}
