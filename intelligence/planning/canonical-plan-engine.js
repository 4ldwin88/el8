// Canonical EL8 Planning engine v2.
// Consumes member-confirmed Focus and selects the smallest useful Action set.
// It does not re-rank Focus, establish Discovery state, or impose fixed Action counts.
import { CANONICAL_ACTION_REGISTRY } from './canonical-action-bank.js';

export const PLAN_SCHEMA_VERSION='2.0.0';
const BLOCKED_SAFETY=new Set(['pause_ordinary_flow','escalate']);
const BURDEN_SCORE=Object.freeze({'Very low':0.5,'Low':1,'Low to medium':1.5,'Medium':2,'High':3});
function score(action){return BURDEN_SCORE[action.burden?.effort]??1}
function arr(v,n){if(!Array.isArray(v))throw new Error(`${n} must be an array`);return v}
function unique(v){return [...new Set(v)]}
function acceptedFocus(input){arr(input.focuses,'focuses');for(const f of input.focuses)if(f.decision!=='accepted')throw new Error('Planning accepts only member-accepted Focus');return input.focuses}
function candidateRank(action,{preferredActionIds,previousActionIds,adaptationConstraint}){let n=0;if(preferredActionIds.includes(action.actionId))n-=100;if(adaptationConstraint==='different_action'&&previousActionIds.includes(action.actionId))n+=100;if(adaptationConstraint==='reduce_burden')n+=score(action)*10;return n}
function actionInstance(action,focusIds){return Object.freeze({actionId:action.actionId,title:action.name,scope:action.scope,focusIds:action.constructIds.filter(id=>focusIds.includes(id)),intent:action.intent,instruction:action.instruction,intendedOutcome:action.intendedOutcome,rationale:action.rationale,burden:action.burden,measurement:action.measurement,review:action.review,trackingRequirement:action.trackingRequirement,additionalAssessmentRequirement:action.additionalAssessmentRequirement,iconKey:action.iconKey,evidenceSourceIds:action.evidenceSourceIds,evidenceStrength:action.evidenceStrength,permittedRationaleClaim:action.permittedRationaleClaim,status:'proposed'});}

export function buildCanonicalPlan(input,{registry=CANONICAL_ACTION_REGISTRY,preferredActionIds=[],rejectedActionIds=[],contraindicatedActionIds=[],previousActionIds=[],adaptationConstraint=null,burdenBudget=null,planningConditions=[],now=new Date().toISOString()}={}){
 if(!input||!Number.isInteger(input.memberStateRevision))throw new Error('canonical Planning input is required');
 const focuses=acceptedFocus(input),focusIds=focuses.map(f=>f.constructId);arr(input.evidenceRefs??[],'evidenceRefs');arr(input.constraintRefs??[],'constraintRefs');
 if(BLOCKED_SAFETY.has(input.safetyDisposition))return{schemaVersion:PLAN_SCHEMA_VERSION,status:'blocked',reason:'safety_override',memberStateRevision:input.memberStateRevision,proposedActions:[],backlog:[]};
 if(!focusIds.length)return{schemaVersion:PLAN_SCHEMA_VERSION,status:'no_plan',reason:'no_member_accepted_focus',memberStateRevision:input.memberStateRevision,proposedActions:[],backlog:[]};
 const eligibility=registry.eligibleFor({focusIds,evidenceRefs:input.evidenceRefs??[],constraintRefs:input.constraintRefs??[],safetyDisposition:input.safetyDisposition,planningConditions});
 const rejectedSet=new Set([...rejectedActionIds,...contraindicatedActionIds]);
 const candidates=eligibility.eligible.filter(a=>!rejectedSet.has(a.actionId)).sort((a,b)=>candidateRank(a,{preferredActionIds,previousActionIds,adaptationConstraint})-candidateRank(b,{preferredActionIds,previousActionIds,adaptationConstraint})||score(a)-score(b)||a.actionId.localeCompare(b.actionId));
 const selected=[],backlog=[],covered=new Set();let usedBurden=0;
 // First pass: one lowest-burden viable Action for each Focus when available.
 for(const focusId of focusIds){const option=candidates.find(a=>a.constructIds.includes(focusId)&&!selected.includes(a));if(!option)continue;const cost=score(option);if(burdenBudget!=null&&usedBurden+cost>burdenBudget){backlog.push(option);continue;}selected.push(option);usedBurden+=cost;for(const id of option.constructIds)if(focusIds.includes(id))covered.add(id);}
 // Second pass: add only Actions explicitly preferred or needed to cover an uncovered Focus; no arbitrary count ceiling.
 for(const action of candidates){if(selected.includes(action)||backlog.includes(action))continue;const addsCoverage=action.constructIds.some(id=>focusIds.includes(id)&&!covered.has(id));const explicitlyPreferred=preferredActionIds.includes(action.actionId);if(!addsCoverage&&!explicitlyPreferred){backlog.push(action);continue;}const cost=score(action);if(burdenBudget!=null&&usedBurden+cost>burdenBudget){backlog.push(action);continue;}selected.push(action);usedBurden+=cost;for(const id of action.constructIds)if(focusIds.includes(id))covered.add(id);}
 const uncoveredFocusIds=focusIds.filter(id=>!covered.has(id));
 const proposedActions=selected.map(a=>actionInstance(a,focusIds));
 const backlogActions=unique(backlog.map(a=>a.actionId));
 return{schemaVersion:PLAN_SCHEMA_VERSION,status:proposedActions.length?'proposed':'no_plan',reason:proposedActions.length?'member_confirmed_focus':'no_eligible_action',createdAt:now,memberStateRevision:input.memberStateRevision,focusIds:[...focusIds],proposedActions,actions:proposedActions,backlog:backlogActions,uncoveredFocusIds,burden:{budget:burdenBudget??'unbounded',used:usedBurden},constraintRefs:[...(input.constraintRefs??[])],evidenceRefs:[...(input.evidenceRefs??[])],decisionTrace:{selectedActionIds:proposedActions.map(a=>a.actionId),rejectedActionIds:[...rejectedActionIds],contraindicatedActionIds:[...contraindicatedActionIds],preferredActionIds:[...preferredActionIds],adaptationConstraint,eligibilityRejections:eligibility.rejected,planningConditions:[...planningConditions],selectionRule:'lowest-burden viable coverage; additional actions only for uncovered Focus or explicit preference; no fixed action-count limit'}};
}
