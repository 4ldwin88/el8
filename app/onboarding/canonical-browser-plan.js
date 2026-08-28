import{canonicalPlanningInputFromBrowser,canonicalBrowserPlanView}from'./browser-planning-adapter.js';
import{buildCanonicalPlan}from'../../intelligence/planning/canonical-plan-engine.js';
export function buildCanonicalBrowserPlan({discoveryOutput,confirmedPriorities,memberState,selectionEvidence={},activationEvidence={}}){
 if(!memberState)throw new Error('Canonical Member State is required');
 const input=canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities,memberStateRevision:memberState.revision});
 const plan=buildCanonicalPlan(input,{selectionEvidence,activationEvidence});
 return{plan,view:canonicalBrowserPlanView(plan)};
}
