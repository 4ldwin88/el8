// Governed lifecycle for durable member context that may materially change later.
// Estimated dates trigger confirmation; they never auto-resolve a modifier.
export const CONTEXT_MODIFIER_STATUS=Object.freeze({ACTIVE:'ACTIVE',REVIEW_DUE:'REVIEW_DUE',RESOLVED:'RESOLVED',SUPERSEDED:'SUPERSEDED'});
const STATUS=new Set(Object.values(CONTEXT_MODIFIER_STATUS));
const str=(v,n)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${n} required`);return v};
const iso=(v,n,{nullable=false}={})=>{if(v==null&&nullable)return null;str(v,n);if(Number.isNaN(Date.parse(v)))throw new Error(`${n} must be an ISO date/time`);return v};
export function createContextModifier({modifierId,type,value=true,status=CONTEXT_MODIFIER_STATUS.ACTIVE,sourceType,sourceRef,knownSince=null,expectedReviewAt=null,expectedEndAt=null,lastConfirmedAt=null,recordedAt=new Date().toISOString(),materialToPlanning=true,supersedesModifierId=null}={}){
 str(modifierId,'modifierId');str(type,'modifier type');str(sourceType,'modifier sourceType');str(sourceRef,'modifier sourceRef');if(!STATUS.has(status))throw new Error(`invalid context modifier status: ${status}`);iso(recordedAt,'recordedAt');iso(knownSince,'knownSince',{nullable:true});iso(expectedReviewAt,'expectedReviewAt',{nullable:true});iso(expectedEndAt,'expectedEndAt',{nullable:true});iso(lastConfirmedAt,'lastConfirmedAt',{nullable:true});
 if([CONTEXT_MODIFIER_STATUS.RESOLVED,CONTEXT_MODIFIER_STATUS.SUPERSEDED].includes(status)&&!lastConfirmedAt)throw new Error(`${status} context modifier requires confirmation timing`);
 return Object.freeze({modifierId,type,value,status,sourceType,sourceRef,knownSince,expectedReviewAt,expectedEndAt,lastConfirmedAt,recordedAt,materialToPlanning:Boolean(materialToPlanning),supersedesModifierId});
}
export function reviewAtForModifier(modifier){return modifier.expectedReviewAt??modifier.expectedEndAt??null}
export function contextModifierReviewSchedule(modifiers,{now=new Date().toISOString()}={}){
 iso(now,'now');const items=Array.isArray(modifiers)?modifiers:Object.values(modifiers??{});return items.filter(x=>x&&[CONTEXT_MODIFIER_STATUS.ACTIVE,CONTEXT_MODIFIER_STATUS.REVIEW_DUE].includes(x.status)).map(x=>{const reviewAt=reviewAtForModifier(x);const due=Boolean(reviewAt&&Date.parse(reviewAt)<=Date.parse(now));return Object.freeze({modifierId:x.modifierId,reviewAt,status:due?CONTEXT_MODIFIER_STATUS.REVIEW_DUE:x.status,followUpRequired:due,promptIntent:due?'confirm_context_modifier_status':null});}).filter(x=>x.reviewAt).sort((a,b)=>Date.parse(a.reviewAt)-Date.parse(b.reviewAt));
}
export function markContextModifierReviewDue(modifier,{now=new Date().toISOString()}={}){const schedule=contextModifierReviewSchedule([modifier],{now})[0];if(!schedule?.followUpRequired)return modifier;return Object.freeze({...modifier,status:CONTEXT_MODIFIER_STATUS.REVIEW_DUE});}
export function confirmContextModifier(modifier,{stillApplies,replacement=null,confirmedAt=new Date().toISOString()}={}){
 iso(confirmedAt,'confirmedAt');if(typeof stillApplies!=='boolean')throw new Error('stillApplies must be boolean');if(!STATUS.has(modifier?.status))throw new Error('valid context modifier required');
 if(stillApplies)return Object.freeze({...modifier,status:CONTEXT_MODIFIER_STATUS.ACTIVE,lastConfirmedAt:confirmedAt,expectedReviewAt:replacement?.expectedReviewAt??modifier.expectedReviewAt,expectedEndAt:replacement?.expectedEndAt??modifier.expectedEndAt,value:replacement?.value??modifier.value});
 return Object.freeze({...modifier,status:replacement?CONTEXT_MODIFIER_STATUS.SUPERSEDED:CONTEXT_MODIFIER_STATUS.RESOLVED,lastConfirmedAt:confirmedAt,supersededByModifierId:replacement?.modifierId??null});
}
export function activeContextModifierRefs(modifiers){const items=Array.isArray(modifiers)?modifiers:Object.values(modifiers??{});return items.filter(x=>x&&[CONTEXT_MODIFIER_STATUS.ACTIVE,CONTEXT_MODIFIER_STATUS.REVIEW_DUE].includes(x.status)&&x.materialToPlanning!==false).map(x=>`context_modifier:${x.modifierId}`)}
