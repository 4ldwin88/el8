import LEGACY_BANK from '../discovery-v2-6-question-bank.js';
import {makeObservation} from './contracts.js';

const CONCERN_ALIAS=Object.freeze({
 money_pressure:'money',work_instability:'work',poor_sleep:'sleep',low_energy:'energy',low_activity:'energy',physical_condition:'energy',low_activation:'energy',stress:'stress',relationship_strain:'relationships',low_support:'support',lonely:'support',home_instability:'home',low_focus:'focus',lack_direction:'direction',schedule_disruption:'work'
});

function concernForTarget(target){return CONCERN_ALIAS[target]??target}
function specificityForRole(role){return role==='gateway'?0:role==='concern-scope'?1:role==='confirmation'?2:role==='discriminator'?2:role==='driver-discriminator'?3:role==='bridge'?2:1}
function evidenceEffect(target,value){return {type:'evidence',target:concernForTarget(target),polarity:value>0?'supports':value<0?'contradicts':'neutral',strength:Math.min(1,Math.abs(value)),certainty:Math.abs(value)>=.9?'definitive':'graded',sourceType:'direct',temporality:'current'}}

export function adaptQuestion(q){
 const mappedTargets=[...new Set((q.targets??[]).map(concernForTarget))];
 return {...q,concernId:mappedTargets[0]??null,concernIds:mappedTargets,specificityLevel:specificityForRole(q.role)};
}
export const ROUND3_BANK=Object.freeze(LEGACY_BANK.map(adaptQuestion));

export function observationsForAnswer(question,answerIds,{timestamp=Date.now()}={}){
 const ids=Array.isArray(answerIds)?answerIds:[answerIds];
 const out=[];
 for(const answerId of ids){
  const option=question.options?.find(o=>o.id===answerId); if(!option)continue;
  const effects=Object.entries(option.effects??{}).filter(([target])=>!target.startsWith('__')).map(([target,value])=>evidenceEffect(target,value));
  const concerns=[...new Set(effects.map(e=>e.target))];
  if(!concerns.length){out.push(makeObservation({id:`${question.id}:${answerId}:${timestamp}`,questionId:question.id,concernId:question.concernId,answerValue:answerId,specificityLevel:question.specificityLevel,timestamp,effects:[]}));continue}
  for(const concernId of concerns)out.push(makeObservation({id:`${question.id}:${answerId}:${concernId}:${timestamp}`,questionId:question.id,concernId,answerValue:answerId,specificityLevel:question.specificityLevel,timestamp,effects:effects.filter(e=>e.target===concernId)}));
 }
 return out;
}

export default ROUND3_BANK;
