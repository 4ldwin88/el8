// Canonical Baseline -> Discovery handoff.
// Baseline supplies observations, member-stated drivers/supports and plan constraints.
// Discovery owns causal investigation and concern resolution. Dimension mapping is retained only
// as a compatibility fallback for older completed Baselines; new MVP Baselines are signal-native.
export const DIMENSION_CONCERN_MAP=Object.freeze({Physical:['health','sleep','energy'],Emotional:['stress'],Intellectual:['focus','direction'],Social:['relationships','support'],Spiritual:['direction'],Occupational:['work'],Financial:['money'],Environmental:['home']});
const ATTENTION=new Set(['Struggling','Needs attention']);
const POSITIVE=new Set(['Going well','Very strong']);
const uniq=xs=>[...new Set(xs.filter(Boolean))];
export function buildBaselineDiscoveryHandoff(derived={}){
 const direct=Array.isArray(derived.candidate_concerns)?derived.candidate_concerns.filter(Boolean):[];
 const indicators=derived.indicator_signals&&typeof derived.indicator_signals==='object'?derived.indicator_signals:{};
 const indicatorSignals=Object.entries(indicators).map(([id,s])=>Object.freeze({id,label:s?.label||id,value:Number(s?.value)||null,concerns:Object.freeze([...(s?.concerns||[])]),dimension:s?.dimension||null}));
 const lowIndicatorConcerns=indicatorSignals.filter(s=>s.value!=null&&s.value<=2).flatMap(s=>s.concerns);
 const priorityConcerns=Array.isArray(derived.member_priority_concerns)?derived.member_priority_concerns.filter(Boolean):[];
 const topics=Array.isArray(derived.concern_topics)?derived.concern_topics.filter(x=>x?.concernId&&x?.topic):[];
 const constraints=Array.isArray(derived.constraints)?derived.constraints:derived.constraints?[derived.constraints]:[];
 const supports=Array.isArray(derived.baseline_summary?.supports)?derived.baseline_summary.supports.filter(Boolean):[];
 const drivers=Array.isArray(derived.baseline_summary?.drivers)?derived.baseline_summary.drivers.filter(Boolean):[];
 // Compatibility fallback only. It must not expand a signal-native Baseline into every concern in a dimension.
 const conditions=derived.condition_baseline||{},impact=(derived.functional_impact||[])[0]||null,worsening=(derived.worsening||[])[0]||null,priority=derived.member_priority||null;
 const dimensionSignals=Object.entries(conditions).map(([dimension,condition])=>Object.freeze({dimension,condition,attention:ATTENTION.has(condition),positive:POSITIVE.has(condition),candidateConcerns:DIMENSION_CONCERN_MAP[dimension]||[]}));
 const explicitDimensions=[impact,worsening,priority].filter(x=>x&&DIMENSION_CONCERN_MAP[x]);
 const candidateDimensions=uniq([...dimensionSignals.filter(x=>x.attention).map(x=>x.dimension),...explicitDimensions]);
 const legacyMapped=uniq(candidateDimensions.flatMap(d=>DIMENSION_CONCERN_MAP[d]||[]));
 const signalNative=direct.length>0||indicatorSignals.length>0||topics.length>0;
 const candidateConcerns=uniq(signalNative?[...direct,...lowIndicatorConcerns,...priorityConcerns,...topics.map(x=>x.concernId)]:legacyMapped);
 return Object.freeze({
  version:'baseline-discovery-handoff-v4-signal-native',
  candidateDimensions:Object.freeze(candidateDimensions),
  candidateConcerns:Object.freeze(candidateConcerns),
  signals:Object.freeze({
   indicatorSignals:Object.freeze(indicatorSignals),
   drivers:Object.freeze([...drivers]),supports:Object.freeze([...supports]),
   priorityConcerns:Object.freeze([...priorityConcerns]),
   concernTopics:Object.freeze(topics.map(x=>Object.freeze({...x}))),
   feasibility:Object.freeze({...derived.feasibility}),constraints:Object.freeze([...constraints]),
   legacy:Object.freeze({dimensionSignals:Object.freeze(dimensionSignals),impact,worsening,priority,overallChange:derived.overall_change||null})
  }),
  uncertainty:Object.freeze({source:signalNative?'signal-native':'legacy-dimension-fallback',requiresDiscoveryConfirmation:candidateConcerns.length>0})
 })
}
