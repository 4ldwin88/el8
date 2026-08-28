import * as Discovery from '../../intelligence/discovery/discovery-engine.js';
const STORAGE_KEY='el8_onboarding_discovery_v4';
export function discoveryOptionsFromBaselineHandoff(handoff={}){const concerns=[...new Set(handoff.candidateConcerns||[])].filter(Boolean);return Object.freeze({concernIds:concerns,baselineHandoff:handoff})}
export function createDiscoverySession(options={}){const s=Discovery.session(options);if(options.baselineHandoff){s.baselineHandoff=options.baselineHandoff;const signals=options.baselineHandoff.signals||{},priorities=signals.priorityConcerns||[];Discovery.seedBaselineSignals(s,signals);Discovery.seedBaselineTopics(s,signals.concernTopics||[]);if(priorities.length)Discovery.seedImportance(s,Object.fromEntries(s.concernIds.map(id=>[id,priorities.includes(id)?3:1])))}return s}
export function createDiscoverySessionFromHandoff(handoff={}){return createDiscoverySession(discoveryOptionsFromBaselineHandoff(handoff))}
export function nextDiscoveryStep(session){const step=Discovery.next(session);if(step.type==='question'&&step.question?.id==='W5'&&(session.baselineTopics?.work||[]).includes('finding_work')){session.asked=[...new Set([...session.asked,'W5'])];return Discovery.next(session)}return step}
export function answerDiscoveryQuestion(session,question,answerIds){return Discovery.answer(session,question,answerIds)}
export function submitDiscoveryTriage(session,importanceByConcern){return Discovery.triage(session,importanceByConcern)}
export function submitDiscoveryPriority(session,concernIds){return Discovery.prioritize(session,concernIds)}
export function resolveDiscoveryConcern(session,concernId,resolutionState,options={}){return Discovery.resolve(session,concernId,resolutionState,options)}
export function finishDiscovery(session){Discovery.complete(session);return discoveryOutput(session)}
export function discoveryOutput(session){return Object.freeze({trace:Discovery.trace(session),plan:Discovery.memberPlan(session),baselineHandoff:session.baselineHandoff||null})}
export function saveDiscoveryDraft(session){const serializable={...session,questionBank:undefined};sessionStorage.setItem(STORAGE_KEY,JSON.stringify(serializable));return session}
export function loadDiscoveryDraft(){const raw=sessionStorage.getItem(STORAGE_KEY);if(!raw)return null;try{return{...JSON.parse(raw),questionBank:Discovery.BANK}}catch{return null}}
export function clearDiscoveryDraft(){sessionStorage.removeItem(STORAGE_KEY)}
