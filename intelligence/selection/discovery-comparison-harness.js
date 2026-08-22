// EL8 v0.13 control vs Adaptive Discovery v1 challenger harness
import { selectQuestions } from './question-selector.js';
import { selectDiscoveryQuestion } from './adaptive-discovery-v1.js';

const idOf=q=>q?.id??q?.question_key??null;
const arr=v=>Array.isArray(v)?v:[];

function controlRun(candidates, context){
  const r=selectQuestions(candidates,context,{maxQuestions:context.maxQuestions,maxBurden:context.maxBurden});
  return {selected:r.selected.map(x=>idOf(x.question)),count:r.selected.length,burden:r.burdenUsed,topScore:r.ranked[0]?.score??null};
}

function challengerRun(candidates, context){
  const chosen=[];let burdenUsed=context.burdenUsed??0;let state={...context};
  while(true){
    const r=selectDiscoveryQuestion(candidates.filter(q=>!chosen.includes(idOf(q))),{...state,questionsAsked:chosen.length,burdenUsed});
    if(!r.selected) return {selected:chosen,count:chosen.length,burden:burdenUsed,stop:r.stop.reason,topScore:r.ranked[0]?.score??null};
    const id=idOf(r.selected.question);chosen.push(id);
    burdenUsed+=r.selected.question.burden??r.selected.question.burden_cost??1;
    // Harness intentionally does not fabricate answers. It measures pre-answer question efficiency.
    if(chosen.length >= (context.maxQuestions??3)) return {selected:chosen,count:chosen.length,burden:burdenUsed,stop:'question-budget',topScore:r.ranked[0]?.score??null};
  }
}

export function compareSelectors(candidates, scenarios){
  return arr(scenarios).map(s=>{
    const control=controlRun(candidates,s.context);
    const challenger=challengerRun(candidates,s.context);
    const fewerQuestions=challenger.count<control.count;
    const lowerBurden=challenger.burden<control.burden;
    return {id:s.id,expectation:s.expectation,control,challenger,delta:{questions:challenger.count-control.count,burden:challenger.burden-control.burden,fewerQuestions,lowerBurden}};
  });
}

export function summarizeComparison(rows){
  const n=rows.length||1;
  return {
    scenarios:rows.length,
    challengerAskedFewer:rows.filter(r=>r.delta.fewerQuestions).length,
    challengerLowerBurden:rows.filter(r=>r.delta.lowerBurden).length,
    meanQuestionDelta:rows.reduce((s,r)=>s+r.delta.questions,0)/n,
    meanBurdenDelta:rows.reduce((s,r)=>s+r.delta.burden,0)/n
  };
}
