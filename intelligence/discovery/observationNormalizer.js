import QUESTION_BANK from '../../registries/questions/questionBank.js';
import {ANSWER_BY_ID,ANSWERS_BY_QUESTION} from '../../registries/questions/answerBank.js';
import {makeObservation} from './contracts.js';

const specificityForRole=role=>({general:0,orientation:0,'concern-scope':1,'state-probe':2,'condition-probe':2,'impact-probe':2,'urgency-probe':2,'resilience-probe':2,'control-probe':2,discriminator:2,'driver-discriminator':3,'feasibility-probe':3,'obligation-probe':3,contradiction:2,correction:2,'handoff-validation':1,'healthy-verification':1}[role]??1);
const constructFor=(q,e)=>e.constructId??q.constructId??null;
function runtimeEffect(q,e){const target=constructFor(q,e),base={sourceType:'direct',temporality:'current'};
 if(e.kind==='state')return target?[{type:'evidence',target,polarity:'supports',strength:1,certainty:'definitive',...base,stateValue:e.value}]:[];
 if(e.kind==='negative_facet'||e.kind==='negative_function_evidence')return target?[{type:'evidence',target,polarity:'contradicts',strength:.5,certainty:'graded',...base,cannotEraseState:true,facet:e.key??null,value:e.value??null}]:[];
 if(e.kind==='facet'||e.kind==='functional_impact_context')return target?[{type:'evidence',target,polarity:'supports',strength:.5,certainty:'graded',...base,facet:e.key??null,value:e.value??null}]:[];
 if(e.kind==='planning_constraint')return target?[{type:'constraint',target,value:e.value??e.key,...base}]:[];
 return [];
}
export const DISCOVERY_BANK=Object.freeze(QUESTION_BANK.filter(q=>q.status!=='design-only'&&q.status!=='deferred').map(q=>Object.freeze({...q,responseMode:q.responseType??'single',options:Object.freeze((ANSWERS_BY_QUESTION[q.id]??[]).map(x=>Object.freeze({id:x.id,text:x.text,status:x.status??'active'}))),specificityLevel:specificityForRole(q.role)})));
export function normalizeAnswerIds(question,answerIds){let ids=[...new Set((Array.isArray(answerIds)?answerIds:[answerIds]).filter(Boolean))].filter(id=>ANSWER_BY_ID[id]?.parentId===question.id);if(question.responseMode!=='multi'&&ids.length>1)ids=ids.slice(0,1);return ids;}
export function observationsForAnswer(question,answerIds,{timestamp=Date.now()}={}){return normalizeAnswerIds(question,answerIds).map(answerId=>{const answer=ANSWER_BY_ID[answerId],effects=runtimeEffect(question,answer.effect);return makeObservation({id:`${question.id}:${answerId}:${timestamp}`,questionId:question.id,constructId:constructFor(question,answer.effect),answerValue:answerId,specificityLevel:question.specificityLevel??specificityForRole(question.role),timestamp,effects});});}
export default DISCOVERY_BANK;