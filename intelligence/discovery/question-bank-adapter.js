import CANDIDATE_BANK from './questions/index.js';
import {makeObservation} from './contracts.js';

const CONCERN_ALIAS=Object.freeze({money_pressure:'money',work_instability:'work',poor_sleep:'sleep',low_energy:'energy',low_activity:'energy',physical_condition:'health',low_activation:'energy',stress:'stress',relationship_strain:'relationships',low_support:'support',lonely:'support',home_instability:'home',low_focus:'focus',lack_direction:'direction',schedule_disruption:'work'});
const WEAK_IDS=new Set(['other','unsure','not_sure','none','none_fit','unknown']);
function concernForTarget(target){return CONCERN_ALIAS[target]??target}
function specificityForRole(role){return role==='gateway'?0:role==='concern-scope'?1:role==='confirmation'?2:role==='discriminator'?2:role==='driver-discriminator'?3:role==='bridge'?2:role==='feasibility-probe'?3:1}
function responseMode(q){if(q.responseMode)return q.responseMode;if(q.mode==='multi')return'multi';if(q.mode==='scale')return'scale';if(q.mode==='structured')return'structured';return'single'}
function evidenceEffect(target,value){return {type:'evidence',target:concernForTarget(target),polarity:value>0?'supports':value<0?'contradicts':'neutral',strength:Math.min(1,Math.abs(value)),certainty:Math.abs(value)>=.9?'definitive':'graded',sourceType:'direct',temporality:'current'}}
function feasibilityEffects(question,option){
 if(question.role!=='feasibility-probe')return[];
 const target=question.concernId;
 const map={
  time:[{type:'constraint',target,value:'limited_time'},{type:'feasibility',target,feasibility:{scheduleFlexibility:'low'}}],
  cost:[{type:'constraint',target,value:'limited_budget'},{type:'feasibility',target,feasibility:{costSensitivity:'high'}}],
  space:[{type:'constraint',target,value:'limited_space'},{type:'feasibility',target,feasibility:{locationAccess:'limited'}}],
  mobility:[{type:'constraint',target,value:'mobility_accessibility'},{type:'feasibility',target,feasibility:{accessibilityNeeds:true}}],
  accessibility:[{type:'constraint',target,value:'mobility_accessibility'},{type:'feasibility',target,feasibility:{accessibilityNeeds:true}}],
  pain:[{type:'constraint',target,value:'pain_or_symptoms'},{type:'feasibility',target,feasibility:{symptomConstraint:true}}],
  symptoms:[{type:'constraint',target,value:'pain_or_symptoms'},{type:'feasibility',target,feasibility:{symptomConstraint:true}}],
  health_guidance:[{type:'constraint',target,value:'professional_guidance'},{type:'feasibility',target,feasibility:{professionalGuidanceRequired:true}}],
  professional:[{type:'constraint',target,value:'professional_guidance'},{type:'feasibility',target,feasibility:{professionalGuidanceRequired:true}}],
  motivation:[{type:'barrier',target,value:'activation_barrier'},{type:'feasibility',target,feasibility:{activationSupportNeeded:true}}],
  none:[{type:'feasibility',target,feasibility:{reportedConstraint:'none'}}]
 };
 return (map[option.id]??[]).map(e=>({...e,sourceType:'direct',temporality:'current'}));
}
export function adaptQuestion(q){const mappedTargets=[...new Set((q.targets??[]).map(concernForTarget))];const mode=responseMode(q);const options=(q.options??[]).map(o=>({...o,exclusiveWithinGroup:o.exclusiveWithinGroup??(mode==='multi'&&WEAK_IDS.has(o.id))}));return{...q,responseMode:mode,options,concernId:mappedTargets[0]??null,concernIds:mappedTargets,specificityLevel:specificityForRole(q.role)}}
export const ROUND3_BANK=Object.freeze(CANDIDATE_BANK.map(adaptQuestion));
export function normalizeAnswerIds(question,answerIds){let ids=[...new Set((Array.isArray(answerIds)?answerIds:[answerIds]).filter(Boolean))];if(question.responseMode!=='multi'&&ids.length>1)ids=ids.slice(0,1);if(question.responseMode==='multi'){const exclusive=ids.find(id=>question.options?.find(o=>o.id===id)?.exclusiveWithinGroup);if(exclusive)ids=[exclusive]}return ids}
export function observationsForAnswer(question,answerIds,{timestamp=Date.now()}={}){const ids=normalizeAnswerIds(question,answerIds),out=[];for(const answerId of ids){const option=question.options?.find(o=>o.id===answerId);if(!option)continue;const weak=WEAK_IDS.has(answerId)||option.weakAnswer===true;const rawEffects=Object.entries(option.effects??{}).filter(([target])=>!target.startsWith('__'));const evidence=rawEffects.map(([target,value])=>evidenceEffect(target,weak&&value>0?0:value));const fit=feasibilityEffects(question,option);const effects=[...evidence,...fit];const concerns=[...new Set(effects.map(e=>e.target).filter(Boolean))];if(!concerns.length){out.push(makeObservation({id:`${question.id}:${answerId}:${timestamp}`,questionId:question.id,concernId:question.concernId,answerValue:answerId,specificityLevel:question.specificityLevel,timestamp,effects:[]}));continue}for(const concernId of concerns)out.push(makeObservation({id:`${question.id}:${answerId}:${concernId}:${timestamp}`,questionId:question.id,concernId,answerValue:answerId,specificityLevel:question.specificityLevel,timestamp,effects:effects.filter(e=>e.target===concernId)}))}return out}
export default ROUND3_BANK;
