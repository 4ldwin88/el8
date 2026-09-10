import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from 'parse5';
import {build} from 'esbuild';

// Link actual HTML module roots and local transitive graphs, including named
// exports and syntax. External CDN execution and authenticated browser behavior
// remain separate human-candidate gates; this check makes no network requests.
export async function checkBrowserModules(root=process.cwd()) {
  let count=0; const failures=[];
  async function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      if(entry.name.startsWith('.')||entry.name==='node_modules') continue;
      const file=path.join(dir,entry.name);
      if(entry.isDirectory()) await walk(file);
      else if(entry.name.endsWith('.html')) {
        const scripts=[];
        function visit(node) {
          const attrs=Object.fromEntries((node.attrs??[]).map(a=>[a.name,a.value]));
          if(node.tagName==='script'&&attrs.type==='module') scripts.push(attrs.src?`import ${JSON.stringify(attrs.src.startsWith('.')||attrs.src.startsWith('http')?attrs.src:'./'+attrs.src)};`:(node.childNodes??[]).map(n=>n.value??'').join(''));
          for(const child of node.childNodes??[]) visit(child);
        }
        visit(parse(fs.readFileSync(file,'utf8')));
        for(const [index,contents] of scripts.entries()) {
          try { await build({stdin:{contents,sourcefile:`${path.relative(root,file)}#module-${index}`,resolveDir:path.dirname(file)},bundle:true,write:false,format:'esm',platform:'browser',external:['https://*','http://*'],logLevel:'silent'}); }
          catch(error) { failures.push(`${path.relative(root,file)}: ${error.message}`); }
          count++;
        }
      }
    }
  }
  await walk(root);
  if(failures.length) throw new Error(failures.join('\n'));
  return count;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) console.log(`Linked ${await checkBrowserModules()} HTML module roots.`);
