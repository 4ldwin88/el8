// Canonical EL8 Prioritization.
// Answers one question only: among Discovery-established problems, what matters most now?
// Discovery owns sufficiency. Planning owns intervention feasibility.

export const PRIORITIZATION_SCHEMA_VERSION = '1.0.0';
const LEVELS=Object.freeze(['low','moderate','high','very-high']);
const LEVEL_RANK=Object.freeze(Object.fromEntries(LEVELS.map((level,index)=>[level,index])));
function factorFor(factors,problemId,key){
  const value=factors?.[problemId]?.[key]??factors?.[key]?.[problemId];
  if(value==null)return null;
  if(typeof value==='boolean')return value?'present':'absent';
  if(typeof value!=='string')throw new Error(`Prioritization factor ${key} must be qualitative`);
  const normalized=value.trim().toLowerCase();
  if(LEVELS.includes(normalized)||['present','absent'].includes(normalized))return normalized;
  throw new Error(`Invalid prioritization factor ${key}: ${value}`);
}
function decisionProfile(candidate,factors={}){
  return{
    memberImportance:factorFor(factors,candidate.problemId,'memberImportance'),
    urgency:factorFor(factors,candidate.problemId,'urgency'),
    materiality:factorFor(factors,candidate.problemId,'materiality'),
    leverage:factorFor(factors,candidate.problemId,'leverage'),
    readiness:factorFor(factors,candidate.problemId,'readiness'),
  };
}
function rank(value){if(value==null)return null;if(value==='present')return 1;if(value==='absent')return 0;return LEVEL_RANK[value]??null}
function compareProfiles(a,b){
  for(const key of ['urgency','materiality','memberImportance','leverage','readiness']){
    const av=rank(a.profile[key]),bv=rank(b.profile[key]);
    // Missing evidence is unknown, not neutral or negative. Only compare a factor when
    // Discovery established that factor for both candidates.
    if(av==null||bv==null)continue;
    const difference=bv-av;if(difference!==0)return difference;
  }
  return a.candidate.problemId.localeCompare(b.candidate.problemId);
}
function rationaleCodes(profile){
  const codes=['discovery_supported'];
  if(['high','very-high','present'].includes(profile.memberImportance))codes.push('member_importance');
  if(['high','very-high','present'].includes(profile.urgency))codes.push('high_urgency');
  if(['high','very-high','present'].includes(profile.materiality))codes.push('high_materiality');
  if(['high','very-high','present'].includes(profile.leverage))codes.push('shared_driver_leverage');
  if(['high','very-high','present'].includes(profile.readiness))codes.push('member_readiness');
  return codes;
}
export function prioritizeCandidates(input,{safetyDisposition=null,decisionFactors={},now=new Date().toISOString()}={}){
  if(!input||!Number.isInteger(input.memberStateRevision))throw new Error('canonical prioritization input is required');
  if(!Array.isArray(input.candidates))throw new Error('input.candidates is required');
  const blocked=['pause_ordinary_flow','escalate'].includes(safetyDisposition?.disposition);
  if(blocked)return{schemaVersion:PRIORITIZATION_SCHEMA_VERSION,memberStateRevision:input.memberStateRevision,createdAt:now,blockedBySafety:true,priorityItems:[],alternatives:[],rationaleCodes:['safety_override']};
  const ranked=input.candidates.map(candidate=>({candidate,profile:decisionProfile(candidate,decisionFactors)})).sort(compareProfiles);
  const priorityItems=ranked.map(({candidate,profile},index)=>({priorityId:`priority:${candidate.problemId.replace(/^problem:/,'')}`,rank:index+1,problemId:candidate.problemId,evidenceRefs:[...(candidate.evidenceRefs||[])],rationaleCodes:rationaleCodes(profile),decisionFactors:profile}));
  return{schemaVersion:PRIORITIZATION_SCHEMA_VERSION,memberStateRevision:input.memberStateRevision,createdAt:now,blockedBySafety:false,priorityItems,alternatives:priorityItems.slice(1),rationaleCodes:['priority_policy']};
}
