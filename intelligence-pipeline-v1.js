// EL8 Intelligence Pipeline v1
// Discovery trace -> handoff -> prioritization -> decision.
import {handoff} from './intelligence-prioritization-handoff.js';
import {prioritize} from './intelligence-prioritization-engine-v1.js';
import {decide} from './intelligence-decision-engine-v1.js';

function runIntelligence(discoveryTrace,context={},options={}){
 const prioritizationInput=handoff(discoveryTrace,options.handoff);
 const prioritization=prioritize(prioritizationInput,context,options.prioritization);
 const decision=decide(prioritization,context);
 return {
  version:'EL8 Intelligence Pipeline v1',
  discovery:{exitReason:discoveryTrace?.exitReason||null,coherent:discoveryTrace?.coherent!==false},
  handoff:prioritizationInput,
  prioritization,
  decision,
  explanation:{
   primary:prioritization.primary?.[0]?.id||null,
   outcome:decision.decision?.type||null,
   reason:decision.decision?.reason||null,
   evidenceRefs:prioritization.primary?.[0]?.evidenceRefs||[]
  }
 };
}
export {runIntelligence}; export default {runIntelligence};
