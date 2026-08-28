// Canonical Safety policy.
// Contextual signals may justify clarification, but they never establish acute risk alone.
// Escalation requires explicit safety information; no weighted risk score is produced.

import { SAFETY_LEVEL, createSafetySignal, createSafetyDisposition } from '../contracts/safety.js';

export const SAFETY_POLICY_VERSION = '0.2.0';

function contextualConfirmationReason(contextualSignals = {}) {
  if (contextualSignals.explicitSafetyConcern === true) return 'explicit_safety_concern_requires_confirmation';
  if (contextualSignals.directSafetyLanguage === true) return 'direct_safety_language_requires_confirmation';
  if (contextualSignals.observedSafetyConcern === true) return 'observed_safety_concern_requires_confirmation';
  if (contextualSignals.safetyClarificationRequired === true) return 'context_requires_direct_confirmation';
  return null;
}

export function evaluateContextualSafety({ signalId = 'safety:context', sourceComponent = 'safety-policy', contextualSignals = {}, observationRefs = [], evidenceRefs = [], concernRefs = [], detectedAt = null } = {}) {
  const reason = contextualConfirmationReason(contextualSignals);
  if (!reason) return { needsDirectConfirmation: false, signals: [], rationaleCodes: ['no_confirmation_trigger'] };

  const signal = createSafetySignal({
    signalId,
    level: SAFETY_LEVEL.ATTENTION,
    code: reason,
    sourceComponent,
    observationRefs,
    evidenceRefs,
    concernRefs,
    detectedAt,
  });

  return { needsDirectConfirmation: true, signals: [signal], rationaleCodes: [signal.code] };
}

export function evaluateDirectConfirmation({ signalRefs = [], confirmation = {}, decidedAt = null } = {}) {
  if (!Array.isArray(signalRefs) || signalRefs.length === 0) throw new Error('signalRefs must be non-empty');

  const immediateDanger = confirmation.immediateDanger === true;
  const intent = confirmation.intent === true;
  const cannotStaySafe = confirmation.canStaySafe === false;
  const explicitPositive = immediateDanger || intent || cannotStaySafe;

  return createSafetyDisposition({
    dispositionId: `safety-disposition:${signalRefs.join('+')}`,
    signalRefs,
    disposition: explicitPositive ? 'escalate' : 'continue_with_constraints',
    constraints: explicitPositive ? ['pause_ordinary_recommendations'] : ['safety_confirmation_completed'],
    rationaleCodes: [explicitPositive ? 'direct_confirmation_positive' : 'direct_confirmation_negative'],
    decidedAt,
  });
}
