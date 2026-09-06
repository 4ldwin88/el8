import {isConstructId,isDimensionId} from '../../registries/taxonomy/index.js';

export const DRIVER_GRAPH_SCHEMA_VERSION='1.0.0';
export const DRIVER_NODE_STATUS=Object.freeze({PLAUSIBLE:'plausible',SUPPORTED:'supported',WEAKENED:'weakened',REJECTED:'rejected',RESOLVED:'resolved',DEFERRED:'deferred'});
export const DRIVER_EDGE_STATUS=Object.freeze({PRIOR:'prior',HYPOTHESIS:'hypothesis',SUPPORTED:'supported',CONTRADICTED:'contradicted',RETRACTED:'retracted'});
const NODE_STATUS=new Set(Object.values(DRIVER_NODE_STATUS));
const EDGE_STATUS=new Set(Object.values(DRIVER_EDGE_STATUS));
const uniq=xs=>[...new Set((xs??[]).filter(Boolean))];
const freezeList=xs=>Object.freeze(uniq(xs));

export function canonicalDriverNode({constructId,dimensionIds=[],evidenceRefs=[],sourceAreaIds=[],memberImportance=null,severity=null,materiality=null,status='plausible',disposition='active',provenanceRefs=[]}={}){
 if(!isConstructId(constructId))throw new Error(`Unknown constructId: ${constructId}`);
 for(const id of dimensionIds)if(!isDimensionId(id))throw new Error(`Unknown dimensionId: ${id}`);
 if(!NODE_STATUS.has(status))throw new Error(`invalid driver node status: ${status}`);
 return Object.freeze({nodeId:constructId,constructId,dimensionIds:freezeList(dimensionIds),evidenceRefs:freezeList(evidenceRefs),sourceAreaIds:freezeList(sourceAreaIds),memberImportance,severity,materiality,status,disposition,provenanceRefs:freezeList(provenanceRefs)});
}

export function canonicalDriverEdge({edgeId,relationshipId=null,fromConstructId,toConstructId,direction=null,evidenceRefs=[],evidenceAgainstRefs=[],sourceRefs=[],confidence='limited',status='prior',memberSpecific=false}={}){
 if(!edgeId)throw new Error('edgeId required');
 if(!isConstructId(fromConstructId)||!isConstructId(toConstructId))throw new Error('driver edge endpoints must be canonical constructs');
 if(!EDGE_STATUS.has(status))throw new Error(`invalid driver edge status: ${status}`);
 return Object.freeze({edgeId,relationshipId,fromConstructId,toConstructId,direction,evidenceRefs:freezeList(evidenceRefs),evidenceAgainstRefs:freezeList(evidenceAgainstRefs),sourceRefs:freezeList(sourceRefs),confidence,status,memberSpecific:Boolean(memberSpecific)});
}

export function canonicalDriverGraph({memberStateRevision=null,nodes=[],edges=[],areaPriority=[],unresolvedRequirements=[],createdAt=new Date().toISOString()}={}){
 const byId=new Map();
 for(const raw of nodes){const node=canonicalDriverNode(raw);const prior=byId.get(node.constructId);if(!prior){byId.set(node.constructId,node);continue}byId.set(node.constructId,canonicalDriverNode({...prior,...node,dimensionIds:[...prior.dimensionIds,...node.dimensionIds],evidenceRefs:[...prior.evidenceRefs,...node.evidenceRefs],sourceAreaIds:[...prior.sourceAreaIds,...node.sourceAreaIds],provenanceRefs:[...prior.provenanceRefs,...node.provenanceRefs]}));}
 const nodeIds=new Set(byId.keys());const canonicalEdges=[];const seen=new Set();
 for(const raw of edges){const edge=canonicalDriverEdge(raw);if(!nodeIds.has(edge.fromConstructId)||!nodeIds.has(edge.toConstructId))continue;const key=edge.relationshipId?`${edge.relationshipId}:${edge.fromConstructId}:${edge.toConstructId}`:edge.edgeId;if(seen.has(key))continue;seen.add(key);canonicalEdges.push(edge);}
 return Object.freeze({schemaVersion:DRIVER_GRAPH_SCHEMA_VERSION,memberStateRevision,createdAt,nodes:Object.freeze([...byId.values()]),edges:Object.freeze(canonicalEdges),areaPriority:Object.freeze([...areaPriority]),unresolvedRequirements:Object.freeze([...unresolvedRequirements])});
}

export function assertNoSilentLoss({beforeNodeIds=[],graph,dispositions={}}={}){
 const after=new Set(graph?.nodes?.map(n=>n.constructId)??[]);const lost=uniq(beforeNodeIds).filter(id=>!after.has(id)&&!dispositions[id]);
 if(lost.length)throw new Error(`driver graph silent loss: ${lost.join(',')}`);return true;
}