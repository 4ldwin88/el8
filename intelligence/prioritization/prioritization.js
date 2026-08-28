// Canonical EL8 Prioritization.
// Answers one question only: among Discovery-established problems, what matters most now?
// Discovery owns sufficiency. Planning owns intervention feasibility.

export const PRIORITIZATION_SCHEMA_VERSION = '1.0.0';
const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
function factorFor(factors, problemId, key) {
  const value = factors?.[problemId]?.[key] ?? factors?.[key]?.[problemId];
  return value == null ? null : clamp01(value);
}
function decisionProfile(candidate, factors = {}) {
  return {
    memberImportance: factorFor(factors, candidate.problemId, 'memberImportance'),
    urgency: factorFor(factors, candidate.problemId, 'urgency'),
    materiality: factorFor(factors, candidate.problemId, 'materiality'),
    leverage: factorFor(factors, candidate.problemId, 'leverage'),
    readiness: factorFor(factors, candidate.problemId, 'readiness'),
  };
}
function compareProfiles(a, b) {
  for (const key of ['urgency','materiality','memberImportance','leverage','readiness']) {
    const av=a.profile[key],bv=b.profile[key];
    // Missing evidence is unknown, not neutral or negative. Only compare a factor when
    // Discovery established that factor for both candidates.
    if (av == null || bv == null) continue;
    const difference = bv - av;
    if (difference !== 0) return difference;
  }
  return a.candidate.problemId.localeCompare(b.candidate.problemId);
}
function rationaleCodes(profile) {
  const codes = ['discovery_supported'];
  if (profile.memberImportance != null && profile.memberImportance >= .7) codes.push('member_importance');
  if (profile.urgency != null && profile.urgency >= .7) codes.push('high_urgency');
  if (profile.materiality != null && profile.materiality >= .7) codes.push('high_materiality');
  if (profile.leverage != null && profile.leverage >= .7) codes.push('shared_driver_leverage');
  if (profile.readiness != null && profile.readiness >= .7) codes.push('member_readiness');
  return codes;
}
export function prioritizeCandidates(input, { safetyDisposition = null, decisionFactors = {}, now = new Date().toISOString() } = {}) {
  if (!input || !Number.isInteger(input.memberStateRevision)) throw new Error('canonical prioritization input is required');
  if (!Array.isArray(input.candidates)) throw new Error('input.candidates is required');
  const blocked = ['pause_ordinary_flow','escalate'].includes(safetyDisposition?.disposition);
  if (blocked) return { schemaVersion:PRIORITIZATION_SCHEMA_VERSION,memberStateRevision:input.memberStateRevision,createdAt:now,blockedBySafety:true,priorityItems:[],alternatives:[],rationaleCodes:['safety_override'] };
  const ranked=input.candidates.map(candidate=>({candidate,profile:decisionProfile(candidate,decisionFactors)})).sort(compareProfiles);
  const priorityItems=ranked.map(({candidate,profile},index)=>({priorityId:`priority:${candidate.problemId.replace(/^problem:/,'')}`,rank:index+1,problemId:candidate.problemId,evidenceRefs:[...(candidate.evidenceRefs||[])],rationaleCodes:rationaleCodes(profile),decisionFactors:profile}));
  return {schemaVersion:PRIORITIZATION_SCHEMA_VERSION,memberStateRevision:input.memberStateRevision,createdAt:now,blockedBySafety:false,priorityItems,alternatives:priorityItems.slice(1),rationaleCodes:['priority_policy']};
}

// Compatibility alias during migration. New callers must use prioritizeCandidates.
export const prioritizeMemberState = prioritizeCandidates;
