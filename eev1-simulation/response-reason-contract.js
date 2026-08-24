// Typed member-response and decision reason-code contract for EEV1.
export const RESPONSE_MODES=Object.freeze(['SINGLE_SELECT','MULTI_SELECT','BOOLEAN','ORDINAL','NUMBER','TEXT']);
export const ESCAPE_CODES=Object.freeze(['UNSURE','NONE_FIT','PREFER_NOT_TO_ANSWER','SKIP_FOR_NOW']);
export const ACTION_REJECTION_CODES=Object.freeze(['INSUFFICIENT_EVIDENCE','DRIVER_UNRESOLVED','SAFETY_BLOCK','INITIAL_BURDEN_CAP','NO_ELIGIBLE_ACTION','DUPLICATE_ACTION','MEMBER_DECLINED']);
export const NON_ADHERENCE_CODES=Object.freeze(['BURDEN_TOO_HIGH','NOT_RELEVANT','FORGOT','ACCESS_BARRIER','UNCLEAR_ACTION','PRIORITY_CHANGED','SAFETY_OR_HEALTH_BARRIER','OTHER']);
export const ADAPTATION_CODES=Object.freeze(['CONTINUE_EFFECTIVE','MODIFY_BURDEN','MODIFY_CLARITY','REPLACE_IRRELEVANT','REASSESS_OUTCOME_FAILURE','REASSESS_DRIVER','PAUSE_SAFETY','PAUSE_MEMBER_CHOICE']);

export function validateResponse(schema={},response={}){
 const errors=[];
 if(!RESPONSE_MODES.includes(schema.mode))errors.push('invalid-mode');
 if(response.escapeCode!==undefined){if(!ESCAPE_CODES.includes(response.escapeCode))errors.push('invalid-escape-code');else return Object.freeze({valid:errors.length===0,errors,normalized:{escapeCode:response.escapeCode}});}
 const v=response.value;
 switch(schema.mode){
  case 'SINGLE_SELECT':if(typeof v!=='string'||!(schema.options??[]).includes(v))errors.push('invalid-single-select');break;
  case 'MULTI_SELECT':if(!Array.isArray(v)||v.some(x=>!(schema.options??[]).includes(x))||new Set(v).size!==v.length)errors.push('invalid-multi-select');break;
  case 'BOOLEAN':if(typeof v!=='boolean')errors.push('invalid-boolean');break;
  case 'ORDINAL':if(!Number.isInteger(v)||v<(schema.min??1)||v>(schema.max??5))errors.push('invalid-ordinal');break;
  case 'NUMBER':if(typeof v!=='number'||!Number.isFinite(v)||(schema.min!==undefined&&v<schema.min)||(schema.max!==undefined&&v>schema.max))errors.push('invalid-number');break;
  case 'TEXT':if(typeof v!=='string'||v.length>(schema.maxLength??2000))errors.push('invalid-text');break;
 }
 return Object.freeze({valid:errors.length===0,errors,normalized:errors.length?null:{value:v}});
}

export function validateReasonCode(code,set){return Object.freeze({valid:Array.isArray(set)&&set.includes(code),code});}
export function reasonSet(name){
 const sets={actionRejection:ACTION_REJECTION_CODES,nonAdherence:NON_ADHERENCE_CODES,adaptation:ADAPTATION_CODES};
 if(!sets[name])throw new Error('unknown-reason-set');return sets[name];
}
