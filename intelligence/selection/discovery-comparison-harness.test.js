import assert from 'node:assert/strict';
import { compareSelectors, summarizeComparison } from './discovery-comparison-harness.js';

const q=(id,signal,extra={})=>({id,signal,active:true,options:['yes','no'],information_value:4,actionability:4,burden:1,answer_evidence:{yes:{uncertainty_reduction:.7,confidence:.9},no:{uncertainty_reduction:.5,confidence:.9}},...extra});
const candidates=[
 q('Q_SLEEP','sleep',{decision_impact:1}),
 q('Q_STRESS','stress'),
 q('Q_CASH','cashflow_after_essentials',{decision_impact:1}),
 q('Q_INCOME','income_stability',{decision_impact:.9})
];
const base={includeInactive:true,activeTriggers:[],availableEvidence:[],completedQuestionIds:[],recentQuestionIds:[],recentSignals:[],evidenceAgeDays:{},friction:0,capacity:1,maxQuestions:2,maxBurden:2};
const scenarios=[
 {id:'resolved',expectation:'Discovery should stop when hypotheses are sufficiently resolved.',context:{...base,uncertaintyBySignal:{sleep:.1,stress:.1},hypotheses:[{id:'H_SLEEP',signals:['sleep'],uncertainty:.1},{id:'H_STRESS',signals:['stress'],uncertainty:.1}],decisionRelevantSignals:['sleep']}},
 {id:'competing',expectation:'Discovery should prioritize the more unresolved decision-relevant hypothesis.',context:{...base,uncertaintyBySignal:{sleep:.9,stress:.4},hypotheses:[{id:'H_SLEEP',signals:['sleep'],uncertainty:.9},{id:'H_STRESS',signals:['stress'],uncertainty:.4}],decisionRelevantSignals:['sleep']}}
];
const rows=compareSelectors(candidates,scenarios);
assert.equal(rows.length,2);
assert.equal(rows[0].challenger.count,0,'resolved hypotheses should require no discovery question');
assert.equal(rows[1].challenger.selected[0],'Q_SLEEP');
const summary=summarizeComparison(rows);
assert.equal(summary.scenarios,2);
assert.ok(summary.challengerAskedFewer>=1);
console.log('Discovery comparison harness tests passed',summary);
