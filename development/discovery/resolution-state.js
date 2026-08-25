export const LEGAL_TRANSITIONS = Object.freeze({
  unscoped: ['triaged','narrowing','deferred','escalated','nonIssue'],
  triaged: ['narrowing','sufficient','deferred','escalated','nonIssue'],
  narrowing: ['sufficient','deferred','escalated','nonIssue'],
  sufficient: [], deferred: [], escalated: [], nonIssue: []
});

export function assertTransition(from, to) {
  if (!(LEGAL_TRANSITIONS[from] ?? []).includes(to)) throw new Error(`Illegal resolution transition ${from} -> ${to}`);
  return true;
}

export function canTransitionToSufficient(state, concernRule = {}) {
  if (!state) return false;
  if (state.driverKnown !== true) return false;
  if (state.immediacyClass == null) return false;
  if (state.safetyEscalationLevel == null) return false;
  return concernRule.sufficient ? Boolean(concernRule.sufficient(state)) : true;
}
