// Bounded lifecycle for cross-dimensional relationships used as decision context.
// Relationships remain hypotheses: evidence-backed, time-bounded, and incapable of choosing Focus.
import {isConstructId,isDimensionId} from '../../registries/taxonomy/index.js';

export const CROSS_DIMENSIONAL_HYPOTHESIS_STATUS=Object.freeze({CURRENT:'current',REVALIDATION_DUE:'revalidation_due',CONTRADICTED:'contradicted',RETRACTED:'retracted'});
export const CROSS_DIMENSIONAL_HYPOTHESIS_CONFIDENCE=Object.freeze({LIMITED:'limited',MODERATE:'moderate',HIGH:'high'});
const STATUS=new Set(Object.values(CROSS_DIMENSIONAL_HYPOTHESIS_STATUS));
const CONFIDENCE=new Set(Object.values(CROSS_DIMENSIONAL_HYPOTHESIS_CONFIDENCE));
const str=(v,n)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${n} required`);return v.trim()};
const iso=(v,n)=>{str(v,n);if(Number.isNaN(Date.parse(v)))throw new Error(`${n} must be ISO date/time`);return v};

export function createCrossDimensionalHypothesis({hypothesisId,proposition,linkedConstructIds,linkedDimensionIds,evidenceRefs,sourceType,sourceRef,confidence='limited',status='current',observedAt,revalidateAfter,expiresAt=null,decisionContextRef=null}={}){
 str(hypothesisId,'hypothesisId');str(proposition,'proposition');str(sourceType,'sourceType');str(sourceRef,'sourceRef');iso(observedAt,'observedAt');iso(revalidateAfter,'revalidateAfter');if(expiresAt!==null)iso(expiresAt,'expiresAt');
 if(!CONFIDENCE.has(confidence))throw new Error(`invalid cross-dimensional hypothesis confidence: ${confidence}`);if(!STATUS.has(status))throw new Error(`invalid cross-dimensional hypothesis status: ${status}`);
 if(!Array.isArray(linkedConstructIds)||linkedConstructIds.length<2)throw new Error('cross-dimensional hypothesis requires at least two linked constructs');for(const id of linkedConstructIds)if(!isConstructId(id))throw new Error(`Unknown constructId: ${id}`);
 if(!Array.isArray(linkedDimensionIds)||new Set(linkedDimensionIds).size<2)throw new Error('cross-dimensional hypothesis requires at least two linked dimensions');for(const id of linkedDimensionIds)if(!isDimensionId(id))throw new Error(`Unknown dimensionId: ${id}`);
 if(!Array.isArray(evidenceRefs)||evidenceRefs.length===0)throw new Error('cross-dimensional hypothesis requires evidenceRefs');
 return Object.freeze({hypothesisId,proposition,linkedConstructIds:[...linkedConstructIds],linkedDimensionIds:[...linkedDimensionIds],evidenceRefs:[...evidenceRefs],sourceType,sourceRef,confidence,status,observedAt,revalidateAfter,expiresAt,decisionContextRef});
}

export function crossDimensionalHypothesisDecisionUsable(hypothesis,{now=new Date().toISOString()}={}){
 iso(now,'now');if(!hypothesis||hypothesis.status!==CROSS_DIMENSIONAL_HYPOTHESIS_STATUS.CURRENT)return false;if(!Array.isArray(hypothesis.evidenceRefs)||hypothesis.evidenceRefs.length===0)return false;if(!CONFIDENCE.has(hypothesis.confidence))return false;
 const t=Date.parse(now);if(Date.parse(hypothesis.observedAt)>t)return false;if(Date.parse(hypothesis.revalidateAfter)<=t)return false;if(hypothesis.expiresAt&&Date.parse(hypothesis.expiresAt)<=t)return false;return true;
}

export function activeCrossDimensionalHypothesisRefs(hypotheses,{now=new Date().toISOString(),acceptedFocusIds=[]}={}){
 const accepted=new Set(acceptedFocusIds);const items=Array.isArray(hypotheses)?hypotheses:Object.values(hypotheses??{});
 return items.filter(h=>crossDimensionalHypothesisDecisionUsable(h,{now})&&h.linkedConstructIds.some(id=>accepted.has(id))).map(h=>`cross_dimension_hypothesis:${h.hypothesisId}`);
}
