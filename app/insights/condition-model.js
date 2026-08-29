export const DIMENSIONS = ['Physical', 'Emotional', 'Intellectual', 'Social', 'Spiritual', 'Occupational', 'Financial', 'Environmental'];

// Conditions are qualitative display states. They are not numeric wellness scores.
export const CONDITION_BANDS = Object.freeze(['Attention', 'Stable', 'Healthy', 'Thriving']);

export function normalizeCondition(value) {
  return ({
    'Struggling': 'Attention',
    'Needs attention': 'Attention',
    'Okay': 'Stable',
    'Going well': 'Healthy',
    'Very strong': 'Thriving',
    'Beyond': 'Thriving'
  }[value] || value || 'No data');
}
