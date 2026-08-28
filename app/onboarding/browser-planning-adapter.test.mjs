import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalPlanningInputFromBrowser} from './browser-planning-adapter.js';

const discoveryOutput={
 trace:{states:[{concernId:'poor_sleep',problemId:'problem:poor_sleep',evidenceRefs:['e:sleep-1'],resolutionState:'supported'}]},
 plan:{focus:[{concernId:'poor_sleep'}]},
 baselineHandoff:{signals:{feasibility:{capacity:'low',overall_load:'Difficult'}}}
};

test('browser Planning consumes canonical Discovery trace states',()=>{
 const input=canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities:['poor_sleep'],memberStateRevision:4});
 assert.equal(input.memberStateRevision,4);
 assert.deepEqual(input.confirmedPriorityIds,['priority:poor_sleep']);
 assert.deepEqual(input.problems,[{priorityId:'priority:poor_sleep',problemId:'problem:poor_sleep',evidenceRefs:['e:sleep-1'],priorLearning:[]}]);
 assert.equal(input.constraints.capacity,'low');
});

test('browser Planning requires an explicit canonical Member State revision',()=>{
 assert.throws(()=>canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities:['poor_sleep']}),/Member State revision is required/);
 assert.throws(()=>canonicalPlanningInputFromBrowser({discoveryOutput,confirmedPriorities:['poor_sleep'],memberStateRevision:-1}),/Member State revision is required/);
});
