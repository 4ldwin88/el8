// Immutable version/replay contract for EEV1 decision artifacts.
export const VERSIONED_TYPES=Object.freeze(['question','evidenceMapping','action','policy','prompt','model']);

export function makeVersionRef({type,id,version,contentHash,retired=false}={}){
 if(!VERSIONED_TYPES.includes(type))throw new Error('invalid-version-type');
 if(!id||!version||!contentHash)throw new Error('incomplete-version-ref');
 return Object.freeze({type:String(type),id:String(id),version:String(version),contentHash:String(contentHash),retired:Boolean(retired)});
}

export function validateDecisionProvenance(record={}){
 const required=['decisionId','timestamp','policyVersion','versionRefs'];
 const missing=required.filter(k=>record[k]===undefined||record[k]===null);
 const invalidRefs=Array.isArray(record.versionRefs)?record.versionRefs.filter(r=>!r||!VERSIONED_TYPES.includes(r.type)||!r.id||!r.version||!r.contentHash):['versionRefs'];
 return Object.freeze({valid:missing.length===0&&invalidRefs.length===0,missing,invalidRefs});
}

export function selectForNewUse(registry=[],{type,id}={}){
 const matches=registry.filter(r=>r.type===type&&r.id===id&&!r.retired);
 if(matches.length!==1)throw new Error(matches.length===0?'no-active-version':'multiple-active-versions');
 return matches[0];
}

export function resolveForReplay(registry=[],ref={}){
 // Replay uses the exact immutable version/hash even if retired.
 const match=registry.find(r=>r.type===ref.type&&r.id===ref.id&&r.version===ref.version&&r.contentHash===ref.contentHash);
 if(!match)throw new Error('historical-version-unavailable');
 return match;
}

export function migrateDerivedState({events=[],fromPolicyVersion,toPolicyVersion,reducer}={}){
 if(!fromPolicyVersion||!toPolicyVersion||typeof reducer!=='function')throw new Error('invalid-migration-request');
 // Events are not rewritten. Migration creates a new derived projection with explicit provenance.
 const state=events.reduce((s,e)=>reducer(s,e,toPolicyVersion),{});
 return Object.freeze({fromPolicyVersion,toPolicyVersion,eventCount:events.length,state:Object.freeze(state),sourceEventsUnchanged:true});
}
