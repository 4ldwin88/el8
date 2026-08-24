import BASE from './discovery-v2-question-bank.js';
// Round 3 human-test overrides. Keep state domains distinct and avoid questions that presume an unestablished problem.
const BANK=BASE.map(q=>{
 if(q.id==='G1')return{
  ...q,
  text:'What’s been bothering you lately? Select any that fit.',mode:'multi',burden:.35,
  options:[
   {id:'money',label:'Money',effects:{money_pressure:.65}},
   {id:'work',label:'Work or school',effects:{work_instability:.55,schedule_disruption:.2}},
   {id:'health',label:'Health or physical condition',effects:{physical_condition:.65}},
   {id:'energy',label:'Low energy or tiredness',effects:{low_energy:.65}},
   {id:'sleep',label:'Sleep',effects:{poor_sleep:.65}},
   {id:'stress',label:'Stress or emotions',effects:{stress:.6}},
   {id:'relationships',label:'Relationships',effects:{relationship_strain:.6}},
   {id:'support',label:'Feeling lonely or unsupported',effects:{low_support:.6,lonely:.4}},
   {id:'home',label:'Home or surroundings',effects:{home_instability:.6}},
   {id:'focus',label:'Focus or motivation',effects:{low_focus:.35,low_activation:.25}},
   {id:'direction',label:'Direction or purpose',effects:{lack_direction:.6}},
   {id:'other',label:'Something else',effects:{}},
   {id:'unsure',label:'Not sure',effects:{}}
  ]
 };
 if(q.id==='PH0')return{...q,text:'Which physical-health areas feel relevant? Select any that fit.',targets:['physical_condition'],mode:'multi',options:[
  {id:'body',label:'Weight, fitness, or physical condition',effects:{physical_condition:.55}},
  {id:'activity',label:'Physical activity',effects:{physical_condition:.25,low_activity:.35}},
  {id:'symptoms',label:'Physical symptoms or discomfort',effects:{physical_condition:.5}},
  {id:'other',label:'Something else',effects:{}},{id:'unsure',label:'Not sure',effects:{}}
 ]};
 if(q.id==='M3')return{...q,text:'What is contributing to the money pressure? Select all that fit.',mode:'multi',burden:.24,options:[
  {id:'no_income',label:'I do not currently have a job or income',effects:{work_instability:.7,money_pressure:.55}},
  {id:'low_income',label:'My income is too low',effects:{work_instability:.3,money_pressure:.5}},
  {id:'unstable_income',label:'My income is uncertain or irregular',effects:{work_instability:.55,money_pressure:.45}},
  {id:'expenses',label:'Bills or expenses are too high',effects:{money_pressure:.6}},{id:'debt',label:'Debt',effects:{money_pressure:.65,stress:.2}},
  {id:'acute',label:'A major or unexpected expense',effects:{money_pressure:.55}},{id:'other',label:'Something else',effects:{}},{id:'unsure',label:'Not sure',effects:{}}
 ]};
 if(q.id==='B1')return{...q,text:'Which best describes what is happening with work right now?',burden:.22,options:[
  {id:'no_work',label:'I currently do not have work',effects:{work_instability:.75}},
  {id:'money',label:'Money or income pressure is affecting my work choices',effects:{money_pressure:.25,work_instability:.15}},
  {id:'stability',label:'My work, hours, or income feel unstable',effects:{work_instability:.4}},
  {id:'fit',label:'My work is stable enough, but it is not a good fit',effects:{work_instability:-.15,lack_direction:.45}},
  {id:'separate',label:'Work is not a major problem for me right now',effects:{work_instability:-.55}},
  {id:'other',label:'Something else',effects:{}},{id:'unsure',label:'Not sure',effects:{}}
 ]};
 if(q.id==='E2')return{...q,text:'What seems connected to your low energy? Select all that fit.',mode:'multi',options:[
  {id:'sleep',label:'Poor sleep',effects:{poor_sleep:.5}},{id:'schedule',label:'Busy or irregular schedule',effects:{schedule_disruption:.4}},
  {id:'stress',label:'Stress',effects:{stress:.35}},{id:'activity',label:'Not being active enough',effects:{low_activity:.4}},
  {id:'body',label:'Health or physical condition',effects:{physical_condition:.4}},{id:'motivation',label:'Low motivation or difficulty getting started',effects:{low_activation:.4,lack_direction:.15}},
  {id:'other',label:'Something else',effects:{}},{id:'unsure',label:'Not sure',effects:{}}
 ]};
 if(q.id==='B4')return{...q,prerequisite:(state,log)=>log.some(o=>(o.effects??[]).some(e=>e.type==='evidence'&&e.target==='focus'&&e.polarity==='supports'&&e.strength>=.25))};
 if(q.id==='ST2')return{...q,options:(q.options??[]).map(o=>o.id==='internal'?{...o,label:'The stress is still there even when nothing specific is going wrong'}:o)};
 if(q.id==='SC1')return{...q,options:[{id:'good',label:'A lot',effects:{schedule_disruption:-.55}},{id:'some',label:'Some',effects:{schedule_disruption:.15}},{id:'little',label:'A little',effects:{schedule_disruption:.4}},{id:'very_little',label:'Very little',effects:{schedule_disruption:.6}}]};
 return q;
});
export {BANK};export default BANK;
