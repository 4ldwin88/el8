// Canonical Baseline -> Discovery handoff.
// Baseline provides broad directional signals. Discovery owns concern-level diagnosis.
// Do not infer a specific concern from a broad dimension unless there is an explicit mapping.

export const DIMENSION_CONCERN_MAP=Object.freeze({
  Physical:['health','sleep','energy'],
  Emotional:['stress'],
  Intellectual:['focus','direction'],
  Social:['relationships','support'],
  Spiritual:['direction'],
  Occupational:['work'],
  Financial:['money'],
  Environmental:['home']
});

const ATTENTION=new Set(['Struggling','Needs attention']);
const POSITIVE=new Set(['Going well','Very strong']);

export function buildBaselineDiscoveryHandoff(derived={}){
  const conditions=derived.condition_baseline||{},impact=(derived.functional_impact||[])[0]||null,worsening=(derived.worsening||[])[0]||null,priority=derived.member_priority||null;
  const dimensionSignals=Object.entries(conditions).map(([dimension,condition])=>Object.freeze({dimension,condition,attention:ATTENTION.has(condition),positive:POSITIVE.has(condition),candidateConcerns:DIMENSION_CONCERN_MAP[dimension]||[]}));
  const explicitDimensions=[impact,worsening,priority].filter(x=>x&&DIMENSION_CONCERN_MAP[x]);
  const candidateDimensions=[...new Set([...dimensionSignals.filter(x=>x.attention).map(x=>x.dimension),...explicitDimensions])];
  const candidateConcerns=[...new Set(candidateDimensions.flatMap(d=>DIMENSION_CONCERN_MAP[d]||[]))];
  return Object.freeze({version:'baseline-discovery-handoff-v1',candidateDimensions,candidateConcerns,signals:Object.freeze({dimensionSignals,impact,worsening,priority,feasibility:derived.feasibility||{},constraints:derived.constraints||null,overallChange:derived.overall_change||null}),uncertainty:Object.freeze({broadDimensionMapping:true,requiresDiscoveryConfirmation:candidateConcerns.length>0})});
}
