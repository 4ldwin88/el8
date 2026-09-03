// Canonical pre-stable Intelligence semantic version.
// Version increments are human-QA driven: increment only when a human-test finding
// requires a substantive correction to integrated Intelligence behavior or contract.
// Ordinary repository work, refactoring, tests, documentation, CI, deployment work,
// schema work, and component-internal changes do not independently advance semantic
// versions. Component/engine versions are intentionally not part of the canonical model.
// Build, commit, harness, schema, and deployment identifiers are separate provenance.
// v1.00 is reserved for a deliberate stable-contract/maturity milestone.
export const INTELLIGENCE_VERSION='v0.03';

export function intelligenceVersionManifest(){
  return Object.freeze({intelligence:INTELLIGENCE_VERSION});
}
