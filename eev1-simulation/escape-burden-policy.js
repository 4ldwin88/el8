import { ESCAPE_CODES } from './response-reason-contract.js';

export const ESCAPE_POLICY=Object.freeze({maxConsecutiveUnsure:2,maxConsecutiveEscapes:3,maxClarificationAttempts:1});

export function routeEscape({escapeCode,consecutiveUnsure=0,consecutiveEscapes=0,clarificationAttempts=0,safetyPending=false}={}){
 if(!ESCAPE_CODES.includes(escapeCode))throw new Error('invalid-escape-code');
 if(safetyPending)return Object.freeze({route:'SAFETY_REVIEW',createsEvidence:false,penalty:false});
 if(escapeCode==='PREFER_NOT_TO_ANSWER')return Object.freeze({route:'RESPECT_AND_MOVE_ON',createsEvidence:false,penalty:false});
 if(escapeCode==='SKIP_FOR_NOW')return Object.freeze({route:'DEFER_QUESTION',createsEvidence:false,penalty:false});
 if(escapeCode==='NONE_FIT')return Object.freeze({route:clarificationAttempts<ESCAPE_POLICY.maxClarificationAttempts?'ONE_NEUTRAL_CLARIFICATION':'MOVE_ON_UNRESOLVED',createsEvidence:false,penalty:false});
 const nextUnsure=consecutiveUnsure+1,nextEscapes=consecutiveEscapes+1;
 if(nextUnsure>=ESCAPE_POLICY.maxConsecutiveUnsure||nextEscapes>=ESCAPE_POLICY.maxConsecutiveEscapes)return Object.freeze({route:'STOP_CLARIFYING_UNRESOLVED',createsEvidence:false,penalty:false});
 return Object.freeze({route:'ONE_NEUTRAL_CLARIFICATION',createsEvidence:false,penalty:false});
}

export function normalizeBurden({units,memberReportedBurden}={}){
 const base=Math.max(1,Math.min(3,Number(units)||1));
 if(memberReportedBurden==='TOO_HIGH')return Object.freeze({units:3,memberOverride:true});
 if(memberReportedBurden==='LOWER_THAN_EXPECTED')return Object.freeze({units:Math.max(1,base-1),memberOverride:true});
 return Object.freeze({units:base,memberOverride:false});
}

export function canAddInitialAction({currentBurden=0,actionBurden=1,cap=3,duplicate=false,safetyBlocked=false}={}){
 if(safetyBlocked)return Object.freeze({allowed:false,reason:'SAFETY_BLOCK'});
 if(duplicate)return Object.freeze({allowed:false,reason:'DUPLICATE_ACTION'});
 if(currentBurden+actionBurden>cap)return Object.freeze({allowed:false,reason:'INITIAL_BURDEN_CAP'});
 return Object.freeze({allowed:true,reason:null});
}
