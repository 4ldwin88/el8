export const EFFECT_TYPES = Object.freeze(['evidence','safety','immediacy','readiness','importance','member-priority','feasibility','constraint','barrier','support','access','capacity']);
export const RESOLUTION_STATES = Object.freeze(['unscoped','triaged','narrowing','sufficient','deferred','escalated','nonIssue']);
export const IMMEDIACY = Object.freeze(['routine','time-sensitive','acute']);
export const TEMPORALITY = Object.freeze(['current','recurring','historical','resolved','unknown']);
export const SOURCE_TYPES = Object.freeze(['direct','inferred','derived']);

export function assertEffect(effect) {
  if (!effect || !EFFECT_TYPES.includes(effect.type)) throw new Error(`Invalid effect type: ${effect?.type}`);
  if (!SOURCE_TYPES.includes(effect.sourceType ?? 'direct')) throw new Error('Invalid effect sourceType');
  if (effect.temporality && !TEMPORALITY.includes(effect.temporality)) throw new Error('Invalid effect temporality');
  if (effect.type === 'evidence') {
    if (!['supports','contradicts','neutral'].includes(effect.polarity)) throw new Error('Invalid evidence polarity');
    if (!['graded','definitive'].includes(effect.certainty ?? 'graded')) throw new Error('Invalid evidence certainty');
  }
  if (effect.type === 'immediacy' && !IMMEDIACY.includes(effect.value)) throw new Error('Invalid immediacy');
  if (effect.type === 'feasibility' && (!effect.feasibility || typeof effect.feasibility !== 'object' || Array.isArray(effect.feasibility))) throw new Error('Invalid feasibility payload');
  return effect;
}

export function makeObservation({id, questionId, concernId, answerValue, specificityLevel=0, timestamp=Date.now(), effects=[]}) {
  if (!id || !questionId) throw new Error('Observation requires id and questionId');
  return Object.freeze({id, questionId, concernId: concernId ?? null, answerValue, specificityLevel, timestamp, effects: Object.freeze(effects.map(assertEffect))});
}
