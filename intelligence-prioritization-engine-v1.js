// EL8 Intelligence — Prioritization Engine v1
// Chooses what deserves attention first; it does not reinterpret Discovery truth.

const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
const WEIGHTS={evidence:.22,impact:.22,leverage:.18,urgency:.16,readiness:.12,feasibility:.10};

function scoreCandidate(candidate,context={}){
 const id=candidate.id;
 const evidence=clamp01((candidate.priorityScore||0)/1.5);
 const impact=clamp01(context.impact?.[id] ?? evidence);
 const leverage=clamp01(context.leverage?.[id] ?? .5);
 const urgency=clamp01(context.urgency?.[id] ?? .35);
 const readiness=clamp01(context.readiness?.[id] ?? .5);
 const feasibility=clamp01(context.feasibility?.[id] ?? .6);
 const memberPreference=clamp01(context.memberPreference?.[id] ?? (candidate.memberRaised?.65:.35));
 const burden=clamp01(context.burden?.[id] ?? .35);
 let score=evidence*WEIGHTS.evidence+impact*WEIGHTS.impact+leverage*WEIGHTS.leverage+urgency*WEIGHTS.urgency+readiness*WEIGHTS.readiness+feasibility*WEIGHTS.feasibility;
 score+=memberPreference*.08;
 score-=burden*.06;
 if(candidate.discoveryDeferred)score-=.18;
 return{id,evidence,impact,leverage,urgency,readiness,feasibility,memberPreference,burden,score:+score.toFixed(3),evidenceRefs:candidate.evidenceRefs||[],memberRaised:!!candidate.memberRaised,discoveryDeferred:!!candidate.discoveryDeferred};
}

function prioritize(handoff,context={},options={}){
 const maxPrimary=options.maxPrimary??1,maxSecondary=options.maxSecondary??2;
 const scored=(handoff?.candidates||[]).map(c=>scoreCandidate(c,context)).sort((a,b)=>b.score-a.score);
 const safety=context.safetyState||null;
 if(safety?.acuteRiskEstablished===true&&safety?.escalate===true){
   return{version:'Prioritization Engine v1',primary:[],secondary:[],queued:scored,requiresReview:true,reason:'confirmed-safety-override',safetyOverride:true,deliveryMode:'safety-escalation'};
 }
 if(safety?.needsDirectConfirmation===true&&!safety?.confirmed){
   return{version:'Prioritization Engine v1',primary:[],secondary:[],queued:scored,requiresReview:true,reason:'safety-confirmation-required',safetyOverride:true,deliveryMode:'safety-confirmation'};
 }
 if(!handoff?.readyForPrioritization||!scored.length)return{version:'Prioritization Engine v1',primary:[],secondary:[],queued:scored,requiresReview:true,reason:'insufficient-handoff',safetyOverride:false};
 const primary=scored.slice(0,maxPrimary);
 const chosen=new Set(primary.map(x=>x.id));
 const top=primary[0]?.score||0;
 const secondary=scored.filter(x=>!chosen.has(x.id)&&(x.memberRaised||top-x.score<=.16)&&!x.discoveryDeferred).slice(0,maxSecondary);
 secondary.forEach(x=>chosen.add(x.id));
 return{version:'Prioritization Engine v1',primary,secondary,queued:scored.filter(x=>!chosen.has(x.id)),requiresReview:!!handoff.requiresReview||primary.some(x=>x.discoveryDeferred),reason:'multi-factor-priority',safetyOverride:false};
}

export {WEIGHTS,scoreCandidate,prioritize};
export default {WEIGHTS,scoreCandidate,prioritize};
