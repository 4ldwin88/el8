import {deriveAllConstructStates} from './construct-projection.js';
import {isConstructId} from '../../registries/taxonomy/index.js';

function validConstructs(ids=[]){return [...new Set(ids.filter(isConstructId))]}

export function createDiscoverySession({constructIds=[],questionBank=[],labels={},outerGuardrail=null,facts={}}={}){
 return {observationLog:[],facts:{...facts},constructIds:validConstructs(constructIds),questionBank,labels,asked:[],questionsAsked:0,outerGuardrail,phase:'orient',triaged:false,incomplete:false,resolutionStates:{},driverKnown:{},baselineCoverage:{},baselineDriverTriaged:false};
}

export function activateConstructs(session,constructIds=[]){
 session.constructIds=validConstructs([...session.constructIds,...constructIds]);
 for(const id of constructIds)if(isConstructId(id)&&!session.resolutionStates[id])session.resolutionStates[id]='triaged';
 return session;
}

export function appendObservation(session,observation){
 if(observation.constructId&&!isConstructId(observation.constructId))throw new Error(`non-canonical Discovery construct: ${observation.constructId}`);
 session.observationLog=Object.freeze([...session.observationLog,observation]);
 if(observation.constructId&&!session.constructIds.includes(observation.constructId))activateConstructs(session,[observation.constructId]);
 return session;
}

export function mergeFacts(session,facts={}){session.facts={...(session.facts||{}),...facts};return session}

export function deriveStates(session){
 return deriveAllConstructStates(session.observationLog,session.constructIds).map(s=>{
  const resolutionState=session.resolutionStates?.[s.constructId]??'triaged';
  // Conflict changes evidence sufficiency, not the member's Not now decision.
  return {...s,resolutionState:s.sufficiencyBlocked&&resolutionState!=='deferred'?'triaged':resolutionState,driverKnown:session.driverKnown?.[s.constructId]??false};
 });
}

function pendingBaselineQuestions(session){return session.questionBank.filter(q=>q.role==='orientation-baseline'&&!session.asked.includes(q.id)&&!session.baselineCoverage?.[String(q.dimension||'').toUpperCase()])}
function baselineMatrix(session,states=[]){const questions=pendingBaselineQuestions(session);if(!questions.length)return null;session.asked=[...session.asked,...questions.map(q=>q.id)];session.questionsAsked++;return{type:'matrix',interaction:'eight-dimension-baseline-matrix',questions,reason:'eight-area-orientation-snapshot',presentation:{showDimensionLabels:true,memberFacingAsOneInteraction:true,responsive:'stacked-rows-on-narrow-viewports'},states}}
function openingFollowup(session){const legacyId=session.openingPath==='positive'?'GEN100':session.openingPath==='uncertain'?'GEN012':session.openingPath==='unclassified'?'GEN301':null;return legacyId?session.questionBank.find(q=>q.legacyId===legacyId&&!session.asked.includes(q.id)):null}
function baselineNeedsNarrowing(session){return Object.entries(session.baselineCoverage||{}).filter(([,v])=>['mixed','difficult'].includes(v?.state)).map(([dimension])=>dimension)}
function baselineDriverTriage(session){const dimensions=new Set(baselineNeedsNarrowing(session));if(!dimensions.size||session.baselineDriverTriaged)return null;const questions=session.questionBank.filter(q=>q.role==='baseline-discriminator'&&dimensions.has(String(q.dimension||'').toUpperCase())&&!session.asked.includes(q.id));if(!questions.length)return null;session.asked=[...session.asked,...questions.map(q=>q.id)];session.questionsAsked++;session.baselineDriverTriaged=true;return{type:'driver-triage',interaction:'compact-driver-relationship-screen',questions,dimensions:[...dimensions],reason:'orientation-driver-hypothesis-routing',presentation:{memberFacingAsOneInteraction:true,compactWrappingButtons:true,combineOptions:true,canonicalDriverIdentity:true,showDimensionLabels:false},states:[]}}
function ask(session,q,reason,states=[]){session.asked=[...session.asked,q.id];session.questionsAsked++;return{type:'question',question:q,reason,states}}

export function nextOrientationStep(session){
 if(session.phase==='orient'){
  const matrix=baselineMatrix(session,deriveStates(session));
  if(matrix)return matrix;
  session.phase='narrow';
 }
 if(session.phase!=='narrow')return null;
 if(session.constructIds.length===0){
  const driverTriage=baselineDriverTriage(session);if(driverTriage)return driverTriage;
  const dimensions=baselineNeedsNarrowing(session);
  if(dimensions.length&&session.baselineDriverTriaged){session.incomplete=true;return{type:'finish',stop:{reason:'baseline-driver-unresolved',incomplete:true,dimensions},states:[]}}
  const followup=openingFollowup(session);if(followup)return ask(session,followup,`${session.openingPath}-opening-followup`,[]);
  return{type:'finish',stop:{reason:'baseline-complete-no-active-concern',incomplete:false,openingPath:session.openingPath??null},states:[]};
 }
 const driverTriage=baselineDriverTriage(session);if(driverTriage)return driverTriage;
 session.phase='graph';
 return null;
}

export function markTriaged(session){session.triaged=true;return session}
export function setResolution(session,constructId,resolutionState,{driverKnown}={}){if(!isConstructId(constructId))throw new Error(`non-canonical Discovery construct: ${constructId}`);session.resolutionStates[constructId]=resolutionState;if(driverKnown!==undefined)session.driverKnown[constructId]=Boolean(driverKnown);return session}
