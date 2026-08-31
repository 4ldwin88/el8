// Governed Discovery Answer Bank.
// Source authority: Drive 02.04.01 EL8 Question & Signal Matrix Workbook.
// Domain semantics remain split only while exhaustive Drive reconstruction is completed;
// this manifest-defined module is the single public registry and prevents destructive replacement.
import DOMAIN_ANSWER_BANK from './domainAnswerBank.js';
import GENERAL_SAFETY_ANSWER_BANK from './generalSafetyAnswerBank.js';

export const ANSWER_BANK_VERSION='0.8.0-reconciliation';
export const ANSWER_BANK=Object.freeze([...GENERAL_SAFETY_ANSWER_BANK,...DOMAIN_ANSWER_BANK]);
export const ANSWER_BY_ID=Object.freeze(Object.fromEntries(ANSWER_BANK.map(x=>[x.id,x])));
export const ANSWERS_BY_QUESTION=Object.freeze(Object.fromEntries([...new Set(ANSWER_BANK.map(x=>x.parentId))].map(id=>[id,Object.freeze(ANSWER_BANK.filter(x=>x.parentId===id))])));
export function assertUniqueAnswerIds(){
  if(Object.keys(ANSWER_BY_ID).length!==ANSWER_BANK.length) throw new Error('Duplicate governed Discovery answer ID');
  return true;
}
assertUniqueAnswerIds();
export default ANSWER_BANK;
