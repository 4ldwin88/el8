import assert from 'node:assert/strict';
import {selectMatrixQuestion} from './matrix-qa-selector.js';
const dims=['Physical','Emotional','Social','Spiritual','Intellectual','Occupational','Financial','Environmental'];
const state=dims.map((d,i)=>({question_key:`q${i}`,prompt:d,primary_signal:`s${i}`,secondary_signals:[],primary_dimension:d,affected_dimensions:[],question_family:'state',redundancy_family:`r${i}`,expected_information_gain:4,actionability:3,burden:1,sensitivity:1,active:true,qa_only:true,options:['Fine','Poor']}));
const financialDeep=[0,1,2].map(i=>({question_key:`fd${i}`,prompt:`Financial deep ${i}`,primary_signal:'F02',secondary_signals:[],primary_dimension:'Financial',affected_dimensions:[],question_family:'driver',redundancy_family:`fd-r${i}`,expected_information_gain:5,actionability:5,burden:1,sensitivity:1,active:true,qa_only:true,options:['A','B']}));
const matrix=[...state,...financialDeep],severity=Object.fromEntries(dims.map(d=>[d,.12]));
let history=[];
for(let i=0;i<dims.length;i++){const result=selectMatrixQuestion({matrix,history,dimensionSeverity:severity});assert.equal(result.selected.length,1,'healthy blind QA should keep probing uncovered dimensions');history.push({intelligence_shadow:{selected:result.selected,context:{dimensionSeverity:severity}}});}
assert.equal(new Set(history.map(h=>h.intelligence_shadow.selected[0].dimension)).size,8);assert.equal(selectMatrixQuestion({matrix,history,dimensionSeverity:severity}).selected.length,0);
// Even severe Financial evidence must not tunnel before broad coverage.
const severe={...severity,Financial:.9};history=[{intelligence_shadow:{selected:[{id:'q6',dimension:'Financial',family:'state',redundancy_family:'r6'}],context:{dimensionSeverity:severe}}}];
for(let i=0;i<3;i++){const r=selectMatrixQuestion({matrix,history,dimensionSeverity:severe});assert.equal(r.selected[0].family,'state');assert.notEqual(r.selected[0].dimension,'Financial');history.push({intelligence_shadow:{selected:r.selected,context:{dimensionSeverity:severe}}});}
assert.equal(new Set(history.map(h=>h.intelligence_shadow.selected[0].dimension)).size,4,'first four probes must cover four dimensions');
// After coverage, deepening may occur, but no dimension gets a third probe until six dimensions are covered.
let r=selectMatrixQuestion({matrix,history,dimensionSeverity:severe});history.push({intelligence_shadow:{selected:r.selected,context:{dimensionSeverity:severe}}});r=selectMatrixQuestion({matrix,history,dimensionSeverity:severe});if(r.selected[0]?.dimension==='Financial')assert.ok(history.filter(h=>h.intelligence_shadow.selected[0].dimension==='Financial').length<2);
console.log('matrix QA selector coverage and anti-tunneling tests passed');
