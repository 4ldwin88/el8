import assert from 'node:assert/strict';
import { evaluateContextualSafety, evaluateDirectConfirmation } from './policy.js';

{
  const result = evaluateContextualSafety({ contextualSignals: { overwhelm: 0.4, functioning: 0.3 } });
  assert.equal(result.needsDirectConfirmation, false);
  assert.deepEqual(result.signals, []);
}

{
  const result = evaluateContextualSafety({ contextualSignals: { overwhelm: 0.95 } });
  assert.equal(result.needsDirectConfirmation, true);
  assert.equal(result.signals[0].level, 1);
  assert.equal(result.signals[0].code, 'context_requires_direct_confirmation');
}

{
  const result = evaluateContextualSafety({ contextualSignals: { overwhelm: 0.7, functioning: 0.7 } });
  assert.equal(result.needsDirectConfirmation, true);
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
console.log('canonical Safety policy tests passed');
