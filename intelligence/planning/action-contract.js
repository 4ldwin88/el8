export const ACTION_CONTRACT_VERSION='2.0.0';
export const ACTION_ID_PATTERN=/^ACT\d{6}$/;
export const ACTION_SCOPES=Object.freeze(['construct','plan']);
export const ACTION_STATUSES=Object.freeze(['active','provisional','deferred','retired','unsupported_experimental']);

export function assertGovernedActionId(id){if(typeof id!=='string'||!ACTION_ID_PATTERN.test(id))throw new Error(`non-governed Action ID: ${id}`);return id}
export const assertCanonicalActionId=assertGovernedActionId;
export const CANONICAL_ACTION_ID_PATTERN=ACTION_ID_PATTERN;

const arr=(v,n)=>{if(!Array.isArray(v))throw new Error(`${n} must be array`);return [...new Set(v)]};
const obj=(v,n)=>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error(`${n} must be object`);return v};
const str=(v,n)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${n} required`);return v};

export function createActionDefinition(input){
 obj(input,'Action');assertGovernedActionId(input.actionId);str(input.name,'name');
 const actionScope=input.actionScope??'construct';if(!ACTION_SCOPES.includes(actionScope))throw new Error(`invalid actionScope: ${actionScope}`);
 const status=input.status??'provisional';if(!ACTION_STATUSES.includes(status))throw new Error(`invalid Action status: ${status}`);
 const constructIds=arr(input.constructIds??[],'constructIds');
 if(actionScope==='construct'&&!constructIds.length)throw new Error('construct-scoped Action requires at least one governed construct');
 if(actionScope==='plan'&&constructIds.length)throw new Error('plan-scoped Action must not masquerade as a construct intervention');
 const measurement=obj(input.measurement,'measurement');
 return Object.freeze({...input,contractVersion:ACTION_CONTRACT_VERSION,actionId:input.actionId,name:input.name,status,actionScope,constructIds,dimensionIds:arr(input.dimensionIds??[],'dimensionIds'),eligibility:Object.freeze({...obj(input.eligibility??{},'eligibility'),minimumEvidenceRefs:arr(input.eligibility?.minimumEvidenceRefs??[],'minimumEvidenceRefs')}),exclusions:Object.freeze({...obj(input.exclusions??{},'exclusions'),contraindications:arr(input.exclusions?.contraindications??[],'contraindications')}),burden:Object.freeze({...obj(input.burden??{},'burden')}),measurement:Object.freeze({...measurement}),review:Object.freeze({...obj(input.review??{},'review'),allowedDispositions:arr(input.review?.allowedDispositions??[],'allowedDispositions')}),stopReconsider:arr(input.stopReconsider??[],'stopReconsider'),evidenceSourceIds:arr(input.evidenceSourceIds??[],'evidenceSourceIds')});
}
export function validateActionDefinition(action){createActionDefinition(action);return true;}
