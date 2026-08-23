// EL8 Plan Engine v1 — evidence-informed MVP challenger.
// Research-derived rule: choose a sensible priority, prescribe the smallest
// feasible action, measure what happens, then adapt. Complexity must earn its place.

const ACTIONS = {
  poor_sleep: { id:'stabilize_sleep_window', dimension:'physical', title:'Stabilize your sleep window', effort:2, measurement:'Log sleep start/end', reviewDays:7 },
  schedule_disruption: { id:'anchor_daily_schedule', dimension:'occupational', title:'Create one daily anchor', effort:2, measurement:'Log whether the anchor happened', reviewDays:7 },
  stress: { id:'daily_decompression', dimension:'emotional', title:'Use a short daily decompression block', effort:1, measurement:'Log completion and stress before/after', reviewDays:7 },
  low_energy: { id:'energy_observation', dimension:'physical', title:'Track when energy drops', effort:1, measurement:'Record low-energy time and preceding activity', reviewDays:7, informationGathering:true },
  low_focus: { id:'protected_focus_block', dimension:'occupational', title:'Protect one focus block', effort:2, measurement:'Log completion', reviewDays:7 },
  work_instability: { id:'income_action', dimension:'occupational', title:'Take one concrete income action', effort:3, measurement:'Record the completed action and result', reviewDays:7 },
  money_pressure: { id:'money_snapshot', dimension:'financial', title:'Create a current money snapshot', effort:2, measurement:'Record available cash, required payments and due dates', reviewDays:7 },
  relationship_strain: { id:'relationship_repair_step', dimension:'social', title:'Take one relationship repair step', effort:3, measurement:'Record the action and result', reviewDays:7 },
  low_support: { id:'support_contact', dimension:'social', title:'Strengthen one support connection', effort:2, measurement:'Make one meaningful support contact', reviewDays:7 },
  home_instability: { id:'home_stability_step', dimension:'environmental', title:'Resolve one home stability issue', effort:3, measurement:'Record one completed stability action', reviewDays:7 },
  lack_direction: { id:'direction_next_step', dimension:'spiritual', title:'Choose one meaningful next step', effort:2, measurement:'Complete one step tied to what matters now', reviewDays:7 }
};

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function normalizeEvidence(input={}) {
  const ranked=input.ranked || input.drivers || [];
  return ranked.map((x,i)=>typeof x==='string'
    ? {id:x, confidence:Math.max(.35,1-(i*.15)), rank:i+1}
    : {rank:i+1, confidence:x.confidence ?? x.score ?? Math.max(.35,1-(i*.15)), ...x});
}

// Evidence does not justify a claim that EL8 can mathematically identify the
// objectively optimal intervention. This score is therefore only a transparent
// prioritization heuristic: safety is handled first; then member importance,
// evidence confidence, leverage, feasibility/capacity and readiness.
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

export function buildPlan(discovery={}, context={}) {
  if(context.safetyHold || discovery.safetyHold)
    return {status:'escalate', reason:'safety_hold', actions:[], reviewDays:null};

  const evidence=normalizeEvidence(discovery);
  if(!evidence.length)
    return {status:'observe', reason:'insufficient_evidence', actions:[], reviewDays:7};

  const candidates=evidence
    .filter(d=>ACTIONS[d.id])
    .map(d=>({driver:d, action:ACTIONS[d.id], priority:priorityScore(d,ACTIONS[d.id],context)}))
    .sort((a,b)=>b.priority-a.priority);

  if(!candidates.length)
    return {status:'observe', reason:'no_authorized_action', actions:[], reviewDays:7};

  // MVP default: one primary action. A second is allowed only when capacity is
  // not low and evidence is strong. Research supports prioritization but does
  // not establish a universal optimal number of simultaneous goals.
  const chosen=[];
  for(const c of candidates) {
    if(chosen.length>=2) break;
    if(chosen.length===1 && (context.capacity==='low' || c.driver.confidence<.8)) break;
    chosen.push({
      ...c.action,
      driver:c.driver.id,
      confidence:+Number(c.driver.confidence).toFixed(3),
      priority:c.priority,
      goal:c.driver.goal || `Improve the situation related to ${c.driver.id.replaceAll('_',' ')}`,
      barrierPlan:c.driver.barrierPlan || null,
      support:c.driver.support || null,
      rationale:`Chosen as a current priority using Discovery evidence, member context, feasibility and expected leverage. This is a working hypothesis, not a proven causal conclusion.`
    });
  }

  return {
    status:'active',
    reason:'evidence_informed_priority',
    actions:chosen,
    reviewDays:Math.min(...chosen.map(a=>a.reviewDays)),
    evidenceUsed:evidence.map(x=>({id:x.id,confidence:x.confidence})),
    uncertainty:'Plan choices are hypotheses to test through follow-up, not claims of optimality or causality.'
  };
}

export function adaptPlan(plan={}, feedback={}) {
  if(plan.status!=='active') return {...plan, adaptation:'no_active_plan'};

  const adherence=clamp(Number(feedback.adherence ?? 1),0,1);
  const benefit=clamp(Number(feedback.benefit ?? 0),-1,1);
  const blocked=Boolean(feedback.blocked);
  const circumstancesChanged=Boolean(feedback.circumstancesChanged);
  const safetyHold=Boolean(feedback.safetyHold);

  if(safetyHold) return {...plan,status:'escalate',actions:[],adaptation:'escalate'};
  if(circumstancesChanged) return {...plan,adaptation:'reprioritize'};
  if(blocked || adherence<.5) return {...plan,adaptation:'simplify_or_reschedule',actions:plan.actions.slice(0,1)};
  if(adherence>=.7 && benefit>0) return {...plan,adaptation:'maintain'};
  if(adherence>=.7 && benefit<=0) return {...plan,adaptation:'reassess'};
  return {...plan,adaptation:'continue_observation'};
}

export { ACTIONS };
