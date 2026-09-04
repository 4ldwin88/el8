// Reconciliation layer for human-QA findings against Drive Planning authority.
// The underlying engine remains the hard-gate/portfolio implementation; this layer corrects
// outcome classification and attaches downstream Toolkit composition without changing Action eligibility.
import{buildPlan as buildBasePlan}from'./planningEngine.js';
import{composeToolkitForAction}from'./toolkit-composition.js';
const clone=x=>structuredClone(x);
export function buildPlan(input,options={}){const base=buildBasePlan(input,options);const resolutions=clone(base.focusResolutions||[]);const noActionIds=new Set(resolutions.filter(r=>r.noActionAllowed).map(r=>r.focusId));const actions=(base.proposedActions||[]).map(a=>Object.freeze({...a,toolkit:composeToolkitForAction(a.actionId)}));const unresolved=(base.uncoveredFocusIds||[]).filter(id=>!noActionIds.has(id));let status=base.status,reason=base.reason;if(status==='coverage_gap'&&!unresolved.length){if(actions.length){status='proposed';reason='member_confirmed_focus_with_governed_no_action_focus'}else{status='no_plan';reason='governed_no_autonomous_intervention'}}return Object.freeze({...base,status,reason,proposedActions:actions,actions,uncoveredFocusIds:unresolved,focusResolutions:resolutions})}
