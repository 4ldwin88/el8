// Canonical EL8 Intelligence taxonomy shell.
// Dimension IDs are locked. Legacy subdimensions are migration candidates until individually reviewed.

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

export const DIMENSION_BY_ID = Object.freeze(
  Object.fromEntries(DIMENSIONS.map((dimension) => [dimension.id, dimension])),
);

// Historical subdimension vocabulary currently under review. This is deliberately
// not exported as canonical taxonomy until each term is reconciled with current
// Discovery concern/driver semantics and approved domain documentation.
export const LEGACY_SUBDIMENSION_CANDIDATES = Object.freeze({
  physical: ['Sleep', 'Energy', 'Movement', 'Nutrition', 'MedicalHealth', 'SubstanceExposure'],
  emotional: ['Mood', 'Stress', 'Regulation', 'Resilience', 'SelfPerception', 'Manageability'],
  social: ['Connection', 'Support', 'Belonging', 'RelationshipQuality', 'Isolation'],
  spiritual: ['Meaning', 'Purpose', 'ValuesAlignment', 'InnerPeace', 'Practice'],
  intellectual: ['Focus', 'Clarity', 'Learning', 'Curiosity', 'CognitiveLoad', 'DecisionCapacity'],
  occupational: ['EmploymentStability', 'Workload', 'Satisfaction', 'Direction', 'Development', 'IncomeStability'],
  financial: ['IncomeAdequacy', 'ExpenseLoad', 'DebtBurden', 'Liquidity', 'Security', 'FinancialControl'],
  environmental: ['Safety', 'Stability', 'Comfort', 'Organization', 'Access', 'EnvironmentalStress'],
});

export function isDimensionId(value) {
  return Object.hasOwn(DIMENSION_BY_ID, value);
}
