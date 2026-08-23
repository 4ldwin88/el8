import {deriveAllConcernStates} from './concern-projection.js';
import {eligibleQuestions} from './question-eligibility.js';
import {selectNextQuestion} from './question-scheduler.js';
import {needsTriage, needsRetriage, buildTriageQuestion} from './triage.js';
import {stoppingDecision} from './sufficiency.js';
import {selectPlanConcerns} from './plan-priority.js';

export function createRound3Session({concernIds=[], questionBank=[], labels={}, outerGuardrail=14}={}) {
  return {version:'round-3', observationLog:[], concernIds:[...concernIds], questionBank, labels, asked:[], questionsAsked:0, outerGuardrail, phase:concernIds.length?'discovery':'gateway', triaged:false, incomplete:false, resolutionStates:{}, driverKnown:{}};
}

export function activateConcerns(session, concernIds=[]) {
  session.concernIds=[...new Set([...session.concernIds,...concernIds.filter(Boolean)])];
  for(const id of concernIds) if(!session.resolutionStates[id]) session.resolutionStates[id]='triaged';
  session.phase='discovery';
  return session;
}

export function appendObservation(session, observation) {
  session.observationLog = Object.freeze([...session.observationLog, observation]);
  if (observation.concernId && !session.concernIds.includes(observation.concernId)) activateConcerns(session,[observation.concernId]);
  return session;
}

export function deriveStates(session) {
  return deriveAllConcernStates(session.observationLog, session.concernIds).map(s => ({...s, resolutionState: session.resolutionStates?.[s.concernId] ?? 'triaged', driverKnown: session.driverKnown?.[s.concernId] ?? false}));
}

function gatewayQuestion(session){return session.questionBank.find(q=>q.role==='gateway' && !session.asked.includes(q.id));}

export function nextRound3Step(session) {
  if(session.phase==='gateway' && session.concernIds.length===0){
    const q=gatewayQuestion(session);
    if(!q)return {type:'finish',stop:{reason:'no-gateway-question',incomplete:true},states:[]};
    session.asked=[...session.asked,q.id]; session.questionsAsked++;
    return {type:'question',question:q,reason:'gateway',states:[]};
  }
  const states=deriveStates(session);
  const stop=stoppingDecision({states,questionsAsked:session.questionsAsked,outerGuardrail:session.outerGuardrail});
  if (stop.stop) { session.incomplete=Boolean(stop.incomplete); return {type:'finish',stop,states}; }
  if (!session.triaged && needsTriage(session.concernIds)) return {type:'triage',question:buildTriageQuestion(session.concernIds,session.labels),states};
  if (session.triaged && needsRetriage(states,session.concernIds.length)) return {type:'triage',question:buildTriageQuestion(states.filter(s=>!s.memberImportance).map(s=>s.concernId),session.labels),states,reason:'re-triage'};
  const candidates=eligibleQuestions(session.questionBank.filter(q=>q.role!=='gateway'&&!session.asked.includes(q.id)),states,session.observationLog).map(q=>({...q,eligible:true}));
  const decision=selectNextQuestion({candidates,states});
  if (decision.type==='question') { session.asked=[...session.asked,decision.question.id]; session.questionsAsked++; }
  return {...decision,states};
}

export function markTriaged(session) { session.triaged=true; return session; }
export function setResolution(session,concernId,resolutionState,{driverKnown}={}){session.resolutionStates[concernId]=resolutionState;if(driverKnown!==undefined)session.driverKnown[concernId]=Boolean(driverKnown);return session;}

export function buildPlan(session,maxPlanSize=3) {
  return selectPlanConcerns(deriveStates(session),maxPlanSize);
}
