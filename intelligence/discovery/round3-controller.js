import {deriveAllConcernStates} from './concern-projection.js';
import {eligibleQuestions} from './question-eligibility.js';
import {selectNextQuestion} from './question-scheduler.js';
import {needsTriage, buildTriageQuestion} from './triage.js';
import {stoppingDecision} from './sufficiency.js';
import {selectPlanConcerns} from './plan-priority.js';

export function createRound3Session({concernIds=[], questionBank=[], labels={}, outerGuardrail=14}={}) {
  return {version:'round-3', observationLog:[], concernIds:[...concernIds], questionBank, labels, asked:[], questionsAsked:0, outerGuardrail, phase:concernIds.length?'discovery':'gateway', triaged:false, incomplete:false, resolutionStates:{}, driverKnown:{}, recoveryAttempts:{}, priorityResolutionUsed:false};
}
export function activateConcerns(session, concernIds=[]) {session.concernIds=[...new Set([...session.concernIds,...concernIds.filter(Boolean)])];for(const id of concernIds)if(!session.resolutionStates[id])session.resolutionStates[id]='triaged';session.phase='discovery';return session;}
export function appendObservation(session, observation) {session.observationLog=Object.freeze([...session.observationLog,observation]);if(observation.concernId&&!session.concernIds.includes(observation.concernId))activateConcerns(session,[observation.concernId]);return session;}
export function deriveStates(session) {return deriveAllConcernStates(session.observationLog,session.concernIds).map(s=>({...s,resolutionState:session.resolutionStates?.[s.concernId]??'triaged',driverKnown:session.driverKnown?.[s.concernId]??false}));}
function gatewayQuestion(session){return session.questionBank.find(q=>q.role==='gateway'&&!session.asked.includes(q.id));}
function unresolved(states){return states.filter(s=>!s.excluded&&!['sufficient','resolved','deferred'].includes(s.resolutionState));}
function recoveryCandidates(session,states){const open=unresolved(states).sort((a,b)=>(b.safetyEscalationLevel??0)-(a.safetyEscalationLevel??0)||(b.memberImportanceRank??0)-(a.memberImportanceRank??0)||(b.evidenceConfidence??0)-(a.evidenceConfidence??0));for(const state of open){if((session.recoveryAttempts[state.concernId]??0)>=1)continue;const candidates=session.questionBank.filter(q=>q.role!=='gateway'&&!session.asked.includes(q.id)&&q.concernId===state.concernId&&(!q.prerequisite||q.prerequisite(state,session.observationLog))).sort((a,b)=>(b.specificityLevel??0)-(a.specificityLevel??0));if(candidates.length){session.recoveryAttempts[state.concernId]=(session.recoveryAttempts[state.concernId]??0)+1;return candidates;}}return [];}
export function nextRound3Step(session) {
 if(session.phase==='gateway'&&session.concernIds.length===0){const q=gatewayQuestion(session);if(!q)return{type:'finish',stop:{reason:'no-gateway-question',incomplete:true},states:[]};session.asked=[...session.asked,q.id];session.questionsAsked++;return{type:'question',question:q,reason:'gateway',states:[]};}
 const states=deriveStates(session);const stop=stoppingDecision({states,questionsAsked:session.questionsAsked,outerGuardrail:session.outerGuardrail});if(stop.stop){session.incomplete=Boolean(stop.incomplete);return{type:'finish',stop,states};}
 // Importance is intentionally a single member-input pass. Newly inferred concerns are investigated
 // through evidence questions and remain visible at the final priority gate; Discovery must not ask
 // the member to re-rank the same concern mid-session.
 if(!session.triaged&&needsTriage(session.concernIds))return{type:'triage',question:buildTriageQuestion(session.concernIds,session.labels),states};
 let candidates=eligibleQuestions(session.questionBank.filter(q=>q.role!=='gateway'&&!session.asked.includes(q.id)),states,session.observationLog).map(q=>({...q,eligible:true}));let recovery=false;
 if(!candidates.length){candidates=recoveryCandidates(session,states).map(q=>({...q,eligible:true}));recovery=Boolean(candidates.length);}
 if(!candidates.length){session.incomplete=true;return{type:'finish',stop:{reason:'question-bank-exhausted',incomplete:true},states};}
 const recentQuestions=session.asked.map(id=>session.questionBank.find(q=>q.id===id)).filter(Boolean);const decision=selectNextQuestion({candidates,states,recentQuestions});if(decision.type==='question'){session.asked=[...session.asked,decision.question.id];session.questionsAsked++;return{...decision,reason:recovery?'specificity-recovery':decision.reason,states};}
 session.incomplete=true;return{type:'finish',stop:{reason:'scheduler-exhausted',incomplete:true},states};
}
export function markTriaged(session){session.triaged=true;return session;}
export function setResolution(session,concernId,resolutionState,{driverKnown}={}){session.resolutionStates[concernId]=resolutionState;if(driverKnown!==undefined)session.driverKnown[concernId]=Boolean(driverKnown);return session;}
// Kept for backward compatibility with stored round-3 sessions. Final member priority selection now
// belongs exclusively to the Proposed Priorities gate, not to an extra Discovery question.
export function recordPriorityResolution(session,concernIds=[]){const chosen=[...new Set(concernIds)].filter(id=>session.concernIds.includes(id)).slice(0,2);session.priorityChoices=chosen;return session;}
export function buildPlan(session,maxPlanSize=3){return selectPlanConcerns(deriveStates(session),maxPlanSize);}
