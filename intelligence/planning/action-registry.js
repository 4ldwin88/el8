import { createActionDefinition } from './action-contract.js';
import { assertCanonicalConstructId } from '../contracts/canonical-vocabulary.js';

export const ACTION_REGISTRY_VERSION='0.1.0';

export function createActionRegistry(definitions=[]){
  const byId=new Map();
  for(const raw of definitions){const action=createActionDefinition(raw);if(byId.has(action.actionId))throw new Error(`duplicate actionId: ${action.actionId}`);byId.set(action.actionId,action);}
  const all=()=>[...byId.values()];
  return Object.freeze({
    version:ACTION_REGISTRY_VERSION,
    get(actionId){return byId.get(actionId)??null;},
    all,
    forConstruct(constructId,{includeHeld=false}={}){assertCanonicalConstructId(constructId,'constructId');return all().filter(a=>a.constructIds.includes(constructId)&&(includeHeld||!['held','deferred','retired'].includes(a.status)));},
    eligibleFor({focusIds,evidenceRefs=[],constraintRefs=[],safetyDisposition='ordinary_flow'}={}){
      if(!Array.isArray(focusIds))throw new Error('focusIds must be array');for(const id of focusIds)assertCanonicalConstructId(id,'focusIds');
      if(['pause_ordinary_flow','escalate'].includes(safetyDisposition))return {eligible:[],rejected:all().map(action=>({actionId:action.actionId,reasonCodes:['safety_override']}))};
      const focusSet=new Set(focusIds),evidenceSet=new Set(evidenceRefs),eligible=[],rejected=[];
      for(const action of all()){
        const reasons=[];
        if(['held','deferred','retired'].includes(action.status))reasons.push(`status_${action.status}`);
        if(!action.constructIds.some(id=>focusSet.has(id)))reasons.push('not_relevant_to_confirmed_focus');
        const required=action.eligibility.minimumEvidenceRefs??[];if(required.some(ref=>!evidenceSet.has(ref)))reasons.push('minimum_evidence_missing');
        // Constraint interpretation belongs to Planning fit logic; registry merely carries refs.
        if(reasons.length)rejected.push({actionId:action.actionId,reasonCodes:reasons});else eligible.push({...action,constraintRefs:[...constraintRefs]});
      }
      return {eligible,rejected};
    },
  });
}
