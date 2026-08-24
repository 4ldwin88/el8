export const SCHEDULER_CONFIG=Object.freeze({OVERRIDE_MARGIN:0.45});
function informationValue(q){return (q.expectedUncertaintyReduction??0)+(q.coverageDeficit??0)*0.5-(q.redundancyPenalty??0)}
function unresolvedUncertainty(q,state){return Boolean(q.addressesUnresolvedUncertainty||state?.uncertain||state?.resolutionState==='narrowing'||state?.driverKnown===false)}
export function selectNextQuestion({candidates,states,config=SCHEDULER_CONFIG}){
 const stateById=new Map(states.map(s=>[s.concernId,s]));
 const safetyConcerns=states.filter(s=>(s.safetyEscalationLevel??0)>0&&!['escalated','nonIssue'].includes(s.resolutionState));
 if(safetyConcerns.length){const ids=new Set(safetyConcerns.map(s=>s.concernId));const eligibleSafety=candidates.filter(q=>ids.has(q.concernId)&&q.eligible!==false&&!q.depthBudgetExhausted);if(!eligibleSafety.length)return{type:'escalate-safety',question:null,reason:'unresolved-safety-no-eligible-question'};eligibleSafety.sort((a,b)=>(b.safetyPriority??0)-(a.safetyPriority??0)||a.id.localeCompare(b.id));return{type:'question',question:eligibleSafety[0],reason:'safety-hard-gate'}}
 const eligible=candidates.filter(q=>q.eligible!==false&&!q.depthBudgetExhausted);if(!eligible.length)return{type:'none',question:null,reason:'no-eligible-question'};
 const tier=q=>stateById.get(q.concernId)?.memberImportanceRank??0;const topTier=Math.max(...eligible.map(tier));const inTier=eligible.filter(q=>tier(q)===topTier).map(q=>({q,value:informationValue(q)})).sort((a,b)=>b.value-a.value||a.q.id.localeCompare(b.q.id));const best=inTier[0];
 const challengers=eligible.filter(q=>tier(q)<topTier).map(q=>({q,value:informationValue(q),state:stateById.get(q.concernId)})).filter(x=>unresolvedUncertainty(x.q,x.state)).sort((a,b)=>b.value-a.value||a.q.id.localeCompare(b.q.id));const challenger=challengers[0];
 if(challenger&&challenger.value>best.value+config.OVERRIDE_MARGIN)return{type:'question',question:challenger.q,score:challenger.value,reason:'cross-tier-unresolved-uncertainty-override',allocation:{topTier,overrideMargin:config.OVERRIDE_MARGIN,inTierQuestion:best.q.id,inTierValue:best.value}};
 return{type:'question',question:best.q,score:best.value,reason:'importance-tier-gate',allocation:{topTier,overrideMargin:config.OVERRIDE_MARGIN}};
}
