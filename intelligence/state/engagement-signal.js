// Decision-useful personalization inside canonical Member State.
// This is not a personality engine: signals stay sparse, evidence-backed and revisable.
export const ENGAGEMENT_SIGNAL_KEYS=Object.freeze(['pacing','feedbackStyle','accountabilityFit','motivationFollowThrough','burdenTolerance']);
export const ENGAGEMENT_SIGNAL_CONFIDENCE=Object.freeze(['unknown','limited','moderate','high']);
export const ENGAGEMENT_SIGNAL_STATUS=Object.freeze(['current','superseded','retracted']);
export function createEngagementSignal({key,value,evidenceRefs=[],sourceType,sourceRef,observedAt=new Date().toISOString(),confidence='limited',status='current'}={}){
 if(!ENGAGEMENT_SIGNAL_KEYS.includes(key))throw new Error(`unsupported engagement signal: ${key}`);
 if(value==null||value==='')throw new Error('engagement signal value required');
 if(!Array.isArray(evidenceRefs))throw new Error('engagement signal evidenceRefs must be an array');
 if(typeof sourceType!=='string'||!sourceType.trim()||typeof sourceRef!=='string'||!sourceRef.trim())throw new Error('engagement signal provenance required');
 if(!ENGAGEMENT_SIGNAL_CONFIDENCE.includes(confidence))throw new Error(`unsupported engagement signal confidence: ${confidence}`);
 if(!ENGAGEMENT_SIGNAL_STATUS.includes(status))throw new Error(`unsupported engagement signal status: ${status}`);
 return Object.freeze({key,value,evidenceRefs:[...new Set(evidenceRefs)],sourceType,sourceRef,observedAt,confidence,status});
}
export function validateEngagementSignals(signals={}){const errors=[];if(!signals||typeof signals!=='object'||Array.isArray(signals))return['engagementSignals must be an object'];for(const[key,signal]of Object.entries(signals)){if(!ENGAGEMENT_SIGNAL_KEYS.includes(key))errors.push(`unsupported engagement signal: ${key}`);if(!signal||typeof signal!=='object'||signal.key!==key)errors.push(`engagement signal key mismatch: ${key}`);if(signal?.value==null||signal?.value==='')errors.push(`engagement signal value required: ${key}`);if(!Array.isArray(signal?.evidenceRefs))errors.push(`engagement signal evidenceRefs must be an array: ${key}`);if(!signal?.sourceType||!signal?.sourceRef)errors.push(`engagement signal provenance required: ${key}`);if(!ENGAGEMENT_SIGNAL_CONFIDENCE.includes(signal?.confidence))errors.push(`invalid engagement signal confidence: ${key}`);if(!ENGAGEMENT_SIGNAL_STATUS.includes(signal?.status))errors.push(`invalid engagement signal status: ${key}`);}return errors;}
