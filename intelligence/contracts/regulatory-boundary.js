// Canonical regulatory-boundary contract for EL8 Intelligence.
// Tier R capabilities are blocked from the current MVP unless an explicit
// governed approval record is supplied. This is a product-scope control,
// not a substitute for jurisdiction-specific legal review.

export const REGULATORY_TIER = Object.freeze({
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  R: 'R',
});

export const CURRENT_MVP_ALLOWED_TIERS = Object.freeze([
  REGULATORY_TIER.A,
  REGULATORY_TIER.B,
  REGULATORY_TIER.C,
  REGULATORY_TIER.D,
]);

export function createRegulatoryBoundary({capabilityId,defaultTiers=[],permittedBehavior,escalationBehavior,tierRTriggers=[],evidenceRequirement=null,memberLanguageRestrictions=[]}={}) {
  if (!capabilityId) throw new Error('capabilityId is required');
  if (!permittedBehavior) throw new Error('permittedBehavior is required');
  if (!escalationBehavior) throw new Error('escalationBehavior is required');
  if (!Array.isArray(defaultTiers)||defaultTiers.length===0) throw new Error('defaultTiers must be non-empty');
  for (const tier of defaultTiers) if (!Object.values(REGULATORY_TIER).includes(tier)) throw new Error(`unknown regulatory tier: ${tier}`);
  return Object.freeze({capabilityId,defaultTiers:[...defaultTiers],permittedBehavior,escalationBehavior,tierRTriggers:[...tierRTriggers],evidenceRequirement,memberLanguageRestrictions:[...memberLanguageRestrictions]});
}

export function assertCapabilityReleaseAllowed({tier,approvalRecord=null}={}) {
  if (!Object.values(REGULATORY_TIER).includes(tier)) throw new Error(`unknown regulatory tier: ${tier}`);
  if (tier!==REGULATORY_TIER.R) return true;
  if (!approvalRecord||approvalRecord.status!=='approved'||!approvalRecord.reviewId) throw new Error('Tier R capability is blocked pending explicit regulatory review approval');
  return true;
}

export function requiresRegulatedFunctionReview({diagnosesCondition=false,predictsDiseaseRiskForClinicalManagement=false,recommendsDiseaseTreatment=false,changesMedicationOrDose=false,analyzesMedicalSignalForDiagnosisOrTreatment=false,replacesProfessionalClinicalJudgment=false}={}) {
  return Boolean(diagnosesCondition||predictsDiseaseRiskForClinicalManagement||recommendsDiseaseTreatment||changesMedicationOrDose||analyzesMedicalSignalForDiagnosisOrTreatment||replacesProfessionalClinicalJudgment);
}
