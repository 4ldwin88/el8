import * as Discovery from '../../intelligence/discovery/round3-engine.js';

const STORAGE_KEY='el8_onboarding_discovery_v1';
export function discoveryOptionsFromBaselineHandoff(handoff={}){const concerns=[...new Set(handoff.candidateConcerns||[])].filter(Boolean);return Object.freeze({concernIds:concerns,baselineHandoff:handoff})}
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
function timeBudgetMinutes(handoff={}){const t=handoff.signals?.feasibility?.time;return t==='<5 min'?5:t==='5–15 min'?15:t==='15–30 min'?30:t==='>30 min'?60:20}
function effortBudget(handoff={}){const f=handoff.signals?.feasibility||{},load=f.overall_load,readiness=f.readiness,t=timeBudgetMinutes(handoff);if(t<=5||load==='Overwhelming'||readiness==='Not ready')return 1;if(t<=15||load==='Difficult'||readiness==='Somewhat ready')return 2;return 3}
function concernPriority(action,handoff={}){const d=handoff.signals?.priority;if(!d)return 0;return (handoff.signals?.dimensionSignals||[]).find(x=>x.dimension===d)?.candidateConcerns?.includes(action.concernId)?2:0}
function oneConstraintScore(action,c,handoff){if(c==='Cost')return action.costBand==='free'?2:-2;if(c==='Time')return Number(action.estimatedMinutes||999)<=timeBudgetMinutes(handoff)?2:-2;if(c==='Accessibility')return action.accessibility==='movement-dependent'?-3:1;if(c==='Professional guidance')return action.professionalSupport==='possible'?1:0;return 0}
function constraintScore(action,handoff={}){const raw=handoff.signals?.constraints,constraints=(Array.isArray(raw)?raw:raw?[raw]:[]).filter(c=>!['None','Prefer not to say'].includes(c));return constraints.reduce((score,c)=>score+oneConstraintScore(action,c,handoff),0)}
function timeFit(action,handoff={}){const m=Number(action.estimatedMinutes||15),budget=timeBudgetMinutes(handoff);if(m<=budget)return 4;if(m<=budget*1.5)return 1;return -3}
function scorePlanAction(action,handoff={}){const effort=Number(action.effort??2)<=effortBudget(handoff)?2:-1,evidence=Number(action.evidenceQuality??0),priority=concernPriority(action,handoff),constraints=constraintScore(action,handoff),time=timeFit(action,handoff),selected=action.memberSelected?1:0;return Object.freeze({total:time+effort+priority+constraints+evidence+selected,time,effort,priority,constraints,evidence,selected})}
function rankPlanActions(actions=[],handoff={}){return [...actions].map((a,index)=>({...a,fitScore:scorePlanAction(a,handoff),_index:index})).sort((a,b)=>b.fitScore.total-a.fitScore.total||a._index-b._index).map(({_index,...a})=>a)}
export function initialPlanProposal(session,{reviewDays=7}={}){const source=Discovery.memberPlan(session),handoff=session.baselineHandoff||{},all=source.focus.flatMap(focus=>focus.actions.map(action=>({...action,concernId:focus.concernId,concernLabel:focus.label,evidenceConfidence:focus.evidenceConfidence,memberSelected:focus.memberSelected}))),actions=rankPlanActions(all,handoff).slice(0,4),budget=effortBudget(handoff);return Object.freeze({status:source.status,reviewDays:[7,14].includes(Number(reviewDays))?Number(reviewDays):7,uncertainty:source.uncertainty,explanation:source.explanation,focus:source.focus,candidateActions:actions,selectedActionIds:[],fitContext:Object.freeze({effortBudget:budget,timeBudgetMinutes:timeBudgetMinutes(handoff),memberPriority:handoff.signals?.priority||null,constraints:handoff.signals?.constraints||[],feasibility:handoff.signals?.feasibility||{}})})}
