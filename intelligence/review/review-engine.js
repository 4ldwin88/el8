// Canonical active-plan review semantics.
// Review interprets observed execution/outcomes; it does not pretend elapsed days are evidence.
const freeze=x=>Object.freeze(x);
const VALID=new Set(['keep','simplify','replace','deepen','reassess']);
export function reviewPlan({plan={},evidence={}}={}){
 if(plan.status!=='active'||!(plan.active||[]).length)throw new Error('Active plan required');
 const adherence=evidence.adherence??null,outcome=evidence.outcome??null,burden=evidence.burden??null,barrierKnown=Boolean(evidence.barrierKnown),circumstancesChanged=Boolean(evidence.circumstancesChanged),safetyChange=Boolean(evidence.safetyChange);
 let decision,reason;
 if(safetyChange||circumstancesChanged){decision='reassess';reason=safetyChange?'safety_or_risk_changed':'member_context_changed'}
 else if(adherence===null||outcome===null){decision='deepen';reason='review_evidence_incomplete'}
 else if(adherence==='high'&&outcome==='improved'&&burden!=='high'){decision='keep';reason='working_and_sustainable'}
 else if((burden==='high'||adherence==='low')&&outcome!=='worse'&&barrierKnown){decision='simplify';reason='execution_barrier_identified'}
 else if(adherence==='high'&&(outcome==='unchanged'||outcome==='worse')){decision='replace';reason='executed_without_expected_benefit'}
 else {decision='deepen';reason='insufficient_causal_clarity'}
 return freeze({contractVersion:'plan-review-v1',decision,reason,valid:VALID.has(decision),evidenceUsed:freeze({...evidence}),actionIds:freeze((plan.active||[]).map(x=>x.id)),requiresDiscovery:decision==='reassess',requiresPlanning:decision==='replace'||decision==='simplify',continueCurrent:decision==='keep'||decision==='deepen'});
}
