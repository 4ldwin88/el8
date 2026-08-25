import {createDiscoveryPort} from './discovery-port.js';
import * as discovery from '../../discovery/round3-engine.js';

const adapter={
  createSession:options=>discovery.session(options),
  nextStep:session=>discovery.next(session),
  answer:(session,question,answerIds)=>discovery.answer(session,question,answerIds),
  triage:(session,importanceByConcern)=>discovery.triage(session,importanceByConcern),
  prioritize:(session,concernIds)=>discovery.prioritize(session,concernIds),
  resolve:(session,concernId,resolutionState,options={})=>discovery.resolve(session,concernId,resolutionState,options),
  complete:session=>discovery.complete(session),
  proposal:(session,options={})=>({
    plan:discovery.memberPlan(session),
    trace:discovery.trace(session),
    options
  })
};

export const discoveryPort=createDiscoveryPort(adapter);
export default discoveryPort;
