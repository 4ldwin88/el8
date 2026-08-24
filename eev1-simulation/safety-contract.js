// EEV1 deterministic governed-safety contract.
// This simulation contract is deliberately conservative: deterministic signals set a floor.
// AI may add/escalate a candidate signal, but may never lower deterministic routing.

export const SAFETY_LEVELS=Object.freeze({NONE:0,LEVEL_1:1,LEVEL_2:2,LEVEL_3:3});
export const SAFETY_ROUTES=Object.freeze({0:'CONTINUE',1:'CONSTRAIN',2:'PAUSE_AND_REVIEW',3:'PAUSE_AND_REFER'});

// signalType is a governed semantic category produced by versioned mappings, not raw keyword matching.
export const GOVERNED_SIGNAL_POLICY=Object.freeze({
 immediate_danger:{level:3,interrupt:true},
 urgent_medical_risk:{level:3,interrupt:true},
 severe_functional_instability:{level:2,interrupt:true},
 significant_safety_uncertainty:{level:2,interrupt:true},
 elevated_vulnerability:{level:1,interrupt:false},
 bounded_caution:{level:1,interrupt:false}
});

const clampLevel=v=>Math.max(0,Math.min(3,Number(v)||0));
export function detectDeterministicSafety(signals=[]){
 const governed=[]; let level=0,interrupt=false;
 for(const signal of signals){
  const rule=GOVERNED_SIGNAL_POLICY[signal?.signalType];
  if(!rule)continue;
  // Only active/current governed observations affect current safety state.
  if(signal.active===false||signal.temporality==='historical'||signal.temporality==='resolved')continue;
  level=Math.max(level,rule.level); interrupt=interrupt||rule.interrupt;
  governed.push(Object.freeze({signalType:signal.signalType,level:rule.level,observationId:signal.observationId??null}));
 }
 return Object.freeze({level,interrupt,governedSignals:Object.freeze(governed)});
}

export function routeSafety({signals=[],aiSuggestedLevel=0,activePlan=false}={}){
 const detected=detectDeterministicSafety(signals);
 const ai=clampLevel(aiSuggestedLevel);
 const effectiveLevel=Math.max(detected.level,ai);
 const route=SAFETY_ROUTES[effectiveLevel];
 const interrupt=Boolean(activePlan&&(detected.interrupt||effectiveLevel>=2));
 return Object.freeze({deterministicLevel:detected.level,aiSuggestedLevel:ai,effectiveLevel,route,interruptActivePlan:interrupt,aiDowngradeBlocked:ai<detected.level,governedSignals:detected.governedSignals});
}

export function safetyPlanDirective(result){
 if(!result||result.effectiveLevel===0)return Object.freeze({planState:'UNCHANGED',optimizationAllowed:true});
 if(result.effectiveLevel===1)return Object.freeze({planState:'CONSTRAINED',optimizationAllowed:true});
 if(result.effectiveLevel===2)return Object.freeze({planState:'PAUSED',optimizationAllowed:false});
 return Object.freeze({planState:'PAUSED_REFER',optimizationAllowed:false});
}
