import {RELATIONSHIPS} from '../registries/relationships.js';
const active=r=>String(r.Status??'').startsWith('ACTIVE');
const targets=r=>String(r['To Signal / Dimension']??'').split(',').map(x=>x.trim()).filter(Boolean);
export function buildDriverLandscape({seedConstructIds=[],knownConstructIds=[],memberSelections={},maxExpansion=24}={}){
 const seeds=new Set(seedConstructIds);const known=new Set([...knownConstructIds,...seedConstructIds]);const candidates=new Map();
 const add=(id,source)=>{if(!id||seeds.has(id))return;const prior=candidates.get(id)??{constructId:id,sourcePaths:[],relationshipIds:[],memberDisposition:null};prior.sourcePaths.push(source.path);if(source.relationshipId)prior.relationshipIds.push(source.relationshipId);prior.memberDisposition=memberSelections[id]??prior.memberDisposition;candidates.set(id,prior);};
 for(const r of RELATIONSHIPS.filter(active)){const from=r['From Signal / Dimension'];const tos=targets(r);if(seeds.has(from))for(const to of tos)add(to,{relationshipId:r['Relationship ID'],path:`${from}->${to}`});for(const to of tos)if(seeds.has(to))add(from,{relationshipId:r['Relationship ID'],path:`${from}->${to}`});}
 const deduped=[...candidates.values()].slice(0,maxExpansion).map(x=>Object.freeze({...x,sourcePaths:Object.freeze([...new Set(x.sourcePaths)]),relationshipIds:Object.freeze([...new Set(x.relationshipIds)]),alreadyKnown:known.has(x.constructId)}));
 return Object.freeze({seedConstructIds:Object.freeze([...seeds]),candidates:Object.freeze(deduped),candidateCount:deduped.length});
}
export function acceptedLandscapeConstructIds(landscape,{includeUnanswered=true}={}){return landscape.candidates.filter(x=>x.memberDisposition!=='reject'&&(includeUnanswered||x.memberDisposition==='accept')).map(x=>x.constructId);}