import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('legacy assessment route is compatibility-only and redirects to Discovery snapshot',async()=>{
 const html=await readFile(new URL('../../assessment.html',import.meta.url),'utf8');
 assert.match(html,/discovery-snapshot\.html/);
 assert.match(html,/retained only for compatibility/);
 assert.doesNotMatch(html,/Baseline/);
});
