export function selectIntervention(state, candidates) {
  if (!state || state.resolutionState !== 'sufficient') throw new Error('Intervention selection requires sufficient concern state');
  if (state.immediacyClass == null || state.safetyEscalationLevel == null) throw new Error('Missing sufficiency contract fields');
  if ((state.safetyEscalationLevel ?? 0) > 0) return {type:'escalation', concernId:state.concernId, reason:'safety-escalation'};
  const applicable = candidates.filter(c => c.concernId === state.concernId && (!c.applicable || c.applicable(state)));
  applicable.sort((a,b) => (b.specificity ?? 0) - (a.specificity ?? 0) || a.id.localeCompare(b.id));
  if (!applicable.length) return {type:'deferred', concernId:state.concernId, reason:'no-applicable-intervention'};
  return {type:'intervention', concernId:state.concernId, intervention:applicable[0]};
}

export const HOME_INTERVENTIONS = Object.freeze([
  {id:'home_acute_step', concernId:'home_instability', specificity:3, applicable:s => s.immediacyClass === 'acute', title:'Take the next time-critical housing stability step'},
  {id:'home_time_sensitive_step', concernId:'home_instability', specificity:2, applicable:s => s.immediacyClass === 'time-sensitive', title:'Address the time-sensitive housing issue'},
  {id:'home_environment_step', concernId:'home_instability', specificity:1, applicable:s => s.immediacyClass === 'routine', title:'Improve one home or environmental barrier'}
]);
