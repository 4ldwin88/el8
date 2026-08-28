// Semantic coverage bridge for Discovery.
// Questions may declare semanticKeys: the facts they are intended to establish.
// A question is suppressed only by a current fact whose authority is explicit. Numeric reliability
// estimates remain provenance metadata; Discovery does not invent a universal cutoff for truth.

function currentFact(fact) {
  return fact && fact.currentStatus !== 'superseded' && fact.currentStatus !== 'retracted';
}

function authoritativeFact(fact) {
  if (!currentFact(fact)) return false;
  if (fact.memberConfirmed === true) return true;
  return fact.authoritative === true || fact.validationStatus === 'validated';
}

export function factsForSemanticKey(facts = {}, semanticKey) {
  return Object.values(facts).filter(fact => currentFact(fact) && fact.semanticKey === semanticKey);
}

export function semanticKeyKnown(facts = {}, semanticKey) {
  return factsForSemanticKey(facts, semanticKey).some(authoritativeFact);
}

export function semanticCoverage(question, facts = {}) {
  const keys = [...new Set(question?.semanticKeys ?? [])].filter(Boolean);
  if (!keys.length) return Object.freeze({ declared: false, complete: false, knownKeys: [], missingKeys: [] });
  const knownKeys = keys.filter(key => semanticKeyKnown(facts, key));
  const missingKeys = keys.filter(key => !knownKeys.includes(key));
  return Object.freeze({ declared: true, complete: missingKeys.length === 0, knownKeys, missingKeys });
}

export function questionRedundantWithFacts(question, facts = {}) {
  return semanticCoverage(question, facts).complete;
}
