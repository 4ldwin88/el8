// Canonical Review evidence sufficiency contract.
// 02.01.05: preserve adherence, outcome, burden/fit, usefulness/relevance,
// context change, Safety change and sufficiency as distinct evidence dimensions.
const freeze=x=>Object.freeze(x);
const PRESENT=value=>value!==undefined&&value!==null&&value!=='';

export const REVIEW_OUTCOME=freeze({
 IMPROVING:'IMPROVING',
 NO_MEANINGFUL_CHANGE:'NO_MEANINGFUL_CHANGE',
 WORSENING:'WORSENING',
 INSUFFICIENT_EVIDENCE:'INSUFFICIENT_EVIDENCE'
});
export const REVIEW_ATTEMPT=freeze({
 ADEQUATE:'ADEQUATE',
 NOT_ADEQUATELY_ATTEMPTED:'NOT_ADEQUATELY_ATTEMPTED',
 UNKNOWN:'ADHERENCE_UNKNOWN'
});

export function assessReviewSufficiency({evidence={},measurementContract={}}={}){
 const adherence=PRESENT(evidence.adherence)||PRESENT(evidence.attempt);
 const outcome=PRESENT(evidence.outcome);
 const burden=PRESENT(evidence.burden)||PRESENT(evidence.fit);
 const usefulness=PRESENT(evidence.usefulness)||PRESENT(evidence.relevance);
 const context=PRESENT(evidence.circumstancesChanged)||PRESENT(evidence.contextChanged);
 const safety=PRESENT(evidence.safetyChanged)||Array.isArray(evidence.safetyEvidenceRefs)&&evidence.safetyEvidenceRefs.length>0;
 const required=Array.isArray(measurementContract.requiredReviewSignals)&&measurementContract.requiredReviewSignals.length
  ? measurementContract.requiredReviewSignals
  : ['adherence','outcome'];
 const available={adherence,outcome,burden,usefulness,context,safety};
 const missing=required.filter(key=>!available[key]);
 return freeze({
  contractVersion:'review-sufficiency-v1',
  sufficient:missing.length===0,
  available:freeze({...available}),
  required:freeze([...required]),
  missing:freeze(missing),
  nextEvidenceRequest:missing[0]||null,
  principle:'Request only the smallest missing signal capable of changing the next decision.'
 });
}

export function classifyReviewEvidence({evidence={},measurementContract={}}={}){
 const sufficiency=assessReviewSufficiency({evidence,measurementContract});
 const rawAttempt=evidence.attempt??evidence.adherence??null;
 let attempt=REVIEW_ATTEMPT.UNKNOWN;
 if(['adequate','high','completed','attempted'].includes(String(rawAttempt).toLowerCase())) attempt=REVIEW_ATTEMPT.ADEQUATE;
 else if(['inadequate','low','not_attempted','not adequately attempted'].includes(String(rawAttempt).toLowerCase())) attempt=REVIEW_ATTEMPT.NOT_ADEQUATELY_ATTEMPTED;
 const rawOutcome=String(evidence.outcome??'').toLowerCase();
 let outcome=REVIEW_OUTCOME.INSUFFICIENT_EVIDENCE;
 if(['improved','improving'].includes(rawOutcome)) outcome=REVIEW_OUTCOME.IMPROVING;
 else if(['unchanged','no_meaningful_change','no meaningful change'].includes(rawOutcome)) outcome=REVIEW_OUTCOME.NO_MEANINGFUL_CHANGE;
 else if(['worse','worsening'].includes(rawOutcome)) outcome=REVIEW_OUTCOME.WORSENING;
 if(!sufficiency.sufficient||attempt===REVIEW_ATTEMPT.UNKNOWN) outcome=REVIEW_OUTCOME.INSUFFICIENT_EVIDENCE;
 return freeze({
  contractVersion:'review-evidence-classification-v1',
  attempt,
  outcome,
  burden:evidence.burden??evidence.fit??null,
  usefulness:evidence.usefulness??evidence.relevance??null,
  contextChanged:Boolean(evidence.circumstancesChanged??evidence.contextChanged),
  safetyChanged:Boolean(evidence.safetyChanged),
  sufficiency,
  evidenceRefs:freeze([...(evidence.evidenceRefs||[])]),
  causalClaim:false
 });
}
