// EL8 Plan Engine v1 — evidence-informed MVP challenger.
// Core model: rank useful next moves, surface a small active set, keep the rest
// in backlog, and adapt from member response. Complexity must earn its place.

const ACTIONS = {
  poor_sleep: { id:'stabilize_sleep_window', type:'intervention', dimension:'physical', title:'Stabilize your sleep window', effort:2, measurement:'Log sleep start/end', reviewDays:7 },
  schedule_disruption: { id:'anchor_daily_schedule', type:'intervention', dimension:'occupational', title:'Create one daily anchor', effort:2, measurement:'Log whether the anchor happened', reviewDays:7 },
  stress: { id:'daily_decompression', type:'intervention', dimension:'emotional', title:'Use a short daily decompression block', effort:1, measurement:'Log completion and stress before/after', reviewDays:7 },
  low_energy: { id:'energy_observation', type:'data', dimension:'physical', title:'Track when energy drops', effort:1, measurement:'Record low-energy time and preceding activity', reviewDays:7, informationGathering:true },
  low_focus: { id:'protected_focus_block', type:'intervention', dimension:'occupational', title:'Protect one focus block', effort:2, measurement:'Log completion', reviewDays:7 },
  work_instability: { id:'income_action', type:'intervention', dimension:'occupational', title:'Take one concrete income action', effort:3, measurement:'Record the completed action and result', reviewDays:7 },
  money_pressure: { id:'money_snapshot', type:'data', dimension:'financial', title:'Create a current money snapshot', effort:2, measurement:'Record available cash, required payments and due dates', reviewDays:7, informationGathering:true },
  relationship_strain: { id:'relationship_repair_step', type:'intervention', dimension:'social', title:'Take one relationship repair step', effort:3, measurement:'Record the action and result', reviewDays:7 },
  low_support: { id:'support_contact', type:'intervention', dimension:'social', title:'Strengthen one support connection', effort:2, measurement:'Make one meaningful support contact', reviewDays:7 },
  home_instability: { id:'home_stability_step', type:'intervention', dimension:'environmental', title:'Resolve one home stability issue', effort:3, measurement:'Record one completed stability action', reviewDays:7 },
  lack_direction: { id:'direction_next_step', type:'intervention', dimension:'spiritual', title:'Choose one meaningful next step', effort:2, measurement:'Complete one step tied to what matters now', reviewDays:7 }
};

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

function toBacklogItem(candidate) {
  const {driver,action,priority}=candidate;
  return {
    ...action,
    driver:driver.id,
    confidence:+Number(driver.confidence).toFixed(3),
    priority,
    status:'backlog',
    goal:driver.goal || `Improve the situation related to ${driver.id.replaceAll('_',' ')}`,
    barrierPlan:driver.barrierPlan || null,
    support:driver.support || null,
    rationale:'Ranked using Discovery evidence, member context, feasibility and expected leverage. This is a working hypothesis, not a proven causal conclusion.'
  };
}

function activeLimit(context={}) {
  // MVP: normally 1–2 simultaneously surfaced items. Weekly throughput can be
  // higher as items are completed/rejected/replaced; the queue itself stays ranked.
  return context.capacity==='low' ? 1 : 2;
}

export function buildPlan(discovery={}, context={}) {
  if(context.safetyHold || discovery.safetyHold)
    return {status:'escalate', reason:'safety_hold', active:[], backlog:[], history:[], reviewDays:null};

  const evidence=normalizeEvidence(discovery);
  if(!evidence.length)
    return {status:'observe', reason:'insufficient_evidence', active:[], backlog:[], history:[], reviewDays:7};

  const backlog=evidence
    .filter(d=>ACTIONS[d.id])
    .map(d=>({driver:d, action:ACTIONS[d.id], priority:priorityScore(d,ACTIONS[d.id],context)}))
    .sort((a,b)=>b.priority-a.priority)
    .map(toBacklogItem);

  if(!backlog.length)
    return {status:'observe', reason:'no_authorized_action', active:[], backlog:[], history:[], reviewDays:7};

  const limit=activeLimit(context);
  const active=backlog.splice(0,limit).map(x=>({...x,status:'active'}));
  return {
    status:'active', reason:'evidence_informed_priority', active, backlog, history:[],
    // compatibility alias while prototype consumers migrate from actions -> active
    actions:active,
    reviewDays:Math.min(...active.map(a=>a.reviewDays)),
    evidenceUsed:evidence.map(x=>({id:x.id,confidence:x.confidence})),
    uncertainty:'Plan choices are hypotheses to test through follow-up, not claims of optimality or causality.'
  };
}

export function respondToItem(plan={}, itemId, response={}, context={}) {
  if(plan.status!=='active') return plan;
  const active=[...(plan.active || plan.actions || [])];
  const backlog=[...(plan.backlog || [])];
  const history=[...(plan.history || [])];
  const index=active.findIndex(x=>x.id===itemId);
  if(index<0) return plan;

  const item=active[index];
  const decision=response.decision || 'complete'; // complete | reject | defer
  active.splice(index,1);
  history.push({...item,status:decision,reason:response.reason || null,respondedAt:response.respondedAt || null});

  if(decision==='defer') {
    // Defer means not now, not never. Put it behind currently eligible alternatives.
    backlog.push({...item,status:'backlog',deferred:true});
  }
  // Reject intentionally does not recycle the item. Future Discovery/reassessment
  // may generate it again only if evidence/circumstances materially change.

  while(active.length<activeLimit(context) && backlog.length) {
    const next=backlog.shift();
    active.push({...next,status:'active',deferred:false});
  }

  return {...plan,active,actions:active,backlog,history};
}

export function adaptPlan(plan={}, feedback={}) {
  if(plan.status!=='active') return {...plan, adaptation:'no_active_plan'};
  const adherence=clamp(Number(feedback.adherence ?? 1),0,1);
  const benefit=clamp(Number(feedback.benefit ?? 0),-1,1);
  if(feedback.safetyHold) return {...plan,status:'escalate',active:[],actions:[],adaptation:'escalate'};
  if(feedback.circumstancesChanged) return {...plan,adaptation:'reprioritize'};
  if(feedback.blocked || adherence<.5) return {...plan,adaptation:'simplify_or_reschedule'};
  if(adherence>=.7 && benefit>0) return {...plan,adaptation:'maintain'};
  if(adherence>=.7 && benefit<=0) return {...plan,adaptation:'reassess'};
  return {...plan,adaptation:'continue_observation'};
}

export { ACTIONS };
