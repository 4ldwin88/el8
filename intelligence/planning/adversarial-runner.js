import { buildPlan, respondToItem, adaptPlan } from './plan-engine.js';
import { ADVERSARIAL_SCENARIOS } from './adversarial-scenarios.js';

function checkScenario(s) {
  let plan=buildPlan(s.discovery,s.context);
  const failures=[];
  const e=s.expect||{};
  if(e.status && plan.status!==e.status) failures.push(`status expected ${e.status}, got ${plan.status}`);
  if(e.reason && plan.reason!==e.reason) failures.push(`reason expected ${e.reason}, got ${plan.reason}`);
  if(e.maxActive!=null && (plan.active||[]).length>e.maxActive) failures.push(`active exceeds ${e.maxActive}`);
  if(e.requiresBacklog && !(plan.backlog||[]).length) failures.push('expected non-empty backlog');
  if(e.activeType && (plan.active||[])[0]?.type!==e.activeType) failures.push(`expected first active type ${e.activeType}`);
  if(e.containsCandidate && ![...(plan.active||[]),...(plan.backlog||[])].some(x=>x.id===e.containsCandidate)) failures.push(`missing candidate ${e.containsCandidate}`);
  if(e.cadenceType && !(plan.active||[]).some(x=>x.cadence?.type===e.cadenceType)) failures.push(`missing active cadence ${e.cadenceType}`);

  if(s.interaction && plan.active?.length) {
    const original=plan.active[0];
    plan=respondToItem(plan,original.id,s.interaction,s.context);
    if(e.replacement && !plan.active?.length) failures.push('expected replacement after response');
    if(e.rejectedNotActive && plan.active?.some(x=>x.id===original.id)) failures.push('rejected item remained active');
    if(e.deferredPreserved && ![...(plan.active||[]),...(plan.backlog||[])].some(x=>x.id===original.id)) failures.push('deferred item was lost');
  }

  if(s.feedback) {
    plan=adaptPlan(plan,s.feedback);
    if(e.adaptation && plan.adaptation!==e.adaptation) failures.push(`adaptation expected ${e.adaptation}, got ${plan.adaptation}`);
  }
  return {id:s.id,pass:failures.length===0,failures,finalStatus:plan.status,adaptation:plan.adaptation||null};
}

export function runAdversarialSuite() {
  const results=ADVERSARIAL_SCENARIOS.map(checkScenario);
  const passed=results.filter(x=>x.pass).length;
  return {passed,total:results.length,passRate:passed/results.length,results};
}

// Works when executed directly with Node; harmless when imported in browser tooling.
if(typeof process!=='undefined' && process.argv?.[1]?.endsWith('adversarial-runner.js')) {
  const report=runAdversarialSuite();
  console.log(JSON.stringify(report,null,2));
  if(report.passed!==report.total) process.exitCode=1;
}
