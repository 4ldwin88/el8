export const DEFAULT_TRIAGE_THRESHOLD=3;
export function needsTriage(constructIds,threshold=DEFAULT_TRIAGE_THRESHOLD){return new Set(constructIds).size>threshold}
export function buildTriageQuestion(constructIds,labels={}){const ids=[...new Set(constructIds)];return Object.freeze({id:'TRIAGE_DYNAMIC',type:'impact-matrix',prompt:'How important are these to you right now?',constructs:ids.map(id=>({id,label:labels[id]??id,options:['not-important','somewhat-important','important','very-important']}))})}
export function needsRetriage(states,activeConstructCount,threshold=DEFAULT_TRIAGE_THRESHOLD){if(activeConstructCount<=threshold)return false;return states.some(s=>(s.memberImportance===null||s.memberImportance===undefined)&&!['deferred','nonIssue','escalated'].includes(s.resolutionState))}
