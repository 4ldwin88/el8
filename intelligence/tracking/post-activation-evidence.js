// Canonical post-activation evidence boundary for Track -> Member State -> Review.
// Capture modality is provenance, not a separate state model.
const freeze=x=>Object.freeze(x);
const SIGNALS=new Set(['adherence','outcome','burden','usefulness','context','safety','other']);
const MODALITIES=new Set(['structured','text','voice','photo','file','integration','system']);
const nonblank=(v,name)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${name} required`);return v.trim()};
export const POST_ACTIVATION_EVIDENCE_VERSION='1.0.0';

export function createPostActivationEvidence({evidenceId,memberId,actionId,planId=null,trackingContractId,signalType,value,unit=null,observedAt,recordedAt=observedAt,source='member',modality='structured',confidence='confirmed',context={},provenanceRefs=[]}={}){
 nonblank(evidenceId,'evidenceId');nonblank(memberId,'memberId');nonblank(actionId,'actionId');nonblank(trackingContractId,'trackingContractId');
 if(!SIGNALS.has(signalType))throw new Error('signalType must be canonical Review evidence dimension');
 if(!MODALITIES.has(modality))throw new Error('unsupported capture modality');
 if(value===undefined||value===null||value==='')throw new Error('value required');
 const observed=new Date(observedAt);const recorded=new Date(recordedAt);if(!Number.isFinite(observed.getTime())||!Number.isFinite(recorded.getTime()))throw new Error('valid observedAt and recordedAt required');
 return freeze({contractVersion:POST_ACTIVATION_EVIDENCE_VERSION,evidenceId,memberId,planId,actionId,trackingContractId,signalType,value,unit,observedAt:observed.toISOString(),recordedAt:recorded.toISOString(),source,modality,confidence,context:freeze({...context}),provenanceRefs:freeze([...new Set(provenanceRefs)]),canonicalEvidence:true});
}

export function toReviewEvidence(records=[]){
 const out={evidenceRefs:[]};
 const ordered=[...records].sort((a,b)=>new Date(a.observedAt)-new Date(b.observedAt));
 for(const record of ordered){
  if(record?.contractVersion!==POST_ACTIVATION_EVIDENCE_VERSION||record.canonicalEvidence!==true)throw new Error('Review requires canonical post-activation evidence');
  out.evidenceRefs.push(record.evidenceId);
  switch(record.signalType){
   case'adherence':out.adherence=record.value;break;
   case'outcome':out.outcome=record.value;break;
   case'burden':out.burden=record.value;break;
   case'usefulness':out.usefulness=record.value;break;
   case'context':out.contextChanged=Boolean(record.value);out.circumstancesChanged=Boolean(record.value);break;
   case'safety':out.safetyChanged=Boolean(record.value);break;
  }
 }
 out.evidenceRefs=[...new Set(out.evidenceRefs)];return freeze({...out,evidenceRefs:freeze(out.evidenceRefs)});
}
