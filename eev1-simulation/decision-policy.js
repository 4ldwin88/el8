import { focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';

export const DECISION_POLICY = Object.freeze({maxQuestionBudget:18,maxInitialFocuses:3,maxInitialActionsPerFocus:1,minimumUsefulFocuses:1,unresolvedConflictRequiresDiscrimination:true});
export function decisionSufficiency({concernEffects={},questionsAsked=0,safetyEscalationLevel=0}={}){
 if(safetyEscalationLevel>0)return Object.freeze({sufficient:true,stopReason:'safety-gate',next:'SAFETY_REVIEW'});
 const entries=Object.entries(concernEffects).map(([concernId,effects])=>({concernId,...focusEligibility(effects)}));
 const eligible=entries.filter(x=>x.eligible), unresolved=entries.filter(x=>x.state==='UNRESOLVED');
 if(eligible.length>=DECISION_POLICY.minimumUsefulFocuses&&unresolved.length===0)return Object.freeze({sufficient:true,stopReason:'decision-useful-evidence',next:'AGENCY_GATE',eligible:eligible.map(x=>x.concernId)});
 if(questionsAsked>=DECISION_POLICY.maxQuestionBudget)return Object.freeze({sufficient:true,stopReason:'question-budget-reached',next:eligible.length?'AGENCY_GATE_WITH_UNCERTAINTY':'NO_FOCUS_YET',eligible:eligible.map(x=>x.concernId),unresolved:unresolved.map(x=>x.concernId)});
 return Object.freeze({sufficient:false,stopReason:null,next:unresolved.length?'DISCRIMINATE_CONFLICT':'ASK_HIGHEST_VALUE_QUESTION',unresolved:unresolved.map(x=>x.concernId)});
}

// Member agency may choose among evidence-supported options, but preference cannot manufacture evidence.
// ACCEPT keeps the proposed set; DECLINE may remove any focus; REPLACE/ADD require the requested
// alternative to independently clear the same focus-eligibility floor. Safety always overrides agency.
export function applyAgencyGate({proposedFocuses=[],concernEffects={},operation='ACCEPT',targetFocus=null,replacementFocus=null,safetyEscalationLevel=0}={}){
 if(safetyEscalationLevel>0)return Object.freeze({accepted:false,focuses:[],next:'SAFETY_REVIEW',reason:'safety-overrides-agency'});
 const unique=[...new Set(proposedFocuses)];
 const eligible=id=>Boolean(id&&focusEligibility(concernEffects[id]??[]).eligible);
 if(operation==='ACCEPT')return Object.freeze({accepted:true,focuses:unique,next:'PLAN',reason:'member-accepted'});
 if(operation==='DECLINE')return Object.freeze({accepted:true,focuses:targetFocus?unique.filter(x=>x!==targetFocus):[],next:'PLAN',reason:'member-declined'});
 if(operation==='REPLACE'){
  if(!unique.includes(targetFocus))return Object.freeze({accepted:false,focuses:unique,next:'AGENCY_GATE',reason:'target-not-proposed'});
  if(!eligible(replacementFocus))return Object.freeze({accepted:false,focuses:unique,next:'AGENCY_GATE',reason:'replacement-not-sufficiently-supported'});
  const next=[...unique.filter(x=>x!==targetFocus),replacementFocus];
  return Object.freeze({accepted:true,focuses:[...new Set(next)].slice(0,DECISION_POLICY.maxInitialFocuses),next:'PLAN',reason:'supported-replacement'});
 }
 if(operation==='ADD'){
  if(!eligible(replacementFocus))return Object.freeze({accepted:false,focuses:unique,next:'AGENCY_GATE',reason:'addition-not-sufficiently-supported'});
  if(unique.includes(replacementFocus))return Object.freeze({accepted:true,focuses:unique,next:'PLAN',reason:'already-in-focus-set'});
  if(unique.length>=DECISION_POLICY.maxInitialFocuses)return Object.freeze({accepted:false,focuses:unique,next:'AGENCY_GATE',reason:'initial-focus-cap-reached'});
  return Object.freeze({accepted:true,focuses:[...unique,replacementFocus],next:'PLAN',reason:'supported-addition'});
 }
 return Object.freeze({accepted:false,focuses:unique,next:'AGENCY_GATE',reason:'unknown-agency-operation'});
}

export function actionEligibility({concernEffects=[],driverEffects=[],actionIntent='learn'}={}){
 const concern=focusEligibility(concernEffects), driver=evaluateDriverHypothesis(driverEffects);
 if(!concern.eligible)return Object.freeze({eligible:false,reason:'focus-not-supported'});
 const mechanismDependent=['resolve','build'].includes(actionIntent);
 if(mechanismDependent&&!driver.established)return Object.freeze({eligible:false,reason:'driver-unresolved-use-learn-or-stabilize'});
 return Object.freeze({eligible:true,reason:mechanismDependent?'established-driver':'uncertainty-safe-action'});
}
export function adaptPlan({adherence,outcome,nonAdherenceReason=null,driverWasHypothesis=false,newSafetyLevel=0}={}){
 if(newSafetyLevel>0)return Object.freeze({decision:'PAUSE_OR_REFER',reopenHypothesis:true,reason:'new-safety-signal'});
 if(adherence==='low'){const route=({burden:'REDUCE_BURDEN',irrelevant:'REPLACE',forgot:'SIMPLIFY_CUE',access:'REMOVE_BARRIER'})[nonAdherenceReason]??'CLARIFY_NON_ADHERENCE';return Object.freeze({decision:route,reopenHypothesis:false,reason:nonAdherenceReason??'reason-required'});}
 if(adherence==='high'&&outcome==='worse')return Object.freeze({decision:'REASSESS',reopenHypothesis:true,weakenPriorDriver:true,reason:'high-adherence-worsening'});
 if(adherence==='high'&&outcome==='unchanged')return Object.freeze({decision:'MODIFY_OR_REASSESS',reopenHypothesis:Boolean(driverWasHypothesis),weakenPriorDriver:Boolean(driverWasHypothesis),reason:'high-adherence-no-improvement'});
 if(adherence==='high'&&outcome==='better')return Object.freeze({decision:'MAINTAIN',reopenHypothesis:false,reason:'working-with-adherence'});
 return Object.freeze({decision:'REVIEW',reopenHypothesis:false,reason:'insufficient-review-data'});
}
