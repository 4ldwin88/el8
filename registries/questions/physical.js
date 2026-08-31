// Governed Physical Discovery registry.
// Source authority: Drive 02.04.01 EL8 Question & Signal Matrix Workbook — Physical.
const q=(id,o)=>Object.freeze({id,dimension:'Physical',status:'conditional',reconciled:true,...o});
const a=(id,parentId,text,effect)=>Object.freeze({id,parentId,text,effect:Object.freeze(effect)});
const state=(p,c,rows)=>rows.map(([s,text,value])=>a(`${p}.${s}`,p,text,{kind:'state',constructId:c,value}));
const uncertain=(p,s='05',text='Not sure')=>a(`${p}.${s}`,p,text,{kind:'uncertain'});

export const QUESTIONS=Object.freeze([
  q('PHY001',{text:'Which physical-health areas, if any, would you like EL8 to understand better?',responseType:'multi',role:'concern-scope',construct:'Physical-health scope discrimination',stage:'Adaptive Narrow',burden:.28}),
  q('PHY100',{text:'In the past 7 days, how much have concerns specifically about your weight or body bothered you?',responseType:'single',role:'state-probe',construct:'Body / weight concern',constructId:'BODY_WEIGHT_CONCERN',stage:'Adaptive state evidence',burden:.17}),
  q('PHY101',{text:'If EL8 suggested a physical-health action, what would it need to account for? Select any that fit.',responseType:'multi',role:'feasibility-probe',construct:'Physical action feasibility',stage:'Adaptive Fit',burden:.1}),
  q('PHY200',{text:'In the past 7 days, how would you rate your sleep overall?',responseType:'single',role:'state-probe',construct:'Sleep state',constructId:'SLEEP_QUALITY',stage:'Adaptive state evidence',burden:.16}),
  q('PHY201',{text:'In the past 7 days, what seemed connected with times it was harder to sleep well? Select any that fit.',responseType:'multi',role:'discriminator',construct:'Sleep contributors',constructId:'SLEEP_QUALITY',stage:'Adaptive discrimination',burden:.2}),
  q('PHY202',{text:'When you sleep better than usual, what—if anything—do you tend to notice the next day?',responseType:'single',role:'confirmation',construct:'Sleep relationship confirmation',constructId:'SLEEP_QUALITY',stage:'Adaptive relationship confirmation',burden:.18}),
  q('PHY300',{text:'In the past 7 days, how would you rate your energy during the day?',responseType:'single',role:'state-probe',construct:'Energy state',constructId:'ENERGY_FUNCTION',stage:'Adaptive state evidence',burden:.16}),
  q('PHY301',{text:'In the past 7 days, what seemed most connected with times you had low energy? Select any that fit.',responseType:'multi',role:'discriminator',construct:'Energy contributors',constructId:'ENERGY_FUNCTION',stage:'Adaptive discrimination',burden:.2}),
  q('PHY400',{text:'In the past 7 days, on how many days were you physically active for at least a short period?',responseType:'single',role:'state-probe',construct:'Activity frequency',constructId:'ACTIVITY_LEVEL',stage:'Adaptive state evidence',burden:.16}),
  q('PHY401',{text:'Which kinds of activity are practical for you right now? Select any that fit.',responseType:'multi',role:'feasibility-probe',construct:'Activity feasibility',constructId:'ACTIVITY_LEVEL',stage:'Adaptive Fit',burden:.12}),
  q('PHY402',{text:'What could make physical activity harder for you right now? Select any that fit.',responseType:'multi',role:'feasibility-probe',construct:'Activity barriers',constructId:'ACTIVITY_LEVEL',stage:'Adaptive Fit',burden:.12}),
  q('PHY500',{text:'In the past 7 days, how often was it hard to start something you intended to do?',responseType:'single',role:'state-probe',dimension:'Cross-dimensional',construct:'Activation',constructId:'ACTIVATION',stage:'Adaptive clarification/state evidence',burden:.17}),
]);

export const ANSWERS=Object.freeze([
  a('PHY001.01','PHY001','Weight or body composition',{kind:'routing',key:'physical_scope',value:'body_weight_scope_candidate',noDirectSeverity:true}),
  a('PHY001.02','PHY001','Exercise, movement, or activity level',{kind:'routing',key:'physical_scope',value:'activity_scope_candidate',noDirectSeverity:true}),
  a('PHY001.03','PHY001','Physical symptoms or discomfort',{kind:'routing',key:'physical_scope',value:'physical_symptom_scope_candidate',noDirectSeverity:true}),
  a('PHY001.04','PHY001','Something else',{kind:'unclassified_context'}),
  a('PHY001.05','PHY001','None of these',{kind:'negative_context',key:'physical_scope',cannotEraseState:true}),
  uncertain('PHY001','06'),
  ...state('PHY100','BODY_WEIGHT_CONCERN',[["01",'Not at all','not_at_all'],["02",'A little','a_little'],["03",'Quite a bit','quite_a_bit']]),
  uncertain('PHY100','04'),
  ...['Keep cost very low','Keep it short','Accessibility or mobility needs','Pain, symptoms, or a health condition','Professional guidance may be needed','No special limitation'].map((text,i)=>a(`PHY101.0${i+1}`,'PHY101',text,{kind:i===5?'planning_context':'planning_constraint',key:'physical_fit',value:['low_cost','short','accessibility_mobility','pain_symptoms_condition','professional_guidance','none'][i]})),
  uncertain('PHY101','07'),
  ...state('PHY200','SLEEP_QUALITY',[["01",'Very well','very_well'],["02",'Okay','okay'],["03",'Not great','not_great'],["04",'Really struggling','really_struggling']]),uncertain('PHY200'),
  ...['Sleep timing or schedule','Stress or thoughts','Noise, light, temperature, or other surroundings','Physical discomfort or health symptoms','Something else','Nothing obvious'].map((text,i)=>a(`PHY201.0${i+1}`,'PHY201',text,{kind:i===4?'unclassified_context':i===5?'negative_context':'context',key:'sleep_contributor',value:['timing_schedule','stress_thoughts','surroundings','physical_discomfort_symptoms','other','nothing_obvious'][i]})),uncertain('PHY201','07'),
  ...['More energy','Better focus','More energy and better focus','Neither noticeably changes'].map((text,i)=>a(`PHY202.0${i+1}`,'PHY202',text,{kind:'relationship',key:'sleep_next_day',value:['more_energy','better_focus','energy_and_focus','neither'][i],noDirectSeverity:true})),uncertain('PHY202','05'),
  ...state('PHY300','ENERGY_FUNCTION',[["01",'Very well','very_well'],["02",'Okay','okay'],["03",'Not great','not_great'],["04",'Really struggling','really_struggling']]),uncertain('PHY300'),
  ...['Poor sleep','A busy or irregular schedule','Stress','Being less active than usual','Health or physical symptoms','Difficulty getting started','Something else','Nothing obvious'].map((text,i)=>a(`PHY301.0${i+1}`,'PHY301',text,{kind:i===6?'unclassified_context':i===7?'negative_context':'context',key:'energy_contributor',value:['poor_sleep','busy_irregular_schedule','stress','less_active','health_physical_symptoms','difficulty_starting','other','nothing_obvious'][i]})),uncertain('PHY301','09'),
  ...state('PHY400','ACTIVITY_LEVEL',[["01",'6–7 days','6_7_days'],["02",'3–5 days','3_5_days'],["03",'1–2 days','1_2_days'],["04",'0 days','0_days']]),uncertain('PHY400'),
  ...['Walking or outdoor activity','Home or bodyweight activity without equipment','Using equipment at home','Gym or fitness facility','Another option','None of these are practical right now'].map((text,i)=>a(`PHY401.0${i+1}`,'PHY401',text,{kind:'planning_context',key:'activity_fit',value:['walking_outdoor','home_bodyweight','home_equipment','gym_facility','other','none_practical'][i]})),uncertain('PHY401','07'),
  ...['Time or schedule','Cost','Space or location','Mobility or accessibility','Pain or physical symptoms','I need professional guidance before changing activity','Getting started','Nothing obvious'].map((text,i)=>a(`PHY402.0${i+1}`,'PHY402',text,{kind:i===7?'planning_context':'planning_constraint',key:'activity_barrier',value:['time_schedule','cost','space_location','mobility_accessibility','pain_symptoms','professional_guidance','getting_started','nothing_obvious'][i]})),uncertain('PHY402','09'),
  ...state('PHY500','ACTIVATION',[["01",'Rarely or never','rarely_or_never'],["02",'Sometimes','sometimes'],["03",'Often','often']]),uncertain('PHY500','04'),
]);

export default Object.freeze({questions:QUESTIONS,answers:ANSWERS});
