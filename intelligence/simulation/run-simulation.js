import {selectQuestions} from '../selection/question-selector.js';
import {attachAnswerEvidence} from '../evidence/answer-value-matrix.js';
import {syntheticMembers} from './synthetic-members.js';
import {emotionalQuestions} from '../question-bank/emotional.js';
import {financialQuestions} from '../question-bank/financial.js';

const bank=[...emotionalQuestions,...financialQuestions].map(attachAnswerEvidence);
const signal=q=>q.signal??q.signal_map?.signal;
const dims=q=>q.primary_dimensions??q.dimensions??[];

function assess(member,result){
 const selected=result.selected.map(x=>x.question),e=member.expect??{},fail=[];
 if(e.maxQuestions!=null&&selected.length>e.maxQuestions)fail.push(`selected ${selected.length}; max ${e.maxQuestions}`);
 if(e.minQuestions!=null&&selected.length<e.minQuestions)fail.push(`selected ${selected.length}; min ${e.minQuestions}`);
 if(e.dimension&&!selected.some(q=>dims(q).includes(e.dimension)))fail.push(`no ${e.dimension} question selected`);
 if(e.preferSignal&&signal(selected[0])!==e.preferSignal)fail.push(`top signal ${signal(selected[0])??'none'}; expected ${e.preferSignal}`);
 if(e.avoidSignal&&selected.some(q=>signal(q)===e.avoidSignal))fail.push(`repeated avoided signal ${e.avoidSignal}`);
 if(e.preferPurpose&&selected[0]?.question_purpose!==e.preferPurpose)fail.push(`top purpose ${selected[0]?.question_purpose??'none'}; expected ${e.preferPurpose}`);
 if(e.allowSafetyOverride&&!selected.some(q=>q.safety_rules?.override_burden))fail.push('no explicit safety override selected');
 return fail;
}

export function runSimulation(members=syntheticMembers,candidates=bank){
 return members.map(member=>{
   const result=selectQuestions(candidates,member.context);
   const failures=assess(member,result);
   return {id:member.id,label:member.label,pass:failures.length===0,failures,selected:result.selected.map(x=>({id:x.question.id,signal:signal(x.question),dimensions:dims(x.question),score:Number(x.score.toFixed(4)),components:x.components})),topRejected:result.ranked.slice(result.selected.length,result.selected.length+3).map(x=>({id:x.question.id,signal:signal(x.question),score:Number(x.score.toFixed(4))})),burdenUsed:result.burdenUsed};
 });
}

export function summarizeSimulation(rows){
 const passed=rows.filter(x=>x.pass).length;
 return {scenarios:rows.length,passed,failed:rows.length-passed,passRate:rows.length?passed/rows.length:0,failures:rows.filter(x=>!x.pass).map(x=>({id:x.id,failures:x.failures}))};
}

if(import.meta.url===`file://${process.argv[1]}`){
 const rows=runSimulation();
 console.log(JSON.stringify({summary:summarizeSimulation(rows),rows},null,2));
 if(rows.some(x=>!x.pass))process.exitCode=1;
}
