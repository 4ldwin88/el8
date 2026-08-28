import { prioritizeCandidates } from '../../intelligence/prioritization/prioritization.js';

const labelFromId=id=>String(id||'').replace(/^problem:/,'').replaceAll('_',' ');

export function canonicalPrioritizationInputFromBrowser(memberState){
  if(!memberState||!Number.isInteger(memberState.revision))throw new Error('canonical Member State is required');
  const candidates=(memberState.problems||[]).filter(problem=>problem.status==='SUPPORTED').map(problem=>({problemId:problem.id,evidenceRefs:[...(problem.evidenceRefs||[])],confidence:problem.confidence??null,temporality:problem.temporality||'unknown'}));
  return{memberStateRevision:memberState.revision,supportedProblemIds:candidates.map(x=>x.problemId),candidates};
}

export function buildCanonicalBrowserPriorities({memberState,decisionFactors={}}){
  const input=canonicalPrioritizationInputFromBrowser(memberState);
  const result=prioritizeCandidates(input,{safetyDisposition:{disposition:memberState?.safety?.disposition==='ORDINARY_FLOW'?null:memberState?.safety?.disposition},decisionFactors});
  return{input,result,candidates:result.priorityItems.map((item,index)=>({concernId:item.problemId,problemId:item.problemId,label:labelFromId(item.problemId),evidenceRefs:item.evidenceRefs,evidenceConfidence:item.decisionFactors?.materiality??null,recommended:index===0,memberEmphasized:(item.decisionFactors?.memberImportance??0)>=.7,rationaleCodes:item.rationaleCodes,rank:item.rank}))};
}
