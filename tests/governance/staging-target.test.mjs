import test from 'node:test';
import assert from 'node:assert/strict';
import {requireStagingTestEnvironment} from '../../scripts/staging-test-environment.mjs';
import {readFileSync} from 'node:fs';
import {parse} from 'yaml';
test('live mutation transport requires explicit staging identity and two synthetic accounts',()=>{
 const good={EL8_TEST_MUTATIONS:'allow-synthetic',EL8_SUPABASE_URL:'https://bqumsiqkpxkofjykgzqp.supabase.co',EL8_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture',EL8_QA_EMAIL_A:'member-a@example.invalid',EL8_QA_PASSWORD_A:'fixture',EL8_QA_EMAIL_B:'member-b@example.invalid',EL8_QA_PASSWORD_B:'fixture'};
 assert.equal(requireStagingTestEnvironment(good).url,good.EL8_SUPABASE_URL);
 for(const key of Object.keys(good)){const bad={...good};delete bad[key];assert.throws(()=>requireStagingTestEnvironment(bad));}
 for(const url of ['https://jprdsidxwjkgiqqakwpr.supabase.co','https://leikcvdfvovycjcjtflq.supabase.co','https://example.com','https://bqumsiqkpxkofjykgzqp.supabase.co.evil.invalid'])assert.throws(()=>requireStagingTestEnvironment({...good,EL8_SUPABASE_URL:url}));
 assert.throws(()=>requireStagingTestEnvironment({...good,EL8_SUPABASE_PUBLISHABLE_KEY:'sb_secret_forbidden'}));
 assert.throws(()=>requireStagingTestEnvironment({...good,EL8_QA_EMAIL_B:good.EL8_QA_EMAIL_A}));
 assert.throws(()=>requireStagingTestEnvironment({...good,EL8_QA_EMAIL_A:'real-person@example.com'}));
});
test('mutating acceptance workflow remains manual, staging-specific and tied to its checked-out SHA',()=>{
 const workflow=parse(readFileSync('.github/workflows/persistence-live.yml','utf8'));
 assert.deepEqual(Object.keys(workflow.on),['workflow_dispatch']);
 const job=workflow.jobs.persistence;
 assert.equal(job.env.EL8_TEST_MUTATIONS,'allow-synthetic');
 assert.ok(Object.values(job.env).every(v=>!String(v).includes('jprdsidxwjkgiqqakwpr')));
 const checkout=job.steps.find(s=>s.uses?.startsWith('actions/checkout@'));
 assert.equal(checkout.with.ref,'${{ github.sha }}');
 assert.ok(job.steps.some(s=>s.run==='npm ci --ignore-scripts'));
 assert.ok(job.steps.some(s=>s.run?.includes('supabase/environments/staging.json')&&s.run.includes('npm run test:persistence:live')));
});
