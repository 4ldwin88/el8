// Canonical Safety policy.
// Contextual signals may justify clarification, but they never establish acute risk alone.
// Escalation requires explicit safety information; no weighted risk score is produced.

import { SAFETY_LEVEL, createSafetySignal, createSafetyDisposition } from '../contracts/safety.js';

export const SAFETY_POLICY_VERSION = '0.2.0';

export function evaluateContextualSafety({ signalId = 'safety:context', sourceComponent = 'safety-policy', contextualSignals = {}, observationRefs = [], evidenceRefs = [], constructRefs = [], detectedAt = null } = {}) {
  const explicitConcern = contextualSignals.explicitSafetyConcern === true;
  const strongContext = Object.entries(contextualSignals)
    .filter(([key]) => key !== 'explicitSafetyConcern')
    .some(([, value]) => typeof value === 'number' && Number.isFinite(value) && value >= 0.9);
  const convergingContext = Object.entries(contextualSignals)
    .filter(([key]) => key !== 'explicitSafetyConcern')
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value >= 0.65)
    .length >= 2;
  const needsDirectConfirmation = explicitConcern || strongContext || convergingContext;

  if (!needsDirectConfirmation) return { needsDirectConfirmation: false, signals: [], rationaleCodes: ['no_confirmation_trigger'] };

  const signal = createSafetySignal({
    signalId,
    level: SAFETY_LEVEL.ATTENTION,
    code: explicitConcern ? 'explicit_safety_concern_requires_confirmation' : 'context_requires_direct_confirmation',
    sourceComponent,
    observationRefs,
    evidenceRefs,
    constructRefs,
    detectedAt,
  });

  return { needsDirectConfirmation: true, signals: [signal], rationaleCodes: [signal.code] };
}

export function isCompleteDirectConfirmation(confirmation) {
  return confirmation !== null && typeof confirmation === 'object' && !Array.isArray(confirmation)
    && typeof confirmation.immediateDanger === 'boolean'
    && typeof confirmation.intent === 'boolean'
    && typeof confirmation.canStaySafe === 'boolean';
}

export function evaluateDirectConfirmation({ signalRefs = [], confirmation = {}, decidedAt = null } = {}) {
  if (!Array.isArray(signalRefs) || signalRefs.length === 0) throw new Error('signalRefs must be non-empty');
  if (!isCompleteDirectConfirmation(confirmation)) throw new Error('direct Safety confirmation must contain boolean immediateDanger, intent, and canStaySafe');

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
