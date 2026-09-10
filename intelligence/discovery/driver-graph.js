import {canonicalDriverGraph} from '../contracts/driver-graph.js';
import {RELATIONSHIPS} from '../registries/relationships.js';
const active=r=>String(r.Status??'').startsWith('ACTIVE');
const targets=r=>String(r['To Signal / Dimension']??'').split(',').map(x=>x.trim()).filter(Boolean);
const strength=r=>{const s=String(r['Evidence Strength']??'').toLowerCase();return s.includes('high')?'high':s.includes('moderate')?'moderate':'limited'};
export function projectDriverGraph({memberStateRevision=null,constructStates=[],areaPriority=[],relationshipEvidence={},unresolvedRequirements=[]}={}){
 const nodes=constructStates.filter(s=>!s.excluded).map(s=>({constructId:s.constructId,dimensionIds:s.dimensionIds??[],evidenceRefs:s.evidenceRefs??[],sourceAreaIds:s.sourceAreaIds??s.dimensionIds??[],memberImportance:s.memberImportance??s.memberImportanceRank??null,severity:s.severity??null,materiality:s.materiality??null,disposition:s.resolutionState==='deferred'?'deferred':'active',status:['supported','established'].includes(s.status)&&(s.evidenceRefs?.length??0)?'supported':'plausible',provenanceRefs:s.provenanceRefs??[]}));
 const ids=new Set(nodes.map(n=>n.constructId));const edges=[];
 for(const r of RELATIONSHIPS.filter(active)){const from=r['From Signal / Dimension'];if(!ids.has(from))continue;for(const to of targets(r)){if(!ids.has(to))continue;const key=`${r['Relationship ID']}:${from}:${to}`;const evidence=relationshipEvidence[key]??{};edges.push({edgeId:key,relationshipId:r['Relationship ID'],fromConstructId:from,toConstructId:to,direction:r.Direction??null,confidence:evidence.confidence??strength(r),status:evidence.status??'prior',memberSpecific:Boolean(evidence.memberSpecific),evidenceRefs:evidence.evidenceRefs??[],evidenceAgainstRefs:evidence.evidenceAgainstRefs??[],sourceRefs:String(r['Source IDs']??'').split(',').map(x=>x.trim()).filter(Boolean)});}}
 return canonicalDriverGraph({memberStateRevision,nodes,edges,areaPriority,unresolvedRequirements});
}