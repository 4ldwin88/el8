// Canonical Discovery → Planning boundary.
// Discovery owns whether a concern is established and its member/context signals.
// Planning owns intervention selection. Vocabulary translation happens only at this boundary.

const freeze=x=>Object.freeze(x);
const IMMEDIACY_TO_URGENCY=freeze({routine:1,'time-sensitive':3,acute:5});
const IMPORTANCE_TO_NUMBER=freeze({low:1,moderate:2,high:4,'very-high':5});
const CONCERN_TO_DRIVER=freeze({money:'money_pressure',work:'work_instability',sleep:'poor_sleep',health:'low_activity',energy:'low_energy',focus:'low_focus',relationships:'relationship_strain',support:'low_support',home:'home_instability',direction:'lack_direction'});
export const planningDriverId=concernId=>CONCERN_TO_DRIVER[concernId]||concernId;

export function concernToPlanningDriver(state={}){
  if(!state.concernId) throw new Error('concernId required');
  return freeze({
    id:planningDriverId(state.concernId),
    sourceConcernId:state.concernId,
    confidence:state.evidenceConfidence??null,
    memberImportance:IMPORTANCE_TO_NUMBER[state.memberImportance]??null,
    memberPrioritySelected:Boolean(state.memberPrioritySelected),
    urgency:IMMEDIACY_TO_URGENCY[state.immediacyClass]??null,
    readiness:state.readiness??null,
    feasibility:state.feasibility??freeze({constraints:freeze([]),supports:freeze([]),values:freeze({}),evidenceRefs:freeze([])}),
    temporality:state.temporality??'unknown',
    specificityFrontier:state.specificityFrontier??0,
    discoveryResolutionState:state.resolutionState??null,
    safetyEscalationLevel:state.safetyEscalationLevel??0,
    evidenceRefs:freeze([...(state.evidenceRefs||[])])
  });
}

export function buildPlanningHandoff(priorityResult={}){
  const selected=priorityResult.selected||[];
  const backlog=priorityResult.backlog||[];
  return freeze({
    contractVersion:'discovery-planning-v1',
    ranked:freeze(selected.map(concernToPlanningDriver)),
    discoveryBacklog:freeze(backlog.map(concernToPlanningDriver)),
    semantics:freeze({
      id:'Planning driver ID translated once from the canonical Discovery concern vocabulary.',
      sourceConcernId:'Original Discovery concern ID retained for traceability.',
      confidence:'Discovery evidence confidence; Planning may threshold it but must not recompute it.',
      memberImportance:'Member-stated importance normalized only at the boundary.',
      memberPrioritySelected:'Explicit member choice; never inferred by Planning.',
      urgency:'Mechanical projection of Discovery immediacy; not a new Planning judgment.',
      readiness:'Discovery-derived readiness; Planning may use it only for action eligibility/fit.',
      feasibility:'Discovery-derived constraints, supports and capacity; Planning may use but not overwrite them.',
      safetyEscalationLevel:'Discovery safety signal; safety routing remains upstream of normal planning.'
    })
  });
}
