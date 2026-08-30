import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const importPattern=/\b(?:import\s+(?:[^'";]+?\s+from\s+)?|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g;
const missing=[];
const htmlFiles=[];

function checkSource(source,fromFile){
  importPattern.lastIndex=0;
  let match;
  while((match=importPattern.exec(source))){
    const spec=match[2].split(/[?#]/)[0];
    const resolved=path.resolve(path.dirname(path.join(root,fromFile)),spec);
    if(!fs.existsSync(resolved)) missing.push(`${fromFile} -> ${spec}`);
  }
}

function walk(dir){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(entry.name==='node_modules'||entry.name==='.git') continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.isFile()){
      const rel=path.relative(root,full);
      if(entry.name.endsWith('.html')){
        htmlFiles.push(rel);
        checkSource(fs.readFileSync(full,'utf8'),rel);
      }else if(entry.name.endsWith('.js')||entry.name.endsWith('.mjs')){
        checkSource(fs.readFileSync(full,'utf8'),rel);
      }
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
