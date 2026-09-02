import {validateMemberStateShape} from './member-state-contract.js';
import {createContextModifier} from './context-modifier-lifecycle.js';

export function applyContextModifierToMemberState(state,payload,{source='discovery',at=new Date().toISOString(),expectedRevision}={}){
 const errors=validateMemberStateShape(state);if(errors.length)throw new Error(`invalid canonical Member State: ${errors.join('; ')}`);if(expectedRevision!==state.revision)throw new Error(`Member State revision conflict: expected ${expectedRevision}, actual ${state.revision}`);if(typeof source!=='string'||!source.trim())throw new Error('transition source required');
 const modifier=createContextModifier({...payload,recordedAt:payload.recordedAt??at});const next=structuredClone(state);const modifiers={...(next.memberContext.contextModifiers??{})};const prior=modifiers[modifier.modifierId]??null;modifiers[modifier.modifierId]=structuredClone(modifier);next.memberContext={...next.memberContext,contextModifiers:modifiers};
 const materialChange=modifier.materialToPlanning!==false&&(!prior||prior.status!==modifier.status||JSON.stringify(prior.value)!==JSON.stringify(modifier.value));if(materialChange&&next.activePlanRef){next.activePlanRef={...next.activePlanRef,reconciliationRequired:true,reconciliation:{reason:'CONTEXT_MODIFIER_CHANGED',modifierId:modifier.modifierId,modifierType:modifier.type,status:modifier.status,at}};}
 next.revision=state.revision+1;next.updatedAt=at;next.historyRefs=[...new Set([...(next.historyRefs??[]),`${next.revision}:CONTEXT_MODIFIER_UPDATED:${source}`])];const after=validateMemberStateShape(next);if(after.length)throw new Error(`invalid canonical Member State: ${after.join('; ')}`);return next;
}
