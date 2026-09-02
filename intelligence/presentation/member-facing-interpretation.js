// Member-facing interpretation boundary for canonical Member State learning.
// Internal personalization may adapt decisions; it must not silently become identity labeling.
const FORBIDDEN_LABEL_KEYS=Object.freeze(['archetype','characterDescriptor','personalityLabel','characterScore']);
const JUDGMENT_TERMS=Object.freeze(['lazy','undisciplined','bad with money','unmotivated']);

export function assertNoMemberFacingIdentityLabels(output={}){
  if(!output||typeof output!=='object'||Array.isArray(output))throw new Error('member-facing interpretation must be an object');
  for(const key of FORBIDDEN_LABEL_KEYS)if(output[key]!=null)throw new Error(`member-facing identity label is not governed: ${key}`);
  const text=JSON.stringify(output).toLowerCase();
  for(const term of JUDGMENT_TERMS)if(text.includes(term))throw new Error(`member-facing character judgment is not governed: ${term}`);
  return output;
}

export function createMemberFacingObservation({observation,evidenceRefs=[],period=null,uncertainty=null,decisionConsequence=null,correctionAvailable=true}={}){
  if(typeof observation!=='string'||!observation.trim())throw new Error('evidence-grounded observation required');
  if(!Array.isArray(evidenceRefs)||!evidenceRefs.length)throw new Error('member-facing observation requires evidenceRefs');
  return Object.freeze(assertNoMemberFacingIdentityLabels({kind:'observation',observation:observation.trim(),evidenceRefs:[...new Set(evidenceRefs)],period,uncertainty,decisionConsequence,correctionAvailable:Boolean(correctionAvailable)}));
}

export function memberFacingLearningFromEngagementSignal(signal,{observation,evidenceRefs=signal?.evidenceRefs??[],period=null,uncertainty=null,decisionConsequence=null}={}){
  if(!signal||typeof signal!=='object')throw new Error('engagement signal required');
  if(signal.status!=='current')throw new Error('only current engagement learning may be exposed');
  // Deliberately require authored evidence-grounded copy instead of exposing key/value as a trait.
  return createMemberFacingObservation({observation,evidenceRefs,period,uncertainty,decisionConsequence});
}
