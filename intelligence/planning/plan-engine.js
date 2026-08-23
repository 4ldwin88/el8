// EL8 Plan Engine v1 — evidence-informed MVP challenger.
// Plans are commitments with appropriate cadence, not a pile of daily tasks.

const ACTIONS = {
  poor_sleep: { id:'sleep_log', type:'data', dimension:'physical', title:'Log your sleep', effort:1, measurement:'Record sleep start/end', cadence:{type:'daily',target:7,period:'week'}, reviewDays:7, informationGathering:true },
  schedule_disruption: { id:'anchor_daily_schedule', type:'intervention', dimension:'occupational', title:'Keep one daily anchor', effort:2, measurement:'Log whether the anchor happened', cadence:{type:'daily',target:7,period:'week'}, reviewDays:7 },
  stress: { id:'decompression_practice', type:'intervention', dimension:'emotional', title:'Use a short decompression practice', effort:1, measurement:'Log completion and stress before/after', cadence:{type:'weekly_target',target:4,period:'week'}, reviewDays:7 },
  low_energy: { id:'energy_observation', type:'data', dimension:'physical', title:'Track when energy drops', effort:1, measurement:'Record low-energy time and preceding activity', cadence:{type:'daily',target:7,period:'week'}, reviewDays:7, informationGathering:true },
  low_focus: { id:'protected_focus_block', type:'intervention', dimension:'occupational', title:'Protect one focus block', effort:2, measurement:'Log completion', cadence:{type:'weekly_target',target:3,period:'week'}, reviewDays:7 },
  work_instability: { id:'income_action', type:'intervention', dimension:'occupational', title:'Take a concrete income action', effort:3, measurement:'Record completed action and result', cadence:{type:'weekly_target',target:2,period:'week'}, reviewDays:7 },
  money_pressure: { id:'money_snapshot', type:'data', dimension:'financial', title:'Create a current money snapshot', effort:2, measurement:'Record available cash, required payments and due dates', cadence:{type:'one_time',target:1,period:'plan'}, reviewDays:7, informationGathering:true },
  relationship_strain: { id:'relationship_repair_step', type:'intervention', dimension:'social', title:'Take one relationship repair step', effort:3, measurement:'Record the action and result', cadence:{type:'one_time',target:1,period:'plan'}, reviewDays:7 },
  low_support: { id:'support_contact', type:'intervention', dimension:'social', title:'Strengthen a support connection', effort:2, measurement:'Make one meaningful support contact', cadence:{type:'weekly_target',target:1,period:'week'}, reviewDays:7 },
  home_instability: { id:'home_stability_step', type:'intervention', dimension:'environmental', title:'Resolve one home stability issue', effort:3, measurement:'Record one completed stability action', cadence:{type:'one_time',target:1,period:'plan'}, reviewDays:7 },
  lack_direction: { id:'direction_next_step', type:'intervention', dimension:'spiritual', title:'Take one meaningful next step', effort:2, measurement:'Complete one step tied to what matters now', cadence:{type:'weekly_target',target:1,period:'week'}, reviewDays:7 }
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

function toBacklogItem({driver,action,priority}) {
  const cadence=driver.cadence || action.cadence || {type:'one_time',target:1,period:'plan'};
  return {
    ...action, cadence, progress:{completed:0,target:cadence.target || 1},
    driver:driver.id, confidence:+Number(driver.confidence).toFixed(3), priority, status:'backlog',
    goal:driver.goal || `Improve the situation related to ${driver.id.replaceAll('_',' ')}`,
    barrierPlan:driver.barrierPlan || null, support:driver.support || null,
    rationale:'Ranked using Discovery evidence, member context, feasibility and expected leverage. This is a working hypothesis, not a proven causal conclusion.'
  };
}

function activeLimit(context={}) { return context.capacity==='low' ? 1 : 2; }

export function buildPlan(discovery={}, context={}) {
  if(context.safetyHold || discovery.safetyHold) return {status:'escalate',reason:'safety_hold',active:[],backlog:[],history:[],reviewDays:null};
  const evidence=normalizeEvidence(discovery);
  if(!evidence.length) return {status:'observe',reason:'insufficient_evidence',active:[],backlog:[],history:[],reviewDays:7};
  const backlog=evidence.filter(d=>ACTIONS[d.id])
    .map(d=>({driver:d,action:ACTIONS[d.id],priority:priorityScore(d,ACTIONS[d.id],context)}))
    .sort((a,b)=>b.priority-a.priority).map(toBacklogItem);
  if(!backlog.length) return {status:'observe',reason:'no_authorized_action',active:[],backlog:[],history:[],reviewDays:7};
  const active=backlog.splice(0,activeLimit(context)).map(x=>({...x,status:'active'}));
  return {status:'active',reason:'evidence_informed_priority',active,backlog,history:[],actions:active,reviewDays:Math.min(...active.map(a=>a.reviewDays)),evidenceUsed:evidence.map(x=>({id:x.id,confidence:x.confidence})),uncertainty:'Plan choices are hypotheses to test through follow-up, not claims of optimality or causality.'};
}

function promote(plan, context={}) {
  const active=[...(plan.active||[])], backlog=[...(plan.backlog||[])];
  while(active.length<activeLimit(context) && backlog.length) active.push({...backlog.shift(),status:'active',deferred:false});
  return {...plan,active,actions:active,backlog};
}

export function recordOccurrence(plan={}, itemId, occurrence={}, context={}) {
  const active=[...(plan.active||plan.actions||[])];
  const history=[...(plan.history||[])];
  const i=active.findIndex(x=>x.id===itemId); if(i<0) return plan;
  const item={...active[i]};
  const completed=Math.min((item.progress?.completed||0)+1,item.progress?.target||1);
  item.progress={...(item.progress||{}),completed,lastAt:occurrence.at||null};
  history.push({itemId,kind:'occurrence',at:occurrence.at||null,note:occurrence.note||null});
  if(completed>=item.progress.target) {
    active.splice(i,1);
    history.push({...item,status:'completed'});
    return promote({...plan,active,actions:active,history},context);
  }
  active[i]=item;
  return {...plan,active,actions:active,history};
}

export function respondToItem(plan={}, itemId, response={}, context={}) {
  const active=[...(plan.active||plan.actions||[])], backlog=[...(plan.backlog||[])], history=[...(plan.history||[])];
  const i=active.findIndex(x=>x.id===itemId); if(i<0) return plan;
  const item=active[i], decision=response.decision||'reject';
  active.splice(i,1);
  history.push({...item,status:decision,reason:response.reason||null,respondedAt:response.respondedAt||null});
  if(decision==='defer') backlog.push({...item,status:'backlog',deferred:true});
  return promote({...plan,active,actions:active,backlog,history},context);
}

export function planView(plan={}) {
  const groups={daily:[],thisWeek:[],scheduled:[],oneTime:[]};
  for(const item of plan.active||[]) {
    const c=item.cadence||{};
    const view={id:item.id,title:item.title,type:item.type,progress:item.progress,cadence:c,measurement:item.measurement};
    if(c.type==='daily') groups.daily.push(view);
    else if(c.type==='weekly_target') groups.thisWeek.push(view);
    else if(c.type==='specific_days') groups.scheduled.push(view);
    else groups.oneTime.push(view);
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

export { ACTIONS };
