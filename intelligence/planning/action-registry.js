import { createActionDefinition,assertCanonicalActionId } from './action-contract.js';
import { assertCanonicalConstructId } from '../contracts/canonical-vocabulary.js';
export const ACTION_REGISTRY_VERSION='0.5.0';
const PLAN_CONDITION_ACTIONS=Object.freeze({reduce_simultaneous_demands:['XDM-A01'],sequence_competing_actions:['XDM-A02'],lowest_burden_viable:['XDM-A03'],information_gathering_trial:['XDM-A04'],protect_capacity:['XDM-A05'],member_chosen_alternative:['XDM-A06']});
const NON_AUTONOMOUS_STATUSES=Object.freeze(['unsupported_experimental','deferred','retired']);
export function createActionRegistry(definitions=[]){
 const byId=new Map();for(const raw of definitions){const action=createActionDefinition(raw);if(byId.has(action.actionId))throw new Error(`duplicate actionId: ${action.actionId}`);byId.set(action.actionId,action)}const all=()=>[...byId.values()];
 return Object.freeze({version:ACTION_REGISTRY_VERSION,get(actionId){assertCanonicalActionId(actionId);return byId.get(actionId)??null},all,forConstruct(constructId,{includeUnavailable=false}={}){assertCanonicalConstructId(constructId,'constructId');return all().filter(a=>a.actionScope==='construct'&&a.constructIds.includes(constructId)&&(includeUnavailable||!NON_AUTONOMOUS_STATUSES.includes(a.status)))},eligibleFor({focusIds,evidenceRefs=[],constraintRefs=[],safetyDisposition='ordinary_flow',planningConditions=[],approvedPlanActionIds=[]}={}){
  if(!Array.isArray(focusIds))throw new Error('focusIds must be array');for(const id of focusIds)assertCanonicalConstructId(id,'focusIds');if(!Array.isArray(planningConditions)||!Array.isArray(approvedPlanActionIds))throw new Error('planningConditions and approvedPlanActionIds must be arrays');
  if(['pause_ordinary_flow','escalate'].includes(safetyDisposition))return{eligible:[],rejected:all().map(action=>({actionId:action.actionId,reasonCodes:['safety_override']}))};
  const focusSet=new Set(focusIds),evidenceSet=new Set(evidenceRefs),approvedPlanSet=new Set();for(const actionId of approvedPlanActionIds){assertCanonicalActionId(actionId);approvedPlanSet.add(actionId)}for(const condition of planningConditions)for(const actionId of PLAN_CONDITION_ACTIONS[condition]??[])approvedPlanSet.add(actionId);const eligible=[],rejected=[];
  for(const action of all()){const reasons=[];if(NON_AUTONOMOUS_STATUSES.includes(action.status))reasons.push(`status_${action.status}`);if(action.actionScope==='construct'&&!action.constructIds.some(id=>focusSet.has(id)))reasons.push('not_relevant_to_confirmed_focus');if(action.actionScope==='plan'&&!approvedPlanSet.has(action.actionId))reasons.push('requires_explicit_planning_condition');const required=action.eligibility.minimumEvidenceRefs??[];if(required.some(ref=>!evidenceSet.has(ref)))reasons.push('minimum_evidence_missing');if(reasons.length)rejected.push({actionId:action.actionId,reasonCodes:reasons});else eligible.push({...action,constraintRefs:[...constraintRefs]})}
  return{eligible,rejected};
 }});
}
