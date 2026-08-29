import{canonicalPlanningInputFromBrowser,canonicalBrowserPlanView}from'./browser-planning-adapter.js';
import{buildCanonicalPlan}from'../../intelligence/planning/canonical-plan-engine.js';
import{applyPlanDeepening}from'../../intelligence/planning/plan-deepening.js';
import{applyCanonicalBrowserPlan}from'./browser-member-state-plan.js';
export function buildCanonicalBrowserPlan({discoveryOutput,confirmedPriorities,memberState,selectionEvidence={},activationEvidence={},rejectedInterventionIds=[],preferredInterventionIds={},contraindications=[],adaptationConstraint=null,previousInterventionIds=[],previousMechanisms=[],maxEffort=null}){
 if(!memberState)throw new Error('Canonical Member State is required');
 const input=canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities,memberStateRevision:memberState.revision});
 const plan=buildCanonicalPlan(input,{selectionEvidence,activationEvidence,rejectedInterventionIds,preferredInterventionIds,contraindications,adaptationConstraint,previousInterventionIds,previousMechanisms,maxEffort});
 return{plan,view:canonicalBrowserPlanView(plan)};
}
export function selectCanonicalBrowserPlanActions({plan,selectedInterventionIds=[],activationEvidence={}}){
 if(!plan||plan.status!=='active')throw new Error('Active canonical plan required');
 const selected=new Set(selectedInterventionIds),candidates=[...(plan.active||[]),...(plan.backlog||[])],active=candidates.filter(x=>selected.has(x.intervention_id||x.id));
 if(!active.length)throw new Error('Select at least one action');
 const backlog=candidates.filter(x=>!selected.has(x.intervention_id||x.id));
 const windows=active.map(c=>String(c.reviewRule?.window||'').match(/(\d+)\s*(?:[–-]\s*\d+)?\s*days?/i)).filter(Boolean).map(m=>Number(m[1]));
 return applyPlanDeepening({...plan,active,actions:active,backlog,reviewDays:windows.length?Math.min(...windows):plan.reviewDays,decisionTrace:{...(plan.decisionTrace||{}),memberSelectedInterventionIds:active.map(x=>x.intervention_id||x.id)}},activationEvidence);
}
export function activateCanonicalBrowserPlan({plan,memberState,acceptedInterventionIds=[]}){
 const accepted=new Set(acceptedInterventionIds);
 const actionDecisions=Object.fromEntries((plan?.active||[]).map(item=>{const id=item.intervention_id||item.id;return[id,{status:accepted.has(id)?'ACCEPTED':'DEFERRED'}]}));
 return{plan:{...plan,activationStatus:'ready'},memberState:applyCanonicalBrowserPlan(memberState,plan,{actionDecisions})};
}
