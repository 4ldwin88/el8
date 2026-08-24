import BASE from './discovery-v2-question-bank.js';
// v2.6+ targeted overrides retained by Round 3.
// M3: causes can coexist, so collecting a forced single 'main' cause loses valid evidence.
// B1: work/money can both be present without one causing the other; preserve dissatisfaction/fit as a useful upstream answer.
const BANK=BASE.map(q=>{
 if(q.id==='M3')return{
  ...q,
  text:'What is contributing to the money pressure? Select all that fit.',
  mode:'multi',
  burden:.24,
  options:[
   {id:'no_income',label:'I do not currently have a job or income',effects:{work_instability:.7,money_pressure:.55}},
   {id:'low_income',label:'My income is too low',effects:{work_instability:.3,money_pressure:.5}},
   {id:'unstable_income',label:'My income is uncertain or irregular',effects:{work_instability:.55,money_pressure:.45}},
   {id:'expenses',label:'Bills or expenses are too high',effects:{money_pressure:.6}},
   {id:'debt',label:'Debt',effects:{money_pressure:.65,stress:.2}},
   {id:'acute',label:'A major or unexpected expense',effects:{money_pressure:.55}},
   {id:'other',label:'Something else',effects:{money_pressure:.25}},
   {id:'unsure',label:'Not sure',effects:{}}
  ]
 };
 if(q.id==='B1')return{
  ...q,
  text:'Which best describes how work and money are connected right now?',
  burden:.22,
  options:[
   {id:'work',label:'Work problems are driving money pressure',effects:{work_instability:.35,money_pressure:.15}},
   {id:'money',label:'Money pressure is affecting my work choices',effects:{money_pressure:.35}},
   {id:'fit',label:'My work is stable enough, but it does not feel meaningful or like a good fit',effects:{work_instability:-.15,lack_direction:.45}},
   {id:'separate',label:'They feel mostly separate',effects:{}},
   {id:'other',label:'Something else',effects:{}},
   {id:'unsure',label:'Not sure',effects:{}}
  ]
 };
 return q;
});
export {BANK};export default BANK;
