// Determines which semantic facts onboarding still needs before a confident package fit can be made.
// This keeps onboarding short: ask only facts that distinguish plausible packages for confirmed priorities.

export const BASELINE_FIT_SCHEMA_VERSION='0.1.0';

function keyOf(rule){return typeof rule==='string'?rule:rule?.semanticKey||null}
function currentKeys(memberState){return new Set(Object.values(memberState?.facts||{}).filter(f=>f.currentStatus==='current').map(f=>f.semanticKey))}
function packageRequirements(pkg){return [...(pkg.eligibilityRules||[]),...(pkg.minimumEvidence||[]),...(pkg.environmentRequirements||[]),...(pkg.equipmentRequirements||[])].map(keyOf).filter(Boolean)}

export function baselineFactsNeededForPriority({memberState,priorityConcernId,planFamilies=[],planPackages=[]}={}){
 const known=currentKeys(memberState);
 const familyIds=new Set(planFamilies.filter(f=>f.targetConcernId===priorityConcernId).map(f=>f.familyId));
 const relevant=planPackages.filter(p=>familyIds.has(p.familyId));
 const required=new Set(relevant.flatMap(packageRequirements));
 return {schemaVersion:BASELINE_FIT_SCHEMA_VERSION,concernId:priorityConcernId,knownFacts:[...known],neededFacts:[...required].filter(k=>!known.has(k)),candidatePackageCodes:relevant.map(p=>p.packageCode)};
}

export function buildBaselineFitAgenda({memberState,prioritization,planFamilies=[],planPackages=[],maxFacts=6}={}){
 if(prioritization?.blockedBySafety)return{schemaVersion:BASELINE_FIT_SCHEMA_VERSION,blockedBySafety:true,items:[]};
 const items=[];
 for(const priority of prioritization?.priorityItems||[]){
  const concern=memberState?.concerns?.[priority.concernId];
  if(!concern?.memberConfirmed)continue;
  const result=baselineFactsNeededForPriority({memberState,priorityConcernId:priority.concernId,planFamilies,planPackages});
  if(result.neededFacts.length)items.push({priorityId:priority.priorityId,concernId:priority.concernId,factKeys:result.neededFacts.slice(0,maxFacts),candidatePackageCodes:result.candidatePackageCodes});
 }
 return{schemaVersion:BASELINE_FIT_SCHEMA_VERSION,blockedBySafety:false,items};
}
