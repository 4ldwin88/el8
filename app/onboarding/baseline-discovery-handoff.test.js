import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBaselineDiscoveryHandoff} from './baseline-discovery-handoff.js';

test('positive baseline indicator suppresses generic concern inference',()=>{
 const h=buildBaselineDiscoveryHandoff({candidate_concerns:['focus'],indicator_signals:{focus_motivation:{label:'Focus & motivation',value:4,concerns:['focus'],dimension:'Intellectual'}}});
 assert.ok(!h.candidateConcerns.includes('focus'));
 assert.ok(h.signals.suppressedPositiveConcerns.includes('focus'));
});

test('explicit low signal can reopen a concern despite another positive signal',()=>{
 const h=buildBaselineDiscoveryHandoff({candidate_concerns:['focus'],indicator_signals:{focus_motivation:{value:4,concerns:['focus']},another_focus_signal:{value:2,concerns:['focus']}}});
 assert.ok(h.candidateConcerns.includes('focus'));
});

test('member priority can reopen a positively rated concern',()=>{
 const h=buildBaselineDiscoveryHandoff({candidate_concerns:['focus'],member_priority_concerns:['focus'],indicator_signals:{focus_motivation:{value:4,concerns:['focus']}}});
 assert.ok(h.candidateConcerns.includes('focus'));
});
