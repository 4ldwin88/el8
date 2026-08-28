import assert from 'node:assert/strict';
import { evaluateContextualSafety, evaluateDirectConfirmation, SAFETY_POLICY_VERSION } from './policy.js';

assert.equal(SAFETY_POLICY_VERSION, '0.2.0');

{
  const result = evaluateContextualSafety({ contextualSignals: { overwhelm: 0.99, functioning: 0.99 } });
  assert.equal(result.needsDirectConfirmation, false, 'generic numeric context must not manufacture a Safety trigger');
  assert.deepEqual(result.signals, []);
}

{
  const result = evaluateContextualSafety({ contextualSignals: { explicitSafetyConcern: true } });
  assert.equal(result.needsDirectConfirmation, true);
  assert.equal(result.signals[0].level, 1);
  assert.equal(result.signals[0].code, 'explicit_safety_concern_requires_confirmation');
}

{
  const result = evaluateContextualSafety({ contextualSignals: { directSafetyLanguage: true } });
  assert.equal(result.needsDirectConfirmation, true);
  assert.equal(result.signals[0].code, 'direct_safety_language_requires_confirmation');
}

{
  const result = evaluateContextualSafety({ contextualSignals: { observedSafetyConcern: true } });
  assert.equal(result.needsDirectConfirmation, true);
  assert.equal(result.signals[0].code, 'observed_safety_concern_requires_confirmation');
}

{
  const result = evaluateContextualSafety({ contextualSignals: { safetyClarificationRequired: true } });
  assert.equal(result.needsDirectConfirmation, true);
  assert.equal(result.signals[0].code, 'context_requires_direct_confirmation');
}

{
  const contextual = evaluateContextualSafety({ contextualSignals: { explicitSafetyConcern: true } });
  const disposition = evaluateDirectConfirmation({ signalRefs: contextual.signals.map(signal => signal.signalId), confirmation: { immediateDanger: false, intent: false, canStaySafe: true } });
  assert.equal(disposition.disposition, 'continue_with_constraints');
  assert.ok(disposition.rationaleCodes.includes('direct_confirmation_negative'));
}

{
  const contextual = evaluateContextualSafety({ contextualSignals: { explicitSafetyConcern: true } });
  const disposition = evaluateDirectConfirmation({ signalRefs: contextual.signals.map(signal => signal.signalId), confirmation: { canStaySafe: false } });
  assert.equal(disposition.disposition, 'escalate');
  assert.ok(disposition.rationaleCodes.includes('direct_confirmation_positive'));
}

assert.throws(() => evaluateDirectConfirmation({ signalRefs: [] }), /signalRefs must be non-empty/);
console.log('canonical Safety semantic-trigger policy tests passed');
