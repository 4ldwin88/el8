const clamp=n=>Math.max(0,Math.min(1,n));

// v0.6 deterministic semantics for closed-choice QA answers.
// Pressure deltas use the blind-runner convention: positive = more pressure,
// negative = reassuring/supportive evidence. Question-specific mappings can
// override these generic ordinal semantics as the bank matures.
const EXACT={
  'not at all':.34,'very little':.34,'far too little':.34,'poorly':.34,
  'much worse':.34,'severe':.4,'very difficult':.4,'overwhelmed':.4,
  'not enough':.34,'less than i needed':.34,'very insecure':.4,
  'very disconnected':.4,'critically low':.45,'already behind':.45,
  'somewhat insecure':.2,'somewhat disconnected':.2,'somewhat':.2,
  'a little':.2,'a little low':.2,'partly':.2,'worse':.2,'difficult':.2,
  'not manageable':.3,'more than i wanted':.2,'some':.12,
  'enough':-.28,'mostly':-.22,'very well':-.34,'plenty':-.34,
  'supportive':-.28,'stable':-.3,'comfortable':-.34,'manageable':-.22,
  'connected enough':-.28,'clear enough':-.24,'fairly well':-.24,
  'nothing significant':-.3,'nothing is blocking':-.3,'not noticeably':-.25,
  'no action':-.18,'no change':0,'yes':.18,'no':-.18
};
const AMBIGUOUS=new Set(['unsure',"i don't know",'don’t know','not sure','something else','something else / mixed','prefer not to say']);

export function inferQaOptionEvidence(answer,question={}){
  const label=String(answer??'').trim().toLowerCase();
  const primary=question.dimension||question.primary_dimension||null;
  if(AMBIGUOUS.has(label))return{delta:{},uncertaintyReduction:.04,ambiguous:true,source:'option-semantic'};
  const delta={};
  if(primary&&Object.prototype.hasOwnProperty.call(EXACT,label))delta[primary]=EXACT[label];
  return{delta,uncertaintyReduction:Object.keys(delta).length?.24:.12,ambiguous:false,source:'option-semantic'};
}

export function applyQaOptionEvidence({belief={},uncertainty={},evidenceCount={},evidence={}}={}){
  const nextBelief={...belief},nextUncertainty={...uncertainty},nextEvidenceCount={...evidenceCount};
  for(const d of Object.keys(nextBelief)){
    const n=Number(evidence.delta?.[d]||0);
    if(n){nextBelief[d]=clamp(Number(nextBelief[d]||0)+n);nextEvidenceCount[d]=Number(nextEvidenceCount[d]||0)+1;nextUncertainty[d]=clamp(Number(nextUncertainty[d]??1)-Number(evidence.uncertaintyReduction||0));}
  }
  return{belief:nextBelief,uncertainty:nextUncertainty,evidenceCount:nextEvidenceCount};
}
