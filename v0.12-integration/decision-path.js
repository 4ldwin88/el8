import {validateResponse} from '../eev1-simulation/response-reason-contract.js';
import {classifyConcern,focusEligibility} from '../eev1-simulation/evidence-engine.js';

const clamp=v=>Math.max(-1,Math.min(1,v));
const qOptions=q=>(q.options??[]).map(o=>o.id);
const responseMode=q=>q.role==='gateway'?'MULTI_SELECT':'SINGLE_SELECT';
const escapeMap={unsure:'UNSURE',later:'SKIP_FOR_NOW',none:'NONE_FIT',nothing:'NONE_FIT'};

export function createDecisionState(){return {effectsByConcern:{},responses:[],invalidResponses:[]};}

export function processResponse(state,question,rawAnswer){
 const ids=Array.isArray(rawAnswer)?rawAnswer:[rawAnswer];
 const singleEscape=ids.length===1?escapeMap[ids[0]]:null;
 const schema={mode:responseMode(question),options:qOptions(question)};
 const response=singleEscape?{escapeCode:singleEscape}:{value:responseMode(question)==='MULTI_SELECT'?ids:ids[0]};
 const validation=validateResponse(schema,response);
 if(!validation.valid){state.invalidResponses.push({questionId:question.id,errors:validation.errors});return {accepted:false,validation};}
 state.responses.push({questionId:question.id,response:validation.normalized});
 if(singleEscape)return {accepted:true,escapeCode:singleEscape,effectsCreated:0};
 let created=0;
 for(const oid of ids){const option=question.options.find(o=>o.id===oid);if(!option)continue;for(const [concern,delta] of Object.entries(option.effects??{})){if(concern==='__opt_out'||!Number.isFinite(delta)||delta===0)continue;const effect=Object.freeze({type:'evidence',polarity:delta>0?'supports':'contradicts',strength:Math.abs(clamp(delta)),sourceType:'direct',certainty:'graded',temporality:'current',observationId:`${question.id}:${oid}:${state.responses.length}`});(state.effectsByConcern[concern]??=[]).push(effect);created++;}}
 return {accepted:true,effectsCreated:created};
}

export function decisionSnapshot(state){
 const concerns=Object.entries(state.effectsByConcern).map(([id,effects])=>{const classified=classifyConcern(effects),eligible=focusEligibility(effects);return Object.freeze({id,state:classified.state,confidence:classified.confidence,eligible:eligible.eligible,effects:Object.freeze([...effects])});}).sort((a,b)=>b.confidence-a.confidence||a.id.localeCompare(b.id));
 return Object.freeze({concerns:Object.freeze(concerns),eligibleFocusIds:Object.freeze(concerns.filter(c=>c.eligible).map(c=>c.id)),responseCount:state.responses.length,invalidResponseCount:state.invalidResponses.length});
}
