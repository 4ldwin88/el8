import assert from'node:assert/strict';import{inferQuestionOptionEvidence}from'./question-option-evidence.js';
let e=inferQuestionOptionEvidence('Income too low',{id:'Q089',signal:'F01'});assert.deepEqual(e.delta,{});assert.equal(e.subdimension,'Financial.ExpenseLoad');
e=inferQuestionOptionEvidence('Significant',{id:'Q038',signal:'F02'});assert.equal(e.delta['Financial.DebtBurden'],.35);
e=inferQuestionOptionEvidence('Poor sleep',{id:'Q004',signal:'P03'});assert.equal(e.source,'question-option-unmapped');
e=inferQuestionOptionEvidence('Rested enough',{id:'Q053',signal:'P02'});assert.equal(e.delta['Physical.Sleep'],-.2);
e=inferQuestionOptionEvidence('Very clear',{id:'Q028',signal:'I04'});assert.equal(e.delta['Intellectual.Focus'],-.35);
e=inferQuestionOptionEvidence('Stable enough',{id:'Q035',signal:'O04'});assert.equal(e.delta['Occupational.EmploymentStability'],-.2);console.log('question-option subdimension evidence tests passed');
