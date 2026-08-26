export const DIMENSIONS = ['Physical', 'Emotional', 'Intellectual', 'Social', 'Spiritual', 'Occupational', 'Financial', 'Environmental'];

export const CONDITION_VALUE = {
  'Attention': .125,
  'Struggling': .125,
  'Needs attention': .125,
  'Stable': .375,
  'Okay': .375,
  'Healthy': .625,
  'Going well': .625,
  'Thriving': .875,
  'Very strong': .875,
  'Beyond': .875
};

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
