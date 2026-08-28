export const CANONICAL_QA_SCENARIOS=Object.freeze([
 {id:'keep',label:'Success → keep',adherence:'high',outcome:'improved',burden:'low',expected:{decision:'keep',route:'continue'}},
 {id:'replace',label:'No benefit → replace',adherence:'high',outcome:'unchanged',burden:'low',expected:{decision:'replace',route:'planning',adaptationConstraint:'different_intervention'}},
 {id:'simplify',label:'Too difficult → simplify',adherence:'low',outcome:'unchanged',burden:'high',barrierKnown:true,expected:{decision:'simplify',route:'planning',adaptationConstraint:'reduce_burden'}},
 {id:'deepen',label:'Outcome unclear → deepen',adherence:'low',outcome:'unchanged',burden:'low',barrierKnown:false,expected:{decision:'deepen',route:'review-deepening'}},
 {id:'reassess',label:'Circumstances changed → reassess',adherence:'high',outcome:'improved',burden:'low',circumstancesChanged:true,expected:{decision:'reassess',route:'discovery'}},
 {id:'safety_hold',label:'Safety interruption → hold',safetyConfirmation:{confirmed:true},expected:{decision:'safety_hold',route:'safety'}},
]);
export function qaScenario(id){const x=CANONICAL_QA_SCENARIOS.find(s=>s.id===id);if(!x)throw new Error(`Unknown canonical QA scenario: ${id}`);return x}
export function scenarioEvidence(s){return{adherence:s.adherence,outcome:s.outcome,burden:s.burden,barrierKnown:s.barrierKnown,circumstancesChanged:s.circumstancesChanged,qaSimulated:true}}
export function assertExpectedScenario(s,review,route){const errors=[];if(review?.decision!==s.expected.decision)errors.push(`expected decision ${s.expected.decision}, got ${review?.decision}`);if(s.expected.route&&route?.route!==s.expected.route)errors.push(`expected route ${s.expected.route}, got ${route?.route}`);if(s.expected.adaptationConstraint&&route?.adaptationConstraint!==s.expected.adaptationConstraint)errors.push(`expected adaptation ${s.expected.adaptationConstraint}, got ${route?.adaptationConstraint}`);return{pass:errors.length===0,errors}}
