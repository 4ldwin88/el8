// One Discovery handoff evaluator. Confidence, driver knowledge, question depth,
// candidate visibility and question exhaustion cannot discharge evidence requirements.
import {ALL_EFFECTS,isExecutableEffect} from '../registries/registry.js';
import {DIMENSION_IDS} from '../../registries/taxonomy/dimensions.js';
const disposed=new Set(['deferred','escalated','nonIssue']);
const supported=new Set(['supported','established']);
export function isActiveDiscoveryCandidate(state){return !state.excluded&&!disposed.has(state.resolutionState);}
export function hasSufficientDiscoveryEvidence(state){return supported.has(state.status)&&state.resolutionState==='sufficient'&&(state.evidenceRefs?.length??0)>0;}
export function auditDiscoveryRequirements(unresolvedRequirements){
 if(!Array.isArray(unresolvedRequirements))throw new Error('Discovery unresolved requirements must be an array');
 const optional=r=>r&&typeof r==='object'&&r.blocking===false&&r.required!==true&&typeof r.requirementId==='string'&&r.requirementId.trim().length>0&&typeof r.reason==='string'&&r.reason.trim().length>0;
 return {unresolvedRequirements:structuredClone(unresolvedRequirements),
  blockingRequirements:structuredClone(unresolvedRequirements.filter(r=>!optional(r))),
  boundedUncertainty:unresolvedRequirements.some(optional)};
}
export function orientationCoverageComplete(areas=[]){
 if(areas.length!==DIMENSION_IDS.length)return false;
 // Explicit unknown is permitted internally; it is not a first-matrix answer.
 return DIMENSION_IDS.every(id=>{const rows=areas.filter(a=>String(a.dimensionId).toLowerCase()===id);return rows.length===1&&(rows[0].state==='unknown'||ALL_EFFECTS.some(e=>isExecutableEffect(e)&&e['Effect Type']==='BASELINE_COVERAGE'&&e['Target ID / Construct']===`DIMENSION_${id.toUpperCase()}`&&e.Value===rows[0].state))});
}
export function handoffAudit(states,{unresolvedRequirements=[],safety=null,incomplete=false,allowEmpty=false}={}){
 if(!Array.isArray(states)||!Array.isArray(unresolvedRequirements))throw new Error('Discovery states and unresolved requirements must be arrays');
 const active=states.filter(isActiveDiscoveryCandidate);
 const eligible=active.filter(hasSufficientDiscoveryEvidence);
 const unresolved=active.filter(s=>!eligible.includes(s));
 const requirements=auditDiscoveryRequirements(unresolvedRequirements);
 const {blockingRequirements}=requirements;
 const blockedBySafety=Boolean(safety?.pauseOrdinaryFlow||states.some(s=>(s.safetyEscalationLevel??0)>0));
 return {
  usable:!incomplete&&!blockedBySafety&&!blockingRequirements.length&&!unresolved.length&&(active.length>0||allowEmpty),
  unresolved,blocking:[...unresolved],candidateIds:active.map(s=>s.constructId),eligibleCandidateIds:eligible.map(s=>s.constructId),
  ...requirements,blockedBySafety,incomplete:Boolean(incomplete)
 };
}
