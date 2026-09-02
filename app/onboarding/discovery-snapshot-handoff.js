// Opening evidence snapshot used inside Discovery. It is not a separate onboarding stage.
// Legacy signal-native field names are accepted only at this ingress boundary; output is construct-native.
const uniq=xs=>[...new Set(xs.filter(Boolean))];
export function buildDiscoverySnapshotHandoff(derived={}){
 const direct=Array.isArray(derived.candidate_construct_ids)?derived.candidate_construct_ids.filter(Boolean):Array.isArray(derived.candidate_concerns)?derived.candidate_concerns.filter(Boolean):[];
 const indicators=derived.indicator_signals&&typeof derived.indicator_signals==='object'?derived.indicator_signals:{};
 const indicatorSignals=Object.entries(indicators).map(([id,s])=>Object.freeze({id,label:s?.label||id,value:Number(s?.value)||null,constructIds:Object.freeze([...(s?.constructIds||s?.concerns||[])]),dimension:s?.dimension||null}));
 const lowIndicatorConstructIds=indicatorSignals.filter(s=>s.value!=null&&s.value<=2).flatMap(s=>s.constructIds);
 const positiveIndicatorConstructIds=new Set(indicatorSignals.filter(s=>s.value!=null&&s.value>=4).flatMap(s=>s.constructIds));
 const memberPriorityConstructIds=Array.isArray(derived.member_priority_construct_ids)?derived.member_priority_construct_ids.filter(Boolean):Array.isArray(derived.member_priority_concerns)?derived.member_priority_concerns.filter(Boolean):[];
 const topics=Array.isArray(derived.construct_topics)?derived.construct_topics.filter(x=>x?.constructId&&x?.topic):Array.isArray(derived.concern_topics)?derived.concern_topics.filter(x=>x?.concernId&&x?.topic).map(x=>({constructId:x.concernId,topic:x.topic})):[];
 const constraints=Array.isArray(derived.constraints)?derived.constraints:derived.constraints?[derived.constraints]:[];
 const supports=Array.isArray(derived.supports)?derived.supports.filter(Boolean):[];
 const drivers=Array.isArray(derived.drivers)?derived.drivers.filter(Boolean):[];
 const explicitConstructSet=new Set([...lowIndicatorConstructIds,...memberPriorityConstructIds,...topics.map(x=>x.constructId)]);
 const inferredDirect=direct.filter(id=>!positiveIndicatorConstructIds.has(id)||explicitConstructSet.has(id));
 const candidateConstructIds=uniq([...inferredDirect,...lowIndicatorConstructIds,...memberPriorityConstructIds,...topics.map(x=>x.constructId)]);
 return Object.freeze({
  version:'discovery-opening-evidence-v2',
  candidateConstructIds:Object.freeze(candidateConstructIds),
  signals:Object.freeze({indicatorSignals:Object.freeze(indicatorSignals),drivers:Object.freeze([...drivers]),supports:Object.freeze([...supports]),memberPriorityConstructIds:Object.freeze([...memberPriorityConstructIds]),constructTopics:Object.freeze(topics.map(x=>Object.freeze({...x}))),suppressedPositiveConstructIds:Object.freeze([...positiveIndicatorConstructIds].filter(id=>!explicitConstructSet.has(id))),feasibility:Object.freeze({...derived.feasibility}),constraints:Object.freeze([...constraints])}),
  uncertainty:Object.freeze({source:'signal-native',requiresDiscoveryConfirmation:candidateConstructIds.length>0})
 })
}
