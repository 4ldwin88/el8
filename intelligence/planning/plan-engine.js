// EL8 Plan Engine v1 — isolated challenger.
// Converts Discovery evidence into a small, explainable, measurable plan.
// No UI coupling and no production persistence.

const ACTIONS = {
  poor_sleep: { id:'stabilize_sleep_window', dimension:'physical', title:'Stabilize your sleep window', effort:2, impact:5, measurement:'Log sleep start/end daily for 7 days', reviewDays:7 },
  schedule_disruption: { id:'anchor_daily_schedule', dimension:'occupational', title:'Create one daily anchor', effort:2, impact:4, measurement:'Complete the same anchor activity at the planned time', reviewDays:7 },
  stress: { id:'daily_decompression', dimension:'emotional', title:'Use a short daily decompression block', effort:1, impact:3, measurement:'Log completion and stress before/after', reviewDays:7 },
  low_energy: { id:'energy_observation', dimension:'physical', title:'Track when energy drops', effort:1, impact:2, measurement:'Record low-energy time and preceding activity for 7 days', reviewDays:7, informationGathering:true },
  low_focus: { id:'protected_focus_block', dimension:'occupational', title:'Protect one focus block', effort:2, impact:3, measurement:'Log one distraction-limited focus block', reviewDays:7 },
  work_instability: { id:'income_action', dimension:'occupational', title:'Take one concrete income action', effort:3, impact:5, measurement:'Record one completed employment or income action', reviewDays:7 },
  money_pressure: { id:'money_snapshot', dimension:'financial', title:'Create a current money snapshot', effort:2, impact:5, measurement:'Record available cash, required payments and next due dates', reviewDays:7 },
  relationship_strain: { id:'relationship_repair_step', dimension:'social', title:'Take one relationship repair step', effort:3, impact:4, measurement:'Record the action taken and result', reviewDays:7 },
  low_support: { id:'support_contact', dimension:'social', title:'Strengthen one support connection', effort:2, impact:3, measurement:'Make one meaningful support contact', reviewDays:7 },
  home_instability: { id:'home_stability_step', dimension:'environmental', title:'Resolve one home stability issue', effort:3, impact:4, measurement:'Record one completed stability action', reviewDays:7 },
  lack_direction: { id:'direction_next_step', dimension:'spiritual', title:'Choose one meaningful next step', effort:2, impact:4, measurement:'Write and complete one next step tied to what matters now', reviewDays:7 }
};

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function normalizeEvidence(input={}){
  const ranked = input.ranked || input.drivers || [];
  return ranked.map((x,i)=> typeof x==='string'
    ? {id:x, confidence:Math.max(.35,1-(i*.15)), rank:i+1}
    : {id:x.id, confidence:x.confidence ?? x.score ?? Math.max(.35,1-(i*.15)), rank:i+1, ...x});
}

function leverageScore(driver, context={}){
  const action=ACTIONS[driver.id];
  if(!action) return -Infinity;
  const confidence=clamp(Number(driver.confidence)||0,0,1);
  const urgency=clamp(Number(driver.urgency ?? 3),1,5);
  const breadth=clamp(Number(driver.breadth ?? driver.downstreamCount ?? 1),1,5);
  const feasibility=6-clamp(Number(action.effort),1,5);
  const capacityPenalty=context.capacity==='low' ? action.effort*.8 : context.capacity==='high' ? 0 : action.effort*.3;
  return +(confidence*5 + urgency + breadth + action.impact + feasibility - capacityPenalty).toFixed(3);
}

export function buildPlan(discovery={}, context={}){
  if(context.safetyHold || discovery.safetyHold) return {status:'escalate', reason:'safety_hold', actions:[], reviewDays:null};
  const evidence=normalizeEvidence(discovery);
  if(!evidence.length) return {status:'observe', reason:'insufficient_evidence', actions:[], reviewDays:7};

  const candidates=evidence
    .filter(d=>ACTIONS[d.id])
    .map(d=>({driver:d, action:ACTIONS[d.id], leverage:leverageScore(d,context)}))
    .sort((a,b)=>b.leverage-a.leverage);

  if(!candidates.length) return {status:'observe', reason:'no_authorized_action', actions:[], reviewDays:7};

  const maxActions=context.capacity==='low'?1:context.capacity==='high'?3:2;
  const chosen=[]; const dimensions=new Set();
  for(const c of candidates){
    if(chosen.length>=maxActions) break;
    // Avoid stacking multiple actions in one dimension unless evidence is strong.
    if(dimensions.has(c.action.dimension) && c.driver.confidence<.8) continue;
    chosen.push({
      ...c.action,
      driver:c.driver.id,
      confidence:+Number(c.driver.confidence).toFixed(3),
      leverage:c.leverage,
      rationale:`Selected because ${c.driver.id} is supported by Discovery evidence and offers a high impact-to-effort opportunity.`
    });
    dimensions.add(c.action.dimension);
  }

  return {
    status:chosen.length?'active':'observe',
    reason:chosen.length?'prioritized_leverage':'insufficient_actionable_evidence',
    actions:chosen,
    reviewDays:chosen.length?Math.min(...chosen.map(a=>a.reviewDays)):7,
    evidenceUsed:evidence.map(x=>({id:x.id,confidence:x.confidence}))
  };
}

export function adaptPlan(plan={}, feedback={}){
  const adherence=clamp(Number(feedback.adherence ?? 1),0,1);
  const benefit=clamp(Number(feedback.benefit ?? 0),-1,1);
  if(plan.status!=='active') return {...plan, adaptation:'no_active_plan'};
  if(adherence<.5) return {...plan, adaptation:'reduce_burden', actions:plan.actions.slice(0,1)};
  if(adherence>=.7 && benefit>0) return {...plan, adaptation:'maintain'};
  if(adherence>=.7 && benefit<=0) return {...plan, adaptation:'reassess_driver'};
  return {...plan, adaptation:'continue_observation'};
}

export { ACTIONS };
