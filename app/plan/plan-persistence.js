import { supabase } from '../../el8-client.js';

export const PLAN_SCHEMA_VERSION = '3.0.0';

function requireArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`${name} must be an array`);
  return value;
}

export function toPlanV3Row(plan, { userId, isTest = false, parentPlanId = null } = {}) {
  if (!plan || plan.schemaVersion !== PLAN_SCHEMA_VERSION) throw new Error('Plan v3 is required');
  if (!userId) throw new Error('userId is required');
  const focusIds = requireArray(plan.focusIds ?? [], 'focusIds');
  const governedActions = requireArray(plan.proposedActions ?? plan.actions ?? [], 'governedActions');
  return {
    user_id: userId,
    schema_version: PLAN_SCHEMA_VERSION,
    status: plan.status,
    focus_ids: focusIds,
    governed_actions: governedActions,
    generated_from: {
      memberStateRevision: plan.memberStateRevision ?? null,
      evidenceRefs: plan.evidenceRefs ?? [],
      constraintRefs: plan.constraintRefs ?? [],
      decisionTrace: plan.decisionTrace ?? null,
      reason: plan.reason ?? null
    },
    parent_plan_id: parentPlanId,
    is_test: Boolean(isTest)
  };
}

export async function saveProposedPlanV3(plan, options = {}) {
  if (plan?.status !== 'proposed') throw new Error('Only proposed Plan v3 records can be persisted through this path');
  const row = toPlanV3Row(plan, options);
  const { data, error } = await supabase.from('el8_plans').insert(row).select('*').single();
  if (error) throw error;
  return data;
}

export async function activatePlanV3(planId) {
  if (!planId) throw new Error('planId is required');
  const { data, error } = await supabase.rpc('activate_el8_plan_v3', { p_plan_id: planId });
  if (error) throw error;
  return data;
}

export async function getActivePlanV3() {
  const { data, error } = await supabase
    .from('el8_plans')
    .select('*')
    .eq('schema_version', PLAN_SCHEMA_VERSION)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data;
}
