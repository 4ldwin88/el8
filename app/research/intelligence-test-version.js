export const INTELLIGENCE_TEST_VERSION='0.3.1';
export const INTELLIGENCE_TEST_HARNESS_VERSION='g02-human-qa.2026-09-02.2';
export const INTELLIGENCE_TEST_BUILD_VERSION=INTELLIGENCE_TEST_HARNESS_VERSION;
export const INTELLIGENCE_TEST_CANDIDATE_REF='reconcile/g02-intelligence';
// This identifies the frozen Intelligence engine candidate under evaluation, not
// the later QA-harness commits that instrument and present that candidate.
export const INTELLIGENCE_TEST_ENGINE_CANDIDATE_SHA='0f5e731faaeea51fec907d95cb78d52b682d37e0';
export const INTELLIGENCE_TEST_CANDIDATE_SHA=INTELLIGENCE_TEST_ENGINE_CANDIDATE_SHA;
export const INTELLIGENCE_TEST_DEPLOYMENT_ID='github-pages:reconcile-g02-intelligence';
export const INTELLIGENCE_TEST_COMPONENT_VERSIONS=Object.freeze({memberState:'3.0.0',discovery:'v8',prioritization:'2.1.0',planning:'4.0.0',capabilityBoundary:'0.3.0'});
export const INTELLIGENCE_TEST_ENGINE_VERSION=INTELLIGENCE_TEST_COMPONENT_VERSIONS;
export const INTELLIGENCE_TEST_STORAGE_KEY='el8.intelligence-test.session.v3';
export const INTELLIGENCE_TEST_TELEMETRY_SCHEMA_VERSION='1.0.0';
