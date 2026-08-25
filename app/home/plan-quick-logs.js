// Temporary adapter that derives Track shortcuts from the current Active Plan.
// This deliberately avoids exposing a permanent catalog when the plan does not require it.

const DEFINITIONS = Object.freeze({
  water: { key: 'water', label: 'Water' },
  hydration: { key: 'water', label: 'Water' },
  sleep: { key: 'sleep', label: 'Sleep' },
  mood: { key: 'mood', label: 'Mood' },
  emotional: { key: 'mood', label: 'Mood' },
  energy: { key: 'energy', label: 'Energy' },
  weight: { key: 'weight', label: 'Weight' }
});

function textOf(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(textOf).join(' ');
  if (typeof value === 'object') return Object.values(value).map(textOf).join(' ');
  return String(value);
}

export function derivePlanQuickLogs(plan, { onSelect } = {}) {
  if (!plan) return [];
  const haystack = textOf({
    focus: plan.focus || plan.priorities || plan.focus_dimensions,
    interventions: plan.interventions || plan.actions,
    evidence: plan.evidence_requirements || plan.evidence || plan.tracking_requirements
  }).toLowerCase();

  const found = [];
  const seen = new Set();
  for (const [term, definition] of Object.entries(DEFINITIONS)) {
    if (!haystack.includes(term) || seen.has(definition.key)) continue;
    seen.add(definition.key);
    found.push({ ...definition, onSelect });
  }
  return found;
}
