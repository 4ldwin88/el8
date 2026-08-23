import {deriveAllConcernStates} from './concern-projection.js';
import {eligibleQuestions} from './question-eligibility.js';
import {selectNextQuestion} from './question-scheduler.js';
import {needsTriage, needsRetriage, buildTriageQuestion} from './triage.js';
import {stoppingDecision} from './sufficiency.js';
import {selectPlanConcerns} from './plan-priority.js';

export function createRound3Session({concernIds=[], questionBank=[], labels={}, outerGuardrail=14}={}) {
  return {version:'round-3', observationLog:[], concernIds:[...concernIds], questionBank, labels, asked:[], questionsAsked:0, outerGuardrail, phase:'discovery', triaged:false, incomplete:false};
}

export function appendObservation(session, observation) {
  session.observationLog = Object.freeze([...session.observationLog, observation]);
  if (observation.concernId && !session.concernIds.includes(observation.concernId)) session.concernIds=[...session.concernIds,observation.concernId];
  return session;
}

export function deriveStates(session) {
  return deriveAllConcernStates(session.observationLog, session.concernIds).map(s => ({...s, resolutionState: session.resolutionStates?.[s.concernId] ?? 'narrowing', driverKnown: session.driverKnown?.[s.concernId] ?? false}));
}

export function nextRound3Step(session) {
  const states=deriveStates(session);
  const stop=stoppingDecision({states,questionsAsked:session.questionsAsked,outerGuardrail:session.outerGuardrail});
  if (stop.stop) { session.incomplete=Boolean(stop.incomplete); return {type:'finish',stop,states}; }
  if (!session.triaged && needsTriage(session.concernIds)) return {type:'triage',question:buildTriageQuestion(session.concernIds,session.labels),states};
  if (needsRetriage(states,session.concernIds.length)) return {type:'triage',question:buildTriageQuestion(states.filter(s=>!s.memberImportance).map(s=>s.concernId),session.labels),states,reason:'re-triage'};
  const candidates=eligibleQuestions(session.questionBank.filter(q=>!session.asked.includes(q.id)),states,session.observationLog).map(q=>({...q,eligible:true}));
  const decision=selectNextQuestion({candidates,states});
  if (decision.type==='question') { session.asked=[...session.asked,decision.question.id]; session.questionsAsked++; }
  return {...decision,states};
}

export function markTriaged(session) { session.triaged=true; return session; }

export function buildPlan(session,maxPlanSize=3) {
  return selectPlanConcerns(deriveStates(session),maxPlanSize);
}
