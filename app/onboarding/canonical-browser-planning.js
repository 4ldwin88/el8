// Browser QA adapter for the canonical Prioritization -> member Focus confirmation -> Planning v3 boundary.
// This is current architecture wiring, not a legacy compatibility adapter.
import {confirmFocus,focusConfirmationPlanningInput} from '../../intelligence/prioritization/focus-confirmation.js';
import {buildCanonicalPlan} from '../../intelligence/planning/canonical-plan-engine.js';

const unique=v=>[...new Set(v||[])];

export function buildCanonicalBrowserPlan({prioritization,selectedConstructIds=[],constraints=[],evidenceRefs=[],safetyDisposition='ordinary_flow',planningContext={},planningOptions={}}={}){
 if(!prioritization)throw new Error('Canonical Prioritization result required');
 const selected=unique(selectedConstructIds);
 const recommended=(prioritization.recommended||[]).map(x=>x.constructId);
 const decisions=recommended.map((constructId,index)=>({constructId,decision:selected.includes(constructId)?'accepted':'rejected',memberRank:selected.indexOf(constructId)>=0?selected.indexOf(constructId)+1:null,reasonCodes:selected.includes(constructId)?['member_confirmed_browser_qa']:['member_not_selected_browser_qa']}));
 const confirmation=confirmFocus({prioritization,decisions,constraints});
 const planningInput=focusConfirmationPlanningInput(confirmation,{evidenceRefs,safetyDisposition,planningContext});
 const plan=buildCanonicalPlan(planningInput,planningOptions);
 return Object.freeze({confirmation,planningInput,plan});
}
