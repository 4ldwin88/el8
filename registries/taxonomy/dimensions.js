// Canonical EL8 dimension registry.
// Drive-controlled dimension IDs are authoritative.

export const TAXONOMY_VERSION = '2026-08-30.1';

export const DIMENSION_IDS = Object.freeze([
  'physical',
  'emotional',
  'social',
  'spiritual',
  'intellectual',
  'occupational',
  'financial',
  'environmental',
]);

const LABELS = Object.freeze({
  physical: 'Physical',
  emotional: 'Emotional',
  social: 'Social',
  spiritual: 'Spiritual',
  intellectual: 'Intellectual',
  occupational: 'Occupational',
  financial: 'Financial',
  environmental: 'Environmental',
});

export const DIMENSIONS = Object.freeze(
  DIMENSION_IDS.map(id => Object.freeze({ id, label: LABELS[id] })),
);

export const DIMENSION_BY_ID = Object.freeze(
  Object.fromEntries(DIMENSIONS.map(item => [item.id, item])),
);

export function isDimensionId(value) {
  return Object.hasOwn(DIMENSION_BY_ID, value);
}
