import assert from 'node:assert/strict';
import {
  REGULATORY_TIER,
  CURRENT_MVP_ALLOWED_TIERS,
  createRegulatoryBoundary,
  assertCapabilityReleaseAllowed,
  requiresRegulatedFunctionReview,
} from './regulatory-boundary.js';

const discovery = createRegulatoryBoundary({
  capabilityId: 'discovery',
  defaultTiers: [REGULATORY_TIER.A, REGULATORY_TIER.B, REGULATORY_TIER.C, REGULATORY_TIER.D],
  permittedBehavior: 'Collect and interpret wellness evidence without diagnosing or prescribing.',
  escalationBehavior: 'Route professional needs to Tier C and governed Safety conditions to Tier D.',
  tierRTriggers: ['diagnosis', 'disease_prediction_for_clinical_management'],
  evidenceRequirement: 'Preserve observation, inference and recommendation distinctions.',
  memberLanguageRestrictions: ['no diagnostic claims', 'no treatment claims'],
});
assert.equal(discovery.capabilityId, 'discovery');
assert.deepEqual(discovery.defaultTiers, CURRENT_MVP_ALLOWED_TIERS);

assert.equal(assertCapabilityReleaseAllowed({ tier: REGULATORY_TIER.A }), true);
assert.equal(assertCapabilityReleaseAllowed({ tier: REGULATORY_TIER.D }), true);
assert.throws(
  () => assertCapabilityReleaseAllowed({ tier: REGULATORY_TIER.R }),
  /blocked pending explicit regulatory review approval/
);
assert.equal(
  assertCapabilityReleaseAllowed({ tier: REGULATORY_TIER.R, approvalRecord: { status: 'approved', reviewId: 'reg-review-1' } }),
  true
);

assert.equal(requiresRegulatedFunctionReview({}), false);
assert.equal(requiresRegulatedFunctionReview({ diagnosesCondition: true }), true);
assert.equal(requiresRegulatedFunctionReview({ recommendsDiseaseTreatment: true }), true);
assert.equal(requiresRegulatedFunctionReview({ changesMedicationOrDose: true }), true);
assert.equal(requiresRegulatedFunctionReview({ analyzesMedicalSignalForDiagnosisOrTreatment: true }), true);
assert.equal(requiresRegulatedFunctionReview({ predictsDiseaseRiskForClinicalManagement: true }), true);
assert.equal(requiresRegulatedFunctionReview({ replacesProfessionalClinicalJudgment: true }), true);

assert.throws(() => createRegulatoryBoundary({
  capabilityId: 'bad',
  defaultTiers: ['UNKNOWN'],
  permittedBehavior: 'x',
  escalationBehavior: 'y',
}));

console.log('regulatory boundary regression guards passed');
