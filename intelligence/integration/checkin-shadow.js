import {questionBank} from '../question-bank/index.js';
import {attachAnswerEvidence} from '../evidence/answer-value-matrix.js';
import {selectQuestions} from '../selection/question-selector.js';

const bank=questionBank.map(attachAnswerEvidence);
const arr=v=>Array.isArray(v)?v:[];
const dimOf=q=>q.dimension??q.primary_dimension??arr(q.primary_dimensions)[0]??null;
const signalOf=q=>q.signal??q.signal_map?.signal??null;

// Converts live prototype state into the selector's context without allowing the
// selector to control the member-facing check-in yet. This is intentionally shadow-only.
export function buildShadowContext({plan,load,activity,pending=[],scheduled=[],focuses=[]}={}){
 const activeTriggers=new Set();
 arr(focuses).forEach(d=>activeTriggers.add(`${String(d).toLowerCase()}_priority`));
 arr(plan?.focus_dimensions).forEach(x=>activeTriggers.add(`${String(typeof x==='string'?x:x?.dimension).toLowerCase()}_priority`));
 if(plan?.dimension)activeTriggers.add(`${String(plan.dimension).toLowerCase()}_priority`);
 if(plan?.supporting_dimension)activeTriggers.add(`${String(plan.supporting_dimension).toLowerCase()}_priority`);
 arr(pending).forEach(x=>arr(x.intelligence_triggers??x.triggers).forEach(t=>activeTriggers.add(t)));
 arr(scheduled).forEach(x=>arr(x.intelligence_triggers??x.triggers).forEach(t=>activeTriggers.add(t)));
 const capacity=load?.adaptation_direction==='reduce'?.25:load?.adaptation_direction==='expand'?.9:.7;
 const friction=load?.adaptation_direction==='reduce'?.85:load?.adaptation_direction==='expand'?.1:.3;
 return {activeTriggers:[...activeTriggers].filter(Boolean),capacity,friction,recentQuestionIds:arr(activity?.recent_question_ids),recentSignals:arr(activity?.recent_signals),uncertaintyBySignal:activity?.uncertainty_by_signal??{},evidenceAgeDays:activity?.evidence_age_days??{},candidateDimensions:[...new Set(arr(focuses).filter(Boolean))],maxQuestions:load?.adaptation_direction==='reduce'?1:2,maxBurden:load?.adaptation_direction==='reduce'?1:3};
}

export function runCheckinShadow(input={}){
 const context=buildShadowContext(input);
 const result=selectQuestions(bank,context);
 return {mode:'shadow',engine_version:'adaptive-selector-v0.4',generated_at:new Date().toISOString(),context:{...context,answerProbabilities:undefined},selected:result.selected.map(x=>({id:x.question.id,dimension:dimOf(x.question),signal:signalOf(x.question),score:x.score,components:x.components,prompt:x.question.prompt})),ranked:result.ranked.slice(0,5).map(x=>({id:x.question.id,dimension:dimOf(x.question),signal:signalOf(x.question),score:x.score})),burdenUsed:result.burdenUsed};
}
