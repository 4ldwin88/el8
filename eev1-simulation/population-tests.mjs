import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';
import { decisionSufficiency, actionEligibility, adaptPlan, DECISION_POLICY } from './decision-policy.js';

const ev = (polarity, strength, extra={}) => ({ type:'evidence', polarity, strength, sourceType:'direct', certainty:'graded', temporality:'current', ...extra });
const support = (strength=.9, extra={}) => ev('supports', strength, extra);
const contradict = (strength=.9, extra={}) => ev('contradicts', strength, extra);

const personas = [
  { id:'clean-single', concerns:{sleep:[support(1)]}, expect:'sleep' },
  { id:'clean-multi', concerns:{money:[support(1)], health:[support(.95)], work:[support(.9)]}, expect:'multi' },
  { id:'weak-noise', concerns:{energy:[support(.2,{sourceType:'inferred'})], focus:[support(.15,{sourceType:'inferred'})]}, expect:'none' },
  { id:'contradictory', concerns:{energy:[support(.9),contradict(.85)]}, expect:'unresolved' },
  { id:'cleared', concerns:{stress:[contradict(1,{certainty:'definitive'})]}, expect:'cleared' },
  { id:'historical-only', concerns:{sleep:[support(1,{temporality:'historical'})]}, expect:'none' },
  { id:'direct-vs-inferred', concerns:{work:[support(.12,{sourceType:'inferred'}),support(.12,{sourceType:'inferred'}),support(.12,{sourceType:'inferred'}),contradict(.8,{certainty:'definitive'})]}, expect:'not-supported' },
  { id:'correlated-money-work', concerns:{money:[support(.55),contradict(.45)],work:[support(.55),contradict(.45)]}, expect:'discriminate' },
  { id:'unsure-empty', concerns:{energy:[],sleep:[],stress:[]}, expect:'budget-stop' },
  { id:'mixed-supported-unresolved', concerns:{money:[support(1)],work:[support(.55),contradict(.45)]}, expect:'continue' },
  { id:'health-energy-separated', concerns:{health:[support(1)],energy:[contradict(1,{certainty:'definitive'})]}, expect:'health-only' },
  { id:'member-low-evidence', concerns:{spiritual:[support(.2)]}, expect:'ineligible' }
];

let passed = 0;
for (const p of personas) {
  const states = Object.fromEntries(Object.entries(p.concerns).map(([id,effects]) => [id,classifyConcern(effects)]));
  const eligible = Object.entries(p.concerns).filter(([,effects]) => focusEligibility(effects).eligible).map(([id])=>id);
  const suff = decisionSufficiency({concernEffects:p.concerns, questionsAsked:p.expect==='budget-stop'?DECISION_POLICY.maxQuestionBudget:6});

  if (p.expect === 'sleep') assert.deepEqual(eligible,['sleep']);
  if (p.expect === 'multi') assert.equal(eligible.length,3);
  if (p.expect === 'none') assert.equal(eligible.length,0);
  if (p.expect === 'unresolved') assert.equal(states.energy.state,'UNRESOLVED');
  if (p.expect === 'cleared') assert.equal(states.stress.state,'CLEARED');
  if (p.expect === 'not-supported') assert.notEqual(states.work.state,'SUPPORTED');
  if (p.expect === 'discriminate') assert.equal(suff.next,'DISCRIMINATE_CONFLICT');
  if (p.expect === 'budget-stop') assert.equal(suff.next,'NO_FOCUS_YET');
  if (p.expect === 'continue') { assert.equal(eligible.includes('money'),true); assert.equal(suff.sufficient,false); }
  if (p.expect === 'health-only') assert.deepEqual(eligible,['health']);
  if (p.expect === 'ineligible') assert.equal(eligible.length,0);
  passed++;
}

// Deterministic combinatorial stress: evidence trajectories across strength/source/temporality.
const strengths=[.15,.35,.6,.85,1];
const sources=['direct','derived','inferred'];
const temporalities=['current','recurring','historical'];
let combinations=0;
for (const s of strengths) for (const sourceType of sources) for (const temporality of temporalities) {
  const effects=[support(s,{sourceType,temporality})];
  const a=classifyConcern(effects);
  const b=classifyConcern(effects);
  assert.deepEqual(a,b);
  assert.ok(a.confidence >= 0 && a.confidence <= 1);
  assert.ok(['UNKNOWN','CANDIDATE','SUPPORTED','CLEARED','UNRESOLVED'].includes(a.state));
  combinations++;
}

// Longitudinal plan trajectories.
assert.equal(adaptPlan({adherence:'high',outcome:'better'}).decision,'MAINTAIN');
assert.equal(adaptPlan({adherence:'high',outcome:'unchanged',driverWasHypothesis:true}).reopenHypothesis,true);
assert.equal(adaptPlan({adherence:'high',outcome:'worse',driverWasHypothesis:true}).weakenPriorDriver,true);
assert.equal(adaptPlan({adherence:'low',outcome:'unchanged',nonAdherenceReason:'access'}).decision,'REMOVE_BARRIER');
assert.equal(adaptPlan({adherence:'low',outcome:'unchanged',nonAdherenceReason:'irrelevant'}).decision,'REPLACE');
assert.equal(adaptPlan({adherence:'high',outcome:'better',newSafetyLevel:3}).decision,'PAUSE_OR_REFER');

// Driver-dependent plans cannot become causal merely because the concern is strong.
const strongConcern=[support(1)];
const uncertainDriver=[support(.55),contradict(.45)];
assert.equal(evaluateDriverHypothesis(uncertainDriver).established,false);
assert.equal(actionEligibility({concernEffects:strongConcern,driverEffects:uncertainDriver,actionIntent:'resolve'}).eligible,false);
assert.equal(actionEligibility({concernEffects:strongConcern,driverEffects:uncertainDriver,actionIntent:'learn'}).eligible,true);

console.log(`EEV1 population suite: PASS (${passed} personas + ${combinations} evidence combinations + longitudinal trajectories)`);
