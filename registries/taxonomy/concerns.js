// Canonical EL8 construct registry.
// Historical "concern" IDs are not decision authority; this manifest filename
// exposes the governed constructs used by Member State and Intelligence.

import { DIMENSION_IDS, isDimensionId } from './dimensions.js';

export const CONSTRUCT_IDS = Object.freeze([
  'EMOTIONAL_STATE','PRESSURE_PATTERN','SLEEP_QUALITY','ENERGY_FUNCTION','LONELINESS',
  'JOB_SECURITY','FINANCIAL_STRAIN','FINANCIAL_CONTROL','ENVIRONMENTAL_SUPPORT','MEANING_PURPOSE',
  'COGNITIVE_ENGAGEMENT','RELATIONSHIP_STRAIN','SUPPORT_AVAILABILITY','PHYSICAL_CONDITION','ACTIVITY_LEVEL',
  'FOCUS_FUNCTION','ACTIVATION','SCHEDULE_DISRUPTION','BODY_WEIGHT_CONCERN','VALUES_CLARITY',
  'NEXT_STEP_CLARITY','DIRECTION_CLARITY',
]);

const construct = (id, dimensionIds, label, options = {}) => Object.freeze({
  id,
  dimensionIds: Object.freeze([...dimensionIds]),
  label,
  experimental: Boolean(options.experimental),
});

export const CONSTRUCTS = Object.freeze([
  construct('EMOTIONAL_STATE',['emotional'],'Emotional state'),
  construct('PRESSURE_PATTERN',['emotional'],'Pressure / stress pattern'),
  construct('SLEEP_QUALITY',['physical'],'Sleep quality / restoration'),
  construct('ENERGY_FUNCTION',['physical'],'Energy / physical functioning'),
  construct('LONELINESS',['social'],'Loneliness / belonging'),
  construct('JOB_SECURITY',['occupational'],'Work / income security'),
  construct('FINANCIAL_STRAIN',['financial'],'Financial strain'),
  construct('FINANCIAL_CONTROL',['financial'],'Financial control / agency'),
  construct('ENVIRONMENTAL_SUPPORT',['environmental'],'Environmental support'),
  construct('MEANING_PURPOSE',['spiritual'],'Meaning / purpose'),
  construct('COGNITIVE_ENGAGEMENT',['intellectual'],'Cognitive engagement',{experimental:true}),
  construct('RELATIONSHIP_STRAIN',['social'],'Relationship strain'),
  construct('SUPPORT_AVAILABILITY',['social'],'Support availability / adequacy'),
  construct('PHYSICAL_CONDITION',['physical'],'Physical condition / health burden'),
  construct('ACTIVITY_LEVEL',['physical'],'Physical activity / movement level'),
  construct('FOCUS_FUNCTION',['intellectual'],'Focus / attention functioning'),
  construct('ACTIVATION',['intellectual'],'Action initiation / activation'),
  construct('SCHEDULE_DISRUPTION',['occupational'],'Schedule / routine disruption'),
  construct('BODY_WEIGHT_CONCERN',['physical'],'Body / weight concern'),
  construct('VALUES_CLARITY',['spiritual'],'Values clarity'),
  construct('NEXT_STEP_CLARITY',['intellectual','occupational'],'Next-step clarity'),
  construct('DIRECTION_CLARITY',['spiritual','occupational'],'Direction clarity'),
]);

export const CONSTRUCT_BY_ID = Object.freeze(
  Object.fromEntries(CONSTRUCTS.map(item => [item.id, item])),
);

export function isConstructId(value) {
  return Object.hasOwn(CONSTRUCT_BY_ID, value);
}

export function validateConstructRegistry() {
  const errors = [];
  const ids = new Set();
  for (const item of CONSTRUCTS) {
    if (ids.has(item.id)) errors.push(`duplicate construct id: ${item.id}`);
    ids.add(item.id);
    for (const dimensionId of item.dimensionIds) {
      if (!isDimensionId(dimensionId)) errors.push(`invalid construct dimension ${dimensionId}: ${item.id}`);
    }
  }
  for (const id of CONSTRUCT_IDS) if (!ids.has(id)) errors.push(`missing canonical construct: ${id}`);
  for (const dimensionId of DIMENSION_IDS) {
    if (!CONSTRUCTS.some(item => item.dimensionIds.includes(dimensionId))) errors.push(`dimension has no canonical construct: ${dimensionId}`);
  }
  return errors;
}
