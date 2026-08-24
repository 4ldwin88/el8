import BASE from './discovery-v2-question-bank.js';
// v2.6+ targeted overrides retained by Round 3.
// M3: causes can coexist, so collecting a forced single 'main' cause loses valid evidence.
// B1: bridge copy must not presume money pressure merely because work was inferred indirectly.
// ST2/SC1: human-test wording/options clarified after v0.7.
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
  text:'Which best describes what is happening with work right now?',
  burden:.22,
  options:[
   {id:'money',label:'Money or income pressure is affecting my work choices',effects:{money_pressure:.25,work_instability:.15}},
   {id:'stability',label:'My work, hours, or income feel unstable',effects:{work_instability:.4}},
   {id:'fit',label:'My work is stable enough, but I am not happy with it or it does not feel like a good fit',effects:{work_instability:-.15,lack_direction:.45}},
   {id:'separate',label:'Work is not a major problem for me right now',effects:{work_instability:-.35}},
   {id:'other',label:'Something else',effects:{}},
   {id:'unsure',label:'Not sure',effects:{}}
  ]
 };
 if(q.id==='ST2')return{...q,options:(q.options??[]).map(o=>o.id==='internal'?{...o,label:'The stress is still there even when nothing specific is going wrong'}:o)};
 if(q.id==='SC1')return{...q,options:[
  {id:'good',label:'A lot',effects:{schedule_disruption:-.55}},
  {id:'some',label:'Some',effects:{schedule_disruption:.15}},
  {id:'little',label:'A little',effects:{schedule_disruption:.4}},
  {id:'very_little',label:'Very little',effects:{schedule_disruption:.6}}
 ]};
 return q;
});
export {BANK};export default BANK;
