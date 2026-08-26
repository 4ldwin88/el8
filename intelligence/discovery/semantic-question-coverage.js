// Semantic coverage bridge for Discovery.
// Questions may declare semanticKeys: the facts they are intended to establish.
// Current, sufficiently reliable facts suppress questions that would only relearn them.

const DEFAULT_MIN_RELIABILITY = 0.6;

function currentFact(fact) {
  return fact && fact.currentStatus !== 'superseded' && fact.currentStatus !== 'retracted';
}

function reliableEnough(fact, minReliability = DEFAULT_MIN_RELIABILITY) {
  if (fact.memberConfirmed) return true;
  if (fact.reliability === null || fact.reliability === undefined) return false;
  return Number(fact.reliability) >= minReliability;
}

export function factsForSemanticKey(facts = {}, semanticKey) {
  return Object.values(facts).filter(fact => currentFact(fact) && fact.semanticKey === semanticKey);
}

export function semanticKeyKnown(facts = {}, semanticKey, { minReliability = DEFAULT_MIN_RELIABILITY } = {}) {
  return factsForSemanticKey(facts, semanticKey).some(fact => reliableEnough(fact, minReliability));
}

export function semanticCoverage(question, facts = {}, options = {}) {
  const keys = [...new Set(question?.semanticKeys ?? [])].filter(Boolean);
  if (!keys.length) return Object.freeze({ declared: false, complete: false, knownKeys: [], missingKeys: [] });
  const knownKeys = keys.filter(key => semanticKeyKnown(facts, key, options));
  const missingKeys = keys.filter(key => !knownKeys.includes(key));
  return Object.freeze({ declared: true, complete: missingKeys.length === 0, knownKeys, missingKeys });
}

export function questionRedundantWithFacts(question, facts = {}, options = {}) {
  return semanticCoverage(question, facts, options).complete;
}
