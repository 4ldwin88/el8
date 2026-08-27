// EL8 Plan Composer — canonical Problem Registry path.
// Discovery establishes supported problems; Planning selects purposeful interventions from the
// versioned Problem–Intervention–Impact registry. Dimensions never select actions directly.
import {REGISTRY,REGISTRY_VERSION} from './problem-intervention-registry.js';
import {problemHypothesesFromDiscovery,eligibleRegistryInterventions} from './problem-registry-adapter.js';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const MIN_ACTION_CONFIDENCE=.55;
const confidenceSufficient=h=>Number.isFinite(Number(h.confidence))&&Number(h.confidence)>=MIN_ACTION_CONFIDENCE;
const activeLimit=c=>c.capacity==='none'?0:c.capacity==='low'?1:2;
const purposeRank={ESCALATE:0,DEEPEN:1,RESOLVE:2,ACT:3,CONNECT:3,TRACK:4,LEARN:5};
function needsMechanism(problem,h){return (problem?.deepeningRequirements||[]).length>0&&!h.mechanism_id;}
function reviewDays(rule={}){const s=String(rule.window||'').toLowerCase();const m=s.match(/(\d+)\s*[–-]\s*(\d+)\s*days?/);if(m)return Number(m[1]);const d=s.match(/(\d+)\s*days?/);return d?Number(d[1]):null;}
function component(h,intervention,status='backlog'){
 const problem=REGISTRY.problems[h.problem_id];
 return{plan_component_id:`${h.problem_id}:${intervention.id}`,problem_id:h.problem_id,problem_label:problem.label,mechanism_id:h.mechanism_id||null,intervention_id:intervention.id,registry_version:REGISTRY_VERSION,purpose:intervention.purpose,title:intervention.memberFacingName,rationale:intervention.rationale||`Selected to address ${problem.label} using the current evidence and member-confirmed focus.`,evidence_strength:intervention.evidenceStrength,action_templates:[...(intervention.actionTemplates||[])],measurement:{...(intervention.measurement||{})},review_rule:{...(intervention.reviewRule||{})},reviewDays:reviewDays(intervention.reviewRule),expected_affected_area_hypotheses:[...(problem.crossDimensionalHypotheses||[])],confidence:+Number(h.confidence).toFixed(3),member_importance:h.member_importance,status,progress:0,decision_trace:{problem_id:h.problem_id,discovery_evidence_ids:[...(h.evidence_ids||[])],suppression_evidence:[...(h.suppression_evidence||[])],contradiction_evidence:[...(h.contradiction_evidence||[])],registry_version:REGISTRY_VERSION}};
}
function candidatesFor(h,context={}){
 const rejected=[...(context.rejectedInterventionIds||[]),...(context.rejectedActionIds||[])];
 return eligibleRegistryInterventions(h.problem_id,{mechanismId:h.mechanism_id,rejectedInterventionIds:rejected}).filter(i=>!(context.contraindications||[]).includes(i.id)).sort((a,b)=>(purposeRank[a.purpose]??99)-(purposeRank[b.purpose]??99)).map(i=>component(h,i));
}
function selectCovered(groups,limit){const active=[],backlog=[];for(const g of groups){if(active.length<limit&&g.items.length){active.push({...g.items[0],status:'active'});backlog.push(...g.items.slice(1));}else backlog.push(...g.items);}return{active,backlog};}
export function buildPlan(discovery={},context={}){
 if(context.safetyHold||discovery.safetyHold)return{status:'escalate',reason:'safety_hold',active:[],backlog:[],registry_version:REGISTRY_VERSION};
 if(context.consent===false)return{status:'observe',reason:'member_consent_required',active:[],backlog:[],registry_version:REGISTRY_VERSION};
 const hypotheses=problemHypothesesFromDiscovery(discovery),supported=hypotheses.filter(confidenceSufficient);
 if(!supported.length)return{status:'observe',reason:'insufficient_evidence',active:[],backlog:[],registry_version:REGISTRY_VERSION};
 const unresolved=supported.filter(h=>needsMechanism(REGISTRY.problems[h.problem_id],h));
 if(unresolved.length)return{status:'deepen',reason:'problem_mechanism_required',active:[],backlog:[],registry_version:REGISTRY_VERSION,selectionDeepening:{required:true,requirements:unresolved.map(h=>({problem_id:h.problem_id,purpose:'DEEPEN',reason:'A decision-changing mechanism is still unresolved.'}))},evidenceUsed:supported};
 const groups=supported.map(h=>({h,items:candidatesFor(h,context)})).filter(g=>g.items.length);
 if(!groups.length)return{status:'observe',reason:'no_eligible_registry_intervention',active:[],backlog:[],registry_version:REGISTRY_VERSION,evidenceUsed:supported};
 const limit=activeLimit(context);if(!limit)return{status:'observe',reason:'capacity_hold',active:[],backlog:groups.flatMap(g=>g.items),registry_version:REGISTRY_VERSION,evidenceUsed:supported};
 const {active,backlog}=selectCovered(groups,limit),coveredProblems=[...new Set(active.map(x=>x.problem_id))],uncoveredProblems=supported.map(h=>h.problem_id).filter(id=>!coveredProblems.includes(id));
 const windows=active.map(x=>x.reviewDays).filter(Number.isFinite);
 return{status:'active',reason:'registry_evidence_informed_priority',registry_version:REGISTRY_VERSION,active,actions:active,backlog,history:[],reviewDays:windows.length?Math.min(...windows):null,evidenceUsed:supported,decisionTrace:{selectedInterventionIds:active.map(x=>x.intervention_id),coveredProblems,uncoveredProblems,coverageRule:'one-purposeful-component-per-supported-focus-before-second-component',rejectedInterventionIds:[...(context.rejectedInterventionIds||[]),...(context.rejectedActionIds||[])]},memberFit:{capacity:context.capacity||'medium'}};
}
export const LIBRARY=REGISTRY.interventions;
