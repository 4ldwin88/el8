import { questionRedundantWithFacts, semanticCoverage } from './semantic-question-coverage.js';
import {unresolvedRequiredEvidence} from './sufficiency.js';

export function contradictionDetected(concernId, observationLog) {
  const effects = observationLog.flatMap(o => o.effects ?? []).filter(e => e.type === 'evidence' && e.target === concernId && e.polarity !== 'neutral');
  return effects.some(a => effects.some(b => a !== b && a.polarity !== b.polarity));
}
function knownTopics(state){return new Set(state?.baselineTopics??[])}
function redundantWithBaseline(question,state){const topics=knownTopics(state);if(!topics.size)return false;if(question.id==='W5'&&topics.has('finding_work'))return true;return false}
function unresolvedRequirementIds(state){return new Set(unresolvedRequiredEvidence(state).map(x=>x.id))}
export function addressesUnresolvedRequirement(question,state){const id=question?.sufficiencyRequirement?.id;return Boolean(id&&unresolvedRequirementIds(state).has(id))}
export function isQuestionEligible(question, state, observationLog, facts = {}) {
  if (!question || !state) return false;
  if (questionRedundantWithFacts(question, facts)) return false;
  if (redundantWithBaseline(question,state)) return false;
  if (typeof question.prerequisite === 'function' && !question.prerequisite(state, observationLog)) return false;
  const frontier = state.specificityFrontier ?? 0;
  const level = question.specificityLevel ?? 0;
  if (level < frontier && !addressesUnresolvedRequirement(question,state) && !contradictionDetected(state.concernId, observationLog)) return false;
  return true;
}
export function eligibleQuestions(questions, states, observationLog, facts = {}) {
  const byId = new Map(states.map(s => [s.concernId, s]));
  return questions.filter(q => isQuestionEligible(q, byId.get(q.concernId), observationLog, facts));
}
export function questionCoverage(question, facts = {}) { return semanticCoverage(question, facts); }
