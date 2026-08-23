// EL8 Plan Engine v1 — evidence-informed MVP challenger.
// Rank useful commitments, surface a small active set, keep alternatives in backlog.
import { LIBRARY, candidatesForDriver } from './intervention-library.js';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function normalizeEvidence(input={}) {
  const ranked=input.ranked || input.drivers || [];
  return ranked.map((x,i)=>typeof x==='string'
    ? {id:x, confidence:Math.max(.35,1-(i*.15)), rank:i+1}
    : {rank:i+1, confidence:x.confidence ?? x.score ?? Math.max(.35,1-(i*.15)), ...x});
}

function priorityScore(driver, action, context={}) {
  const confidence=clamp(Number(driver.confidence)||0,0,1);
  const importance=clamp(Number(driver.memberImportance ?? driver.importance ?? 3),1,5);
  const leverage=clamp(Number(driver.breadth ?? driver.downstreamCount ?? 1),1,5);
  const urgency=clamp(Number(driver.urgency ?? 3),1,5);
  const readiness=clamp(Number(driver.readiness ?? context.readiness ?? 3),1,5);
  const feasibility=6-clamp(Number(action.effort),1,5);
  const capacityPenalty=context.capacity==='low' ? action.effort : context.capacity==='high' ? 0 : action.effort*.35;
  return +(urgency + importance + confidence*5 + leverage + readiness + feasibility - capacityPenalty).toFixed(3);
}

function toBacklogItem(driver,action,priority) {
  return {...action,cadence:{...action.cadence},driver:driver.id,confidence:+Number(driver.confidence).toFixed(3),priority,status:'backlog',progress:0,
    goal:driver.goal || `Improve the situation related to ${driver.id.replaceAll('_',' ')}`,
    barrierPlan:driver.barrierPlan || null,support:driver.support || null,
    rationale:'Ranked using Discovery evidence, member context, feasibility and expected leverage. This is a working hypothesis, not a proven causal conclusion.'};
}

function activeLimit(context={}) { return context.capacity==='low' ? 1 : 2; }

function buildCandidates(evidence,context) {
  return evidence.flatMap(driver=>candidatesForDriver(driver.id).map(action=>({driver,action,priority:priorityScore(driver,action,context)})))
    .sort((a,b)=>b.priority-a.priority)
    .map(x=>toBacklogItem(x.driver,x.action,x.priority));
}

export function buildPlan(discovery={}, context={}) {
  if(context.safetyHold || discovery.safetyHold) return {status:'escalate',reason:'safety_hold',active:[],backlog:[],history:[],reviewDays:null};
  const evidence=normalizeEvidence(discovery);
  if(!evidence.length) return {status:'observe',reason:'insufficient_evidence',active:[],backlog:[],history:[],reviewDays:7};
  const backlog=buildCandidates(evidence,context);
  if(!backlog.length) return {status:'observe',reason:'no_authorized_action',active:[],backlog:[],history:[],reviewDays:7};
  const active=backlog.splice(0,activeLimit(context)).map(x=>({...x,status:'active'}));
  return {status:'active',reason:'evidence_informed_priority',active,backlog,history:[],actions:active,
    reviewDays:Math.min(...active.map(a=>a.reviewDays)),evidenceUsed:evidence.map(x=>({id:x.id,confidence:x.confidence})),
    uncertainty:'Plan choices are hypotheses to test through follow-up, not claims of optimality or causality.'};
}

export function respondToItem(plan={}, itemId, response={}, context={}) {
  if(plan.status!=='active') return plan;
  const active=[...(plan.active||plan.actions||[])], backlog=[...(plan.backlog||[])], history=[...(plan.history||[])];
  const index=active.findIndex(x=>x.id===itemId); if(index<0) return plan;
  const item=active[index], decision=response.decision||'complete'; active.splice(index,1);
  history.push({...item,status:decision,reason:response.reason||null,respondedAt:response.respondedAt||null});
  if(decision==='defer') backlog.push({...item,status:'backlog',deferred:true});
  while(active.length<activeLimit(context)&&backlog.length) active.push({...backlog.shift(),status:'active',deferred:false});
  return {...plan,active,actions:active,backlog,history};
}

export function recordProgress(plan={}, itemId, amount=1, context={}) {
  const active=[...(plan.active||[])]; const i=active.findIndex(x=>x.id===itemId); if(i<0) return plan;
  const item={...active[i]}, target=Number(item.cadence?.target||1); item.progress=Math.min(target,Number(item.progress||0)+amount); active[i]=item;
  let next={...plan,active,actions:active};
  if(item.progress>=target) next=respondToItem(next,itemId,{decision:'complete'},context);
  return next;
}

export function planView(plan={}) {
  const groups={daily:[],thisWeek:[],scheduled:[],oneTime:[]};
  for(const item of plan.active||[]) {
    const c=item.cadence||{}; const view={...item,progressLabel:`${item.progress||0}/${c.target||1}`};
    if(c.type==='daily') groups.daily.push(view); else if(c.type==='weekly_target') groups.thisWeek.push(view); else if(c.type==='specific_days') groups.scheduled.push(view); else groups.oneTime.push(view);
  }
  return {...groups,backlogCount:(plan.backlog||[]).length};
}

export function adaptPlan(plan={}, feedback={}) {
  if(plan.status!=='active') return {...plan,adaptation:'no_active_plan'};
  const adherence=clamp(Number(feedback.adherence??1),0,1), benefit=clamp(Number(feedback.benefit??0),-1,1);
  if(feedback.safetyHold) return {...plan,status:'escalate',active:[],actions:[],adaptation:'escalate'};
  if(feedback.circumstancesChanged) return {...plan,adaptation:'reprioritize'};
  if(feedback.blocked||adherence<.5) return {...plan,adaptation:'simplify_or_reschedule'};
  if(adherence>=.7&&benefit>0) return {...plan,adaptation:'maintain'};
  if(adherence>=.7&&benefit<=0) return {...plan,adaptation:'reassess'};
  return {...plan,adaptation:'continue_observation'};
}

export { LIBRARY };
