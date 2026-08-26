// Canonical EL8 Plan Family / Plan Package contracts.
// Package codes classify family + broad capability tier; detailed fit lives in metadata.

export const PACKAGE_RECOMMENDATION_STATES = Object.freeze([
  'highly_recommended','recommended','optional','insufficient_evidence','not_appropriate','professional_review_required'
]);
export const PACKAGE_TRANSITIONS = Object.freeze([
  'progress_within_package','move_variant','switch_parallel_variant','step_down','repeat_extend','pause_reassess','exit_family'
]);
export const COMPONENT_TYPES = Object.freeze(['assess','do','track','learn','support','review']);
export const CAPABILITY_LEVELS = Object.freeze(['foundation','intermediate','advanced','specialized']);
export const LEVEL_SERIES = Object.freeze({foundation:100,intermediate:200,advanced:300,specialized:800});

export function packageCode({familyCode,capabilityLevel='foundation',variantNumber=1}={}) {
  const base=LEVEL_SERIES[capabilityLevel];
  if(!familyCode || base===undefined) throw new Error('familyCode and valid capabilityLevel are required');
  const variant=Number(variantNumber);
  if(!Number.isInteger(variant)||variant<1||variant>99) throw new Error('variantNumber must be an integer from 1 to 99');
  return `${String(familyCode).toUpperCase()}-${base+variant}`;
}

export function definePlanFamily(input={}) {
  const family={familyId:input.familyId,familyCode:String(input.familyCode||'').toUpperCase(),name:input.name,targetDimensionId:input.targetDimensionId,targetConcernId:input.targetConcernId,supportedTopicIds:[...(input.supportedTopicIds||[])],familyGoal:input.familyGoal,selectionFactors:[...(input.selectionFactors||[])],transitionRules:[...(input.transitionRules||[])],exitConditions:[...(input.exitConditions||[])],evidenceRefs:[...(input.evidenceRefs||[])],reviewStatus:input.reviewStatus||'draft'};
  const errors=validatePlanFamily(family); if(errors.length) throw new Error(errors.join('; ')); return Object.freeze(family);
}

export function definePlanPackage(input={}) {
  const capabilityLevel=input.capabilityLevel||'foundation';
  const familyCode=String(input.familyCode||'').toUpperCase();
  const variantNumber=input.variantNumber??1;
  const canonicalCode=packageCode({familyCode,capabilityLevel,variantNumber});
  const pkg={packageId:input.packageId||canonicalCode,packageCode:canonicalCode,version:input.version||'0.1.0',familyId:input.familyId,familyCode,variantCode:input.variantCode||canonicalCode,variantNumber,name:input.name,targetDimensionId:input.targetDimensionId,targetConcernId:input.targetConcernId,targetTopicIds:[...(input.targetTopicIds||[])],capabilityLevel,goal:input.goal,rationale:input.rationale,eligibilityRules:[...(input.eligibilityRules||[])],minimumEvidence:[...(input.minimumEvidence||[])],exclusions:[...(input.exclusions||[])],referralConditions:[...(input.referralConditions||[])],environmentRequirements:[...(input.environmentRequirements||[])],equipmentRequirements:[...(input.equipmentRequirements||[])],prerequisiteCapabilities:[...(input.prerequisiteCapabilities||[])],startingAssessmentComponents:[...(input.startingAssessmentComponents||[])],requiredComponents:[...(input.requiredComponents||[])],optionalComponents:[...(input.optionalComponents||[])],dependencies:[...(input.dependencies||[])],burdenEnvelope:input.burdenEnvelope||null,indicatorDefinitions:[...(input.indicatorDefinitions||[])],milestones:[...(input.milestones||[])],minimumViableAdherence:input.minimumViableAdherence||null,initialReviewWindow:input.initialReviewWindow||null,expectedSignals:[...(input.expectedSignals||[])],adaptationPaths:[...(input.adaptationPaths||[])],entryPaths:[...(input.entryPaths||[])],eligibleTransitionTargets:[...(input.eligibleTransitionTargets||[])],evidenceRefs:[...(input.evidenceRefs||[])],reviewStatus:input.reviewStatus||'draft'};
  const errors=validatePlanPackage(pkg); if(errors.length) throw new Error(errors.join('; ')); return Object.freeze(pkg);
}

export function validatePlanFamily(family={}) { const errors=[]; for(const key of ['familyId','familyCode','name','targetDimensionId','targetConcernId','familyGoal']) if(!family[key]) errors.push(`${key} is required`); if(!/^[A-Z]{2,4}$/.test(family.familyCode||'')) errors.push('familyCode must be 2–4 uppercase letters'); if(!Array.isArray(family.supportedTopicIds)) errors.push('supportedTopicIds must be an array'); return errors; }
function validateComponent(component,index,label){const errors=[];if(!component?.id)errors.push(`${label}[${index}] requires id`);if(!COMPONENT_TYPES.includes(component?.type))errors.push(`${label}[${index}] has invalid type`);return errors}
export function validatePlanPackage(pkg={}) { const errors=[]; for(const key of ['packageId','packageCode','version','familyId','familyCode','variantCode','name','targetDimensionId','targetConcernId','goal','rationale']) if(!pkg[key]) errors.push(`${key} is required`); if(!CAPABILITY_LEVELS.includes(pkg.capabilityLevel)) errors.push('invalid capabilityLevel'); try{if(pkg.packageCode!==packageCode(pkg))errors.push('packageCode does not match classification metadata')}catch{errors.push('invalid package classification metadata')} if(!pkg.requiredComponents?.length)errors.push('at least one required component is required'); if(!pkg.indicatorDefinitions?.length)errors.push('at least one indicator is required'); if(!pkg.initialReviewWindow)errors.push('initialReviewWindow is required'); (pkg.startingAssessmentComponents||[]).forEach((x,i)=>errors.push(...validateComponent(x,i,'startingAssessmentComponents'))); (pkg.requiredComponents||[]).forEach((x,i)=>errors.push(...validateComponent(x,i,'requiredComponents'))); (pkg.optionalComponents||[]).forEach((x,i)=>errors.push(...validateComponent(x,i,'optionalComponents'))); return errors; }

export function createActivePlanPackage({definition,recommendationState='recommended',recommendationReasons=[],priorityConcernId,selectedTopicIds=[],memberConfirmation='pending',startedAt=null,reviewDueAtOrCondition=null,priorPackageId=null,entryReasonCodes=[]}={}) { if(!definition)throw new Error('definition is required');const errors=validatePlanPackage(definition);if(errors.length)throw new Error(errors.join('; '));if(!PACKAGE_RECOMMENDATION_STATES.includes(recommendationState))throw new Error('invalid recommendationState');return{packageId:definition.packageId,packageCode:definition.packageCode,packageVersion:definition.version,familyId:definition.familyId,familyCode:definition.familyCode,variantCode:definition.variantCode,capabilityLevel:definition.capabilityLevel,priorityConcernId:priorityConcernId||definition.targetConcernId,selectedTopicIds:[...selectedTopicIds],recommendationState,recommendationReasons:[...recommendationReasons],memberConfirmation,instantiatedComponents:[...definition.startingAssessmentComponents,...definition.requiredComponents],activeIndicatorIds:definition.indicatorDefinitions.map(x=>x.id),startedAt,reviewDueAtOrCondition,modifications:[],status:'proposed',priorPackageId,entryReasonCodes:[...entryReasonCodes],transitionReasonCodes:[]}; }
