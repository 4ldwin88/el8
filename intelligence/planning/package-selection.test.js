import assert from 'node:assert/strict';
import {createMemberState,createConcernState,createFact} from '../state/member-state-contract.js';
import {definePlanFamily,definePlanPackage} from './plan-package-contract.js';
import {selectPlanPackage} from './package-selection.js';

const state=createMemberState({memberId:'test'});
const concern=createConcernState({concernId:'physical.weight',status:'active'});
concern.memberConfirmed=true; concern.sufficiency='sufficient'; concern.memberPriority=true; concern.evidenceRefs.push('baseline:weight');
state.concerns[concern.concernId]=concern; state.memberContext.priorityConcernIds=[concern.concernId];
state.facts.gym=createFact({factId:'gym',semanticKey:'access.gym',value:false,sourceType:'baseline',sourceRef:'q:gym',affectedConcernId:concern.concernId,memberConfirmed:true});
state.facts.walk=createFact({factId:'walk',semanticKey:'environment.safe_walking',value:true,sourceType:'baseline',sourceRef:'q:walk',affectedConcernId:concern.concernId,memberConfirmed:true});

const family=definePlanFamily({familyId:'weight_management',familyCode:'WM',name:'Weight Management',targetDimensionId:'physical',targetConcernId:'physical.weight',supportedTopicIds:['physical.weight'],familyGoal:'Establish sustainable weight-management behaviour'});
const base={familyId:family.familyId,familyCode:'WM',targetDimensionId:'physical',targetConcernId:'physical.weight',targetTopicIds:['physical.weight'],goal:'Establish a sustainable routine',rationale:'Evidence-backed low-burden package.',requiredComponents:[{id:'walk',type:'do'},{id:'review',type:'review'}],indicatorDefinitions:[{id:'weight-trend'}],initialReviewWindow:{days:14}};
const wm101=definePlanPackage({...base,variantNumber:1,name:'Beginner Weight Management — No Equipment',capabilityLevel:'foundation',eligibilityRules:[{semanticKey:'environment.safe_walking',equals:true}]});
const wm102=definePlanPackage({...base,variantNumber:2,name:'Beginner Weight Management — Gym',capabilityLevel:'foundation',eligibilityRules:[{semanticKey:'access.gym',equals:true}]});

const prioritization={blockedBySafety:false,priorityItems:[{priorityId:'priority:physical.weight',rank:1,concernId:'physical.weight',rationaleCodes:['supported_concern']}]};
const result=selectPlanPackage({memberState:state,prioritization,planFamilies:[family],planPackages:[wm102,wm101]});
assert.equal(result.status,'selected');
assert.equal(result.selection.packageCode,'WM-101');
assert.equal(result.selection.recommendationState,'highly_recommended');
assert.ok(result.selection.rationaleCodes.includes('member_priority_match'));

const blocked=selectPlanPackage({memberState:state,prioritization:{blockedBySafety:true,priorityItems:[]},planFamilies:[family],planPackages:[wm101]});
assert.equal(blocked.status,'blocked_by_safety');

const insufficient=createMemberState(); insufficient.concerns[concern.concernId]={...concern,memberConfirmed:false};
assert.equal(selectPlanPackage({memberState:insufficient,prioritization,planFamilies:[family],planPackages:[wm101]}).status,'insufficient_fit');

console.log('priority -> family -> package selection tests passed');
