// Governed Financial Discovery registry. Source: Drive 02.04.01 — Financial.
const q=(id,o)=>Object.freeze({id,dimension:'Financial',status:'conditional',reconciled:true,...o});
const a=(id,parentId,text,effect)=>Object.freeze({id,parentId,text,effect:Object.freeze(effect)});
const state=(p,c,rows)=>rows.map(([s,text,value])=>a(`${p}.${s}`,p,text,{kind:'state',constructId:c,value}));
const facet=(p,key,rows)=>rows.map(([s,text,value,negative=false])=>a(`${p}.${s}`,p,text,{kind:negative?'negative_facet':'facet',key,value,...(negative?{cannotEraseState:true}:{})}));
const ctx=(p,key,rows)=>rows.map(([s,text,value])=>a(`${p}.${s}`,p,text,{kind:'context',key,value}));
const plan=(p,key,rows)=>rows.map(([s,text,value])=>a(`${p}.${s}`,p,text,{kind:'planning_constraint',key,value}));
const u=(p,s,text='Not sure')=>a(`${p}.${s}`,p,text,{kind:'uncertain'});
export const QUESTIONS=Object.freeze([
q('FIN001',{text:'During the past 30 days, how often have you felt worried or under pressure because of money?',responseType:'single',role:'state-probe',constructId:'FINANCIAL_STRAIN',burden:.18}),
q('FIN002',{text:'Right now, how well are you able to cover your regular required expenses?',responseType:'single',role:'condition-probe',burden:.18}),
q('FIN003',{text:'Which parts of your current financial situation seem connected to the money pressure you are experiencing? Select any that fit.',responseType:'multi',role:'concern-scope',burden:.24}),
q('FIN004',{text:'During the past 30 days, how much has your financial situation limited choices that matter to you?',responseType:'single',role:'impact-probe',burden:.18}),
q('FIN005',{text:'Which best describes your required payments over the next 30 days?',responseType:'single',role:'urgency-probe',burden:.14}),
q('FIN006',{text:'If an unexpected necessary expense came up today, how able would you be to cover it without missing other required payments?',responseType:'single',role:'resilience-probe',burden:.14}),
q('FIN007',{text:'Which required expenses are currently difficult to cover or at risk of being missed? Select any that fit.',responseType:'multi',role:'obligation-probe',burden:.2}),
q('FIN008',{text:'How clearly do you know what money is coming in, what is due, and what is available right now?',responseType:'single',role:'visibility-probe',status:'deferred',burden:.1}),
q('FIN009',{text:'If EL8 suggested a money-related next step, what would it need to account for? Select any that fit.',responseType:'multi',role:'feasibility-probe',burden:.1})]);
export const ANSWERS=Object.freeze([
...state('FIN001','FINANCIAL_STRAIN',[['01','Never','never'],['02','Rarely','rarely'],['03','Sometimes','sometimes'],['04','Often','often'],['05','Almost always','almost_always']]),u('FIN001','06'),
...facet('FIN002','required_expense_coverage',[['01','Comfortably','comfortable',true],['02','I can cover them, but with little room left','tight_covered'],['03','It is difficult to cover all of them','difficult'],['04','I cannot currently cover all of them','cannot_cover']]),u('FIN002','05'),
...ctx('FIN003','financial_contributor',[['01','No current income','no_income'],['02','Income does not cover what I need','income_shortfall'],['03','Income is uncertain or irregular','irregular_income'],['04','Regular expenses are difficult to cover','expense_difficulty'],['05','Debt or required debt payments','debt'],['06','A recent unexpected expense or financial shock','financial_shock'],['07','Something else','other'],['08','None of these','none']]),u('FIN003','09'),
...facet('FIN004','financial_choice_limitation',[['01','Not at all','none',true],['02','A little','little'],['03','Somewhat','some'],['04','Quite a bit','substantial'],['05','Very much','very_high']]),u('FIN004','06'),
...facet('FIN005','financial_payment_risk',[['01','I expect to cover them','covered',true],['02','I expect to cover them, but it will be tight','tight'],['03','I may miss one or more required payments','may_miss'],['04','I am already behind on one or more required payments','already_behind']]),u('FIN005','05'),
...facet('FIN006','financial_resilience',[['01','I could cover it','can_cover',true],['02','I probably could, but it would be difficult','difficult'],['03','I probably could not','probably_cannot'],['04','I could not cover it','cannot_cover']]),u('FIN006','05'),
...ctx('FIN007','at_risk_obligation',[['01','Housing','housing'],['02','Utilities','utilities'],['03','Food','food'],['04','Transportation','transportation'],['05','Medication or healthcare','healthcare'],['06','Debt or minimum payments','debt'],['07','Another required expense','other']]),a('FIN007.08','FIN007','None',{kind:'negative_facet',key:'at_risk_obligation',value:'none',cannotEraseState:true}),u('FIN007','09'),
...['Very clearly','Mostly clearly','I know some of it','I do not have a clear picture'].map((text,i)=>a(`FIN008.0${i+1}`,'FIN008',text,{kind:'deferred',noDirectEvidence:true})),a('FIN008.05','FIN008','Not sure',{kind:'deferred',noDirectEvidence:true}),
...plan('FIN009','financial_fit',[['01','Keep it quick and manageable','quick'],['02','Keep the effort low right now','low_effort'],['03','Keep the cost very low','low_cost'],['04','I may need help accessing information, accounts, or services','access_help'],['05','I may need another person or professional involved','other_person_or_professional'],['06','No special limitation','none']]),u('FIN009','07')]);
export default Object.freeze({questions:QUESTIONS,answers:ANSWERS});