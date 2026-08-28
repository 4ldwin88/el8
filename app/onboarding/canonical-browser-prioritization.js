import { prioritizeCandidates } from '../../intelligence/prioritization/prioritization.js';
import {canonicalMemberProblemId} from './canonical-problem-map.js';

const clamp01=value=>Math.max(0,Math.min(1,Number(value)||0));
const normalizedImportance=value=>value==null?null:typeof value==='number'?clamp01(value/3):({low:.25,moderate:.5,high:.75,'very-high':1}[value]??null);
const labelFromId=id=>String(id||'').replace(/^problem:/,'').replaceAll('_',' ');

export function canonicalPrioritizationInputFromBrowser(memberState){
  if(!memberState||!Number.isInteger(memberState.revision))throw new Error('canonical Member State is required');
  const candidates=(memberState.problems||[]).filter(problem=>problem.status==='SUPPORTED').map(problem=>({problemId:problem.id,evidenceRefs:[...(problem.evidenceRefs||[])],confidence:problem.confidence??null,temporality:problem.temporality||'unknown'}));
  return{memberStateRevision:memberState.revision,supportedProblemIds:candidates.map(x=>x.problemId),candidates};
}

export function prioritizationDecisionFactorsFromDiscovery(discoveryOutput={}){
  const factors={};
  for(const row of discoveryOutput?.trace?.states||[]){
    const id=canonicalMemberProblemId(row.problemId||row.concernId||row.sourceConcernId||row.id);if(!id)continue;
    const factor={};
    const importance=normalizedImportance(row.memberImportance);if(importance!==null)factor.memberImportance=importance;
    const evidenceRaw=row.evidenceConfidence??row.confidence;if(evidenceRaw!==null&&evidenceRaw!==undefined)factor.materiality=clamp01(evidenceRaw);
    if(row.urgent===true||row.safetyRelevant===true)factor.urgency=1;
    const leverageRaw=row.leverage??row.crossDimensionalLeverage;if(leverageRaw!==null&&leverageRaw!==undefined)factor.leverage=clamp01(leverageRaw);
    if(row.memberSelected===true)factor.readiness=1;
    if(Object.keys(factor).length)factors[id]={...(factors[id]||{}),...factor};
  }
  return factors;
}

export function buildCanonicalBrowserPriorities({memberState,discoveryOutput=null,decisionFactors=null}){
  const input=canonicalPrioritizationInputFromBrowser(memberState),factors=decisionFactors||prioritizationDecisionFactorsFromDiscovery(discoveryOutput||{}),safetyDisposition=memberState?.safety?.disposition==='ORDINARY_FLOW'?null:memberState?.safety||null;
  const result=prioritizeCandidates(input,{safetyDisposition,decisionFactors:factors});
  return{input,result,decisionFactors:factors,candidates:result.priorityItems.map((item,index)=>({concernId:item.problemId,problemId:item.problemId,label:labelFromId(item.problemId),evidenceRefs:item.evidenceRefs,evidenceConfidence:item.decisionFactors?.materiality??null,recommended:index===0,memberEmphasized:(item.decisionFactors?.memberImportance??0)>=.7,rationaleCodes:item.rationaleCodes,rank:item.rank}))};
}
