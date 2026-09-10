import BANK from './observationNormalizer.js';
import {DISCOVERY_CONTRACT_FINGERPRINT} from './runtime-fingerprint.js';
import {assertJsonValue} from '../state/json-representation.js';
import {isConstructId} from '../../registries/taxonomy/index.js';

const FORMAT='el8.discovery-run.v1';
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function validateSession(s){
 assertJsonValue(s,'Discovery run session');
 if(!s||Array.isArray(s)||!uuid.test(s.runId))throw new Error('Discovery run requires stable UUID identity');
 for(const key of ['observationLog','constructIds','asked','questionTimings','unresolvedRequirements'])
  if(!Array.isArray(s[key]))throw new Error(`Discovery run record requires ${key}`);
 for(const key of ['facts','resolutionStates','baselineCoverage','driverSelections','severityResponses','relationshipEvidence','safetyContextualSignals'])
  if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))throw new Error(`Discovery run record requires ${key}`);
 if(!s.constructIds.every(isConstructId))throw new Error('Discovery run contains non-canonical construct identity');
 if(!Number.isFinite(s.assessmentStart)||!Number.isInteger(s.questionsAsked)||s.questionsAsked<0||typeof s.phase!=='string')
  throw new Error('Invalid Discovery run progress');
 if(Object.hasOwn(s,'questionBank'))throw new Error('Discovery run must not embed an executable bank');
}
export function captureDiscoveryRun(session){
 if(!session||Object.getOwnPropertyDescriptor(session,'questionBank')?.value!==BANK)throw new Error('Discovery run bank does not match the governed runtime contract');
 const descriptors=Object.getOwnPropertyDescriptors(session);delete descriptors.questionBank;
 const snapshot=Object.create(Object.getPrototypeOf(session),descriptors);
 validateSession(snapshot);
 return {format:FORMAT,contractFingerprint:DISCOVERY_CONTRACT_FINGERPRINT,
  runId:snapshot.runId,session:structuredClone(snapshot)};
}
export function restoreDiscoveryRun(record){
 assertJsonValue(record,'Discovery run record');
 if(!record||record.format!==FORMAT)throw new Error('Unsupported Discovery run record format; explicit migration or reacquisition required');
 if(record.contractFingerprint!==DISCOVERY_CONTRACT_FINGERPRINT)
  throw new Error('Discovery run contract changed; explicit migration or reacquisition required');
 if(Object.keys(record).some(k=>!['format','contractFingerprint','runId','session'].includes(k)))throw new Error('Unsupported Discovery run record fields');
 validateSession(record.session);
 if(record.runId!==record.session.runId)throw new Error('Discovery run identity mismatch');
 // This is an explicit resume operation after compatibility validation, never
 // ordinary persistence normalization or semantic migration.
 return {...structuredClone(record.session),questionBank:BANK};
}
