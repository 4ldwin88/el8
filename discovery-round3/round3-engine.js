import BANK,{observationsForAnswer} from './question-bank-adapter.js';
import {createRound3Session,appendObservation,nextRound3Step,markTriaged,buildPlan,deriveStates,activateConcerns,setResolution} from './round3-controller.js';

export function session(options={}){return createRound3Session({concernIds:options.concernIds??[],questionBank:options.questionBank??BANK,labels:options.labels??{},outerGuardrail:options.outerGuardrail??14})}
export function next(s){return nextRound3Step(s)}
export function answer(s,question,answerIds){
 const ids=Array.isArray(answerIds)?answerIds:[answerIds];
 const observations=observationsForAnswer(question,ids);
 if(question.role==='gateway') activateConcerns(s,[...new Set(observations.flatMap(o=>o.effects??[]).filter(e=>e.type==='evidence'&&e.polarity==='supports').map(e=>e.target))]);
 for(const o of observations){if(question.role==='gateway' && o.concernId && !s.concernIds.includes(o.concernId))continue;appendObservation(s,o)}
 return s;
}
export function triage(s,importanceByConcern={}){const now=Date.now();for(const[concernId,value]of Object.entries(importanceByConcern))appendObservation(s,{id:`triage:${concernId}:${now}`,questionId:'TRIAGE',concernId,answerValue:value,specificityLevel:0,timestamp:now,effects:Object.freeze([{type:'importance',target:concernId,value,sourceType:'direct',temporality:'current'}])});markTriaged(s);return s}
export function resolve(s,concernId,resolutionState,opts={}){return setResolution(s,concernId,resolutionState,opts)}
export function trace(s){return {version:s.version,phase:s.phase,questionsAsked:s.questionsAsked,asked:[...s.asked],activeConcerns:[...s.concernIds],triaged:s.triaged,incomplete:s.incomplete,states:deriveStates(s),plan:buildPlan(s),observations:[...s.observationLog]}}
export {BANK};
export default {BANK,session,next,answer,triage,resolve,trace};
