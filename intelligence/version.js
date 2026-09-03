// Canonical pre-stable Intelligence version registry.
// Version increments are human-QA driven: increment only when a human-test finding
// requires a substantive Intelligence/engine fix. Ordinary repository work does not
// advance semantic Intelligence versions.
// Increment the affected engine/component by 0.01 for that human-QA fix candidate.
// Increment Intelligence when the human-QA fix materially changes the integrated system.
// v1.00 is reserved for a stable contract/maturity milestone.
export const INTELLIGENCE_VERSION='v0.03';
export const ENGINE_VERSIONS=Object.freeze({
  discovery:'v0.03',
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
