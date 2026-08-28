export function buildBaselineDiscoveryHandoff(derived={}){
  const candidateConcerns=[...new Set(derived.candidate_concerns||[])].filter(Boolean);
  const emphasis=derived.concern_emphasis||{};
  const priorityConcerns=[...new Set(derived.member_priority_concerns||[])].filter(id=>candidateConcerns.includes(id));
  const concernTopics=Array.isArray(derived.concern_topics)?derived.concern_topics:[];
  return Object.freeze({
    candidateConcerns,
    signals:Object.freeze({
      concernEmphasis:Object.freeze({...emphasis}),
      priorityConcerns:Object.freeze(priorityConcerns),
      concernTopics:Object.freeze(concernTopics.map(topic=>Object.freeze({...topic}))),
      overallChange:derived.overall_change??null,
      constraints:Object.freeze([...(derived.constraints||[])]),
      feasibility:Object.freeze({...derived.feasibility})
    })
  });
}
