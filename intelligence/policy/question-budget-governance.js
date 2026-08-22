export const MAX_CONFIRMATION_PER_DIMENSION=2;
export const BREADTH_TARGET=4;
export function dimensionQuestionCounts(turns=[]){const out={};for(const t of turns){if(!t.dimension)continue;out[t.dimension]??={confirmation:0,discovery:0,drill:0,total:0};if(out[t.dimension][t.stage]!=null)out[t.dimension][t.stage]++;out[t.dimension].total++}return out}
export function unresolvedDimensions(hypotheses={},turns=[]){const counts=dimensionQuestionCounts(turns);return Object.keys(hypotheses).filter(d=>hypotheses[d]?.state==='candidate'&&(counts[d]?.confirmation||0)>=MAX_CONFIRMATION_PER_DIMENSION)}
export function eligibleCandidates(hypotheses={},turns=[]){const blocked=new Set(unresolvedDimensions(hypotheses,turns));return Object.keys(hypotheses).filter(d=>hypotheses[d]?.state==='candidate'&&!blocked.has(d)).sort((a,b)=>(hypotheses[b]?.confidence||0)-(hypotheses[a]?.confidence||0))}
export function breadthDimensions(turns=[]){return new Set(turns.filter(t=>['confirmation','discovery'].includes(t.stage)&&t.dimension).map(t=>t.dimension))}
export function shouldContinueBreadth(hypotheses={},turns=[]){const screened=breadthDimensions(turns).size,active=Object.values(hypotheses).filter(x=>x?.state==='candidate').length;return screened<BREADTH_TARGET&&(active>0||screened===0)}
export function chooseDiscoveryDimension(dimensions,status={},turns=[]){const counts=dimensionQuestionCounts(turns);return dimensions.filter(d=>!status[d]?.observed).sort((a,b)=>(counts[a]?.total||0)-(counts[b]?.total||0)||dimensions.indexOf(a)-dimensions.indexOf(b))[0]||null}
