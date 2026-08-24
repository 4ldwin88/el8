import {validateResponse} from '../eev1-simulation/response-reason-contract.js';
import {classifyConcern,focusEligibility} from '../eev1-simulation/evidence-engine.js';

// Bridge legacy Discovery fixture outcomes into the hardened v0.12 decision boundary.
// This adapter is intentionally narrow: it does not replace the live UI or mutate v0.11.
const concernEffect=(id,active=true)=>({
 type:'evidence',polarity:active?'supports':'contradicts',strength:active?1:.8,
 sourceType:'direct',certainty:'graded',temporality:'current',observationId:`legacy:${id}`
});

export function normalizeLegacyAnswer(question,answer){
 const options=(question?.options??[]).map(o=>o.id);
 const mode=question?.role==='gateway'?'MULTI_SELECT':'SINGLE_SELECT';
 const escapeMap={unsure:'UNSURE',later:'SKIP_FOR_NOW',none:'NONE_FIT',nothing:'NONE_FIT'};
 if(typeof answer==='string'&&escapeMap[answer])return {schema:{mode,options},response:{escapeCode:escapeMap[answer]}};
 return {schema:{mode,options},response:{value:answer}};
}

export function validateLegacyAnswer(question,answer){
 const {schema,response}=normalizeLegacyAnswer(question,answer);
 return validateResponse(schema,response);
}

export function adaptLegacyTrace(trace={}){
 const ranked=trace.ranked??[];
 const active=new Set(trace.active??[]);
 const concerns=ranked.map(item=>{
  const effects=[concernEffect(item.id,active.has(item.id))];
  const state=classifyConcern(effects),eligibility=focusEligibility(effects);
  return Object.freeze({id:item.id,legacyRank:item.score??null,effects:Object.freeze(effects),state:state.state,eligible:eligibility.eligible,confidence:eligibility.confidence});
 });
 return Object.freeze({version:'0.12-candidate',source:'legacy-discovery-trace',concerns:Object.freeze(concerns),eligibleFocusIds:Object.freeze(concerns.filter(c=>c.eligible).map(c=>c.id)),exitReason:trace.exitReason??null,optedOut:Boolean(trace.optedOut)});
}

export function classifyCompatibility(legacyRun,adapted){
 const legacyTop=new Set((legacyRun.top3??[]));
 const hardened=new Set(adapted.eligibleFocusIds??[]);
 const overlap=[...legacyTop].filter(x=>hardened.has(x));
 if(legacyTop.size===0&&hardened.size===0)return Object.freeze({classification:'EQUIVALENT',reason:'both-no-supported-focus'});
 if(legacyTop.size>0&&overlap.length===legacyTop.size)return Object.freeze({classification:'EQUIVALENT',reason:'legacy-supported-focus-preserved'});
 if(hardened.size<legacyTop.size)return Object.freeze({classification:'INTENTIONAL_HARDENING',reason:'eev1-evidence-floor-reduced-legacy-focus-set'});
 return Object.freeze({classification:'REGRESSION',reason:'unexplained-focus-divergence'});
}
