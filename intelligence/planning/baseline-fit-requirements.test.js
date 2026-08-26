import assert from 'node:assert/strict';
import {createMemberState,createFact} from '../state/member-state-contract.js';
import {buildActionDeepeningAgenda,actionFactsNeeded} from './baseline-fit-requirements.js';

const state=createMemberState();
state.facts.sleep=createFact({factId:'sleep',semanticKey:'baseline.sleep_window',value:{bed:'00:30',wake:'08:30'},sourceType:'baseline',sourceRef:'q:sleep'});

const sleepAction={id:'stabilize_sleep_window',deepeningRequirements:[
  {id:'sleep-window',evidenceKey:'baseline.sleep_window',purpose:'baseline_measurement',decisionImpact:'Defines the starting sleep window.',requiredBeforeActivation:true},
  {id:'preferred-window',evidenceKey:'preference.sleep_window',purpose:'personalization',decisionImpact:'Changes the recommended target window.',requiredBeforeActivation:false},
  {id:'curiosity',evidenceKey:'sleep.favorite_pillow',purpose:'personalization'}
]};

const needed=actionFactsNeeded({memberState:state,action:sleepAction});
assert.deepEqual(needed.requirements.map(x=>x.evidenceKey),['preference.sleep_window'],'known onboarding facts must be reused and non-decision-useful questions excluded');

const agenda=buildActionDeepeningAgenda({memberState:state,actions:[sleepAction]});
assert.equal(agenda.items.length,1);
assert.equal(agenda.items[0].actionId,'stabilize_sleep_window');
assert.equal(agenda.items[0].requiredBeforeActivation,false);

assert.equal(buildActionDeepeningAgenda({memberState:state,actions:[sleepAction],blockedBySafety:true}).items.length,0);
assert.equal(buildActionDeepeningAgenda({memberState:state,actions:[{id:'walk'}]}).items.length,0,'simple actions need no automatic second assessment');

console.log('action-specific deepening agenda tests passed');
