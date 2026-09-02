import * as Discovery from '../../intelligence/discovery/discovery-engine.js';
import {isConstructId} from '../../registries/taxonomy/index.js';
import {handoffAudit} from '../../intelligence/discovery/sufficiency.js';
const STORAGE_KEY='el8_onboarding_discovery_v6';
export function createDiscoverySession(options={}){return Discovery.session(options)}
export function createDiscoverySessionFromHandoff(handoff={},options={}){
 const constructIds=[...new Set([...(handoff?.candidateConstructIds||handoff?.candidateConcerns||[]),...(options.constructIds||[])].filter(isConstructId))];
 return Discovery.session({...options,constructIds});
}
export function nextDiscoveryStep(session){return Discovery.next(session)}
export function answerDiscoveryQuestion(session,question,answerIds){return Discovery.answer(session,question,answerIds)}
export function submitDiscoverySafetyConfirmation(session,confirmation){return Discovery.setSafetyContext(session,{},confirmation)}
// Composite Orientation interactions remain one member-facing event while preserving permanent question/answer provenance underneath.
export function answerDiscoveryInteraction(session,interaction,answersByQuestion={}){
 const questions=Array.isArray(interaction?.questions)?interaction.questions:[];
 for(const question of questions){const answerIds=answersByQuestion[question.id];if(answerIds!==undefined&&answerIds!==null)Discovery.answer(session,question,answerIds)}
 return session;
}
export function submitDiscoveryTriage(session,importanceByConstruct){return Discovery.triage(session,importanceByConstruct)}
export function resolveDiscoveryConstruct(session,constructId,resolutionState,options={}){return Discovery.resolve(session,constructId,resolutionState,options)}
export function finishDiscovery(session){Discovery.complete(session);return discoveryOutput(session)}
export function discoveryOutput(session){const trace=Discovery.trace(session),handoff=handoffAudit(trace.states||[]);return Object.freeze({trace,handoff:Object.freeze({usable:handoff.usable,candidateIds:Object.freeze([...handoff.candidateIds]),unresolvedConstructIds:Object.freeze(handoff.unresolved.map(x=>x.constructId)),blockingConstructIds:Object.freeze(handoff.blocking.map(x=>x.constructId))})})}
export function saveDiscoveryDraft(session){const serializable={...session,questionBank:undefined};sessionStorage.setItem(STORAGE_KEY,JSON.stringify(serializable));return session}
export function loadDiscoveryDraft(){const raw=sessionStorage.getItem(STORAGE_KEY);if(!raw)return null;try{return{...JSON.parse(raw),questionBank:Discovery.BANK}}catch{return null}}
export function clearDiscoveryDraft(){sessionStorage.removeItem(STORAGE_KEY)}
function normalizedImportance(s={}){const raw=s.memberImportance;if(raw===null||raw===undefined)return null;if(typeof raw==='number')return raw;const map={low:0,moderate:1,high:2,'very-high':3};return map[raw]??null}
const CONFIDENCE_ORDER=Object.freeze({UNKNOWN:0,LIMITED:1,MODERATE:2,WELL_SUPPORTED:3});
function qualitativeConfidence(s={}){const raw=s.qualitativeConfidence??s.evidenceConfidence??s.confidence??'UNKNOWN';const value=String(raw).trim().toUpperCase().replace(/[ -]+/g,'_');return Object.hasOwn(CONFIDENCE_ORDER,value)?value:'UNKNOWN'}
function evidenceSupport(confidence){if(confidence==='WELL_SUPPORTED')return'strong';if(confidence==='MODERATE')return'sufficient';if(confidence==='LIMITED')return'limited';return'none'}
// Discovery exposes construct-keyed qualitative evidence candidates only. Prioritization owns ranking and Focus selection.
export function discoveryPriorityCandidates(output={}){const states=output.trace?.states||[];return states.filter(s=>{if(['deferred','nonIssue','escalated'].includes(s.resolutionState)||s.excluded)return false;const importance=normalizedImportance(s),confidence=qualitativeConfidence(s);return (importance!==null&&importance>0)||confidence!=='UNKNOWN'}).map(s=>{const importance=normalizedImportance(s),confidence=qualitativeConfidence(s),constructId=s.constructId;return Object.freeze({constructId,label:s.label||constructId,qualitativeConfidence:confidence,evidenceSupport:evidenceSupport(confidence),memberImportance:importance,resolutionState:s.resolutionState,memberEmphasized:importance!==null&&importance>=2,inferred:importance===null&&confidence!=='UNKNOWN',evidenceRefs:s.evidenceRefs||[],feasibility:s.feasibility||null})}).sort((a,b)=>Number(b.memberImportance??-1)-Number(a.memberImportance??-1)||CONFIDENCE_ORDER[b.qualitativeConfidence]-CONFIDENCE_ORDER[a.qualitativeConfidence]||a.constructId.localeCompare(b.constructId))}
