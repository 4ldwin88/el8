// Development-facing Discovery interface.
// Development must not import an implementation from experiments/. A promoted adapter must implement this port.

export const DISCOVERY_PORT_VERSION='discovery-port-v1';

export function assertDiscoveryAdapter(adapter){
  const required=['createSession','nextStep','answer','triage','prioritize','resolve','complete','proposal'];
  const missing=required.filter(name=>typeof adapter?.[name]!=='function');
  if(missing.length)throw new Error(`Discovery adapter is incomplete: ${missing.join(', ')}`);
  return adapter;
}

export function createDiscoveryPort(adapter){
  const implementation=assertDiscoveryAdapter(adapter);
  return Object.freeze({
    version:DISCOVERY_PORT_VERSION,
    createSession:options=>implementation.createSession(options),
    nextStep:session=>implementation.nextStep(session),
    answer:(session,question,answerIds)=>implementation.answer(session,question,answerIds),
    triage:(session,importanceByConcern)=>implementation.triage(session,importanceByConcern),
    prioritize:(session,concernIds)=>implementation.prioritize(session,concernIds),
    resolve:(session,concernId,resolutionState,options={})=>implementation.resolve(session,concernId,resolutionState,options),
    complete:session=>implementation.complete(session),
    proposal:(session,options={})=>implementation.proposal(session,options)
  });
}
