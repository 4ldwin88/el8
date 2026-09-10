import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  validatePackageTestGate,
  validateReleaseWorkflow,
  verifyRepositoryReleaseGate,
} from '../../scripts/verify-release-gate.mjs';

const rootDirectory = fileURLToPath(new URL('../..', import.meta.url)).replace(/\/$/, '');

test('current candidate has one complete offline gate for validation and deployment', () => {
  assert.deepEqual(verifyRepositoryReleaseGate(rootDirectory), []);
});

test('a deployment workflow without the canonical gate is rejected', () => {
  const errors = validateReleaseWorkflow('.github/workflows/pages.yml', `
steps:
  - run: node scripts/write-intelligence-test-build-meta.mjs
  - uses: actions/upload-pages-artifact@v3
  - uses: actions/deploy-pages@v4
`);
  assert.ok(errors.some((error) => error.includes('must invoke the canonical npm test gate')));
});

test('a gate placed after artifact creation is rejected', () => {
  const errors = validateReleaseWorkflow('.github/workflows/pages.yml', `
steps:
  - run: node scripts/write-intelligence-test-build-meta.mjs
  - uses: actions/upload-pages-artifact@v3
  - uses: actions/deploy-pages@v4
  - run: npm test
`);
  assert.ok(errors.some((error) => error.includes('before the canonical test gate')));
});

test('workflow-owned suite lists are rejected as competing gate definitions', () => {
  const errors = validateReleaseWorkflow('.github/workflows/qa.yml', `
steps:
  - run: npm test
  - run: npm run test:profile
`);
  assert.ok(errors.some((error) => error.includes('parallel suite-specific test list')));
});

test('workflow-owned direct Node test commands are rejected as competing gate definitions', () => {
  const errors = validateReleaseWorkflow('.github/workflows/g02-intelligence-validation.yml', `
steps:
  - run: npm test
  - run: node --test app/home/home-shell-resilience.test.mjs
`);
  assert.ok(errors.some((error) => error.includes('parallel suite-specific test list')));
});

test('a non-live test script outside npm test is rejected', () => {
  const errors = validatePackageTestGate({ scripts: { test: 'npm run test:a', 'test:a': 'node a.test.mjs', 'test:b': 'node b.test.mjs' } });
  assert.ok(errors.includes('test:b is outside the canonical npm test gate'));
});

test('the live persistence suite cannot enter the offline release gate', () => {
  const errors = validatePackageTestGate({ scripts: { test: 'npm run test:persistence:live', 'test:persistence:live': 'node live.test.mjs' } });
  assert.ok(errors.includes('test:persistence:live must remain explicit and outside the offline release gate'));
});
