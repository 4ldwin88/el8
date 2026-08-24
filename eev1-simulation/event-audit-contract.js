// Append-only event/audit contract for EEV1.
export const EVENT_TYPES=Object.freeze(['OBSERVATION_RECORDED','EVIDENCE_CREATED','SAFETY_EVALUATED','FOCUS_PROPOSED','AGENCY_DECIDED','PLAN_COMPOSED','OUTCOME_RECORDED','PLAN_ADAPTED']);

export function makeEvent({eventId,streamId,sequence,type,occurredAt,recordedAt,actor='system',payload={},provenance={}}={}){
 if(!eventId||!streamId||!Number.isInteger(sequence)||sequence<1||!EVENT_TYPES.includes(type)||!occurredAt||!recordedAt)throw new Error('invalid-event');
 return Object.freeze({eventId:String(eventId),streamId:String(streamId),sequence,type,occurredAt:String(occurredAt),recordedAt:String(recordedAt),actor:String(actor),payload:Object.freeze({...payload}),provenance:Object.freeze({...provenance})});
}

export function appendEvent(stream=[],event,{expectedSequence}={}){
 const current=stream.length?stream[stream.length-1].sequence:0;
 if(expectedSequence!==undefined&&expectedSequence!==current)throw new Error('concurrency-conflict');
 if(event.sequence!==current+1)throw new Error('non-contiguous-sequence');
 if(stream.some(e=>e.eventId===event.eventId))throw new Error('duplicate-event-id');
 if(stream.some(e=>e.streamId!==event.streamId))throw new Error('stream-id-mismatch');
 return Object.freeze([...stream,event]);
}

export function validateEventStream(stream=[]){
 const errors=[];const ids=new Set();let streamId=null;
 stream.forEach((e,i)=>{if(!Object.isFrozen(e))errors.push(`event-${i+1}-mutable`);if(e.sequence!==i+1)errors.push(`event-${i+1}-sequence`);if(ids.has(e.eventId))errors.push(`event-${i+1}-duplicate-id`);ids.add(e.eventId);streamId??=e.streamId;if(e.streamId!==streamId)errors.push(`event-${i+1}-stream`);if(!EVENT_TYPES.includes(e.type))errors.push(`event-${i+1}-type`);});
 return Object.freeze({valid:errors.length===0,errors});
}

export function rebuildProjection(stream=[],reducer,initialState={}){
 if(typeof reducer!=='function')throw new Error('reducer-required');
 if(!validateEventStream(stream).valid)throw new Error('invalid-event-stream');
 return Object.freeze(stream.reduce((state,event)=>reducer(state,event),initialState));
}

export function auditChain(stream=[]){
 if(!validateEventStream(stream).valid)throw new Error('invalid-event-stream');
 return Object.freeze(stream.map(e=>Object.freeze({eventId:e.eventId,sequence:e.sequence,type:e.type,occurredAt:e.occurredAt,recordedAt:e.recordedAt,actor:e.actor,provenance:e.provenance})));
}
