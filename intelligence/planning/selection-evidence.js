// Canonical pre-selection evidence contract for Adaptive Planning.
// Selection evidence is keyed by canonical Problem Registry ID. Legacy Discovery driver IDs
// are accepted only at this temporary compatibility edge during migration.
const freeze=x=>Object.freeze(x);
const selection=x=>freeze({phase:'selection',requiredBeforeSelection:true,...x});
const LEGACY_TO_PROBLEM=freeze({poor_sleep:'P02',schedule_disruption:'P04',stress:'P06',low_focus:'P04',low_activity:'P01',work_instability:'P05',money_pressure:'P03',relationship_strain:'P07',low_support:'P07',home_instability:'P08',lack_direction:'P04',low_energy:'P01'});
const canonical=id=>/^P0[1-8]$/.test(String(id||''))?String(id):LEGACY_TO_PROBLEM[id]||null;
export const SELECTION_EVIDENCE=freeze({
 P01:[selection({id:'activity-current-level',evidenceKey:'baseline.activity_level',purpose:'dose_and_action_choice',prompt:'How much intentional movement are you currently getting in a typical week?',options:['Almost none','1–2 days','3–4 days','5+ days','It varies too much to say']})],
 P02:[selection({id:'sleep-current-pattern',evidenceKey:'baseline.sleep_pattern',purpose:'eligibility_and_action_choice',prompt:'Which best describes your sleep pattern recently?',options:['Mostly consistent and restful','Mostly consistent but not restful','Timing changes a lot','I am not sure yet']})],
 P03:[selection({id:'money-current-state',evidenceKey:'financial.current_snapshot',purpose:'action_choice',prompt:'Which best describes what you need most right now?',options:['Understand where my money is going','Get clear on cash, bills and due dates','Take action on a specific bill or debt','Increase income','Something else']})],
 P04:[selection({id:'focus-current-pattern',evidenceKey:'focus.current_pattern',purpose:'observation_vs_intervention_choice',prompt:'Do you already know when and under what conditions your focus tends to work best?',options:['Yes — the useful pattern is fairly clear','Partly — I have some idea','No — I need to understand the pattern first']})],
 P05:[selection({id:'income-current-route',evidenceKey:'work.current_income_route',purpose:'action_choice',prompt:'Which income route are you willing and able to pursue right now?',options:['Apply for jobs','Freelance or contract work','Build or sell something','Improve current work or hours','I am not sure yet']})],
 P06:[selection({id:'stress-current-context',evidenceKey:'stress.current_context',purpose:'observation_vs_intervention_choice',prompt:'Do you already know when or what tends to drive the stress you want help with?',options:['Yes — the pattern is fairly clear','Partly — I have some idea','No — I need to understand the pattern first']})],
 P07:[selection({id:'support-availability',evidenceKey:'support.available',purpose:'feasibility_and_action_choice',prompt:'Is there someone you would realistically consider turning to for support right now?',options:['Yes','Maybe','No']})],
 P08:[selection({id:'environment-current-barrier',evidenceKey:'environment.current_barrier',purpose:'action_choice',prompt:'Which home or environment issue is interfering with you most right now?',options:['Clutter or organization','Noise or interruptions','Housing stability','Access to what I need','Something else']})]
});
export const OBSERVATION_ONLY_PROBLEMS=freeze([]);
export const OBSERVATION_ONLY_DRIVERS=freeze(['low_energy']);
export function selectionRequirementsForProblem(problemId){const id=canonical(problemId);return(SELECTION_EVIDENCE[id]||[]).map(x=>({...x,options:x.options?[...x.options]:undefined}));}
export const selectionRequirementsForDriver=selectionRequirementsForProblem;
export function selectionRequirementsForEvidence(evidence=[]){const seen=new Set();return evidence.flatMap(d=>selectionRequirementsForProblem(d.problem_id||d.id)).filter(r=>!seen.has(r.evidenceKey)&&seen.add(r.evidenceKey));}
export function missingSelectionRequirements(evidence=[],answers={}){return selectionRequirementsForEvidence(evidence).filter(r=>answers?.[r.evidenceKey]==null||answers?.[r.evidenceKey]==='');}
export function driverSelectionMode(id){const problemId=canonical(id);if(SELECTION_EVIDENCE[problemId])return'selection_evidence';if(OBSERVATION_ONLY_DRIVERS.includes(id)||OBSERVATION_ONLY_PROBLEMS.includes(problemId))return'observation_only';return'unclassified';}
