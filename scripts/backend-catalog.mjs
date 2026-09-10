import {createHash} from 'node:crypto';
// PostgreSQL may print ACL arrays in grant order. Compare their privilege sets.
export function canonicalCatalog(value){
 if(typeof value==='string'&&/^\{(?:[a-z_]*=[arwdDxtmXU*]*\/postgres,?)*\}$/.test(value))return value.slice(1,-1).split(',').sort();
 if(Array.isArray(value))return value.map(canonicalCatalog);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonicalCatalog(v)]));
 return value;
}
export function catalogHashes(catalog){return Object.fromEntries(Object.entries(catalog).map(([section,value])=>[section,createHash('sha256').update(JSON.stringify(canonicalCatalog(value))).digest('hex')]));}
