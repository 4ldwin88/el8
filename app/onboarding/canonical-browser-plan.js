import{canonicalPlanningInputFromBrowser,canonicalBrowserPlanView}from'./browser-planning-adapter.js';
import{buildCanonicalPlan}from'../../intelligence/planning/canonical-plan-engine.js';
import{applyCanonicalBrowserPlan}from'./browser-member-state-plan.js';
export function buildCanonicalBrowserPlan({discoveryOutput,confirmedPriorities,memberState,selectionEvidence={},activationEvidence={},rejectedInterventionIds=[],preferredInterventionIds={},contraindications=[],adaptationConstraint=null,previousInterventionIds=[],previousMechanisms=[],maxEffort=null}){
 if(!memberState)throw new Error('Canonical Member State is required');
 const input=canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities,memberStateRevision:memberState.revision});
 const plan=buildCanonicalPlan(input,{selectionEvidence,activationEvidence,rejectedInterventionIds,preferredInterventionIds,contraindications,adaptationConstraint,previousInterventionIds,previousMechanisms,maxEffort});
 return{plan,view:canonicalBrowserPlanView(plan)};
}
export function activateCanonicalBrowserPlan({plan,memberState,acceptedInterventionIds=[]}){
 const accepted=new Set(acceptedInterventionIds);
 const actionDecisions=Object.fromEntries((plan?.active||[]).map(item=>{const id=item.intervention_id||item.id;return[id,{status:accepted.has(id)?'ACCEPTED':'DEFERRED'}]}));
 return{plan:{...plan,activationStatus:'ready'},memberState:applyCanonicalBrowserPlan(memberState,plan,{actionDecisions})};
}
