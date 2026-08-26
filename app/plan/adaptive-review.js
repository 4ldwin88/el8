import { createOutcome, interpretOutcome } from '../../intelligence/outcomes/outcomes.js';

export function reviewAction({plan,actionId,status='unknown',adherence=null,benefitDirection='unknown',barrierCodes=[],burden=null,contextChanged=false,safetyChanged=false,measurementSufficient=null,observationRefs=[],evidenceRefs=[],recordedAt=null}={}){
  const action=(plan?.interventions||[]).find(x=>x.id===actionId);
  if(!action)throw new Error('A current plan action is required.');
  const concernId=action.concern_id||action.concernId;
  if(!concernId)throw new Error('The plan action must preserve its originating concern.');
  const outcome=createOutcome({outcomeId:`${actionId}:${recordedAt||new Date().toISOString()}`,interventionId:actionId,concernId,status,adherence,benefitDirection,barrierCodes,burden,contextChanged,safetyChanged,measurementSufficient,observationRefs,evidenceRefs,recordedAt});
  return {outcome,decision:interpretOutcome(outcome)};
}

export function memberReviewCopy(decision={}){
  switch(decision.adaptation){
    case 'maintain': return {title:'This action appears to be helping.',detail:'Keep it in place while EL8 continues observing the result.'};
    case 'simplify_or_reschedule': return {title:'The action may need to fit you better.',detail:'EL8 should adjust burden, timing, or barriers before judging whether the action works.'};
    case 'reassess': return {title:'The result does not support simply continuing.',detail:'You followed the action well enough to review whether the action or underlying assumption should change.'};
    case 'deepen_measurement': return {title:'EL8 needs better evidence before changing the plan.',detail:'The current measurement is not sufficient to judge this action.'};
    case 'reprioritize': return {title:'Something important changed.',detail:'EL8 should reconsider priorities before adapting this action.'};
    case 'escalate': return {title:'This plan needs a safety review.',detail:'Optimization should pause while the new safety information is handled.'};
    default:return {title:'EL8 is still learning from this action.',detail:'Continue observation until there is enough evidence to make a justified change.'};
  }
}
