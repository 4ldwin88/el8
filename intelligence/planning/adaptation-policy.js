// Bounded adaptation policy for the Adaptive Plan experiment.
// A single ordinary review never silently replaces or reprioritizes a plan.

export const PLAN_ADAPTATIONS=Object.freeze(['maintain','observe','modify','reassess','reprioritize','safety_hold']);

export function decidePlanAdaptation(reviews=[]){
  const valid=reviews.filter(r=>r?.decision?.adaptation);
  if(!valid.length)return {adaptation:'observe',reason:'no_review_evidence',automatic:false};
  if(valid.some(r=>r.decision.adaptation==='escalate'))return {adaptation:'safety_hold',reason:'safety_change',automatic:true};
  if(valid.some(r=>r.decision.adaptation==='reprioritize'))return {adaptation:'reprioritize',reason:'material_context_change',automatic:false,requiresConfirmation:true};

  const recent=valid.slice(-3),count=a=>recent.filter(r=>r.decision.adaptation===a).length;
  if(count('maintain')>=2)return {adaptation:'maintain',reason:'repeated_supported_benefit',automatic:false};
  if(count('simplify_or_reschedule')>=2)return {adaptation:'modify',reason:'repeated_fit_or_adherence_barrier',automatic:false,requiresConfirmation:true};
  if(count('reassess')>=2)return {adaptation:'reassess',reason:'repeated_poor_outcome_despite_adherence',automatic:false,requiresConfirmation:true};
  if(count('deepen_measurement')>=1)return {adaptation:'observe',reason:'measurement_insufficient',automatic:false};
  return {adaptation:'observe',reason:'insufficient_repeated_evidence',automatic:false};
}
