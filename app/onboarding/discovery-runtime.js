import * as Discovery from '../../intelligence/discovery/discovery-engine.js';
const STORAGE_KEY='el8_onboarding_discovery_v5';
export function createDiscoverySession(options={}){return Discovery.session(options)}
export function nextDiscoveryStep(session){return Discovery.next(session)}
export function answerDiscoveryQuestion(session,question,answerIds){return Discovery.answer(session,question,answerIds)}
export function submitDiscoveryTriage(session,importanceByConstruct){return Discovery.triage(session,importanceByConstruct)}
export function resolveDiscoveryConstruct(session,constructId,resolutionState,options={}){return Discovery.resolve(session,constructId,resolutionState,options)}
export function finishDiscovery(session){Discovery.complete(session);return discoveryOutput(session)}
export function discoveryOutput(session){return Object.freeze({trace:Discovery.trace(session)})}
export function saveDiscoveryDraft(session){const serializable={...session,questionBank:undefined};sessionStorage.setItem(STORAGE_KEY,JSON.stringify(serializable));return session}
export function loadDiscoveryDraft(){const raw=sessionStorage.getItem(STORAGE_KEY);if(!raw)return null;try{return{...JSON.parse(raw),questionBank:Discovery.BANK}}catch{return null}}
export function clearDiscoveryDraft(){sessionStorage.removeItem(STORAGE_KEY)}
function normalizedImportance(s={}){const raw=s.memberImportance;if(raw===null||raw===undefined)return null;if(typeof raw==='number')return raw;const map={low:0,moderate:1,high:2,'very-high':3};return map[raw]??null}
function evidenceConfidence(s={}){return Number(s.evidenceConfidence??s.confidence??0)}
function evidenceSupport(value){const evidence=Number(value||0);if(evidence>=.75)return'strong';if(evidence>=.55)return'sufficient';if(evidence>0)return'limited';return'none'}
export function discoveryPriorityCandidates(output={}){const states=output.trace?.states||[];return states.filter(s=>{if(['deferred','nonIssue','escalated'].includes(s.resolutionState)||s.excluded)return false;const importance=normalizedImportance(s),evidence=evidenceConfidence(s);return (importance!==null&&importance>0)||evidence>0}).map(s=>{const importance=normalizedImportance(s),evidence=evidenceConfidence(s);return Object.freeze({constructId:s.constructId,label:s.label||s.constructId,evidenceConfidence:evidence,evidenceSupport:evidenceSupport(evidence),memberImportance:importance,resolutionState:s.resolutionState,memberEmphasized:importance!==null&&importance>=2,inferred:importance===null&&evidence>0,evidenceRefs:s.evidenceRefs||[],feasibility:s.feasibility||null})}).sort((a,b)=>Number(b.memberImportance??-1)-Number(a.memberImportance??-1)||Number(b.evidenceConfidence)-Number(a.evidenceConfidence)||a.constructId.localeCompare(b.constructId))}
