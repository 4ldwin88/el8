import assert from 'node:assert/strict';
import {selectDiscoveryQuestion,shouldStopDiscovery} from './adaptive-discovery-v1.js';
const q=(id,signal,extra={})=>({id,signal,active:true,options:['yes','no','unsure'],information_value:4,actionability:4,burden:1,answer_evidence:{yes:{uncertainty_reduction:.7,confidence:.9},no:{uncertainty_reduction:.5,confidence:.9},unsure:{uncertainty_reduction:.05,confidence:.2}},...extra});
const qs=[q('Q_SLEEP','sleep'),q('Q_STRESS','stress'),q('Q_SOCIAL','social_connection'),q('Q_WORK','employment_stability',{decision_impact:1}),q('Q_MONEY','financial_security',{decision_impact:1}),q('Q_HOME','environmental_stability'),q('Q_MEANING','purpose'),q('Q_FOCUS','cognitive_load')];
const base={includeInactive:true,activeTriggers:[],availableEvidence:[],completedQuestionIds:[],recentQuestionIds:[],recentSignals:[],evidenceAgeDays:{},friction:0,capacity:1,questionsAsked:0,burdenUsed:0,maxQuestions:3,maxBurden:3,minimumDiscoveryValue:.1};
function pick(ctx){return selectDiscoveryQuestion(qs,{...base,...ctx}).selected?.question?.id||null}
// Work + Unsure: work should beat arbitrary Physical-first traversal.
assert.equal(pick({hypotheses:[{id:'H_WORK',signals:['employment_stability'],uncertainty:.9,confidence:.1},{id:'H_STRESS',signals:['stress'],uncertainty:.5,confidence:.4}],decisionRelevantSignals:['employment_stability']}),'Q_WORK');
// Social masked as physical fatigue: once physical support weakens, residual Social uncertainty can win.
assert.equal(pick({hypotheses:[{id:'H_SLEEP',signals:['sleep'],uncertainty:.2,confidence:.2},{id:'H_SOCIAL',signals:['social_connection'],uncertainty:.85,confidence:.35}],decisionRelevantSignals:['social_connection']}),'Q_SOCIAL');
// Multi-driver: selector should choose a high-impact unresolved structural driver, not a fixed dimension order.
assert.ok(['Q_WORK','Q_MONEY'].includes(pick({hypotheses:[{id:'H_WORK',signals:['employment_stability'],uncertainty:.8,confidence:.4},{id:'H_MONEY',signals:['financial_security'],uncertainty:.82,confidence:.45},{id:'H_STRESS',signals:['stress'],uncertainty:.7,confidence:.5}],decisionRelevantSignals:['employment_stability','financial_security']})));
// Healthy: sufficiently resolved beliefs stop without burning budget.
assert.equal(shouldStopDiscovery({...base,hypotheses:[{id:'H_SLEEP',signals:['sleep'],uncertainty:.1,confidence:.1},{id:'H_STRESS',signals:['stress'],uncertainty:.1,confidence:.1}]},[{score:.8}]).reason,'sufficient-confidence');
// Repeated Unsure / flat information: stop when remaining question value is too low.
assert.equal(shouldStopDiscovery({...base,hypotheses:[],minimumDiscoveryValue:.2},[{score:.08}]).reason,'low-information-value');
// High friction/capacity: burden budget should terminate before interrogation.
assert.equal(shouldStopDiscovery({...base,capacity:.2,burdenUsed:1,maxBurden:1,hypotheses:[{id:'H',signals:['stress'],uncertainty:.9}]},[{score:.9}]).reason,'burden-budget');
// Safety must override ordinary stopping logic.
assert.deepEqual(shouldStopDiscovery({...base,safetyTriggered:true,questionsAsked:99,burdenUsed:99},[]),{stop:false,reason:'safety-routing-required'});
// Contradiction recovery: a newly unresolved orthogonal driver should outrank a now-low-uncertainty initial route.
assert.equal(pick({hypotheses:[{id:'H_INITIAL_PHYSICAL',signals:['sleep'],uncertainty:.15,confidence:.2},{id:'H_FINANCIAL',signals:['financial_security'],uncertainty:.9,confidence:.45}],decisionRelevantSignals:['financial_security']}),'Q_MONEY');
// Stale evidence: base selector freshness should not make stale evidence block a useful unresolved probe.
assert.equal(pick({availableEvidence:['employment_stability'],evidenceAgeDays:{employment_stability:90},hypotheses:[{id:'H_WORK',signals:['employment_stability'],uncertainty:.85,confidence:.35}],decisionRelevantSignals:['employment_stability']}),'Q_WORK');
console.log('Adaptive Discovery v1 adversarial tests passed');
