// Universal Baseline is broad starting evidence, not a diagnosis or aggregate wellness score.
export const BASELINE_MODULE = Object.freeze({ id:'UNI-BASE-005', version:'0.5', type:'universal_baseline' });
export const BASELINE_DIMENSIONS = Object.freeze(['Physical','Emotional','Intellectual','Social','Spiritual','Occupational','Financial','Environmental']);
export const BASELINE_CONDITIONS = Object.freeze(['Struggling','Needs attention','Okay','Going well','Very strong']);

export function baselineNextRoute({ safetyFlags=[] } = {}) {
  return safetyFlags.length ? 'safety-hold.html' : 'discovery.html';
}

export function baselineDerivedOutputs(responses={}) {
  return {
    condition_baseline:Object.fromEntries(BASELINE_DIMENSIONS.map(dimension=>[dimension,responses[`dim_${dimension}`] ?? null])),
    functional_impact:responses.impact ?? [],
    worsening:responses.worsening ?? [],
    member_priority:responses.priority ?? null,
    cross_dimensional_friction:{perceived:responses.friction_yes ?? null,upstream:responses.upstream ?? null,affected:responses.affected ?? [],note:responses.friction_note ?? null},
    feasibility:{readiness:responses.readiness ?? null,time:responses.time ?? null,cost:responses.cost ?? null},
    material_constraints:responses.material ?? []
  };
}
