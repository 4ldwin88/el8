import assert from 'node:assert/strict';
import {definePlanFamily,definePlanPackage,createActivePlanPackage,validatePlanPackage,packageCode} from './plan-package-contract.js';

const family=definePlanFamily({familyId:'weight_management',familyCode:'WM',name:'Weight Management',targetDimensionId:'physical',targetConcernId:'weight_management',supportedTopicIds:['physical.weight'],familyGoal:'Establish sustainable weight-management behaviour'});
assert.equal(family.familyCode,'WM');
assert.equal(packageCode({familyCode:'WM',capabilityLevel:'foundation',variantNumber:1}),'WM-101');
assert.equal(packageCode({familyCode:'WM',capabilityLevel:'intermediate',variantNumber:2}),'WM-202');
assert.equal(packageCode({familyCode:'WM',capabilityLevel:'specialized',variantNumber:1}),'WM-801');

const wm101=definePlanPackage({familyId:family.familyId,familyCode:'WM',variantNumber:1,name:'Beginner Weight Management — No Equipment',targetDimensionId:'physical',targetConcernId:'weight_management',targetTopicIds:['physical.weight'],capabilityLevel:'foundation',goal:'Establish a sustainable beginner weight-management routine',rationale:'Low-barrier package for eligible members who do not require a gym or equipment.',environmentRequirements:['walkable_safe_environment'],equipmentRequirements:[],startingAssessmentComponents:[{id:'wm101-starting-assessment',type:'assess'}],requiredComponents:[{id:'wm101-nutrition-target',type:'do'},{id:'wm101-walk',type:'do'},{id:'wm101-review',type:'review'}],indicatorDefinitions:[{id:'wm101-weight-trend'},{id:'wm101-walk-adherence'}],initialReviewWindow:{days:14},adaptationPaths:['progress_within_package','move_variant','step_down','pause_reassess'],eligibleTransitionTargets:['WM-102','WM-201']});
assert.equal(wm101.packageCode,'WM-101');
assert.equal(validatePlanPackage(wm101).length,0);
assert.equal(wm101.equipmentRequirements.length,0);

const wm102=definePlanPackage({...wm101,packageId:undefined,packageCode:undefined,variantCode:undefined,variantNumber:2,name:'Beginner Weight Management — Gym',environmentRequirements:['gym_access'],equipmentRequirements:['gym'],eligibleTransitionTargets:['WM-101','WM-201']});
assert.equal(wm102.packageCode,'WM-102');
assert.equal(wm102.capabilityLevel,'foundation');

const wm201=definePlanPackage({...wm101,packageId:undefined,packageCode:undefined,variantCode:undefined,variantNumber:1,capabilityLevel:'intermediate',name:'Intermediate Weight Management — No Equipment',eligibleTransitionTargets:['WM-101','WM-202']});
assert.equal(wm201.packageCode,'WM-201');

const active=createActivePlanPackage({definition:wm101,recommendationState:'highly_recommended',recommendationReasons:['member_goal_match','low_barrier_fit'],memberConfirmation:'pending'});
assert.equal(active.familyId,'weight_management');
assert.equal(active.packageCode,'WM-101');
assert.equal(active.status,'proposed');
assert.ok(active.instantiatedComponents.some(x=>x.type==='assess'));

// Codes classify broad level, but transitions remain governed by fit rather than numerical order.
assert.deepEqual(wm102.eligibleTransitionTargets,['WM-101','WM-201']);
assert.throws(()=>packageCode({familyCode:'WM',capabilityLevel:'foundation',variantNumber:100}),/1 to 99/);
assert.throws(()=>definePlanPackage({...wm101,packageId:undefined,variantCode:undefined,variantNumber:3,requiredComponents:[]}),/required component/);
assert.throws(()=>definePlanPackage({...wm101,packageId:undefined,variantCode:undefined,variantNumber:3,indicatorDefinitions:[]}),/indicator/);
assert.throws(()=>definePlanPackage({...wm101,packageId:undefined,variantCode:undefined,variantNumber:3,initialReviewWindow:null}),/initialReviewWindow/);

console.log('classified plan family/package contract tests passed');
