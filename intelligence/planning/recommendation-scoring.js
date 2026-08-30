// EL8 Intelligence v0.1 calibration model. Internal decision support only;
// coefficients and bands are hypotheses to be calibrated from QA/outcomes.
export const RECOMMENDATION_SCORING_MODEL_VERSION='0.1.0';
export const ACTION_FIT_WEIGHTS=Object.freeze({mechanismMatch:.30,feasibility:.20,memberPreference:.15,actionability:.15,priorLearning:.10,decisionValue:.10});
export const CONFIDENCE_WEIGHTS=Object.freeze({evidenceStrength:.35,discrimination:.25,recencyRelevance:.15,sufficiency:.15,corroboration:.10});
const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
function weighted(values,weights){return Object.entries(weights).reduce((sum,[k,w])=>sum+clamp(values?.[k])*w,0)}
export function confidenceBand(v){v=clamp(v);return v<.40?'insufficient':v<.60?'limited':v<.80?'moderate':'high'}
export function scoreActionRecommendation({fit={},confidence={},materialUncertainty=0,materialContradiction=0,hardGates={}}={}){
 const failed=Object.entries(hardGates).filter(([,v])=>v===false).map(([k])=>k);
 const actionFit=weighted(fit,ACTION_FIT_WEIGHTS);
 const baseConfidence=weighted(confidence,CONFIDENCE_WEIGHTS);
 const recommendationConfidence=baseConfidence*(1-clamp(materialUncertainty))*(1-clamp(materialContradiction));
 const recommendationStrength=actionFit*recommendationConfidence;
 return Object.freeze({scoringModelVersion:RECOMMENDATION_SCORING_MODEL_VERSION,hardGateFailures:failed,eligible:failed.length===0,fitComponents:Object.fromEntries(Object.keys(ACTION_FIT_WEIGHTS).map(k=>[k,clamp(fit?.[k])])),confidenceComponents:Object.fromEntries(Object.keys(CONFIDENCE_WEIGHTS).map(k=>[k,clamp(confidence?.[k])])),materialUncertainty:clamp(materialUncertainty),materialContradiction:clamp(materialContradiction),actionFit,recommendationConfidence,confidenceBand:confidenceBand(recommendationConfidence),recommendationStrength});
}
