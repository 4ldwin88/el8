// Onboarding → canonical Adaptive Plan bridge.
// Baseline + Discovery establish enough evidence for a basic plan. The selected plan may
// then require plan-specific deepening before an action is activated.
import { buildPlan } from '../../intelligence/planning/plan-engine.js';

const DRIVER_MAP=Object.freeze({
  physical_condition:'low_activity',
  work_pressure:'work_instability',
  low_direction:'lack_direction'
});
const driverId=id=>DRIVER_MAP[id]||id;

function normalizedImportance(state={}){
  const raw=state.memberImportance;
  if(raw==null)return null;
  if(typeof raw==='number')return raw+1;
  return ({low:1,moderate:2,high:4,'very-high':5})[raw]??null;
}

export function planningEvidenceFromDiscovery(output={},confirmedPriorities=[]){
  const wanted=new Set((confirmedPriorities||[]).map(String));
  return (output.trace?.states||[])
    .filter(state=>wanted.has(String(state.concernId)))
    .map((state,index)=>({
      id:driverId(state.concernId),
      sourceConcernId:state.concernId,
      confidence:Number(state.evidenceConfidence??state.confidence??0),
      rank:index+1,
      memberImportance:normalizedImportance(state),
      feasibility:state.feasibility||null,
      readiness:state.feasibility?.values?.readiness??null
    }));
}

export function onboardingPlanContext({baselineHandoff={},capacity=null,evidence={},rejectedActionIds=[]}={}){
  const signals=baselineHandoff?.signals||{};
  const feasibility=signals.feasibility||{};
  const inferredCapacity=capacity || (feasibility.overall_load==='Overwhelming'||feasibility.readiness==='Not ready'?'low':'medium');
  return {
    capacity:inferredCapacity,
    constraints:Array.isArray(signals.constraints)?signals.constraints:signals.constraints?[signals.constraints]:[],
    evidence,
    rejectedActionIds,
    consent:true
  };
}

export function buildOnboardingAdaptivePlan({discoveryOutput={},confirmedPriorities=[],baselineHandoff={},capacity=null,evidence={},rejectedActionIds=[]}={}){
  const ranked=planningEvidenceFromDiscovery(discoveryOutput,confirmedPriorities);
  return buildPlan({ranked},onboardingPlanContext({baselineHandoff,capacity,evidence,rejectedActionIds}));
}

export function onboardingPlanView(plan={}){
  return {
    status:plan.status||'observe',
    reason:plan.reason||null,
    actions:(plan.active||[]).map(action=>({
      id:action.id,
      title:action.title,
      dimension:action.dimension,
      measurement:action.measurement,
      rationale:action.rationale,
      reviewDays:action.reviewDays,
      driver:action.driver,
      deepeningRequirements:(plan.deepening?.requirements||[]).filter(req=>req.actionId===action.id)
    })),
    activationStatus:plan.activationStatus||null,
    deepening:plan.deepening||{required:false,blocking:[],optional:[],requirements:[]},
    reviewDays:plan.reviewDays||null,
    uncertainty:plan.uncertainty||null,
    decisionTrace:plan.decisionTrace||null
  };
}
