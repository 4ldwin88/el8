// Canonical pre-stable Intelligence version registry.
// Increment a component by 0.01 for substantive compatible changes.
// v1.00 is reserved for a stable contract/maturity milestone.
export const INTELLIGENCE_VERSION='v0.01';
export const ENGINE_VERSIONS=Object.freeze({
  discovery:'v0.01',
  prioritization:'v0.01',
  planning:'v0.01',
  review:'v0.01',
  safety:'v0.01',
  state:'v0.01',
  tracking:'v0.01',
  outcomes:'v0.01',
  presentation:'v0.01'
});
export function intelligenceVersionManifest(){return Object.freeze({intelligence:INTELLIGENCE_VERSION,engines:{...ENGINE_VERSIONS}})}
