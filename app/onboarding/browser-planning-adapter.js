// Browser presentation edge for canonical Planning.
// Planning input authority lives at the Focus-confirmation capability boundary; this adapter only validates browser-provided canonical state and formats Plan output.
import {focusConfirmationToPlanning} from '../../intelligence/contracts/capability-boundaries.js';
const clone=x=>structuredClone(x);
export function canonicalPlanningInputFromBrowser({memberStateRevision,confirmedFocus,evidenceRefs=[],constraintRefs=[],safetyDisposition='ordinary_flow',planningContext={}}={}){
 if(!Number.isInteger(memberStateRevision)||memberStateRevision<0)throw new Error('Member State revision is required');
 if(!Array.isArray(confirmedFocus))throw new Error('confirmedFocus must be an array');
 const focuses=confirmedFocus.map(f=>{if(!f?.constructId||f.decision!=='accepted')throw new Error('browser Planning accepts only member-accepted Focus');return clone(f)});
 return focusConfirmationToPlanning({memberStateRevision,focuses,evidenceRefs:[...evidenceRefs],constraintRefs:[...constraintRefs],safetyDisposition,planningContext});
}
export function canonicalBrowserPlanView(plan={}){const actions=plan.proposedActions||plan.actions||[];return{status:plan.status||'no_plan',reason:plan.reason||null,focusIds:[...(plan.focusIds||[])],actions:clone(actions),backlog:clone(plan.backlog||[]),uncoveredFocusIds:[...(plan.uncoveredFocusIds||[])],burden:clone(plan.burden||{}),trackingRequirements:actions.map(a=>a.trackingRequirement).filter(Boolean),additionalAssessmentRequirements:actions.map(a=>a.additionalAssessmentRequirement).filter(Boolean),activationStatus:plan.status==='proposed'&&actions.length?'awaiting_member_acceptance':null,decisionTrace:clone(plan.decisionTrace||{})}}
