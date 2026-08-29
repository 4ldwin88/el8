import { prioritizeCandidates } from '../../intelligence/prioritization/prioritization.js';
import {canonicalMemberProblemId} from './canonical-problem-map.js';

const labelFromId=id=>String(id||'').replace(/^problem:/,'').replaceAll('_',' ');
const IMPORTANCE=Object.freeze({1:'low',2:'moderate',3:'high',4:'very-high',low:'low',moderate:'moderate',high:'high','very-high':'very-high'});
const qualitative=value=>typeof value==='string'&&['low','moderate','high','very-high'].includes(value.toLowerCase())?value.toLowerCase():null;
const importance=value=>value==null?null:IMPORTANCE[value]??qualitative(value);

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
    const memberImportance=importance(row.memberImportance);if(memberImportance)factor.memberImportance=memberImportance;
    const materiality=qualitative(row.materiality);if(materiality)factor.materiality=materiality;
    if(row.urgent===true)factor.urgency='present';
    const leverage=qualitative(row.leverage??row.crossDimensionalLeverage);if(leverage)factor.leverage=leverage;
    const readiness=qualitative(row.readiness);if(readiness)factor.readiness=readiness;
    if(Object.keys(factor).length)factors[id]={...(factors[id]||{}),...factor};
  }
  return factors;
}

export function buildCanonicalBrowserPriorities({memberState,discoveryOutput=null,decisionFactors=null}){
  const input=canonicalPrioritizationInputFromBrowser(memberState),factors=decisionFactors||prioritizationDecisionFactorsFromDiscovery(discoveryOutput||{}),safetyDisposition=memberState?.safety?.disposition==='ORDINARY_FLOW'?null:memberState?.safety||null;
  const result=prioritizeCandidates(input,{safetyDisposition,decisionFactors:factors});
  return{input,result,decisionFactors:factors,candidates:result.priorityItems.map((item,index)=>({concernId:item.problemId,problemId:item.problemId,label:labelFromId(item.problemId),evidenceRefs:item.evidenceRefs,recommended:index===0,memberEmphasized:['high','very-high','present'].includes(item.decisionFactors?.memberImportance),rationaleCodes:item.rationaleCodes,rank:item.rank}))};
}
