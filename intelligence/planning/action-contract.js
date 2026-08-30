import { assertCanonicalConstructId, assertCanonicalDimension } from '../contracts/canonical-vocabulary.js';

export const ACTION_CONTRACT_VERSION='1.0.0';
export const ACTION_INTENTS=Object.freeze(['stabilize','resolve','build','learn','track','assess','educate','refer']);
export const ACTION_STATUS=Object.freeze(['active','provisional','held','deferred','retired']);
export const EVIDENCE_STRENGTH=Object.freeze(['strong','moderate','supported','evidence_informed','context_dependent','low','unknown']);

function str(v,n){if(typeof v!=='string'||!v.trim())throw new Error(`${n} required`);return v}
function arr(v,n){if(!Array.isArray(v))throw new Error(`${n} must be array`);return v}
function unique(v){return [...new Set(v)]}
function refs(v,n){arr(v,n);for(const x of v)str(x,n);return unique(v)}
function obj(v,n){if(!v||typeof v!=='object'||Array.isArray(v))throw new Error(`${n} must be object`);return v}

export function createActionDefinition(input){
  obj(input,'Action');str(input.actionId,'actionId');str(input.name,'name');str(input.instruction,'instruction');str(input.intendedOutcome,'intendedOutcome');str(input.rationale,'rationale');
  if(!ACTION_INTENTS.includes(input.intent))throw new Error(`invalid Action intent: ${input.intent}`);
  const constructIds=refs(input.constructIds??[],'constructIds');for(const id of constructIds)assertCanonicalConstructId(id,'constructIds');
  const dimensionIds=refs(input.dimensionIds??[],'dimensionIds');for(const id of dimensionIds)assertCanonicalDimension(id,'dimensionIds');
  if(!constructIds.length)throw new Error('Action requires at least one canonical construct');
  const measurement=obj(input.measurement,'measurement');str(measurement.decisionUse,'measurement.decisionUse');
  const review=obj(input.review,'review');str(review.trigger,'review.trigger');arr(review.allowedDispositions,'review.allowedDispositions');
  const burden=obj(input.burden,'burden');
  const status=input.status??'provisional';if(!ACTION_STATUS.includes(status))throw new Error(`invalid Action status: ${status}`);
  const evidenceStrength=input.evidenceStrength??'unknown';if(!EVIDENCE_STRENGTH.includes(evidenceStrength))throw new Error(`invalid evidenceStrength: ${evidenceStrength}`);
  return Object.freeze({
    contractVersion:ACTION_CONTRACT_VERSION,actionId:input.actionId,name:input.name,constructIds,dimensionIds,intent:input.intent,
    instruction:input.instruction,intendedOutcome:input.intendedOutcome,rationale:input.rationale,
    eligibility:Object.freeze({...obj(input.eligibility??{},'eligibility'),minimumEvidenceRefs:refs(input.eligibility?.minimumEvidenceRefs??[],'minimumEvidenceRefs')}),
    exclusions:Object.freeze({...obj(input.exclusions??{},'exclusions'),contraindications:[...(input.exclusions?.contraindications??[])]}),
    burden:Object.freeze({...burden}),measurement:Object.freeze({...measurement}),review:Object.freeze({...review,allowedDispositions:[...review.allowedDispositions]}),
    stopReconsider:[...(input.stopReconsider??[])],trackingRequirement:input.trackingRequirement??null,additionalAssessmentRequirement:input.additionalAssessmentRequirement??null,
    iconKey:input.iconKey??null,evidenceSourceIds:refs(input.evidenceSourceIds??[],'evidenceSourceIds'),evidenceStrength,permittedRationaleClaim:input.permittedRationaleClaim??null,
    evidenceReviewStatus:input.evidenceReviewStatus??'required',status,
  });
}

export function validateActionDefinition(action){createActionDefinition(action);return true;}
