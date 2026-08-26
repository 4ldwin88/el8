import test from'node:test';import assert from'node:assert/strict';import{adaptationRpcPayload}from'./adaptation-payload.js';
const tx={status:'confirmed',adaptation:'modify',planId:'p1',interventionId:'walk',reason:'fit',memberInstruction:'walk 10 minutes',reviewSessionIds:['r1','r2']};
test('confirmed transaction maps to governed RPC payload',()=>assert.deepEqual(adaptationRpcPayload(tx),{confirmed:true,adaptation:'modify',planId:'p1',interventionId:'walk',reason:'fit',memberInstruction:'walk 10 minutes',evidenceSessionIds:['r1','r2']}));
test('unconfirmed transaction cannot mutate plan state',()=>assert.throws(()=>adaptationRpcPayload({...tx,status:'proposed'}),/confirmed/));
test('unknown adaptation cannot reach persistence boundary',()=>assert.throws(()=>adaptationRpcPayload({...tx,adaptation:'maintain'}),/Unsupported/));
