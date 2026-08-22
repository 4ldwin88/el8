// EL8 Intelligence — Decision Engine v1
// Converts prioritized needs into the least-burdensome appropriate next response.

const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));

function route(priority,context={}){
 const safety=context.safetyState||null;
 if(safety?.acuteRiskEstablished&&safety?.escalate)return{type:'safety-escalation',reason:'confirmed-safety',burden:'necessary'};
 if(safety?.needsDirectConfirmation&&!safety?.confirmed)return{type:'safety-confirmation',reason:'safety-uncertain',burden:'necessary'};
 if(!priority)return{type:'no-action',reason:'no-material-priority',burden:'none'};
 if(priority.discoveryDeferred)return{type:'deeper-assessment',target:priority.id,reason:'insufficient-evidence',burden:'low'};
 const readiness=clamp(context.readiness?.[priority.id]??priority.readiness??.5);
 const feasibility=clamp(context.feasibility?.[priority.id]??priority.feasibility??.6);
 const uncertainty=clamp(context.uncertainty?.[priority.id]??0);
 const trackability=clamp(context.trackability?.[priority.id]??.5);
 const knowledgeGap=clamp(context.knowledgeGap?.[priority.id]??0);
 const reassessmentDue=context.reassessmentDue?.[priority.id]===true;
 if(reassessmentDue)return{type:'reassessment',target:priority.id,reason:'stale-or-change-check',burden:'medium'};
 if(uncertainty>=.6)return{type:'deeper-assessment',target:priority.id,reason:'decision-uncertainty',burden:'low'};
 if(readiness<.35)return knowledgeGap>=.55?{type:'content',target:priority.id,reason:'low-readiness-knowledge-gap',burden:'low'}:{type:'tracking',target:priority.id,reason:'low-readiness-observe-first',burden:'low'};
 if(feasibility<.35)return{type:'tracking',target:priority.id,reason:'not-yet-actionable',burden:'low'};
 if(knowledgeGap>=.65)return{type:'content',target:priority.id,reason:'knowledge-before-action',burden:'low'};
 if(trackability>=.7&&readiness<.6)return{type:'tracking',target:priority.id,reason:'measure-before-action',burden:'low'};
 return{type:'action',target:priority.id,reason:'ready-and-actionable',burden:readiness>=.75?'normal':'low'};
}

function decide(prioritization,context={}){
 if(prioritization?.safetyOverride)return route(null,{...context,safetyState:context.safetyState});
 const primary=prioritization?.primary?.[0]||null;
 const decision=route(primary,context);
 return{version:'Decision Engine v1',decision,secondary:(prioritization?.secondary||[]).map(x=>x.id),queued:(prioritization?.queued||[]).map(x=>x.id),requiresReview:!!prioritization?.requiresReview&&decision.type!=='safety-escalation'};
}

export {route,decide};
export default {route,decide};
