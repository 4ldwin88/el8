import BASE from './discovery-v2-question-bank.js';
// v2.6 overrides only the finance driver discriminator. Causes can coexist,
// so collecting a forced single 'main' cause loses valid evidence.
const BANK=BASE.map(q=>q.id!=='M3'?q:{
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
});
export {BANK};export default BANK;
