import { normalizeCondition } from './condition-model.js';

export const CONDITION_BANDS = ['Attention', 'Stable', 'Healthy', 'Thriving'];

export function conditionFromAssessment(dimension, assessment = {}) {
  const source = {
    ...(assessment.responses || {}),
    ...(assessment.derived_outputs || {})
  };
  return normalizeCondition(
    source?.condition_baseline?.[dimension] ||
    source?.life?.[dimension] ||
    source?.conditions?.[dimension] ||
    source?.dimension_conditions?.[dimension] ||
    source?.[dimension]
  );
}

export function buildDimensionHistory(dimension, sessions = []) {
  const completed = sessions.filter(session => session?.status === 'completed');
  const baseline = completed.find(session => session.module_type === 'universal_baseline');
  const history = [];
  const baselineCondition = baseline ? conditionFromAssessment(dimension, baseline) : 'No data';

  if (baselineCondition !== 'No data') {
    history.push({
      type: 'baseline',
      label: 'Baseline',
      condition: baselineCondition,
      date: baseline.submitted_at || baseline.completed_at || null
    });
  }

  completed
    .filter(session => session !== baseline && ['reassessment', 'monthly_reassessment', 'universal_reassessment'].includes(session.module_type))
    .forEach(session => {
      const condition = conditionFromAssessment(dimension, session);
      if (condition === 'No data') return;
      history.push({
        type: 'reassessment',
        label: session.submitted_at || session.completed_at || 'Reassessment',
        condition,
        date: session.submitted_at || session.completed_at || null
      });
    });

  return history;
}

export function summarizeDimensionHistory(history = []) {
  const baseline = history.find(item => item.type === 'baseline')?.condition || null;
  const current = history.at(-1)?.condition || baseline;
  const firstIndex = CONDITION_BANDS.indexOf(baseline);
  const currentIndex = CONDITION_BANDS.indexOf(current);
  let trajectory = 'unclear';
  if (firstIndex >= 0 && currentIndex >= 0) {
    trajectory = currentIndex > firstIndex ? 'improving' : currentIndex < firstIndex ? 'declining' : 'steady';
  }
  return { baseline, current, trajectory };
}
