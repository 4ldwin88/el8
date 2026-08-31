// Public governed Discovery question registry. Domain modules own content; this file only assembles and validates it.
import {QUESTIONS as GENERAL} from './general.js';
import {QUESTIONS as PHYSICAL} from './physical.js';
import {QUESTIONS as EMOTIONAL} from './emotional.js';
import {QUESTIONS as FINANCIAL} from './financial.js';
import {QUESTIONS as INTELLECTUAL} from './intellectual.js';
import {QUESTIONS as OCCUPATIONAL} from './occupational.js';
import {QUESTIONS as SOCIAL} from './social.js';
import {QUESTIONS as ENVIRONMENTAL} from './environmental.js';
import {QUESTIONS as SPIRITUAL} from './spiritual.js';
import {QUESTIONS as SAFETY} from './safety.js';
import {QUESTIONS as CROSS_DIMENSIONAL} from './crossDimensional.js';
export const QUESTION_BANK_VERSION='0.9.0-domain-registry';
export const QUESTION_BANK=Object.freeze([...GENERAL,...PHYSICAL,...EMOTIONAL,...FINANCIAL,...INTELLECTUAL,...OCCUPATIONAL,...SOCIAL,...ENVIRONMENTAL,...SPIRITUAL,...SAFETY,...CROSS_DIMENSIONAL]);
export const QUESTION_BY_ID=Object.freeze(Object.fromEntries(QUESTION_BANK.map(x=>[x.id,x])));
export function assertUniqueQuestionIds(){if(Object.keys(QUESTION_BY_ID).length!==QUESTION_BANK.length)throw new Error('Duplicate governed Discovery question ID');return true;}
assertUniqueQuestionIds();
export default QUESTION_BANK;