// EL8 Adaptive Plan Composer — MVP.
// Dynamically composes 1–2 independently justified actions from current evidence.
// A plan grouping is presentational: it never creates package-level eligibility or inertia.
import { LIBRARY, candidatesForDriver } from './intervention-library.js';
import { applyPlanDeepening } from './plan-deepening.js';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const MIN_ACTION_CONFIDENCE=.55;

function normalizeEvidence(input={}) {
  const ranked=input.ranked || input.drivers || [];
  return ranked.map((x,i)=>typeof x==='string'
    ? {id:x,confidence:null,rank:i+1}
    : {rank:i+1,...x,confidence:x.confidence ?? x.score ?? x.evidenceConfidence ?? null});
}
function adherenceEstimate(context={}) { const raw=context.adherence ?? context.recentAdherence ?? context.adherenceScore; return raw==null?.6:clamp(Number(raw),0,1); }
function driverFeasibility(driver={}) { return driver.feasibility?.values || driver.feasibility || {}; }
function mergedContext(driver={},context={}) { const f=driverFeasibility(driver); return {...context,...f,capacity:f.capacity ?? context.capacity,supports:[...(context.supports||[]),...(driver.feasibility?.supports||[])],constraints:[...(context.constraints||[]),...(driver.feasibility?.constraints||[])]}; }
function frictionBudget(context={}) { const adherence=adherenceEstimate(context); const capacityBase=context.capacity==='low'?1.6:context.capacity==='high'?4.4:3; return clamp(capacityBase+((adherence-.6)*2.5),1,5); }
function evidenceWeight(strength) { return strength==='supported'?.5:strength==='evidence_informed'?.15:0; }
function constraintTokens(driver={},context={}) { const f=driver.feasibility||{}; return new Set([...(context.contraindications||[]),...(context.constraints||[]),...(driver.contraindications||[]),...(f.constraints||[])].map(String)); }
function confidenceSufficient(driver={}) { return Number.isFinite(Number(driver.confidence)) && Number(driver.confidence)>=MIN_ACTION_CONFIDENCE; }
function isEligible(driver,action,context={}) {
  if(!confidenceSufficient(driver)) return false;
  const fit=mergedContext(driver,context), readiness=clamp(Number(driver.readiness ?? fit.readiness ?? 3),1,5), minReadiness=Number(action.eligibility?.minReadiness ?? 1);
  if(readiness<minReadiness) return false;
  const blocked=constraintTokens(driver,fit);
  if((action.contraindications||[]).some(x=>blocked.has(String(x)))) return false;
  const values=driverFeasibility(driver);
  if(values.professionalGuidanceRequired===true && action.requiresProfessionalGuidance===false) return false;
  if(values.access===false && action.requiresAccess===true) return false;
  if(context.rejectedActionIds?.includes(action.id)) return false;
  return true;
}
function priorityScore(driver,action,context={}) {
  const fit=mergedContext(driver,context), confidence=clamp(Number(driver.confidence)||0,0,1), importance=clamp(Number(driver.memberImportance??driver.importance??3),1,5), leverage=clamp(Number(driver.breadth??driver.downstreamCount??1),1,5), urgency=clamp(Number(driver.urgency??3),1,5), readiness=clamp(Number(driver.readiness??fit.readiness??3),1,5), effort=clamp(Number(action.effort),1,5), feasibility=6-effort, budget=frictionBudget(fit), overBudget=Math.max(0,effort-budget), underBudget=Math.max(0,budget-effort);
  return +(urgency+importance+confidence*5+leverage+readiness+feasibility+evidenceWeight(action.evidenceStrength)+underBudget*.2-overBudget*2.25-(fit.capacity==='low'?effort*.35:fit.capacity==='high'?0:effort*.15)).toFixed(3);
}
function toCandidate(driver,action,priority,context={},supportingDrivers=[driver]) {
  const fit=mergedContext(driver,context);
  return {...action,cadence:{...action.cadence},driver:driver.id,supportingDrivers:supportingDrivers.map(x=>({id:x.id,confidence:+Number(x.confidence).toFixed(3)})),confidence:+Number(driver.confidence).toFixed(3),priority,status:'backlog',progress:0,friction:{effort:clamp(Number(action.effort),1,5),budget:+frictionBudget(fit).toFixed(2),recentAdherence:+adherenceEstimate(fit).toFixed(2)},feasibilityUsed:driver.feasibility||null,goal:driver.goal||`Improve the situation related to ${driver.id.replaceAll('_',' ')}`,barrierPlan:driver.barrierPlan||null,support:driver.support||null,rationale:'Selected from current evidence, member fit, capacity and feasibility. This action remains an independently testable hypothesis.'};
}
function activeLimit(context={}) { if(context.capacity==='none') return 0; return context.capacity==='low'?1:2; }
function buildCandidates(evidence,context) {
  const raw=evidence.flatMap(driver=>candidatesForDriver(driver.id).filter(action=>isEligible(driver,action,context)).map(action=>({driver,action,priority:priorityScore(driver,action,context)})));
  const byAction=new Map();
  for(const candidate of raw){const existing=byAction.get(candidate.action.id);if(!existing)byAction.set(candidate.action.id,{...candidate,supportingDrivers:[candidate.driver]});else{existing.supportingDrivers.push(candidate.driver);if(candidate.priority>existing.priority)Object.assign(existing,{driver:candidate.driver,action:candidate.action,priority:candidate.priority});}}
  return [...byAction.values()].sort((a,b)=>b.priority-a.priority).map(x=>toCandidate(x.driver,x.action,x.priority,context,x.supportingDrivers));
}
function evidenceSnapshot(evidence=[]) { return evidence.map(x=>({id:x.id,confidence:x.confidence,feasibility:x.feasibility||null})); }

export function buildPlan(discovery={},context={}) {
  if(context.safetyHold||discovery.safetyHold)return{status:'escalate',reason:'safety_hold',active:[],backlog:[],history:[],reviewDays:null};
  if(context.consent===false)return{status:'observe',reason:'member_consent_required',active:[],backlog:[],history:[],reviewDays:null};
  const evidence=normalizeEvidence(discovery),supported=evidence.filter(confidenceSufficient);
  if(!supported.length)return{status:'observe',reason:'insufficient_evidence',active:[],backlog:[],history:[],reviewDays:7,evidenceUsed:evidenceSnapshot(evidence)};
  const backlog=buildCandidates(supported,context);
  if(!backlog.length)return{status:'observe',reason:'no_eligible_authorized_action',active:[],backlog:[],history:[],reviewDays:7,evidenceUsed:evidenceSnapshot(supported)};
  const limit=activeLimit(context);
  if(limit===0)return{status:'observe',reason:'capacity_hold',active:[],backlog,history:[],reviewDays:7,evidenceUsed:evidenceSnapshot(supported)};
  const active=backlog.splice(0,limit).map(x=>({...x,status:'active'}));
  const plan={status:'active',reason:'evidence_informed_priority',active,backlog,history:[],actions:active,reviewDays:Math.min(...active.map(a=>a.reviewDays)),evidenceUsed:evidenceSnapshot(supported),decisionTrace:{candidateActionIds:[...active,...backlog].map(x=>x.id),selectedActionIds:active.map(x=>x.id),excludedEvidenceIds:evidence.filter(x=>!confidenceSufficient(x)).map(x=>x.id),capacity:context.capacity||'medium',rejectedActionIds:[...(context.rejectedActionIds||[])]},memberFit:{recentAdherence:+adherenceEstimate(context).toFixed(2),frictionBudget:+frictionBudget(context).toFixed(2),capacity:context.capacity||'medium'},uncertainty:'Each action is a hypothesis to test; grouping does not establish causality or package-level success.'};
  return applyPlanDeepening(plan,context.evidence||{});
}
export function respondToItem(plan={},itemId,response={},context={}) {
  if(plan.status!=='active')return plan;
  const active=[...(plan.active||plan.actions||[])],backlog=[...(plan.backlog||[])],history=[...(plan.history||[])],index=active.findIndex(x=>x.id===itemId);if(index<0)return plan;
  const item=active[index],decision=response.decision||'complete';active.splice(index,1);history.push({...item,status:decision,reason:response.reason||null,respondedAt:response.respondedAt||null});
  if(decision==='defer')backlog.push({...item,status:'backlog',deferred:true});
  while(active.length<activeLimit(context)&&backlog.length)active.push({...backlog.shift(),status:'active',deferred:false});
  return applyPlanDeepening({...plan,active,actions:active,backlog,history},context.evidence||{});
}
export function recordProgress(plan={},itemId,amount=1,context={}) { const active=[...(plan.active||[])],i=active.findIndex(x=>x.id===itemId);if(i<0)return plan;const item={...active[i]},target=Number(item.cadence?.target||1);item.progress=Math.min(target,Number(item.progress||0)+amount);active[i]=item;let next={...plan,active,actions:active};if(item.progress>=target)next=respondToItem(next,itemId,{decision:'complete'},context);return next; }
export function planView(plan={}) { const groups={daily:[],thisWeek:[],scheduled:[],oneTime:[]};for(const item of plan.active||[]){const c=item.cadence||{},view={...item,progressLabel:`${item.progress||0}/${c.target||1}`};if(c.type==='daily')groups.daily.push(view);else if(c.type==='weekly_target')groups.thisWeek.push(view);else if(c.type==='specific_days')groups.scheduled.push(view);else groups.oneTime.push(view);}return{...groups,backlogCount:(plan.backlog||[]).length}; }
export function adaptPlan(plan={},feedback={}) { if(plan.status!=='active')return{...plan,adaptation:'no_active_plan'};const adherence=clamp(Number(feedback.adherence??1),0,1),benefit=clamp(Number(feedback.benefit??0),-1,1);if(feedback.safetyHold)return{...plan,status:'escalate',active:[],actions:[],adaptation:'escalate'};if(feedback.circumstancesChanged)return{...plan,adaptation:'reprioritize'};if(feedback.blocked||adherence<.5)return{...plan,adaptation:'simplify_or_reschedule',failureAttribution:'adherence_or_barrier'};if(adherence>=.7&&benefit>0)return{...plan,adaptation:'maintain',failureAttribution:null};if(adherence>=.7&&benefit<=0)return{...plan,adaptation:'reassess',failureAttribution:'action_or_hypothesis'};return{...plan,adaptation:'continue_observation',failureAttribution:'insufficient_observation'}; }
export { LIBRARY, MIN_ACTION_CONFIDENCE };
