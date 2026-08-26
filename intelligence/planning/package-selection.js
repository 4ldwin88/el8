// Canonical priority -> Plan Family -> best-fit Plan Package selection.
// Selection consumes canonical Member State + Prioritization output. It does not rank loose actions.

import { validatePlanPackage } from './plan-package-contract.js';

export const PACKAGE_SELECTION_SCHEMA_VERSION='0.1.0';

function currentFacts(state){return Object.values(state?.facts||{}).filter(f=>f.currentStatus==='current')}
function semanticFactMap(state){return new Map(currentFacts(state).map(f=>[f.semanticKey,f.value]))}
function matchesRequirement(requirement,facts){
  if(typeof requirement==='function') return Boolean(requirement(facts));
  if(typeof requirement==='string') return facts.has(requirement)&&Boolean(facts.get(requirement));
  if(!requirement?.semanticKey) return false;
  if(!facts.has(requirement.semanticKey)) return false;
  const actual=facts.get(requirement.semanticKey);
  if('equals' in requirement) return actual===requirement.equals;
  if('oneOf' in requirement) return requirement.oneOf.includes(actual);
  return Boolean(actual);
}
function packageFit(pkg,state,priority){
  const facts=semanticFactMap(state);
  const exclusions=(pkg.exclusions||[]).filter(r=>matchesRequirement(r,facts));
  const referrals=(pkg.referralConditions||[]).filter(r=>matchesRequirement(r,facts));
  const eligibility=(pkg.eligibilityRules||[]);
  const unmet=eligibility.filter(r=>!matchesRequirement(r,facts));
  const memberPriority=state?.memberContext?.priorityConcernIds?.includes(priority.concernId)||state?.concerns?.[priority.concernId]?.memberPriority===true;
  return {eligible:exclusions.length===0&&referrals.length===0&&unmet.length===0,exclusions,referrals,unmet,memberPriority};
}

export function selectPlanPackage({memberState,prioritization,planFamilies=[],planPackages=[]}={}){
  if(!memberState?.concerns) throw new Error('memberState is required');
  if(!prioritization?.priorityItems) throw new Error('prioritization is required');
  if(prioritization.blockedBySafety) return {schemaVersion:PACKAGE_SELECTION_SCHEMA_VERSION,status:'blocked_by_safety',selection:null};
  for(const pkg of planPackages){const errors=validatePlanPackage(pkg);if(errors.length)throw new Error(`Invalid package ${pkg.packageId}: ${errors.join('; ')}`)}

  for(const priority of prioritization.priorityItems){
    const concern=memberState.concerns[priority.concernId];
    if(!concern||!concern.memberConfirmed||concern.sufficiency!=='sufficient') continue;
    const families=planFamilies.filter(f=>f.targetConcernId===priority.concernId);
    for(const family of families){
      const candidates=planPackages.filter(p=>p.familyId===family.familyId).map(pkg=>({pkg,fit:packageFit(pkg,memberState,priority)}));
      const eligible=candidates.filter(x=>x.fit.eligible).sort((a,b)=>{
        // Prefer lower-burden/foundation packages by default; progression is never inferred from code order.
        const levels={foundation:0,intermediate:1,advanced:2,specialized:3};
        return (levels[a.pkg.capabilityLevel]??9)-(levels[b.pkg.capabilityLevel]??9)||a.pkg.variantNumber-b.pkg.variantNumber;
      });
      if(eligible.length){const chosen=eligible[0];return {schemaVersion:PACKAGE_SELECTION_SCHEMA_VERSION,status:'selected',selection:{priorityId:priority.priorityId,concernId:priority.concernId,familyId:family.familyId,packageId:chosen.pkg.packageId,packageCode:chosen.pkg.packageCode,recommendationState:chosen.fit.memberPriority?'highly_recommended':'recommended',rationaleCodes:[...priority.rationaleCodes,'confirmed_sufficient_priority','eligible_package_fit',...(chosen.fit.memberPriority?['member_priority_match']:[])]},alternatives:eligible.slice(1).map(x=>x.pkg.packageCode)};}
    }
  }
  return {schemaVersion:PACKAGE_SELECTION_SCHEMA_VERSION,status:'insufficient_fit',selection:null};
}
