import { prioritizeCandidates } from '../../intelligence/prioritization/prioritization.js';

const PROBLEM_BY_CONCERN=Object.freeze({physical_condition:'problem:low_activity',low_activity:'problem:low_activity',low_energy:'problem:low_activity',poor_sleep:'problem:poor_sleep',money:'problem:financial_strain',money_pressure:'problem:financial_strain',work_pressure:'problem:income_gap',work_instability:'problem:income_gap',low_direction:'problem:execution_gap',lack_direction:'problem:execution_gap',low_focus:'problem:execution_gap',schedule_disruption:'problem:execution_gap',stress:'problem:stress',relationship_strain:'problem:social_disconnection',low_support:'problem:social_disconnection',home_instability:'problem:environment_friction'});
const problemId=id=>PROBLEM_BY_CONCERN[id]||(/^problem:/.test(String(id||''))?id:`problem:${id}`);
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
  for(const row of discoveryOutput?.trace?.states||[]){const id=problemId(row.problemId||row.concernId||row.sourceConcernId||row.id);if(!id)continue;const importance=normalizedImportance(row.memberImportance),evidence=clamp01(row.evidenceConfidence??row.confidence??0);factors[id]={memberImportance:importance??.5,materiality:evidence,urgency:row.urgent||row.safetyRelevant?1:.5,leverage:clamp01(row.leverage??row.crossDimensionalLeverage??.5),readiness:row.memberSelected?1:importance??.5}}
  return factors;
}

export function buildCanonicalBrowserPriorities({memberState,discoveryOutput=null,decisionFactors=null}){
  const input=canonicalPrioritizationInputFromBrowser(memberState),factors=decisionFactors||prioritizationDecisionFactorsFromDiscovery(discoveryOutput||{}),safetyDisposition=memberState?.safety?.disposition==='ORDINARY_FLOW'?null:memberState?.safety||null;
  const result=prioritizeCandidates(input,{safetyDisposition,decisionFactors:factors});
  return{input,result,decisionFactors:factors,candidates:result.priorityItems.map((item,index)=>({concernId:item.problemId,problemId:item.problemId,label:labelFromId(item.problemId),evidenceRefs:item.evidenceRefs,evidenceConfidence:item.decisionFactors?.materiality??null,recommended:index===0,memberEmphasized:(item.decisionFactors?.memberImportance??0)>=.7,rationaleCodes:item.rationaleCodes,rank:item.rank}))};
}
