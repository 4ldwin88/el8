// Canonical Baseline -> Discovery handoff.
// Baseline identifies broad human-readable pressure points and known topics. Discovery
// investigates only what remains unresolved: diagnosis, causality, feasibility and fit.
export const DIMENSION_CONCERN_MAP=Object.freeze({Physical:['health','sleep','energy'],Emotional:['stress'],Intellectual:['focus','direction'],Social:['relationships','support'],Spiritual:['direction'],Occupational:['work'],Financial:['money'],Environmental:['home']});
const ATTENTION=new Set(['Struggling','Needs attention']);
const POSITIVE=new Set(['Going well','Very strong']);
export function buildBaselineDiscoveryHandoff(derived={}){
 const direct=Array.isArray(derived.candidate_concerns)?derived.candidate_concerns.filter(Boolean):[];
 const emphasis=derived.concern_emphasis||{},priorityConcerns=Array.isArray(derived.member_priority_concerns)?derived.member_priority_concerns.filter(Boolean):[];
 const topics=Array.isArray(derived.concern_topics)?derived.concern_topics.filter(x=>x?.concernId&&x?.topic):[];
 const conditions=derived.condition_baseline||{},impact=(derived.functional_impact||[])[0]||null,worsening=(derived.worsening||[])[0]||null,priority=derived.member_priority||null,constraints=Array.isArray(derived.constraints)?derived.constraints:derived.constraints?[derived.constraints]:[];
 const dimensionSignals=Object.entries(conditions).map(([dimension,condition])=>Object.freeze({dimension,condition,attention:ATTENTION.has(condition),positive:POSITIVE.has(condition),candidateConcerns:DIMENSION_CONCERN_MAP[dimension]||[]}));
 const explicitDimensions=[impact,worsening,priority].filter(x=>x&&DIMENSION_CONCERN_MAP[x]),candidateDimensions=[...new Set([...dimensionSignals.filter(x=>x.attention).map(x=>x.dimension),...explicitDimensions])],mapped=[...new Set(candidateDimensions.flatMap(d=>DIMENSION_CONCERN_MAP[d]||[]))],candidateConcerns=[...new Set(direct.length?direct:mapped)];
 return Object.freeze({version:'baseline-discovery-handoff-v3.2',candidateDimensions,candidateConcerns,signals:Object.freeze({dimensionSignals,impact,worsening,priority,priorityConcerns:Object.freeze([...priorityConcerns]),concernEmphasis:Object.freeze({...emphasis}),concernTopics:Object.freeze(topics.map(x=>Object.freeze({...x}))),feasibility:derived.feasibility||{},constraints:Object.freeze(constraints),overallChange:derived.overall_change||null}),uncertainty:Object.freeze({broadDimensionMapping:!direct.length,requiresDiscoveryConfirmation:candidateConcerns.length>0})})
}
