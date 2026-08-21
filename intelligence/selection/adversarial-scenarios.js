import { selectQuestions } from './question-selector.js';

const base={includeInactive:true,recentQuestionIds:[],recentSignals:[],availableEvidence:[],evidenceAgeDays:{},uncertaintyBySignal:{},maxQuestions:2,maxBurden:2};

export const adversarialScenarios=[
  {
    id:'high_friction',
    expectation:'Ask at most one very high-value ordinary question; asking nothing is acceptable.',
    context:{...base,activeTriggers:['emotional_priority','emotional_uncertainty'],uncertainSignals:['pressure_pattern'],uncertaintyBySignal:{pressure_pattern:0.7},friction:0.95,capacity:0.2,maxQuestions:1,maxBurden:1,candidateDimensions:['Emotional']}
  },
  {
    id:'financial_pressure',
    expectation:'Prioritize near-term financial evidence, especially cash flow/income/runway, over unrelated emotional or clarification questions.',
    context:{...base,activeTriggers:['financial_priority','cashflow_uncertainty','income_uncertainty','runway_unknown'],uncertainSignals:['cashflow_after_essentials','income_stability','liquid_runway'],uncertaintyBySignal:{cashflow_after_essentials:1,income_stability:0.9,liquid_runway:0.85},friction:0.1,capacity:0.8,candidateDimensions:['Financial']}
  },
  {
    id:'priority_tie',
    expectation:'Use one or two clarification questions drawn from candidate dimensions rather than arbitrarily choosing a focus.',
    context:{...base,activeTriggers:['priority_tie','multiple_plausible_focuses','feasibility_uncertain','upstream_relationship_uncertain'],uncertainSignals:['member_perceived_leverage','member_perceived_feasibility','member_perceived_upstream_leverage'],uncertaintyBySignal:{member_perceived_leverage:1,member_perceived_feasibility:0.8,member_perceived_upstream_leverage:0.9},friction:0.1,capacity:0.8,candidateDimensions:['Physical','Emotional','Occupational']}
  },
  {
    id:'stable_low_uncertainty',
    expectation:'Prefer no adaptive question when evidence is fresh, uncertainty is low and there is no meaningful trigger.',
    context:{...base,activeTriggers:[],uncertainSignals:[],uncertaintyBySignal:{pressure_pattern:0.05,functional_interference:0.05,income_stability:0.05,cashflow_after_essentials:0.05,liquid_runway:0.05,member_perceived_leverage:0.05,member_perceived_feasibility:0.05,member_perceived_upstream_leverage:0.05},friction:0,capacity:1,candidateDimensions:['Physical']}
  },
  {
    id:'returning_stale_member',
    expectation:'Prefer stale, decision-relevant evidence tied to the active focus; do not dump a backlog of old questions.',
    context:{...base,activeTriggers:['emotional_priority','emotional_uncertainty'],uncertainSignals:['pressure_pattern','functional_interference'],uncertaintyBySignal:{pressure_pattern:0.8,functional_interference:0.8},evidenceAgeDays:{pressure_pattern:60,functional_interference:30},friction:0.25,capacity:0.55,maxQuestions:1,maxBurden:1,candidateDimensions:['Emotional','Physical']}
  }
];

export function runAdversarialScenarios(candidates){
  return adversarialScenarios.map(s=>{
    const result=selectQuestions(candidates,s.context,{maxQuestions:s.context.maxQuestions,maxBurden:s.context.maxBurden});
    return {id:s.id,expectation:s.expectation,selected:result.selected.map(x=>({id:x.question.id??x.question.question_key,score:Number(x.score.toFixed(4))})),ranked:result.ranked.slice(0,5).map(x=>({id:x.question.id??x.question.question_key,score:Number(x.score.toFixed(4))})),burdenUsed:result.burdenUsed};
  });
}
