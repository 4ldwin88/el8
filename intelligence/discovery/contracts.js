import {isConstructId} from '../../registries/taxonomy/index.js';
export const EFFECT_TYPES=Object.freeze(['safety','immediacy','readiness','importance','member-priority','feasibility','constraint','barrier','support','access','capacity']);
export const RESOLUTION_STATES=Object.freeze(['unscoped','triaged','narrowing','sufficient','deferred','escalated','nonIssue']);
export const IMMEDIACY=Object.freeze(['routine','time-sensitive','acute']);
export const TEMPORALITY=Object.freeze(['current','recurring','historical','resolved','unknown']);
export const SOURCE_TYPES=Object.freeze(['direct','inferred','derived']);
// Explicit backward links select current evidence without mutating history.
// No timestamp ordering or repeated answer implicitly supersedes a report.
export function currentObservations(observationLog){
 const seen=new Map(),superseded=new Set();
 for(const observation of observationLog){
  if(!observation?.id||seen.has(observation.id))throw new Error('Ambiguous Discovery observation identity');
  if(Object.hasOwn(observation,'supersedesObservationId')){
   const prior=seen.get(observation.supersedesObservationId);
   if(!prior||superseded.has(prior.id)||prior.questionId!==observation.questionId||
    !Number.isFinite(observation.timestamp)||observation.timestamp<prior.timestamp)
    throw new Error('Invalid Discovery correction link');
   const ordinary=o=>isConstructId(o.constructId)&&!o.effects?.length&&o.registryEvidence?.effects?.length&&
    o.registryEvidence.question?.['Question ID']===o.questionId&&
    o.registryEvidence.answer?.['Parent Question ID']===o.questionId&&
    o.registryEvidence.answer?.['Answer ID']===o.answerValue&&
    o.registryEvidence.effects.every(e=>['STATE','UNCERTAINTY'].includes(e['Effect Type'])&&e['Target ID / Construct']===o.constructId);
   if(!ordinary(prior)||!ordinary(observation)||prior.constructId!==observation.constructId)
    throw new Error('Correction requires matching ordinary focused observations');
   superseded.add(prior.id);
  }
  seen.set(observation.id,observation);
 }
 return observationLog.filter(o=>!superseded.has(o.id));
}
export function assertEffect(effect){if(!effect||!EFFECT_TYPES.includes(effect.type))throw new Error(`Invalid effect type: ${effect?.type}`);if(!SOURCE_TYPES.includes(effect.sourceType??'direct'))throw new Error('Invalid effect sourceType');if(effect.temporality&&!TEMPORALITY.includes(effect.temporality))throw new Error('Invalid effect temporality');if(effect.target&&!isConstructId(effect.target))throw new Error(`Invalid effect construct target: ${effect.target}`);if(effect.type==='immediacy'&&!IMMEDIACY.includes(effect.value))throw new Error('Invalid immediacy');if(effect.type==='feasibility'&&(!effect.feasibility||typeof effect.feasibility!=='object'||Array.isArray(effect.feasibility)))throw new Error('Invalid feasibility payload');return effect}
export function makeObservation({id,questionId,constructId,answerValue,specificityLevel=0,timestamp=Date.now(),effects=[],registryEvidence}){if(!id||!questionId)throw new Error('Observation requires id and questionId');if(constructId&&!isConstructId(constructId))throw new Error(`Invalid observation construct: ${constructId}`);return Object.freeze({id,questionId,constructId:constructId??null,answerValue,specificityLevel,timestamp,effects:Object.freeze(effects.map(assertEffect)),...(registryEvidence===undefined?{}:{registryEvidence:structuredClone(registryEvidence)})})}
