// Structured decision-trace contract for explainable EL8 Intelligence decisions.
// Keeps evidence, alternatives, uncertainty and change conditions machine-readable
// without turning internal scores into member-facing wellness scores.
export const DECISION_TRACE_SCHEMA_VERSION='1.0.0';
const list=v=>Array.isArray(v)?[...v]:[];
const uniq=v=>[...new Set(list(v).filter(x=>x!==null&&x!==undefined&&x!==''))];
export function createDecisionTrace({decisionType,decisionId=null,whyThis=[],whyNow=[],whyNot=[],whatWouldChangeMind=[],evidenceRefs=[],uncertaintyRefs=[],alternatives=[],policyRefs=[],diagnostics={}}={}){
 if(!decisionType)throw Error('decisionType is required');
 return Object.freeze({schemaVersion:DECISION_TRACE_SCHEMA_VERSION,decisionType,decisionId,whyThis:uniq(whyThis),whyNow:uniq(whyNow),whyNot:list(whyNot).map(x=>({...x})),whatWouldChangeMind:uniq(whatWouldChangeMind),evidenceRefs:uniq(evidenceRefs),uncertaintyRefs:uniq(uncertaintyRefs),alternatives:list(alternatives).map(x=>({...x})),policyRefs:uniq(policyRefs),diagnostics:{...diagnostics}});
}
export function validateDecisionTrace(trace){const errors=[];if(!trace||typeof trace!=='object')return['decision trace must be an object'];if(trace.schemaVersion!==DECISION_TRACE_SCHEMA_VERSION)errors.push('unsupported decision trace schemaVersion');if(!trace.decisionType)errors.push('decisionType is required');for(const key of ['whyThis','whyNow','whyNot','whatWouldChangeMind','evidenceRefs','uncertaintyRefs','alternatives','policyRefs'])if(!Array.isArray(trace[key]))errors.push(`${key} must be an array`);if(!trace.diagnostics||typeof trace.diagnostics!=='object'||Array.isArray(trace.diagnostics))errors.push('diagnostics must be an object');return errors;}
