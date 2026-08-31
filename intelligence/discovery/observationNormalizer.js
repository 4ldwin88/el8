import QUESTION_BANK from '../../registries/questions/questionBank.js';
import {ANSWER_BY_ID,ANSWERS_BY_QUESTION} from '../../registries/questions/answerBank.js';
import {makeObservation} from './contracts.js';

const specificityForRole=role=>({general:0,orientation:0,'concern-scope':1,'state-probe':2,'condition-probe':2,'impact-probe':2,'urgency-probe':2,'resilience-probe':2,'control-probe':2,discriminator:2,'driver-discriminator':3,'feasibility-probe':3,'obligation-probe':3,contradiction:2,correction:2,'handoff-validation':1,'healthy-verification':1}[role]??1);
const constructFor=(q,e)=>e.constructId??q.constructId??null;

// Governed opening routes identify which canonical constructs Discovery should clarify.
// These are routing candidates, not evidence and never change construct severity/state by themselves.
const ROUTE_CONSTRUCTS=Object.freeze({
  Financial:Object.freeze(['FINANCIAL_STRAIN']),
  Occupational:Object.freeze(['JOB_SECURITY','SCHEDULE_DISRUPTION']),
  Environmental:Object.freeze(['ENVIRONMENTAL_INTERFERENCE','HOUSING_STABILITY']),
  PHYSICAL_CONDITION:Object.freeze(['PHYSICAL_CONDITION']),
  ENERGY_FUNCTION:Object.freeze(['ENERGY_FUNCTION']),
  SLEEP_QUALITY:Object.freeze(['SLEEP_QUALITY']),
  PRESSURE_PATTERN:Object.freeze(['PRESSURE_PATTERN']),
  RELATIONSHIP_STRAIN:Object.freeze(['RELATIONSHIP_STRAIN']),
  social_support_loneliness:Object.freeze(['SUPPORT_AVAILABILITY','LONELINESS']),
  focus_activation:Object.freeze(['FOCUS_FUNCTION','ACTIVATION']),
  direction_meaning_next_step:Object.freeze(['DIRECTION_CLARITY','MEANING_PURPOSE','VALUES_CLARITY','NEXT_STEP_CLARITY'])
});

function runtimeEffect(q,e){const target=constructFor(q,e),base={sourceType:'direct',temporality:'current'};
 if(e.kind==='state')return target?[{type:'evidence',target,polarity:'supports',strength:1,certainty:'definitive',...base,stateValue:e.value}]:[];
 if(e.kind==='negative_facet'||e.kind==='negative_function_evidence')return target?[{type:'evidence',target,polarity:'contradicts',strength:.5,certainty:'graded',...base,cannotEraseState:true,facet:e.key??null,value:e.value??null}]:[];
 if(e.kind==='facet'||e.kind==='functional_impact_context')return target?[{type:'evidence',target,polarity:'supports',strength:.5,certainty:'graded',...base,facet:e.key??null,value:e.value??null}]:[];
 if(e.kind==='planning_constraint')return target?[{type:'constraint',target,value:e.value??e.key,...base}]:[];
 return [];
}

export const DISCOVERY_BANK=Object.freeze(QUESTION_BANK.filter(q=>q.status!=='design-only'&&q.status!=='deferred').map(q=>Object.freeze({...q,responseMode:q.responseType??'single',options:Object.freeze((ANSWERS_BY_QUESTION[q.id]??[]).filter(x=>x.status!=='design-only'&&x.runnable!==false).map(x=>Object.freeze({id:x.id,text:x.text,status:x.status??'active'}))),specificityLevel:specificityForRole(q.role)})));

export function normalizeAnswerIds(question,answerIds){let ids=[...new Set((Array.isArray(answerIds)?answerIds:[answerIds]).filter(Boolean))].filter(id=>ANSWER_BY_ID[id]?.parentId===question.id);if(question.responseMode!=='multi'&&ids.length>1)ids=ids.slice(0,1);return ids;}

export function constructsForAnswer(question,answerIds){const ids=normalizeAnswerIds(question,answerIds),constructs=[];for(const id of ids){const effect=ANSWER_BY_ID[id]?.effect;if(!effect)continue;if(effect.kind==='routing_prior'&&effect.route)constructs.push(...(ROUTE_CONSTRUCTS[effect.route]??[]));if(effect.kind==='routing'&&effect.value){const value=String(effect.value);if(value==='body_weight_scope_candidate')constructs.push('BODY_WEIGHT_CONCERN');if(value==='activity_scope_candidate')constructs.push('ACTIVITY_LEVEL');if(value==='physical_symptom_scope_candidate')constructs.push('PHYSICAL_CONDITION');}}
 return [...new Set(constructs)];
}

export function observationsForAnswer(question,answerIds,{timestamp=Date.now()}={}){return normalizeAnswerIds(question,answerIds).map(answerId=>{const answer=ANSWER_BY_ID[answerId],effects=runtimeEffect(question,answer.effect);return makeObservation({id:`${question.id}:${answerId}:${timestamp}`,questionId:question.id,constructId:constructFor(question,answer.effect),answerValue:answerId,specificityLevel:question.specificityLevel??specificityForRole(question.role),timestamp,effects});});}
export default DISCOVERY_BANK;