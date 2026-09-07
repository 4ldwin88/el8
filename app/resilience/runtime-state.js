// Canonical member-facing runtime resilience contract.
// This adapter translates infrastructure/runtime conditions into governed presentation
// states. It does not create a second Member State or alter Intelligence decisions.

export const RUNTIME_STATE = Object.freeze({
  READY: 'ready',
  LOADING: 'loading',
  INSUFFICIENT_EVIDENCE: 'insufficient_evidence',
  OFFLINE: 'offline',
  PERSISTENCE_FAILURE: 'persistence_failure',
  REVISION_CONFLICT: 'revision_conflict',
  DEGRADED_INTELLIGENCE: 'degraded_intelligence',
  SAFETY_INTERRUPT: 'safety_interrupt'
});

const COPY = Object.freeze({
  [RUNTIME_STATE.READY]: Object.freeze({ title: '', message: '', action: null }),
  [RUNTIME_STATE.LOADING]: Object.freeze({ title: 'Loading your plan', message: 'EL8 is getting your latest information.', action: null }),
  [RUNTIME_STATE.INSUFFICIENT_EVIDENCE]: Object.freeze({ title: 'More information is needed', message: 'There is not enough evidence yet to make this decision confidently.', action: 'continue_discovery' }),
  [RUNTIME_STATE.OFFLINE]: Object.freeze({ title: 'You’re offline', message: 'Your confirmed information is unchanged. Reconnect before saving new changes.', action: 'retry' }),
  [RUNTIME_STATE.PERSISTENCE_FAILURE]: Object.freeze({ title: 'Your change was not confirmed', message: 'EL8 could not confirm that this change was saved. Your last confirmed information is unchanged.', action: 'retry' }),
  [RUNTIME_STATE.REVISION_CONFLICT]: Object.freeze({ title: 'Your information changed elsewhere', message: 'Reload the latest confirmed information before making this change again.', action: 'reload' }),
  [RUNTIME_STATE.DEGRADED_INTELLIGENCE]: Object.freeze({ title: 'EL8 cannot make this decision right now', message: 'Your confirmed information is still available, but EL8 will not guess while decision support is unavailable.', action: 'retry' }),
  [RUNTIME_STATE.SAFETY_INTERRUPT]: Object.freeze({ title: 'Immediate help', message: 'Safety takes priority over ordinary EL8 recommendations and plan changes.', action: 'safety' })
});

export function runtimeState(kind = RUNTIME_STATE.READY, detail = {}) {
  if (!Object.values(RUNTIME_STATE).includes(kind)) throw new Error(`unknown runtime state: ${kind}`);
  return Object.freeze({ kind, blocking: kind !== RUNTIME_STATE.READY, ...COPY[kind], ...detail });
}

export function runtimeStateFromError(error, { online = typeof navigator === 'undefined' ? true : navigator.onLine !== false } = {}) {
  if (!online) return runtimeState(RUNTIME_STATE.OFFLINE);
  const message = String(error?.message || error || '');
  if (/safety|immediate help|crisis/i.test(message)) return runtimeState(RUNTIME_STATE.SAFETY_INTERRUPT);
  if (/revision conflict|conflict/i.test(message)) return runtimeState(RUNTIME_STATE.REVISION_CONFLICT);
  if (/intelligence|decision support|degraded/i.test(message)) return runtimeState(RUNTIME_STATE.DEGRADED_INTELLIGENCE);
  return runtimeState(RUNTIME_STATE.PERSISTENCE_FAILURE);
}

export function discoveryRuntimeState(output = {}) {
  if (output?.safety?.interrupted === true || output?.handoff?.safetyInterrupted === true) return runtimeState(RUNTIME_STATE.SAFETY_INTERRUPT);
  const handoff = output?.handoff;
  if (!handoff) return runtimeState(RUNTIME_STATE.LOADING);
  if (handoff.usable === false || (handoff.blockingConstructIds?.length ?? 0) > 0) {
    return runtimeState(RUNTIME_STATE.INSUFFICIENT_EVIDENCE, {
      unresolvedConstructIds: Object.freeze([...(handoff.unresolvedConstructIds || [])]),
      blockingConstructIds: Object.freeze([...(handoff.blockingConstructIds || [])])
    });
  }
  return runtimeState(RUNTIME_STATE.READY, { boundedUncertainty: Boolean(handoff.boundedUncertainty) });
}

export function dominantRuntimeState(...states) {
  const present = states.filter(Boolean);
  return present.find(state => state.kind === RUNTIME_STATE.SAFETY_INTERRUPT)
    || present.find(state => state.kind === RUNTIME_STATE.REVISION_CONFLICT)
    || present.find(state => state.kind === RUNTIME_STATE.PERSISTENCE_FAILURE || state.kind === RUNTIME_STATE.OFFLINE)
    || present.find(state => state.kind === RUNTIME_STATE.DEGRADED_INTELLIGENCE)
    || present.find(state => state.kind === RUNTIME_STATE.INSUFFICIENT_EVIDENCE)
    || present.find(state => state.kind === RUNTIME_STATE.LOADING)
    || present[0]
    || runtimeState(RUNTIME_STATE.READY);
}

export async function withRuntimeState(operation, { online } = {}) {
  try {
    const value = await operation();
    return Object.freeze({ value, state: runtimeState(RUNTIME_STATE.READY) });
  } catch (error) {
    return Object.freeze({ value: null, error, state: runtimeStateFromError(error, { online }) });
  }
}
