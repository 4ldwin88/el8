import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const htmlFiles=fs.readdirSync(root).filter(name=>name.endsWith('.html'));
const importPattern=/\b(?:import\s+(?:[^'";]+?\s+from\s+)?|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g;
const missing=[];

function checkSource(source,fromFile){
  importPattern.lastIndex=0;
  let match;
  while((match=importPattern.exec(source))){
    const spec=match[2].split(/[?#]/)[0];
    const resolved=path.resolve(path.dirname(path.join(root,fromFile)),spec);
    if(!fs.existsSync(resolved)) missing.push(`${fromFile} -> ${spec}`);
  }
}

for(const file of htmlFiles) checkSource(fs.readFileSync(path.join(root,file),'utf8'),file);

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name==='.git') continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.isFile()&&(entry.name.endsWith('.js')||entry.name.endsWith('.mjs'))){
      const rel=path.relative(root,full);
      checkSource(fs.readFileSync(full,'utf8'),rel);
    }
  }
}
walk(root);

if(missing.length){
  console.error('Browser import smoke failed. Missing relative module targets:');
  for(const item of [...new Set(missing)].sort()) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`Browser import smoke passed across ${htmlFiles.length} HTML entry points and repository JS modules.`);
