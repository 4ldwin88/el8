// EL8 Plan Composer — MVP.
// Planning selects a small, feasible action set from established evidence.
// Review owns interpretation of outcomes and sends only simple replanning constraints back here.
import { LIBRARY, candidatesForDriver } from './intervention-library.js';
import { applyPlanDeepening } from './plan-deepening.js';
import { missingSelectionRequirements } from './selection-evidence.js';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const MIN_ACTION_CONFIDENCE=.55;
const normalizeEvidence=(input={})=>(input.ranked||input.drivers||[]).map((x,i)=>typeof x==='string'?{id:x,confidence:null,rank:i+1}:{rank:i+1,...x,confidence:x.confidence??x.score??x.evidenceConfidence??null});
const adherenceEstimate=(c={})=>{const raw=c.adherence??c.recentAdherence??c.adherenceScore;return raw==null?.6:clamp(Number(raw),0,1)};
const driverFeasibility=(d={})=>d.feasibility?.values||d.feasibility||{};
const mergedContext=(d={},c={})=>{const f=driverFeasibility(d);return{...c,...f,capacity:f.capacity??c.capacity,supports:[...(c.supports||[]),...(d.feasibility?.supports||[])],constraints:[...(c.constraints||[]),...(d.feasibility?.constraints||[])]}};
const frictionBudget=(c={})=>clamp((c.capacity==='low'?1.6:c.capacity==='high'?4.4:3)+((adherenceEstimate(c)-.6)*2.5),1,5);
const confidenceSufficient=(d={})=>Number.isFinite(Number(d.confidence))&&Number(d.confidence)>=MIN_ACTION_CONFIDENCE;
const text=v=>String(v??'').trim().toLowerCase();
function selectionFit(driver,action,context={}){const e=context.selectionEvidence||{},v=k=>text(e[k]);let score=0,reasons=[];const add=(n,r)=>{score+=n;if(r)reasons.push(r)};if(driver.id==='low_activity'&&v('baseline.activity_level'))add(action.id==='activity_baseline'?2:action.id==='walk'?1:0,'current activity fit');if(driver.id==='work_instability'&&v('work.current_income_route'))add(action.id==='income_action'?3:0,'member-selected income route');return{score,reasons}}
function isEligible(d,a,c={}){if(!confidenceSufficient(d))return false;const fit=mergedContext(d,c),readiness=clamp(Number(d.readiness??fit.readiness??3),1,5);if(readiness<Number(a.eligibility?.minReadiness??1))return false;const blocked=new Set([...(c.contraindications||[]),...(c.constraints||[])].map(String));if((a.contraindications||[]).some(x=>blocked.has(String(x))))return false;if(c.rejectedActionIds?.includes(a.id))return false;if(c.adaptationConstraint==='different_mechanism'&&(c.previousMechanisms||[]).includes(a.mechanism))return false;if(c.adaptationConstraint==='reduce_burden'&&c.previousMaxEffort!=null&&Number(a.effort)>Number(c.previousMaxEffort))return false;return true}
function score(d,a,c={}){const fit=mergedContext(d,c),importance=clamp(Number(d.memberImportance??d.importance??3),1,5),effort=clamp(Number(a.effort),1,5),budget=frictionBudget(fit);return +(importance+clamp(Number(d.confidence)||0,0,1)*5+(6-effort)-Math.max(0,effort-budget)*2.25+selectionFit(d,a,c).score).toFixed(3)}
function candidate(d,a,p,c={}){return{...a,driver:d.id,confidence:+Number(d.confidence).toFixed(3),priority:p,status:'backlog',progress:0,friction:{effort:Number(a.effort),budget:+frictionBudget(mergedContext(d,c)).toFixed(2)},rationale:'Selected from current evidence, member fit, capacity and feasibility; this action remains a testable hypothesis.'}}
const activeLimit=c=>c.capacity==='none'?0:c.capacity==='low'?1:2;
function buildCandidates(e,c){return e.flatMap(d=>candidatesForDriver(d.id).filter(a=>isEligible(d,a,c)).map(a=>candidate(d,a,score(d,a,c),c))).sort((a,b)=>b.priority-a.priority)}
function selectCovered(backlog,evidence,limit){const active=[],used=new Set();for(const d of evidence){if(active.length>=limit)break;const i=backlog.findIndex(a=>a.driver===d.id&&!used.has(a.id));if(i>=0){const [a]=backlog.splice(i,1);active.push(a);used.add(a.id)}}while(active.length<limit&&backlog.length){const a=backlog.shift();if(!used.has(a.id)){active.push(a);used.add(a.id)}}return active.map(x=>({...x,status:'active'}))}

export function buildPlan(discovery={},context={}){
  if(context.safetyHold||discovery.safetyHold)return{status:'escalate',reason:'safety_hold',active:[],backlog:[]};
  if(context.consent===false)return{status:'observe',reason:'member_consent_required',active:[],backlog:[]};
  const evidence=normalizeEvidence(discovery),supported=evidence.filter(confidenceSufficient);
  if(!supported.length)return{status:'observe',reason:'insufficient_evidence',active:[],backlog:[],reviewDays:7};
  const missing=missingSelectionRequirements(supported,context.selectionEvidence||{});
  if(missing.length)return{status:'deepen',reason:'selection_evidence_required',active:[],backlog:[],selectionDeepening:{required:true,requirements:missing}};
  const trace={rejectedActionIds:[...(context.rejectedActionIds||[])],adaptationConstraint:context.adaptationConstraint||null};
  const backlog=buildCandidates(supported,context);
  if(!backlog.length)return{status:'observe',reason:'no_eligible_authorized_action',active:[],backlog:[],reviewDays:7,evidenceUsed:supported,decisionTrace:trace};
  const limit=activeLimit(context);
  if(!limit)return{status:'observe',reason:'capacity_hold',active:[],backlog,reviewDays:7,evidenceUsed:supported,decisionTrace:trace};
  // Coverage beats global action score: when capacity allows, each supported confirmed focus gets
  // one active action before any focus receives a second action.
  const active=selectCovered(backlog,supported,limit);
  const coveredDrivers=[...new Set(active.map(a=>a.driver))];
  const uncoveredDrivers=supported.map(d=>d.id).filter(id=>!coveredDrivers.includes(id));
  return applyPlanDeepening({status:'active',reason:'evidence_informed_priority',active,actions:active,backlog,history:[],reviewDays:Math.min(...active.map(a=>a.reviewDays)),selectionEvidence:{...(context.selectionEvidence||{})},evidenceUsed:supported,decisionTrace:{...trace,selectedActionIds:active.map(x=>x.id),coveredDrivers,uncoveredDrivers,coverageRule:'one-action-per-supported-focus-before-second-action'},memberFit:{recentAdherence:+adherenceEstimate(context).toFixed(2),frictionBudget:+frictionBudget(context).toFixed(2),capacity:context.capacity||'medium'}},{...(context.selectionEvidence||{}),...(context.evidence||{})});
}
export{LIBRARY,MIN_ACTION_CONFIDENCE};
