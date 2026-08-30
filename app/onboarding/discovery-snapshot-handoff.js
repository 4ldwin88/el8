// Discovery opening snapshot -> adaptive Discovery handoff.
// The opening snapshot is evidence collection inside Discovery, not a separate Baseline stage.
const uniq=xs=>[...new Set(xs.filter(Boolean))];
export function buildDiscoverySnapshotHandoff(derived={}){
 const direct=Array.isArray(derived.candidate_concerns)?derived.candidate_concerns.filter(Boolean):[];
 const indicators=derived.indicator_signals&&typeof derived.indicator_signals==='object'?derived.indicator_signals:{};
 const indicatorSignals=Object.entries(indicators).map(([id,s])=>Object.freeze({id,label:s?.label||id,value:Number(s?.value)||null,concerns:Object.freeze([...(s?.concerns||[])]),dimension:s?.dimension||null}));
 const lowIndicatorConcerns=indicatorSignals.filter(s=>s.value!=null&&s.value<=2).flatMap(s=>s.concerns);
 const positiveIndicatorConcerns=new Set(indicatorSignals.filter(s=>s.value!=null&&s.value>=4).flatMap(s=>s.concerns));
 const priorityConcerns=Array.isArray(derived.member_priority_concerns)?derived.member_priority_concerns.filter(Boolean):[];
 const topics=Array.isArray(derived.concern_topics)?derived.concern_topics.filter(x=>x?.concernId&&x?.topic):[];
 const constraints=Array.isArray(derived.constraints)?derived.constraints:derived.constraints?[derived.constraints]:[];
 const supports=Array.isArray(derived.supports)?derived.supports.filter(Boolean):[];
 const drivers=Array.isArray(derived.drivers)?derived.drivers.filter(Boolean):[];
 const explicitConcernSet=new Set([...lowIndicatorConcerns,...priorityConcerns,...topics.map(x=>x.concernId)]);
 const inferredDirect=direct.filter(id=>!positiveIndicatorConcerns.has(id)||explicitConcernSet.has(id));
 const candidateConcerns=uniq([...inferredDirect,...lowIndicatorConcerns,...priorityConcerns,...topics.map(x=>x.concernId)]);
 return Object.freeze({
  version:'discovery-snapshot-handoff-v2',
  candidateConcerns:Object.freeze(candidateConcerns),
  signals:Object.freeze({indicatorSignals:Object.freeze(indicatorSignals),drivers:Object.freeze([...drivers]),supports:Object.freeze([...supports]),priorityConcerns:Object.freeze([...priorityConcerns]),concernTopics:Object.freeze(topics.map(x=>Object.freeze({...x}))),suppressedPositiveConcerns:Object.freeze([...positiveIndicatorConcerns].filter(id=>!explicitConcernSet.has(id))),feasibility:Object.freeze({...derived.feasibility}),constraints:Object.freeze([...constraints])}),
  uncertainty:Object.freeze({source:'signal-native',requiresDiscoveryConfirmation:candidateConcerns.length>0})
 })
}
