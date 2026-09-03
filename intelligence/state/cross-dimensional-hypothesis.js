// Member-specific relationship graph boundary.
// Population REL rows are priors only. A member edge exists only after its endpoint Signals are
// independently supported and member evidence satisfies the canonical edge-instantiation rule.
// Member edges may inform leverage, monitoring and Review; they never manufacture endpoint state.
import {isConstructId,isDimensionId} from '../../registries/taxonomy/index.js';
import {RELATIONSHIPS} from '../registries/relationships.js';

export const CROSS_DIMENSIONAL_HYPOTHESIS_STATUS=Object.freeze({CURRENT:'current',REVALIDATION_DUE:'revalidation_due',CONTRADICTED:'contradicted',RETRACTED:'retracted'});
export const CROSS_DIMENSIONAL_HYPOTHESIS_CONFIDENCE=Object.freeze({LIMITED:'limited',MODERATE:'moderate',HIGH:'high'});
const STATUS=new Set(Object.values(CROSS_DIMENSIONAL_HYPOTHESIS_STATUS));
const CONFIDENCE=new Set(Object.values(CROSS_DIMENSIONAL_HYPOTHESIS_CONFIDENCE));
const REL_BY_ID=new Map(RELATIONSHIPS.map(r=>[r['Relationship ID'],r]));
const str=(v,n)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${n} required`);return v.trim()};
const iso=(v,n)=>{str(v,n);if(Number.isNaN(Date.parse(v)))throw new Error(`${n} must be ISO date/time`);return v};
const activeRelationship=r=>r&&String(r.Status??'').startsWith('ACTIVE');
const targetIds=r=>String(r?.['To Signal / Dimension']??'').split(',').map(x=>x.trim()).filter(Boolean);

export function createCrossDimensionalHypothesis({hypothesisId,relationshipId=null,fromConstructId=null,toConstructId=null,direction=null,proposition,linkedConstructIds,linkedDimensionIds,evidenceRefs,evidenceAgainstRefs=[],competingExplanationRefs=[],sourceType,sourceRef,confidence='limited',status='current',observedAt,revalidateAfter,expiresAt=null,decisionContextRef=null}={}){
 str(hypothesisId,'hypothesisId');str(proposition,'proposition');str(sourceType,'sourceType');str(sourceRef,'sourceRef');iso(observedAt,'observedAt');iso(revalidateAfter,'revalidateAfter');if(expiresAt!==null)iso(expiresAt,'expiresAt');
 if(!CONFIDENCE.has(confidence))throw new Error(`invalid cross-dimensional hypothesis confidence: ${confidence}`);if(!STATUS.has(status))throw new Error(`invalid cross-dimensional hypothesis status: ${status}`);
 if(!Array.isArray(linkedConstructIds)||linkedConstructIds.length<2)throw new Error('cross-dimensional hypothesis requires at least two linked constructs');for(const id of linkedConstructIds)if(!isConstructId(id))throw new Error(`Unknown constructId: ${id}`);
 if(!Array.isArray(linkedDimensionIds)||new Set(linkedDimensionIds).size<2)throw new Error('cross-dimensional hypothesis requires at least two linked dimensions');for(const id of linkedDimensionIds)if(!isDimensionId(id))throw new Error(`Unknown dimensionId: ${id}`);
 if(!Array.isArray(evidenceRefs)||evidenceRefs.length===0)throw new Error('cross-dimensional hypothesis requires evidenceRefs');
 let canonicalRelationship=null;
 if(relationshipId!==null){canonicalRelationship=REL_BY_ID.get(str(relationshipId,'relationshipId'));if(!activeRelationship(canonicalRelationship))throw new Error(`relationshipId must reference an ACTIVE canonical relationship: ${relationshipId}`);const from=str(fromConstructId,'fromConstructId'),to=str(toConstructId,'toConstructId');if(canonicalRelationship['From Signal / Dimension']!==from||!targetIds(canonicalRelationship).includes(to))throw new Error(`member edge endpoints do not match ${relationshipId}`);if(!linkedConstructIds.includes(from)||!linkedConstructIds.includes(to))throw new Error('member edge endpoints must be present in linkedConstructIds');}
 return Object.freeze({hypothesisId,relationshipId,fromConstructId,toConstructId,direction:direction??canonicalRelationship?.Direction??null,proposition,linkedConstructIds:[...linkedConstructIds],linkedDimensionIds:[...linkedDimensionIds],evidenceRefs:[...evidenceRefs],evidenceAgainstRefs:[...evidenceAgainstRefs],competingExplanationRefs:[...competingExplanationRefs],sourceType,sourceRef,confidence,status,observedAt,revalidateAfter,expiresAt,decisionContextRef});
}

export function crossDimensionalHypothesisDecisionUsable(hypothesis,{now=new Date().toISOString()}={}){
 iso(now,'now');if(!hypothesis||hypothesis.status!==CROSS_DIMENSIONAL_HYPOTHESIS_STATUS.CURRENT)return false;if(!Array.isArray(hypothesis.evidenceRefs)||hypothesis.evidenceRefs.length===0)return false;if(!CONFIDENCE.has(hypothesis.confidence))return false;
 if(hypothesis.relationshipId!==null){const rel=REL_BY_ID.get(hypothesis.relationshipId);if(!activeRelationship(rel))return false;if(rel['From Signal / Dimension']!==hypothesis.fromConstructId||!targetIds(rel).includes(hypothesis.toConstructId))return false;}
 const t=Date.parse(now);if(Date.parse(hypothesis.observedAt)>t)return false;if(Date.parse(hypothesis.revalidateAfter)<=t)return false;if(hypothesis.expiresAt&&Date.parse(hypothesis.expiresAt)<=t)return false;return true;
}

export function activeCrossDimensionalHypothesisRefs(hypotheses,{now=new Date().toISOString(),acceptedFocusIds=[]}={}){
 const accepted=new Set(acceptedFocusIds);const items=Array.isArray(hypotheses)?hypotheses:Object.values(hypotheses??{});
 return items.filter(h=>crossDimensionalHypothesisDecisionUsable(h,{now})&&h.linkedConstructIds.some(id=>accepted.has(id))).map(h=>`cross_dimension_hypothesis:${h.hypothesisId}`);
}

export function memberRelationshipGraph(hypotheses,{now=new Date().toISOString()}={}){
 const items=Array.isArray(hypotheses)?hypotheses:Object.values(hypotheses??{});
 const edges=items.filter(h=>h.relationshipId&&crossDimensionalHypothesisDecisionUsable(h,{now})).map(h=>Object.freeze({edgeId:h.hypothesisId,relationshipId:h.relationshipId,fromConstructId:h.fromConstructId,toConstructId:h.toConstructId,direction:h.direction,confidence:h.confidence,evidenceRefs:[...h.evidenceRefs],evidenceAgainstRefs:[...(h.evidenceAgainstRefs??[])],competingExplanationRefs:[...(h.competingExplanationRefs??[])],observedAt:h.observedAt,revalidateAfter:h.revalidateAfter}));
 return Object.freeze({edges:Object.freeze(edges)});
}
