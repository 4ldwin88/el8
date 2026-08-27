// Browser ESM implementation of the canonical PLAN_UPDATED Member State transition.
// Keep this projection aligned with intelligence/member-state/plan-result-adapter.cjs;
// Planning remains the decision authority and this module only applies its accepted result.

const clone=x=>JSON.parse(JSON.stringify(x));
function reviewDueAt(createdAt,reviewDays){if(!createdAt||!Number.isFinite(Number(reviewDays)))return null;const d=new Date(createdAt);if(Number.isNaN(d.getTime()))return null;d.setUTCDate(d.getUTCDate()+Number(reviewDays));return d.toISOString()}
export function applyCanonicalBrowserPlan(state,plan,{at=plan?.createdAt||new Date().toISOString()}={}){
 if(!state||state.schemaVersion!=='1.0.0'||!Number.isInteger(state.revision))throw new Error('canonical Member State is required');
 if(!plan||plan.status!=='active'||plan.memberStateRevision!==state.revision)throw new Error('canonical plan revision conflict');
 const active=Array.isArray(plan.active)?plan.active:[];if(!active.length)throw new Error('active canonical plan requires interventions');
 const accepted=new Set((state.priorities||[]).filter(p=>p.status==='ACCEPTED').map(p=>p.id));
 for(const item of active){if(!accepted.has(item.priorityId))throw new Error(`plan intervention requires accepted priority: ${item.priorityId}`);const priority=state.priorities.find(p=>p.id===item.priorityId);if(!priority||priority.problemId!==item.problemId)throw new Error('plan intervention problem must match accepted priority');const problem=state.problems.find(p=>p.id===item.problemId);if(!problem||problem.status!=='SUPPORTED')throw new Error('plan intervention requires supported problem')}
 const next=clone(state),planId=`plan:${state.memberId}:${state.revision+1}`;
 next.activePlan={...next.activePlan,planId,status:'ACTIVE',activatedAt:at,reviewDueAt:reviewDueAt(at,plan.reviewDays),interventions:active.map(i=>({id:i.intervention_id||i.id,priorityId:i.priorityId,problemId:i.problemId,status:'ACCEPTED',title:i.title||null,purpose:i.purpose||null,selectionMechanism:i.selectionMechanism||null,evidenceRefs:[...(i.evidenceRefs||[])],burden:{...(i.burden||{})},actionTemplates:[...(i.actionTemplates||[])],measurement:{...(i.measurement||{})},reviewRule:{...(i.reviewRule||{})},registryVersion:i.registry_version||plan.registry_version||null})),backlog:(plan.backlog||[]).map(i=>({id:i.intervention_id||i.id,priorityId:i.priorityId,problemId:i.problemId,status:'backlog'})),reviewDays:plan.reviewDays??null,activationStatus:plan.activationStatus||'ready',registryVersion:plan.registry_version||null,planningRevision:plan.memberStateRevision,decisionTrace:{...(plan.decisionTrace||{})},updatedAt:at};
 next.revision=state.revision+1;next.updatedAt=at;next.history=[...(next.history||[]),{revision:next.revision,previousRevision:state.revision,type:'PLAN_UPDATED',at,source:'planning:canonical'}];return next;
}
