// Public governed Discovery answer registry. Domain modules own content; this file only assembles and validates it.
import {ANSWERS as GENERAL} from './general.js';
import {ANSWERS as PHYSICAL} from './physical.js';
import {ANSWERS as EMOTIONAL} from './emotional.js';
import {ANSWERS as FINANCIAL} from './financial.js';
import {ANSWERS as INTELLECTUAL} from './intellectual.js';
import {ANSWERS as OCCUPATIONAL} from './occupational.js';
import {ANSWERS as SOCIAL} from './social.js';
import {ANSWERS as ENVIRONMENTAL} from './environmental.js';
import {ANSWERS as SPIRITUAL} from './spiritual.js';
import {ANSWERS as SAFETY} from './safety.js';
import {ANSWERS as CROSS_DIMENSIONAL} from './crossDimensional.js';
import {QUESTION_BY_ID} from './questionBank.js';

export const ANSWER_BANK_VERSION='0.9.1-domain-registry';
const ALL_ANSWERS=Object.freeze([...GENERAL,...PHYSICAL,...EMOTIONAL,...FINANCIAL,...INTELLECTUAL,...OCCUPATIONAL,...SOCIAL,...ENVIRONMENTAL,...SPIRITUAL,...SAFETY,...CROSS_DIMENSIONAL]);

// Runtime answers must always have a governed parent question. Retained design/research
// candidates without a governed parent remain auditable but cannot leak into Discovery.
export const ANSWER_CANDIDATES=Object.freeze(ALL_ANSWERS.filter(x=>x.runnable===false));
export const ANSWER_BANK=Object.freeze(ALL_ANSWERS.filter(x=>x.runnable!==false));
export const ANSWER_BY_ID=Object.freeze(Object.fromEntries(ANSWER_BANK.map(x=>[x.id,x])));
export const ANSWERS_BY_QUESTION=Object.freeze(Object.fromEntries([...new Set(ANSWER_BANK.map(x=>x.parentId))].map(id=>[id,Object.freeze(ANSWER_BANK.filter(x=>x.parentId===id))])));

export function assertAnswerRegistry(){
  const allById=Object.fromEntries(ALL_ANSWERS.map(x=>[x.id,x]));
  if(Object.keys(allById).length!==ALL_ANSWERS.length)throw new Error('Duplicate governed Discovery answer ID');
  const orphan=ANSWER_BANK.filter(x=>!QUESTION_BY_ID[x.parentId]);
  if(orphan.length)throw new Error(`Orphan runnable Discovery answer(s): ${orphan.map(x=>x.id).join(', ')}`);
  const runnableCandidate=ANSWER_CANDIDATES.filter(x=>QUESTION_BY_ID[x.parentId]&&x.runnable!==false);
  if(runnableCandidate.length)throw new Error('Non-runnable candidate classification failed');
  return true;
}
assertAnswerRegistry();
export default ANSWER_BANK;