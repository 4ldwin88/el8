// Canonical EL8 Intelligence taxonomy for the current vertical-slice milestone.
// Dimensions and topics are domain vocabulary. Concerns are versioned semantic hypotheses.

export const TAXONOMY_VERSION = '1.0.0';

export const DIMENSIONS = Object.freeze([
  { id: 'physical', label: 'Physical' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'social', label: 'Social' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'intellectual', label: 'Intellectual' },
  { id: 'occupational', label: 'Occupational' },
  { id: 'financial', label: 'Financial' },
  { id: 'environmental', label: 'Environmental' },
]);

export const DIMENSION_BY_ID = Object.freeze(Object.fromEntries(DIMENSIONS.map(dimension => [dimension.id, dimension])));
const topic = (id, dimensionId, label) => Object.freeze({ id, dimensionId, label });

// Canonical topic vocabulary. Legacy subdimensions were reconciled here as vocabulary only;
// their numeric state/averaging model is intentionally not migrated.
export const TOPICS = Object.freeze([
  topic('physical.sleep', 'physical', 'Sleep'),
  topic('physical.energy', 'physical', 'Energy'),
  topic('physical.movement', 'physical', 'Movement'),
  topic('physical.nutrition', 'physical', 'Nutrition'),
  topic('physical.health', 'physical', 'Physical health'),
  topic('physical.substance_exposure', 'physical', 'Substance exposure'),

  topic('emotional.mood', 'emotional', 'Mood'),
  topic('emotional.stress', 'emotional', 'Stress'),
  topic('emotional.regulation', 'emotional', 'Emotional regulation'),
  topic('emotional.resilience', 'emotional', 'Resilience'),
  topic('emotional.self_perception', 'emotional', 'Self-perception'),
  topic('emotional.manageability', 'emotional', 'Manageability'),

  topic('social.connection', 'social', 'Connection'),
  topic('social.support', 'social', 'Support'),
  topic('social.belonging', 'social', 'Belonging'),
  topic('social.relationship_quality', 'social', 'Relationship quality'),
  topic('social.isolation', 'social', 'Isolation'),

  topic('spiritual.meaning', 'spiritual', 'Meaning'),
  topic('spiritual.purpose', 'spiritual', 'Purpose'),
  topic('spiritual.values_alignment', 'spiritual', 'Values alignment'),
  topic('spiritual.inner_peace', 'spiritual', 'Inner peace'),
  topic('spiritual.practice', 'spiritual', 'Practice'),

  topic('intellectual.focus', 'intellectual', 'Focus'),
  topic('intellectual.clarity', 'intellectual', 'Clarity'),
  topic('intellectual.learning', 'intellectual', 'Learning'),
  topic('intellectual.curiosity', 'intellectual', 'Curiosity'),
  topic('intellectual.cognitive_load', 'intellectual', 'Cognitive load'),
  topic('intellectual.decision_capacity', 'intellectual', 'Decision capacity'),
  topic('intellectual.activation', 'intellectual', 'Activation and follow-through'),

  topic('occupational.employment_stability', 'occupational', 'Employment stability'),
  topic('occupational.workload', 'occupational', 'Workload'),
  topic('occupational.satisfaction', 'occupational', 'Work satisfaction'),
  topic('occupational.direction', 'occupational', 'Work direction'),
  topic('occupational.development', 'occupational', 'Development'),
  topic('occupational.income_stability', 'occupational', 'Income stability'),
  topic('occupational.schedule', 'occupational', 'Work and schedule stability'),

  topic('financial.income_adequacy', 'financial', 'Income adequacy'),
  topic('financial.expense_load', 'financial', 'Expense load'),
  topic('financial.debt_burden', 'financial', 'Debt burden'),
  topic('financial.liquidity', 'financial', 'Liquidity'),
  topic('financial.security', 'financial', 'Financial security'),
  topic('financial.control', 'financial', 'Financial control'),

  topic('environmental.safety', 'environmental', 'Environmental safety'),
  topic('environmental.stability', 'environmental', 'Home and environmental stability'),
  topic('environmental.comfort', 'environmental', 'Comfort'),
  topic('environmental.organization', 'environmental', 'Organization'),
  topic('environmental.access', 'environmental', 'Access'),
  topic('environmental.stress', 'environmental', 'Environmental stress'),
]);

export const TOPIC_BY_ID = Object.freeze(Object.fromEntries(TOPICS.map(item => [item.id, item])));
const concern = (id, dimensionId, topicIds, label) => Object.freeze({ id, dimensionId, topicIds: Object.freeze([...topicIds]), label });

export const CONCERNS = Object.freeze([
  concern('poor_sleep', 'physical', ['physical.sleep'], 'Sleep difficulty'),
  concern('low_energy', 'physical', ['physical.energy'], 'Low energy'),
  concern('low_activity', 'physical', ['physical.movement'], 'Low activity'),
  concern('physical_condition', 'physical', ['physical.health'], 'Physical condition concern'),
  concern('stress', 'emotional', ['emotional.stress'], 'Stress or emotional strain'),
  concern('relationship_strain', 'social', ['social.relationship_quality'], 'Relationship strain'),
  concern('low_support', 'social', ['social.support'], 'Low support'),
  concern('lonely', 'social', ['social.isolation', 'social.connection', 'social.belonging'], 'Loneliness or isolation'),
  concern('low_focus', 'intellectual', ['intellectual.focus', 'intellectual.clarity'], 'Low focus or clarity'),
  concern('low_activation', 'intellectual', ['intellectual.activation'], 'Low activation or follow-through'),
  concern('work_instability', 'occupational', ['occupational.employment_stability'], 'Work or employment instability'),
  concern('schedule_disruption', 'occupational', ['occupational.schedule'], 'Schedule disruption'),
  concern('money_pressure', 'financial', ['financial.income_adequacy', 'financial.expense_load', 'financial.debt_burden', 'financial.liquidity', 'financial.security', 'financial.control'], 'Money pressure'),
  concern('home_instability', 'environmental', ['environmental.stability', 'environmental.stress'], 'Home or environmental instability'),
  concern('lack_direction', 'spiritual', ['spiritual.meaning', 'spiritual.purpose'], 'Lack of direction or purpose'),
]);

export const CONCERN_BY_ID = Object.freeze(Object.fromEntries(CONCERNS.map(item => [item.id, item])));
export function isDimensionId(value) { return Object.hasOwn(DIMENSION_BY_ID, value); }
export function isTopicId(value) { return Object.hasOwn(TOPIC_BY_ID, value); }
export function isConcernId(value) { return Object.hasOwn(CONCERN_BY_ID, value); }

export function validateTaxonomy() {
  const errors = [];
  const topicIds = new Set();
  const concernIds = new Set();
  for (const item of TOPICS) {
    if (topicIds.has(item.id)) errors.push(`duplicate topic id: ${item.id}`);
    topicIds.add(item.id);
    if (!isDimensionId(item.dimensionId)) errors.push(`invalid topic dimension: ${item.id}`);
  }
  for (const item of CONCERNS) {
    if (concernIds.has(item.id)) errors.push(`duplicate concern id: ${item.id}`);
    concernIds.add(item.id);
    if (!isDimensionId(item.dimensionId)) errors.push(`invalid concern dimension: ${item.id}`);
    for (const topicId of item.topicIds) if (!isTopicId(topicId)) errors.push(`unknown concern topic ${topicId}: ${item.id}`);
  }
  return errors;
}
