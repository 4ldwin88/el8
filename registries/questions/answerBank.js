// Governed Discovery Answer Bank.
// Source authority: Drive 02.04.01 EL8 Question & Signal Matrix Workbook.
// Answer effects are evidence semantics, not aggregate wellness scores.

const answer=(id,parentId,text,effect)=>Object.freeze({id,parentId,text,effect:Object.freeze({...effect})});

export const ANSWER_BANK_VERSION='0.1.0-reconciliation';

export const ANSWER_BANK=Object.freeze([
  // Environmental interference — direct ordinal state evidence.
  answer('ENV001.01','ENV001','Never',{constructId:'ENVIRONMENTAL_INTERFERENCE',kind:'state',value:'never'}),
  answer('ENV001.02','ENV001','Rarely',{constructId:'ENVIRONMENTAL_INTERFERENCE',kind:'state',value:'rarely'}),
  answer('ENV001.03','ENV001','Sometimes',{constructId:'ENVIRONMENTAL_INTERFERENCE',kind:'state',value:'sometimes'}),
  answer('ENV001.04','ENV001','Often',{constructId:'ENVIRONMENTAL_INTERFERENCE',kind:'state',value:'often'}),
  answer('ENV001.05','ENV001','Almost always',{constructId:'ENVIRONMENTAL_INTERFERENCE',kind:'state',value:'almost_always'}),
  answer('ENV001.06','ENV001','Not sure',{kind:'uncertain'}),

  // Environmental factor identity — context only; never additive severity.
  answer('ENV002.01','ENV002','Noise or frequent interruptions',{kind:'context',key:'environment_factor',value:'noise_interruptions'}),
  answer('ENV002.02','ENV002','Not enough privacy',{kind:'context',key:'environment_factor',value:'privacy'}),
  answer('ENV002.03','ENV002','Not enough usable space or too much crowding',{kind:'context',key:'environment_factor',value:'crowding_usable_space'}),
  answer('ENV002.04','ENV002','Temperature, air quality, smoke, dampness, or similar physical conditions',{kind:'context',key:'environment_factor',value:'physical_conditions'}),
  answer('ENV002.05','ENV002','Accessibility or difficulty using the space',{kind:'constraint',key:'environment_factor',value:'accessibility'}),
  answer('ENV002.06','ENV002','Transportation or location makes important activities difficult',{kind:'constraint',key:'environment_factor',value:'transport_location'}),
  answer('ENV002.07','ENV002','Conflict or tension with people I live with',{kind:'context',key:'household_relationship_context',value:'conflict_tension'}),
  answer('ENV002.08','ENV002','Uncertainty about being able to stay where I live',{kind:'routing',constructId:'HOUSING_STABILITY',value:'clarify'}),
  answer('ENV002.09','ENV002','Something else',{kind:'context',key:'environment_factor',value:'other'}),
  answer('ENV002.10','ENV002','None of these',{kind:'none'}),
  answer('ENV002.11','ENV002','Not sure',{kind:'uncertain'}),

  // Contextual home Safety — Safety routing is independent of ordinary Environmental severity.
  answer('ENV003.01','ENV003','Yes',{kind:'safety_context',key:'contextual_safety_home',value:'safe'}),
  answer('ENV003.02','ENV003','Mostly',{kind:'safety_context',key:'contextual_safety_home',value:'mostly_safe'}),
  answer('ENV003.03','ENV003','No',{kind:'safety_trigger',key:'contextual_safety_home',value:'not_physically_safe',requiresImmediacyClarification:true}),
  answer('ENV003.04','ENV003','Not sure',{kind:'safety_context',key:'contextual_safety_home',value:'uncertain'}),
  answer('ENV003.05','ENV003','I prefer not to answer',{kind:'nonresponse'}),

  // Housing stability — separate direct state evidence.
  answer('ENV004.01','ENV004','I expect to be able to stay here',{constructId:'HOUSING_STABILITY',kind:'state',value:'expected_secure'}),
  answer('ENV004.02','ENV004','There is some uncertainty',{constructId:'HOUSING_STABILITY',kind:'state',value:'some_uncertainty'}),
  answer('ENV004.03','ENV004','I may have to leave or lose this housing',{constructId:'HOUSING_STABILITY',kind:'state',value:'may_lose_housing'}),
  answer('ENV004.04','ENV004','This is temporary housing',{constructId:'HOUSING_STABILITY',kind:'state',value:'temporary_housing'}),
  answer('ENV004.05','ENV004','Not sure',{kind:'uncertain'}),
  answer('ENV004.06','ENV004','Not applicable',{kind:'not_applicable'}),

  // Planning feasibility only.
  answer('ENV005.01','ENV005','A lot',{kind:'planning_context',key:'environmental_change_feasibility',value:'high'}),
  answer('ENV005.02','ENV005','Some of it',{kind:'planning_context',key:'environmental_change_feasibility',value:'some'}),
  answer('ENV005.03','ENV005','Very little',{kind:'planning_context',key:'environmental_change_feasibility',value:'very_little'}),
  answer('ENV005.04','ENV005','None right now',{kind:'planning_constraint',key:'environmental_change_feasibility',value:'none'}),
  answer('ENV005.05','ENV005','Not sure',{kind:'uncertain'}),
]);

export const ANSWER_BY_ID=Object.freeze(Object.fromEntries(ANSWER_BANK.map(item=>[item.id,item])));
export const ANSWERS_BY_QUESTION=Object.freeze(Object.fromEntries([...new Set(ANSWER_BANK.map(item=>item.parentId))].map(parentId=>[parentId,Object.freeze(ANSWER_BANK.filter(item=>item.parentId===parentId))])));

export function assertUniqueAnswerIds(){if(Object.keys(ANSWER_BY_ID).length!==ANSWER_BANK.length)throw new Error('Duplicate governed Discovery answer ID');return true;}
export default ANSWER_BANK;
