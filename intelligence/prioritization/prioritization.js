// Canonical EL8 Prioritization.
// Answers one question only: among Discovery-established canonical constructs,
// what deserves member consideration as Focus now? Discovery owns sufficiency;
// the member owns Focus confirmation; Planning owns intervention feasibility.

import { UNKNOWN, createPriorityCandidate } from '../contracts/canonical-contracts.js';
import { discoveryToPrioritization, prioritizationToFocusConfirmation } from '../contracts/capability-boundaries.js';

export const PRIORITIZATION_SCHEMA_VERSION='2.0.0';
export const PRIORITY_FACTOR_KEYS=Object.freeze(['urgency','materiality','memberImportance','leverage','readiness']);

function clamp01(value){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):UNKNOWN}
function suppliedFactor(decisionFactors,constructId,key){
  const value=decisionFactors?.[constructId]?.[key]??decisionFactors?.[key]?.[constructId];
  return value==null?UNKNOWN:clamp01(value);
}
function profile(candidate,decisionFactors){
  const factors={};
  for(const key of PRIORITY_FACTOR_KEYS){
    const explicit=suppliedFactor(decisionFactors,candidate.constructId,key);
    const candidateValue=candidate.factors?.[key];
    factors[key]=explicit!==UNKNOWN?explicit:(candidateValue==null?UNKNOWN:clamp01(candidateValue));
  }
  return factors;
}
function compareKnownDesc(a,b,key){
  const av=a.profile[key],bv=b.profile[key];
  const ak=av!==UNKNOWN,bk=bv!==UNKNOWN;
  if(ak&&bk&&bv!==av)return bv-av;
  if(ak!==bk)return ak?-1:1; // Known evidence ranks before unknown; unknown is never treated as neutral evidence.
  return 0;
}
function compareProfiles(a,b){
  for(const key of PRIORITY_FACTOR_KEYS){const d=compareKnownDesc(a,b,key);if(d)return d;}
  return a.candidate.constructId.localeCompare(b.candidate.constructId);
}
function rationaleCodes(p){
  const codes=['discovery_supported'];
  if(p.memberImportance!==UNKNOWN&&p.memberImportance>=.7)codes.push('member_importance');
  if(p.urgency!==UNKNOWN&&p.urgency>=.7)codes.push('high_urgency');
  if(p.materiality!==UNKNOWN&&p.materiality>=.7)codes.push('high_materiality');
  if(p.leverage!==UNKNOWN&&p.leverage>=.7)codes.push('shared_contributor_leverage');
  if(p.readiness!==UNKNOWN&&p.readiness>=.7)codes.push('member_readiness');
  if(PRIORITY_FACTOR_KEYS.some(key=>p[key]===UNKNOWN))codes.push('ranking_uncertainty_present');
  return codes;
}

export function prioritizeCandidates(input,{safetyDisposition=null,decisionFactors={},now=new Date().toISOString()}={}){
  // Boundary validation rejects legacy IDs and hypothesis-only candidates.
  const canonicalInput=discoveryToPrioritization(input);
  const blocked=['pause_ordinary_flow','escalate'].includes(safetyDisposition?.disposition??canonicalInput.safetyDisposition);
  if(blocked)return {
    schemaVersion:PRIORITIZATION_SCHEMA_VERSION,memberStateRevision:canonicalInput.memberStateRevision,createdAt:now,
    blockedBySafety:true,recommended:[],alternatives:[],rationaleCodes:['safety_override'],
  };

  const ranked=canonicalInput.candidates.map(candidate=>{
    const p=profile(candidate,decisionFactors);
    return {candidate:createPriorityCandidate({constructId:candidate.constructId,evidenceRefs:candidate.evidenceRefs??[],factors:p,eligibility:'eligible'}),profile:p};
  }).sort(compareProfiles);

  // Prioritization ranks all eligible candidates. It does not impose a Focus-count limit.
  const rankedItems=ranked.map(({candidate,profile:p},index)=>Object.freeze({
    constructId:candidate.constructId,rank:index+1,evidenceRefs:[...candidate.evidenceRefs],factors:p,rationaleCodes:rationaleCodes(p),
  }));
  const boundary=prioritizationToFocusConfirmation({memberStateRevision:canonicalInput.memberStateRevision,recommended:rankedItems,alternatives:[],rationaleRefs:[]});
  return {
    schemaVersion:PRIORITIZATION_SCHEMA_VERSION,memberStateRevision:canonicalInput.memberStateRevision,createdAt:now,
    blockedBySafety:false,recommended:boundary.recommended,alternatives:boundary.alternatives,rationaleCodes:['priority_policy'],
  };
}
