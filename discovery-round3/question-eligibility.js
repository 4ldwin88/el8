export function contradictionDetected(concernId, observationLog) {
  const effects = observationLog.flatMap(o => o.effects ?? []).filter(e => e.type === 'evidence' && e.target === concernId && e.polarity !== 'neutral');
  return effects.some(a => effects.some(b => a !== b && a.polarity !== b.polarity));
}

export function isQuestionEligible(question, state, observationLog) {
  if (!question || !state) return false;
  if (typeof question.prerequisite === 'function' && !question.prerequisite(state, observationLog)) return false;
  const frontier = state.specificityFrontier ?? 0;
  const level = question.specificityLevel ?? 0;
  if (level < frontier && !contradictionDetected(state.concernId, observationLog)) return false;
  return true;
}

export function eligibleQuestions(questions, states, observationLog) {
  const byId = new Map(states.map(s => [s.concernId, s]));
  return questions.filter(q => isQuestionEligible(q, byId.get(q.concernId), observationLog));
}
