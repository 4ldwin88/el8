import LEGACY from '../discovery-v2-engine.js';
import {createDecisionState,processResponse,decisionSnapshot} from './decision-path.js';

export function session(warm={}){return {legacy:LEGACY.session(warm),eev1:createDecisionState(),shadowLog:[]};}
export function next(s){return LEGACY.next(s.legacy);}
export function answer(s,qid,rawAnswer){
 const q=LEGACY.BANK.find(x=>x.id===qid);if(!q)throw new Error('Unknown question '+qid);
 const hardened=processResponse(s.eev1,q,rawAnswer);
 if(!hardened.accepted){s.shadowLog.push({qid,accepted:false,errors:hardened.validation.errors});return {accepted:false,errors:hardened.validation.errors};}
 LEGACY.answer(s.legacy,qid,rawAnswer);
 const snap=decisionSnapshot(s.eev1),legacy=LEGACY.trace(s.legacy);
 s.shadowLog.push({qid,accepted:true,legacyActive:[...legacy.active],eev1Eligible:[...snap.eligibleFocusIds]});
 return {accepted:true,legacy,eev1:snap};
}
export function correct(s,id){LEGACY.correct(s.legacy,id);return trace(s);}
export function trace(s){return Object.freeze({legacy:LEGACY.trace(s.legacy),eev1:decisionSnapshot(s.eev1),shadowLog:Object.freeze(s.shadowLog.map(x=>Object.freeze({...x})))});}
export default {session,next,answer,correct,trace};
