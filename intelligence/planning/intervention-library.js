// EL8 MVP intervention + evidence-gathering library
// Candidate commitments are evidence-informed options, not prescriptions or claims
// that any item is optimal for a particular member. BCT tags make active ingredients
// explicit for later evidence review and testing.

const item = (x) => ({
  scope:'general_wellness',
  eligibility:{minReadiness:1},
  contraindications:[],
  bct:[],
  ...x
});

export const LIBRARY = {
  poor_sleep: [
    item({id:'sleep_log',type:'data',dimension:'physical',title:'Log your sleep',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Sleep start, end and optional quality',reviewDays:7,evidenceStrength:'supported',bct:['2.3 self-monitoring of behaviour']}),
    item({id:'stabilize_sleep_window',type:'intervention',dimension:'physical',title:'Keep a more consistent sleep window',effort:2,cadence:{type:'daily',target:7,period:'week'},measurement:'Log whether sleep/wake timing stayed near the chosen window',reviewDays:7,evidenceStrength:'supported',bct:['1.4 action planning','2.3 self-monitoring of behaviour','8.3 habit formation']})
  ],
  schedule_disruption: [
    item({id:'anchor_daily_schedule',type:'intervention',dimension:'occupational',title:'Create one daily anchor',effort:2,cadence:{type:'daily',target:7,period:'week'},measurement:'Log whether the anchor happened',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.4 action planning','7.1 prompts/cues','8.3 habit formation']})
  ],
  stress: [
    item({id:'stress_check',type:'data',dimension:'emotional',title:'Log stress and context',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Stress level plus what was happening',reviewDays:7,evidenceStrength:'evidence_informed',bct:['2.4 self-monitoring of outcomes','4.2 information about antecedents']}),
    item({id:'short_decompression',type:'intervention',dimension:'emotional',title:'Use a short decompression block',effort:1,cadence:{type:'weekly_target',target:5,period:'week'},measurement:'Completion and stress before/after',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.4 action planning','2.4 self-monitoring of outcomes']})
  ],
  low_energy: [
    item({id:'energy_observation',type:'data',dimension:'physical',title:'Track when energy drops',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Low-energy time and preceding activity',reviewDays:7,evidenceStrength:'evidence_informed',bct:['2.4 self-monitoring of outcomes','4.2 information about antecedents']})
  ],
  low_focus: [
    item({id:'focus_pattern_log',type:'data',dimension:'occupational',title:'Track when focus is easiest and hardest',effort:1,cadence:{type:'weekly_target',target:3,period:'week'},measurement:'Time, task and context when focus was strong or weak',reviewDays:7,evidenceStrength:'evidence_informed',bct:['2.3 self-monitoring of behaviour','4.2 information about antecedents']}),
    item({id:'protected_focus_block',type:'intervention',dimension:'occupational',title:'Protect one focus block',effort:2,cadence:{type:'weekly_target',target:3,period:'week'},measurement:'Log completion and approximate duration',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.4 action planning','12.1 restructuring physical environment']})
  ],
  low_activity: [
    item({id:'activity_baseline',type:'data',dimension:'physical',title:'Track your intentional movement',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Record intentional movement and approximate duration',reviewDays:7,evidenceStrength:'supported',bct:['2.3 self-monitoring of behaviour']}),
    item({id:'walk',type:'intervention',dimension:'physical',title:'Go for a walk',effort:2,cadence:{type:'weekly_target',target:3,period:'week'},measurement:'Log walk completion and approximate duration',reviewDays:7,evidenceStrength:'supported',bct:['1.1 goal setting behaviour','1.4 action planning','2.3 self-monitoring of behaviour','8.7 graded tasks']}),
    item({id:'strength_activity',type:'intervention',dimension:'physical',title:'Do a strength-training session',effort:3,cadence:{type:'weekly_target',target:2,period:'week'},measurement:'Log completed session',reviewDays:7,evidenceStrength:'supported',eligibility:{minReadiness:2},bct:['1.1 goal setting behaviour','1.4 action planning','2.3 self-monitoring of behaviour','8.7 graded tasks']})
  ],
  work_instability: [
    item({id:'work_barrier_snapshot',type:'data',dimension:'occupational',title:'Identify the main work or income barrier',effort:1,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record the main barrier and one factor affecting it',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.2 problem solving']}),
    item({id:'income_action',type:'intervention',dimension:'occupational',title:'Take one concrete income action',effort:3,cadence:{type:'weekly_target',target:2,period:'week'},measurement:'Record completed action and result',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.1 goal setting behaviour','1.4 action planning','2.3 self-monitoring of behaviour']})
  ],
  money_pressure: [
    item({id:'money_snapshot',type:'data',dimension:'financial',title:'Create a current money snapshot',effort:2,cadence:{type:'one_time',target:1,period:'once'},measurement:'Available cash, required payments and due dates',reviewDays:7,evidenceStrength:'evidence_informed',bct:['2.4 self-monitoring of outcomes']}),
    item({id:'financial_next_step',type:'intervention',dimension:'financial',title:'Take one manageable financial next step',effort:2,cadence:{type:'weekly_target',target:1,period:'week'},measurement:'Record the action taken and immediate result',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.2 problem solving','1.4 action planning']})
  ],
  relationship_strain: [
    item({id:'relationship_context_log',type:'data',dimension:'social',title:'Notice when relationship strain shows up',effort:1,cadence:{type:'weekly_target',target:3,period:'week'},measurement:'Record situation, trigger and outcome without diagnosing motive',reviewDays:7,evidenceStrength:'evidence_informed',bct:['2.4 self-monitoring of outcomes','4.2 information about antecedents']}),
    item({id:'relationship_repair_step',type:'intervention',dimension:'social',title:'Take one relationship repair step',effort:3,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record action and result',reviewDays:7,evidenceStrength:'evidence_informed',eligibility:{minReadiness:2},bct:['1.4 action planning','3.3 social support emotional']})
  ],
  low_support: [
    item({id:'support_map',type:'data',dimension:'social',title:'Map who you can realistically turn to',effort:1,cadence:{type:'one_time',target:1,period:'once'},measurement:'Identify at least one available source of practical or emotional support',reviewDays:7,evidenceStrength:'supported',bct:['3.1 social support unspecified']}),
    item({id:'support_contact',type:'intervention',dimension:'social',title:'Strengthen one support connection',effort:2,cadence:{type:'weekly_target',target:1,period:'week'},measurement:'Log one meaningful support contact',reviewDays:7,evidenceStrength:'supported',bct:['3.1 social support unspecified','1.4 action planning']})
  ],
  home_instability: [
    item({id:'environment_barrier_log',type:'data',dimension:'environmental',title:'Identify one environmental barrier',effort:1,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record the barrier and how it interferes with the current plan',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.2 problem solving','4.2 information about antecedents']}),
    item({id:'home_stability_step',type:'intervention',dimension:'environmental',title:'Resolve one home stability issue',effort:3,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record completed stability action',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.2 problem solving','12.1 restructuring physical environment']})
  ],
  lack_direction: [
    item({id:'values_prompt',type:'data',dimension:'spiritual',title:'Clarify what matters most right now',effort:1,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record one value or direction that currently matters',reviewDays:7,evidenceStrength:'evidence_informed',bct:['13.4 valued self-identity']}),
    item({id:'direction_next_step',type:'intervention',dimension:'spiritual',title:'Take one meaningful next step',effort:2,cadence:{type:'weekly_target',target:1,period:'week'},measurement:'Complete one step tied to what matters now',reviewDays:7,evidenceStrength:'evidence_informed',bct:['1.1 goal setting behaviour','1.4 action planning']})
  ]
};

export function candidatesForDriver(driverId) {
  return (LIBRARY[driverId] || []).map(x=>({...x,cadence:{...x.cadence},eligibility:{...x.eligibility},contraindications:[...x.contraindications],bct:[...x.bct]}));
}

export function allLibraryItems() {
  return Object.entries(LIBRARY).flatMap(([driver,items])=>items.map(item=>({driver,...item,cadence:{...item.cadence},eligibility:{...item.eligibility},contraindications:[...item.contraindications],bct:[...item.bct]})));
}
