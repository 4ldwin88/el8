import assert from 'node:assert/strict';
import {selectMatrixQuestion} from './matrix-qa-selector.js';
const dims=['Physical','Emotional','Social','Spiritual','Intellectual','Occupational','Financial','Environmental'];
const matrix=dims.map((d,i)=>({question_key:`q${i}`,prompt:d,primary_signal:`s${i}`,secondary_signals:[],primary_dimension:d,affected_dimensions:[],question_family:'state',redundancy_family:`r${i}`,expected_information_gain:4,actionability:3,burden:1,sensitivity:1,active:true,qa_only:true,options:['Fine','Poor']}));
const severity=Object.fromEntries(dims.map(d=>[d,.12]));
let history=[];
for(let i=0;i<dims.length;i++){
  const result=selectMatrixQuestion({matrix,history,dimensionSeverity:severity});
  assert.equal(result.selected.length,1,'healthy blind QA should keep probing uncovered dimensions');
  history.push({intelligence_shadow:{selected:result.selected,context:{dimensionSeverity:severity}}});
}
assert.equal(new Set(history.map(h=>h.intelligence_shadow.selected[0].dimension)).size,8);
assert.equal(selectMatrixQuestion({matrix,history,dimensionSeverity:severity}).selected.length,0);
console.log('matrix QA selector coverage tests passed');
