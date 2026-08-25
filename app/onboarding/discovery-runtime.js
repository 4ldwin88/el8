import * as Discovery from '../../intelligence/discovery/round3-engine.js';

const STORAGE_KEY='el8_onboarding_discovery_v1';
export function discoveryOptionsFromBaselineHandoff(handoff={}){
  const concerns=[...new Set(handoff.candidateConcerns||[])].filter(Boolean);
  return Object.freeze({concernIds:concerns,baselineHandoff:handoff});
}
export function createDiscoverySession(options={}){const s=Discovery.session(options);if(options.baselineHandoff)s.baselineHandoff=options.baselineHandoff;return s}
export function createDiscoverySessionFromHandoff(handoff={}){return createDiscoverySession(discoveryOptionsFromBaselineHandoff(handoff))}
export function nextDiscoveryStep(session){return Discovery.next(session)}
export function answerDiscoveryQuestion(session,question,answerIds){return Discovery.answer(session,question,answerIds)}
export function submitDiscoveryTriage(session,importanceByConcern){return Discovery.triage(session,importanceByConcern)}
export function submitDiscoveryPriority(session,concernIds){return Discovery.prioritize(session,concernIds)}
export function resolveDiscoveryConcern(session,concernId,resolutionState,options={}){return Discovery.resolve(session,concernId,resolutionState,options)}
export function finishDiscovery(session){Discovery.complete(session);return discoveryOutput(session)}
export function discoveryOutput(session){return Object.freeze({trace:Discovery.trace(session),plan:Discovery.memberPlan(session),baselineHandoff:session.baselineHandoff||null})}
export function saveDiscoveryDraft(session){const serializable={...session,questionBank:undefined};sessionStorage.setItem(STORAGE_KEY,JSON.stringify(serializable));return session}
export function loadDiscoveryDraft(){const raw=sessionStorage.getItem(STORAGE_KEY);if(!raw)return null;try{return{...JSON.parse(raw),questionBank:Discovery.BANK}}catch{return null}}
export function clearDiscoveryDraft(){sessionStorage.removeItem(STORAGE_KEY)}
function effortBudget(handoff={}){const f=handoff.signals?.feasibility||{},time=f.time,load=f.overall_load,readiness=f.readiness;if(time==='<5 min'||load==='Overwhelming'||readiness==='Not ready')return 1;if(time==='5–15 min'||load==='Difficult'||readiness==='Somewhat ready')return 2;return 3}
function concernPriority(action,handoff={}){const d=handoff.signals?.priority;if(!d)return 0;return (handoff.signals?.dimensionSignals||[]).find(x=>x.dimension===d)?.candidateConcerns?.includes(action.concernId)?2:0}
function rankPlanActions(actions=[],handoff={}){const budget=effortBudget(handoff);return [...actions].map((a,index)=>({...a,_index:index,_fit:(Number(a.effort??2)<=budget?3:0)+concernPriority(a,handoff)+(a.evidenceQuality??0)})).sort((a,b)=>b._fit-a._fit||a._index-b._index).map(({_index,_fit,...a})=>a)}
export function initialPlanProposal(session,{reviewDays=7}={}){const source=Discovery.memberPlan(session),handoff=session.baselineHandoff||{},all=source.focus.flatMap(focus=>focus.actions.map(action=>({...action,concernId:focus.concernId,concernLabel:focus.label,evidenceConfidence:focus.evidenceConfidence,memberSelected:focus.memberSelected}))),actions=rankPlanActions(all,handoff).slice(0,4),budget=effortBudget(handoff);return Object.freeze({status:source.status,reviewDays:[7,14].includes(Number(reviewDays))?Number(reviewDays):7,uncertainty:source.uncertainty,explanation:source.explanation,focus:source.focus,candidateActions:actions,selectedActionIds:[],fitContext:Object.freeze({effortBudget:budget,memberPriority:handoff.signals?.priority||null,constraints:handoff.signals?.constraints||null,feasibility:handoff.signals?.feasibility||{}})})}
