// EEV1 learning/metrics governance. Historical outcomes may suggest candidates,
// but may not silently alter evidence, safety, eligibility, or production policy.
export const LEARNING_STAGES=Object.freeze(['DRAFT','SHADOW','HELD_OUT_VALIDATED','APPROVED','DEPLOYED','ROLLED_BACK']);
export const PROTECTED_DOMAINS=Object.freeze(['SAFETY','EVIDENCE_STATE','DRIVER_STATE','AGENCY_ELIGIBILITY','ACTION_ELIGIBILITY']);

export function createPolicyCandidate({candidateId,basePolicyVersion,candidateVersion,changes=[],metricsPlan,createdAt}={}){
 if(!candidateId||!basePolicyVersion||!candidateVersion||!metricsPlan||!createdAt)throw new Error('invalid-policy-candidate');
 return Object.freeze({candidateId,basePolicyVersion,candidateVersion,changes:Object.freeze([...changes]),metricsPlan:Object.freeze({...metricsPlan}),createdAt,stage:'DRAFT'});
}

export function containsProtectedChange(candidate={}){
 return (candidate.changes??[]).some(c=>PROTECTED_DOMAINS.includes(c.domain));
}

export function advanceCandidate(candidate,{toStage,shadowResult,heldOutResult,approval,monitoringPlan}={}){
 const allowed={DRAFT:['SHADOW'],SHADOW:['HELD_OUT_VALIDATED'],HELD_OUT_VALIDATED:['APPROVED'],APPROVED:['DEPLOYED'],DEPLOYED:['ROLLED_BACK']};
 if(!(allowed[candidate.stage]??[]).includes(toStage))throw new Error('invalid-stage-transition');
 if(toStage==='HELD_OUT_VALIDATED'&&shadowResult?.passed!==true)throw new Error('shadow-validation-required');
 if(toStage==='APPROVED'&&heldOutResult?.passed!==true)throw new Error('held-out-validation-required');
 if(toStage==='APPROVED'&&(!approval?.approverId||!approval?.timestamp))throw new Error('explicit-approval-required');
 if(toStage==='DEPLOYED'&&!monitoringPlan)throw new Error('monitoring-plan-required');
 if(toStage==='DEPLOYED'&&containsProtectedChange(candidate)&&approval?.protectedChangeApproved!==true)throw new Error('protected-change-approval-required');
 return Object.freeze({...candidate,stage:toStage,shadowResult:shadowResult??candidate.shadowResult,heldOutResult:heldOutResult??candidate.heldOutResult,approval:approval??candidate.approval,monitoringPlan:monitoringPlan??candidate.monitoringPlan});
}

export function historicalSuggestion({patternId,contextSimilarity,observations=[]}={}){
 const similarity=Math.max(0,Math.min(1,Number(contextSimilarity)||0));
 return Object.freeze({patternId,contextSimilarity:similarity,observationCount:observations.length,mayGenerateCandidate:true,maySatisfyEvidence:false,causalClaim:false});
}

export function rollbackDeployment(candidate,{reason,timestamp}={}){
 if(candidate.stage!=='DEPLOYED')throw new Error('only-deployed-can-rollback');
 if(!reason||!timestamp)throw new Error('rollback-audit-required');
 return Object.freeze({...candidate,stage:'ROLLED_BACK',rollback:Object.freeze({reason,timestamp})});
}
