// Canonical Discovery question selection.
// Internal ranking values are ephemeral selection mechanics only: they are never Member State or wellness scores.

const DEFAULT_BURDEN_BUDGET = 12;
const clamp01 = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

function questionTargets(question) {
  return new Set((question.effects ?? []).filter(effect => effect.type === 'evidence').map(effect => effect.target));
}

function unanswered(question, answeredQuestionIds) {
  return !answeredQuestionIds.has(question.id);
}

function dependenciesMet(question, answeredQuestionIds) {
  const deps = question.dependsOn ?? question.dependencies ?? [];
  return deps.every(id => answeredQuestionIds.has(id));
}

function triggerMatches(question, context) {
  if (!question.trigger) return true;
  if (typeof question.trigger === 'function') return Boolean(question.trigger(context));
  const required = Array.isArray(question.trigger) ? question.trigger : [question.trigger];
  return required.every(trigger => context.triggers?.has(trigger));
}

function burdenOf(question) {
  return Number.isFinite(question.burden) ? Math.max(0, question.burden) : 1;
}

function concernNeed(concern) {
  if (!concern) return 0.5;
  if (concern.status === 'unknown') return 1;
  if (concern.status === 'candidate' || concern.sufficiency === 'insufficient') return 0.9;
  if (concern.status === 'active' && concern.sufficiency === 'sufficient') return 0.25;
  if (concern.status === 'excluded' || concern.status === 'resolved') return 0;
  return 0.5;
}

function redundancyPenalty(question, answeredQuestions) {
  const targets = questionTargets(question);
  if (!targets.size) return 0;
  const overlap = answeredQuestions.filter(answered => {
    const answeredTargets = questionTargets(answered);
    return [...targets].some(target => answeredTargets.has(target));
  }).length;
  return Math.min(0.75, overlap * 0.15);
}

export function rankDiscoveryQuestions({
  questions,
  memberState,
  answeredQuestionIds = [],
  answeredQuestions = [],
  burdenUsed = 0,
  burdenBudget = DEFAULT_BURDEN_BUDGET,
  capacity = 1,
  triggers = [],
} = {}) {
  if (!Array.isArray(questions)) throw new Error('questions is required');
  const answered = new Set(answeredQuestionIds);
  const triggerSet = new Set(triggers);
  const remainingBudget = Math.max(0, burdenBudget - burdenUsed);
  const capacityFactor = clamp01(capacity);

  return questions
    .filter(question => unanswered(question, answered))
    .filter(question => dependenciesMet(question, answered))
    .filter(question => triggerMatches(question, { memberState, answeredQuestionIds: answered, triggers: triggerSet }))
    .filter(question => burdenOf(question) <= remainingBudget || question.safetyCritical === true)
    .map(question => {
      const targets = [...questionTargets(question)];
      const need = targets.length
        ? Math.max(...targets.map(target => concernNeed(memberState?.concerns?.[target])))
        : 0.25;
      const informationGain = clamp01(Number.isFinite(question.informationGain) ? question.informationGain : need);
      const redundancy = redundancyPenalty(question, answeredQuestions);
      const burden = burdenOf(question);
      const frictionPenalty = burden * (1 - capacityFactor) * 0.15;
      const safetyBoost = question.safetyCritical === true ? 10 : 0;
      const selectionValue = safetyBoost + informationGain - redundancy - frictionPenalty;
      return {
        question,
        selectionValue,
        rationale: {
          targetConcernIds: targets,
          informationGain,
          redundancyPenalty: redundancy,
          frictionPenalty,
          burden,
          safetyCritical: question.safetyCritical === true,
        },
      };
    })
    .sort((a, b) => b.selectionValue - a.selectionValue || a.question.id.localeCompare(b.question.id));
}

export function selectNextDiscoveryQuestion(options = {}) {
  return rankDiscoveryQuestions(options)[0] ?? null;
}
