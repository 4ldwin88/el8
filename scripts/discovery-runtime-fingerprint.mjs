import {build} from 'esbuild';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export async function discoveryRuntimeFingerprint(root=process.cwd()){
 const {metafile}=await build({absWorkingDir:root,entryPoints:['app/onboarding/discovery-runtime.js'],bundle:true,write:false,format:'esm',platform:'browser',metafile:true,logLevel:'silent'});
 const files=Object.keys(metafile.inputs).filter(f=>f!=='intelligence/discovery/runtime-fingerprint.js').sort();
 const contents=await Promise.all(files.map(async file=>[file,createHash('sha256').update(await readFile(resolve(root,file))).digest('hex')]));
 return {fingerprint:createHash('sha256').update(JSON.stringify(contents)).digest('hex'),files};
}
