// Canonical pre-selection evidence contract for Adaptive Planning.
// Selection evidence is information that can materially change WHICH action is chosen.
// Activation evidence belongs to plan-deepening and only tailors/measures an action after selection.

const freeze=x=>Object.freeze(x);
const selection=(x)=>freeze({phase:'selection',requiredBeforeSelection:true,...x});

// Drivers listed here intentionally require decision-changing evidence before EL8 may choose
// between observation and intervention, or among multiple interventions.
export const SELECTION_EVIDENCE=freeze({
  poor_sleep:[selection({id:'sleep-current-pattern',evidenceKey:'baseline.sleep_pattern',purpose:'eligibility_and_action_choice',prompt:'Which best describes your sleep pattern recently?',options:['Mostly consistent and restful','Mostly consistent but not restful','Timing changes a lot','I am not sure yet']})],
  schedule_disruption:[selection({id:'schedule-current-pattern',evidenceKey:'schedule.current_pattern',purpose:'action_choice',prompt:'Which part of your daily schedule is least predictable right now?',options:['Sleep and wake times','Meals or self-care','Work or responsibilities','My whole day varies','Something else']})],
  stress:[selection({id:'stress-current-context',evidenceKey:'stress.current_context',purpose:'observation_vs_intervention_choice',prompt:'Do you already know when or what tends to drive the stress you want help with?',options:['Yes — the pattern is fairly clear','Partly — I have some idea','No — I need to understand the pattern first']})],
  low_focus:[selection({id:'focus-current-pattern',evidenceKey:'focus.current_pattern',purpose:'observation_vs_intervention_choice',prompt:'Do you already know when and under what conditions your focus tends to work best?',options:['Yes — the useful pattern is fairly clear','Partly — I have some idea','No — I need to understand the pattern first']})],
  low_activity:[selection({id:'activity-current-level',evidenceKey:'baseline.activity_level',purpose:'dose_and_action_choice',prompt:'How much intentional movement are you currently getting in a typical week?',options:['Almost none','1–2 days','3–4 days','5+ days','It varies too much to say']})],
  work_instability:[selection({id:'income-current-route',evidenceKey:'work.current_income_route',purpose:'action_choice',prompt:'Which income route are you willing and able to pursue right now?',options:['Apply for jobs','Freelance or contract work','Build or sell something','Improve current work or hours','I am not sure yet']})],
  money_pressure:[selection({id:'money-current-state',evidenceKey:'financial.current_snapshot',purpose:'action_choice',prompt:'Which best describes what you need most right now?',options:['Understand where my money is going','Get clear on cash, bills and due dates','Take action on a specific bill or debt','Increase income','Something else']})],
  relationship_strain:[selection({id:'relationship-current-goal',evidenceKey:'relationship.repair_goal',purpose:'action_choice',prompt:'What would you most like to improve in this relationship right now?',options:['Communication','Trust or repair','Boundaries','More support or connection','I am not sure yet']})],
  low_support:[selection({id:'support-availability',evidenceKey:'support.available',purpose:'feasibility_and_action_choice',prompt:'Is there someone you would realistically consider turning to for support right now?',options:['Yes','Maybe','No']})],
  home_instability:[selection({id:'environment-current_barrier',evidenceKey:'environment.current_barrier',purpose:'action_choice',prompt:'Which home or environment issue is interfering with you most right now?',options:['Clutter or organization','Noise or interruptions','Housing stability','Access to what I need','Something else']})],
  lack_direction:[selection({id:'values-current-direction',evidenceKey:'values.current_direction',purpose:'action_choice',prompt:'What matters enough right now that you want your next step to support?',options:['Health and stability','Work or progress','Relationships','Learning or growth','Meaning or purpose','I am not sure yet']})]
});

// Observation-only drivers intentionally do not require pre-selection evidence because there is
// no competing intervention decision yet. Their first action exists to gather the missing pattern.
export const OBSERVATION_ONLY_DRIVERS=freeze(['low_energy']);

export function selectionRequirementsForDriver(driverId){return(SELECTION_EVIDENCE[driverId]||[]).map(x=>({...x,options:x.options?[...x.options]:undefined}));}
export function selectionRequirementsForEvidence(evidence=[]){const seen=new Set();return evidence.flatMap(d=>selectionRequirementsForDriver(d.id)).filter(r=>!seen.has(r.evidenceKey)&&seen.add(r.evidenceKey));}
export function missingSelectionRequirements(evidence=[],answers={}){return selectionRequirementsForEvidence(evidence).filter(r=>answers?.[r.evidenceKey]==null||answers?.[r.evidenceKey]==='');}
export function driverSelectionMode(driverId){if(SELECTION_EVIDENCE[driverId])return'selection_evidence';if(OBSERVATION_ONLY_DRIVERS.includes(driverId))return'observation_only';return'unclassified';}
