import * as Discovery from '../../intelligence/discovery/round3-engine.js';

const STORAGE_KEY='el8_onboarding_discovery_v1';
export function createDiscoverySession(options={}){return Discovery.session(options)}
export function nextDiscoveryStep(session){return Discovery.next(session)}
export function answerDiscoveryQuestion(session,question,answerIds){return Discovery.answer(session,question,answerIds)}
export function submitDiscoveryTriage(session,importanceByConcern){return Discovery.triage(session,importanceByConcern)}
export function submitDiscoveryPriority(session,concernIds){return Discovery.prioritize(session,concernIds)}
export function resolveDiscoveryConcern(session,concernId,resolutionState,options={}){return Discovery.resolve(session,concernId,resolutionState,options)}
export function finishDiscovery(session){Discovery.complete(session);return discoveryOutput(session)}
export function discoveryOutput(session){return Object.freeze({trace:Discovery.trace(session),plan:Discovery.memberPlan(session)})}
export function saveDiscoveryDraft(session){sessionStorage.setItem(STORAGE_KEY,JSON.stringify(session));return session}
export function loadDiscoveryDraft(){const raw=sessionStorage.getItem(STORAGE_KEY);if(!raw)return null;try{return JSON.parse(raw)}catch{return null}}
export function clearDiscoveryDraft(){sessionStorage.removeItem(STORAGE_KEY)}
export function initialPlanProposal(session,{reviewDays=7}={}){const source=Discovery.memberPlan(session);const actions=source.focus.flatMap(focus=>focus.actions.map(action=>({...action,concernId:focus.concernId,concernLabel:focus.label}))).slice(0,4);return Object.freeze({status:source.status,reviewDays:[7,14].includes(Number(reviewDays))?Number(reviewDays):7,uncertainty:source.uncertainty,explanation:source.explanation,focus:source.focus,candidateActions:actions,selectedActionIds:[]})}
