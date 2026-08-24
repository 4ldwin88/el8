// EEV1 material-decision authority contract.
// AI may assist interpretation or presentation, but may not silently change deterministic state.

export const AUTHORITY_CLASSES=Object.freeze({
 DETERMINISTIC:'DETERMINISTIC',
 AI_ASSISTED:'AI_ASSISTED',
 AI_MEDIATED:'AI_MEDIATED'
});

export const OPERATING_LOOP_AUTHORITY=Object.freeze({
 observationCapture:{authority:'DETERMINISTIC',material:true},
 freeTextStructuring:{authority:'AI_ASSISTED',material:false,requiresHumanOrRuleValidation:true},
 evidenceMapping:{authority:'DETERMINISTIC',material:true},
 evidenceAggregation:{authority:'DETERMINISTIC',material:true},
 concernStateTransition:{authority:'DETERMINISTIC',material:true},
 driverEstablishment:{authority:'DETERMINISTIC',material:true},
 deterministicSafetyDetection:{authority:'DETERMINISTIC',material:true},
 aiSafetySignalSuggestion:{authority:'AI_ASSISTED',material:false,mayEscalate:true,mayDowngrade:false},
 safetyRouting:{authority:'DETERMINISTIC',material:true},
 decisionSufficiency:{authority:'DETERMINISTIC',material:true},
 priorityEligibility:{authority:'DETERMINISTIC',material:true},
 priorityOrdering:{authority:'DETERMINISTIC',material:true},
 agencyEligibility:{authority:'DETERMINISTIC',material:true},
 actionEligibility:{authority:'DETERMINISTIC',material:true},
 actionCandidateGeneration:{authority:'AI_ASSISTED',material:false,requiresEligibilityGate:true},
 planComposition:{authority:'DETERMINISTIC',material:true},
 memberFacingExplanation:{authority:'AI_ASSISTED',material:false,mustNotAlterDecision:true},
 adherenceOutcomeCapture:{authority:'DETERMINISTIC',material:true},
 adaptationDecision:{authority:'DETERMINISTIC',material:true},
 historicalPatternSuggestion:{authority:'AI_ASSISTED',material:false,requiresEligibilityGate:true}
});

export function validateAuthorityContract(contract=OPERATING_LOOP_AUTHORITY){
 const errors=[];
 for(const [node,spec] of Object.entries(contract)){
  if(!Object.values(AUTHORITY_CLASSES).includes(spec.authority))errors.push(`${node}: invalid authority`);
  if(spec.material&&spec.authority!=='DETERMINISTIC')errors.push(`${node}: material decision must be deterministic`);
  if(spec.mayDowngrade===true)errors.push(`${node}: AI may not downgrade governed safety`);
 }
 return Object.freeze({valid:errors.length===0,errors});
}

export function validateAICallRecord(record={}){
 const required=['callId','purpose','modelId','promptVersion','policyVersion','timestamp','rawOutput'];
 const missing=required.filter(k=>record[k]===undefined||record[k]===null||record[k]==='');
 return Object.freeze({valid:missing.length===0,missing});
}

export function applyAISafetySuggestion({deterministicLevel=0,aiSuggestedLevel=0}={}){
 const d=Math.max(0,Math.min(3,Number(deterministicLevel)||0));
 const a=Math.max(0,Math.min(3,Number(aiSuggestedLevel)||0));
 // AI may only increase the level presented to deterministic routing.
 return Object.freeze({effectiveLevel:Math.max(d,a),deterministicLevel:d,aiSuggestedLevel:a,aiDowngradeBlocked:a<d});
}
