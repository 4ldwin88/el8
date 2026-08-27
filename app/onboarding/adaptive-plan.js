// Onboarding → canonical Adaptive Plan bridge.
import { buildPlan } from '../../intelligence/planning/plan-engine.js';
import { buildPlanningHandoff } from '../../intelligence/planning/discovery-handoff.js';
import { safetyGate } from '../../intelligence/safety/gate.js';

const DRIVER_MAP=Object.freeze({physical_condition:'low_activity',work_pressure:'work_instability',low_direction:'lack_direction'});
const ALLOWED_FRICTIONS=new Set(['time','energy','emotional_bandwidth','money','access','confidence','readiness','other']);
const confidenceOf=s=>Number(s?.evidenceConfidence??s?.confidence??0);
function canonicalState(state={}){const concernId=DRIVER_MAP[state.concernId]||state.concernId;return{...state,concernId,readiness:state.readiness??state.feasibility?.values?.readiness??null}}

// The confirmed focus is the authoritative concern identity. Discovery supplies evidence about it.
// Do not require a byte-for-byte concern-id match here: the Discovery trace can contain legacy or
// more-specific states while the member confirms the canonical parent focus. We first use an exact
// state, then the recommended candidate, then synthesize a traceable state from confirmed focus +
// Discovery evidence. Planning remains the sole intervention selector.
export function planningEvidenceFromDiscovery(output={},confirmedPriorities=[]){
  const states=(output.trace?.states||[]).map(canonicalState);
  const focus=output.plan?.focus||output.trace?.memberPlan?.focus||[];
  return confirmedPriorities.map(String).map(id=>{
    const exact=states.find(s=>String(s.concernId)===id);
    if(exact)return exact;
    const recommended=focus.find(f=>String(f.concernId)===id);
    if(recommended)return canonicalState({...recommended,memberPrioritySelected:true});
    const related=states.filter(s=>String(s.sourceConcernId||'')===id||String(s.parentConcernId||'')===id).sort((a,b)=>confidenceOf(b)-confidenceOf(a));
    const best=related[0];
    return canonicalState({...(best||{}),concernId:id,memberPrioritySelected:true,evidenceConfidence:best?.evidenceConfidence??best?.confidence??0,evidenceRefs:best?.evidenceRefs||[]});
  }).filter(s=>s.concernId);
}

export function capturePriorityOverride({recommendedPriorities=[],confirmedPriorities=[],frictions=[]}={}){const recommended=[...new Set(recommendedPriorities.map(String))],confirmed=[...new Set(confirmedPriorities.map(String))],changed=recommended.length!==confirmed.length||recommended.some(x=>!confirmed.includes(x));if(!changed)return{overridden:false,recommended,confirmed,frictions:[],constraints:[],capacitySignal:null};const normalized=frictions.map(x=>typeof x==='string'?{type:x}:{...x}).filter(x=>ALLOWED_FRICTIONS.has(x.type)).map(x=>({type:x.type,concernId:x.concernId||null,note:x.note||null}));const constraints=normalized.map(x=>x.type),lowCapacity=normalized.some(x=>['energy','emotional_bandwidth','readiness'].includes(x.type));return{overridden:true,recommended,confirmed,frictions:normalized,constraints,capacitySignal:lowCapacity?'low':null}}
export function onboardingPlanContext({baselineHandoff={},capacity=null,selectionEvidence={},evidence={},rejectedActionIds=[],adaptationConstraint=null,previousActionIds=[],safety=null,priorityOverride=null,adaptationExclusions=[]}={}){const signals=baselineHandoff?.signals||{},feasibility=signals.feasibility||{},overrideConstraints=priorityOverride?.constraints||[],inferredCapacity=capacity||priorityOverride?.capacitySignal||(feasibility.overall_load==='Overwhelming'||feasibility.readiness==='Not ready'?'low':'medium');return{capacity:inferredCapacity,constraints:[...(Array.isArray(signals.constraints)?signals.constraints:signals.constraints?[signals.constraints]:[]),...overrideConstraints],selectionEvidence,evidence,rejectedActionIds,adaptationConstraint,previousActionIds,safety,priorityOverride,adaptationExclusions,consent:true}}
export function buildOnboardingAdaptivePlan({discoveryOutput={},recommendedPriorities=[],confirmedPriorities=[],priorityOverrideFrictions=[],baselineHandoff={},capacity=null,selectionEvidence={},evidence={},rejectedActionIds=[],adaptationConstraint=null,previousActionIds=[],adaptationExclusions=[],safetyContextualSignals={},safetyConfirmation=null}={}){const safety=safetyGate({stage:'planning',contextualSignals:safetyContextualSignals,confirmation:safetyConfirmation,evidenceRefs:discoveryOutput.trace?.observations?.map(x=>x.id).filter(Boolean)||[],concernRefs:confirmedPriorities});if(safety.pauseOrdinaryFlow)return{status:'safety_hold',reason:safety.status,safety,active:[],actions:[],backlog:[],reviewDays:null};const priorityOverride=capturePriorityOverride({recommendedPriorities,confirmedPriorities,frictions:priorityOverrideFrictions});if(priorityOverride.overridden&&!priorityOverride.frictions.length)return{status:'deepen',reason:'priority_override_context_required',active:[],actions:[],backlog:[],reviewDays:null,priorityOverride};const selectedStates=planningEvidenceFromDiscovery(discoveryOutput,confirmedPriorities);const ranked=buildPlanningHandoff({selected:selectedStates,backlog:[]}).ranked;const plan=buildPlan({ranked},onboardingPlanContext({baselineHandoff,capacity,selectionEvidence,evidence,rejectedActionIds,adaptationConstraint,previousActionIds,safety,priorityOverride,adaptationExclusions}));return{...plan,safety,priorityOverride}}
export function onboardingPlanView(plan={}){return{status:plan.status||'observe',reason:plan.reason||null,actions:(plan.active||[]).map(a=>({id:a.id,title:a.title,dimension:a.dimension,measurement:a.measurement,rationale:a.rationale,reviewDays:a.reviewDays,driver:a.driver,deepeningRequirements:(plan.deepening?.requirements||[]).filter(r=>r.actionId===a.id)})),selectionDeepening:plan.selectionDeepening||{required:false,requirements:[]},selectionEvidence:plan.selectionEvidence||null,activationStatus:plan.activationStatus||null,deepening:plan.deepening||{required:false,blocking:[],optional:[],requirements:[]},reviewDays:plan.reviewDays||null,uncertainty:plan.uncertainty||null,decisionTrace:plan.decisionTrace||null,safety:plan.safety||null,priorityOverride:plan.priorityOverride||null}}
