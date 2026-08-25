export const INTERVENTION_INTENTS=Object.freeze(['stabilize','resolve','build','enhance','learn','maintain']);
const IMPLEMENTED_INTENTS=new Set(['stabilize','resolve','build','learn']);
const BASE_INTENT_PRIORITY=Object.freeze({stabilize:4,resolve:3,build:2,learn:1});
function intentPriority(candidate,state){if(candidate.intent==='stabilize'&&state.immediacyClass==='acute')return 10;return BASE_INTENT_PRIORITY[candidate.intent]??0}
function readinessMet(candidate,state){const r=candidate.readinessPrerequisite;if(!r)return true;if(typeof r==='function')return Boolean(r(state));if(Array.isArray(r))return r.includes(state.readiness);return state.readiness===r}
function safetyAllowed(candidate,state){if(typeof candidate.safetyConstraint==='function')return Boolean(candidate.safetyConstraint(state));return candidate.safetyAllowed!==false}
export function deriveInterventionEvidenceQuality(candidate,state){return candidate.concernId===state.concernId?(state.evidenceConfidence??0):0}
export function rankInterventionCandidates(state,candidates,{limit=4,maxPerIntent=2}={}){
 if(!state)throw new Error('Concern state required');
 if((state.safetyEscalationLevel??0)>0)return {type:'escalation',concernId:state.concernId,reason:'safety-escalation',candidates:[]};
 const eligible=candidates.filter(c=>c.concernId===state.concernId&&IMPLEMENTED_INTENTS.has(c.intent)&&readinessMet(c,state)&&safetyAllowed(c,state)&&(!c.applicable||c.applicable(state))).sort((a,b)=>intentPriority(b,state)-intentPriority(a,state)||deriveInterventionEvidenceQuality(b,state)-deriveInterventionEvidenceQuality(a,state)||(a.effort??2)-(b.effort??2)||a.id.localeCompare(b.id));
 const counts=new Map(),ranked=[];for(const c of eligible){const n=counts.get(c.intent)??0;if(n>=maxPerIntent)continue;ranked.push({...c,evidenceQuality:deriveInterventionEvidenceQuality(c,state)});counts.set(c.intent,n+1);if(ranked.length>=limit)break}
 return ranked.length?{type:'candidates',concernId:state.concernId,candidates:ranked}:{type:'deferred',concernId:state.concernId,reason:'no-eligible-intervention',candidates:[]};
}
export function selectIntervention(state,candidates){
 if(!state||state.resolutionState!=='sufficient')throw new Error('Intervention selection requires sufficient concern state');
 if(state.immediacyClass==null||state.safetyEscalationLevel==null)throw new Error('Missing sufficiency contract fields');
 const result=rankInterventionCandidates(state,candidates,{limit:1});if(result.type!=='candidates')return result;return{type:'intervention',concernId:state.concernId,intervention:result.candidates[0]};
}
export const HOME_INTERVENTIONS=Object.freeze([
 {id:'home_acute_step',concernId:'home_instability',intent:'stabilize',effort:2,applicable:s=>s.immediacyClass==='acute',title:'Take the next time-critical housing stability step',mechanism:'immediate-stability',expectedOutcome:'Reduce immediate housing instability',measurement:'Record completion and immediate housing status',timeHorizon:'immediate'},
 {id:'home_time_sensitive_step',concernId:'home_instability',intent:'resolve',effort:2,applicable:s=>s.immediacyClass==='time-sensitive',title:'Address the time-sensitive housing issue',mechanism:'barrier-resolution',expectedOutcome:'Resolve or materially reduce the time-sensitive housing barrier',measurement:'Record the action and resulting status',timeHorizon:'near-term'},
 {id:'home_environment_step',concernId:'home_instability',intent:'build',effort:1,applicable:s=>s.immediacyClass==='routine',title:'Improve one home or environmental barrier',mechanism:'environment-improvement',expectedOutcome:'Improve one identified environmental condition',measurement:'Record the change and whether the barrier improved',timeHorizon:'7-days'}
]);
