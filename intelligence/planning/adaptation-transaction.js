// Immutable adaptation intent. This contract deliberately separates member confirmation
// from plan mutation so an accepted recommendation cannot silently rewrite history.
export const ADAPTATION_TRANSACTION_VERSION='0.1.0';
const CONFIRMABLE=new Set(['modify','reassess','reprioritize']);

export function createAdaptationTransaction({planId,interventionId,policy,reviewSessionIds=[],confirmed=false,confirmedAt=null,memberInstruction=null}={}){
  if(!planId||!interventionId)throw new Error('planId and interventionId are required');
  if(!policy?.adaptation)throw new Error('adaptation policy is required');
  if(!CONFIRMABLE.has(policy.adaptation))throw new Error(`adaptation is not confirmable: ${policy.adaptation}`);
  if(policy.requiresConfirmation!==true)throw new Error('adaptation policy must require confirmation');
  if(confirmed&&!confirmedAt)throw new Error('confirmedAt is required when confirmed');
  return {schemaVersion:ADAPTATION_TRANSACTION_VERSION,planId,interventionId,adaptation:policy.adaptation,reason:policy.reason||null,status:confirmed?'confirmed':'proposed',reviewSessionIds:[...reviewSessionIds],confirmedAt:confirmedAt||null,memberInstruction:memberInstruction?.trim()||null,mutationStatus:'not_applied'};
}

export function nextAdaptationRoute(transaction={}){
  if(transaction.status!=='confirmed')return null;
  if(transaction.adaptation==='modify')return 'plan-adjustment';
  if(transaction.adaptation==='reassess')return 'plan-reassessment';
  if(transaction.adaptation==='reprioritize')return 'priority-reassessment';
  return null;
}
