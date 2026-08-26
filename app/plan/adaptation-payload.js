export function adaptationRpcPayload(transaction={}){
  if(transaction.status!=='confirmed')throw new Error('A confirmed adaptation transaction is required.');
  if(!['modify','reassess','reprioritize'].includes(transaction.adaptation))throw new Error('Unsupported adaptation transaction.');
  if(!transaction.planId||!transaction.interventionId)throw new Error('Plan and intervention are required.');
  return {confirmed:true,adaptation:transaction.adaptation,planId:transaction.planId,interventionId:transaction.interventionId,reason:transaction.reason||null,memberInstruction:transaction.memberInstruction||null,evidenceSessionIds:[...(transaction.reviewSessionIds||[])]};
}
