import BANK,{observationsForAnswer} from './question-bank-adapter.js';
import {createRound3Session,appendObservation,nextRound3Step,markTriaged,buildPlan,deriveStates} from './round3-controller.js';

const CONCERNS=[...new Set(BANK.flatMap(q=>q.concernIds??[]).filter(Boolean))];
export function session(options={}){return createRound3Session({concernIds:options.concernIds??CONCERNS,questionBank:options.questionBank??BANK,labels:options.labels??{},outerGuardrail:options.outerGuardrail??14})}
export function next(s){return nextRound3Step(s)}
export function answer(s,question,answerIds){for(const o of observationsForAnswer(question,answerIds))appendObservation(s,o);return s}
export function triage(s,importanceByConcern={}){const now=Date.now();for(const[concernId,value]of Object.entries(importanceByConcern))appendObservation(s,{id:`triage:${concernId}:${now}`,questionId:'TRIAGE',concernId,answerValue:value,specificityLevel:0,timestamp:now,effects:Object.freeze([{type:'importance',target:concernId,value,sourceType:'direct',temporality:'current'}])});markTriaged(s);return s}
export function trace(s){return {version:s.version,questionsAsked:s.questionsAsked,asked:[...s.asked],triaged:s.triaged,incomplete:s.incomplete,states:deriveStates(s),plan:buildPlan(s),observations:[...s.observationLog]}}
export {BANK};
export default {BANK,session,next,answer,triage,trace};
