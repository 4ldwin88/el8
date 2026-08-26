import assert from 'node:assert/strict';
import {definePlanFamily,definePlanPackage,createActivePlanPackage,validatePlanPackage} from './plan-package-contract.js';

const family=definePlanFamily({familyId:'weight_management',familyCode:'WL',name:'Weight Management',targetDimensionId:'physical',targetConcernId:'weight_management',supportedTopicIds:['physical.weight'],familyGoal:'Establish sustainable weight-management behaviour'});
assert.equal(family.familyCode,'WL');

const wl1=definePlanPackage({packageId:'WL1',familyId:family.familyId,familyCode:'WL',variantCode:'WL1',sequenceNumber:1,name:'Beginner Weight Management — No Equipment',targetDimensionId:'physical',targetConcernId:'weight_management',targetTopicIds:['physical.weight'],capabilityLevel:'beginner',goal:'Establish a sustainable beginner weight-management routine',rationale:'Low-barrier package for eligible members who do not require a gym or equipment.',environmentRequirements:['walkable_safe_environment'],equipmentRequirements:[],startingAssessmentComponents:[{id:'wl1-starting-assessment',type:'assess'}],requiredComponents:[{id:'wl1-nutrition-target',type:'do'},{id:'wl1-walk',type:'do'},{id:'wl1-review',type:'review'}],indicatorDefinitions:[{id:'wl1-weight-trend'},{id:'wl1-walk-adherence'}],initialReviewWindow:{days:14},adaptationPaths:['progress_within_package','move_variant','step_down','pause_reassess'],eligibleTransitionTargets:['WL2']});
assert.equal(validatePlanPackage(wl1).length,0);
assert.equal(wl1.equipmentRequirements.length,0);

const wl2=definePlanPackage({...wl1,packageId:'WL2',variantCode:'WL2',sequenceNumber:2,name:'Beginner Weight Management — Gym',environmentRequirements:['gym_access'],equipmentRequirements:['gym'],eligibleTransitionTargets:['WL1','WL8']});
assert.equal(wl2.capabilityLevel,'beginner');
assert.ok(wl2.eligibleTransitionTargets.includes('WL1'));

const active=createActivePlanPackage({definition:wl1,recommendationState:'highly_recommended',recommendationReasons:['member_goal_match','low_barrier_fit'],memberConfirmation:'pending'});
assert.equal(active.familyId,'weight_management');
assert.equal(active.variantCode,'WL1');
assert.equal(active.status,'proposed');
assert.ok(active.instantiatedComponents.some(x=>x.type==='assess'));

// Numbering does not encode mandatory linear progression: WL2 can point back to WL1 and ahead to WL8.
assert.deepEqual(wl2.eligibleTransitionTargets,['WL1','WL8']);

assert.throws(()=>definePlanPackage({...wl1,packageId:'BAD',variantCode:'BAD',requiredComponents:[]}),/required component/);
assert.throws(()=>definePlanPackage({...wl1,packageId:'BAD2',variantCode:'BAD2',indicatorDefinitions:[]}),/indicator/);
assert.throws(()=>definePlanPackage({...wl1,packageId:'BAD3',variantCode:'BAD3',initialReviewWindow:null}),/initialReviewWindow/);

console.log('plan family/package contract tests passed');
