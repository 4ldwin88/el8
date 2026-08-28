import assert from 'node:assert/strict';
import {buildCanonicalBrowserPlan} from '../onboarding/canonical-browser-plan.js';

const memberState={revision:4};
const discovery=(concernId,problemId,evidenceRef,capacity='medium')=>({trace:{states:[{concernId,problemId,evidenceRefs:[evidenceRef],resolutionState:'supported'}]},baselineHandoff:{signals:{feasibility:{capacity}}}});
const build=({concernId,problemId,evidenceRef,selectionEvidence,capacity='medium'})=>buildCanonicalBrowserPlan({discoveryOutput:discovery(concernId,problemId,evidenceRef,capacity),confirmedPriorities:[problemId],memberState,selectionEvidence});

// Internal canonical profiles exercise production Planning and its governed registry directly.
// They are accelerated QA fixtures, not an external snapshot or alternate plan engine.
const movement=build({concernId:'low_activity',problemId:'problem:low_activity',evidenceRef:'e:activity',selectionEvidence:{'baseline.activity_level':'Almost none'}});
const money=build({concernId:'money_pressure',problemId:'problem:financial_strain',evidenceRef:'e:money',selectionEvidence:{'financial.current_snapshot':'Understand where my money is going'}});
const work=build({concernId:'work_instability',problemId:'problem:income_gap',evidenceRef:'e:work',selectionEvidence:{'work.current_income_route':'Build or sell something'}});
assert.equal(movement.plan.active[0].problem_id,'P01');
assert.equal(money.plan.active[0].problem_id,'P03');
assert.equal(work.plan.active[0].problem_id,'P05');
assert.notEqual(movement.plan.active[0].intervention_id,money.plan.active[0].intervention_id);
assert.notEqual(money.plan.active[0].intervention_id,work.plan.active[0].intervention_id);
assert.equal(money.plan.active[0].intervention_id,'I03_MONEY_SNAPSHOT');
assert.equal(work.plan.active[0].intervention_id,'I05_INCOME_EXPERIMENT');
assert.deepEqual(movement.plan.active[0].evidenceRefs,['e:activity']);
assert.deepEqual(money.plan.active[0].evidenceRefs,['e:money']);
assert.deepEqual(work.plan.active[0].evidenceRefs,['e:work']);

const unresolved=buildCanonicalBrowserPlan({discoveryOutput:discovery('poor_sleep','problem:poor_sleep','e:sleep'),confirmedPriorities:['problem:poor_sleep'],memberState,selectionEvidence:{}});
assert.equal(unresolved.plan.status,'deepen');
assert.equal(unresolved.plan.reason,'selection_evidence_required');
assert.equal(unresolved.view.selectionDeepening.required,true);
assert.ok(unresolved.view.selectionDeepening.requirements.some(x=>x.evidenceKey==='baseline.sleep_pattern'));

const multiDiscovery={trace:{states:[{concernId:'low_activity',problemId:'problem:low_activity',evidenceRefs:['e:a']},{concernId:'stress',problemId:'problem:stress',evidenceRefs:['e:s']}]},baselineHandoff:{signals:{feasibility:{capacity:'low'}}}};
const focused=buildCanonicalBrowserPlan({discoveryOutput:multiDiscovery,confirmedPriorities:['problem:low_activity','problem:stress'],memberState,selectionEvidence:{'baseline.activity_level':'1–2 days','stress.current_context':'Yes — the pattern is fairly clear'}});
assert.equal(focused.plan.active.length,1);
assert.ok(focused.plan.backlog.length>=1);

console.log('internal canonical Intelligence Discovery→Plan profile regressions passed');
