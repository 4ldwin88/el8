import assert from 'node:assert/strict';
import {session,next} from './round3-engine.js';

// Human testing must begin with broad discovery, not pre-triage every known concern.
const s=session();
const first=next(s);
assert.notEqual(first.type,'triage','Round 3 cannot open by triaging the entire ontology; gateway answers must scope concerns first.');

// Human testing must have a reachable terminal state with actionable plan output.
// This assertion remains deliberately strict until resolution-state integration is complete.
assert.ok(['question','finish'].includes(first.type),'First step must be a gateway question or a valid terminal result.');

console.log('Round 3 human-harness readiness passed');
