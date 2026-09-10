import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const RELEASE_WORKFLOWS = Object.freeze([
  '.github/workflows/qa.yml',
  '.github/workflows/g02-intelligence-validation.yml',
  '.github/workflows/pages.yml',
]);

export const LIVE_ONLY_TEST_SCRIPTS = Object.freeze(new Set([
  'test:persistence:live',
]));

function invokedTestScripts(command = '') {
  return [...String(command).matchAll(/npm\s+run\s+(test:[\w:-]+)/g)].map((match) => match[1]);
}

export function reachableTestScripts(scripts, entry = 'test') {
  const reachable = new Set();
  const pending = [entry];

  while (pending.length) {
    const scriptName = pending.pop();
    if (reachable.has(scriptName)) continue;
    reachable.add(scriptName);
    for (const dependency of invokedTestScripts(scripts[scriptName])) {
      if (!reachable.has(dependency)) pending.push(dependency);
    }
  }

  return reachable;
}

export function validatePackageTestGate(packageJson) {
  const scripts = packageJson?.scripts ?? {};
  const errors = [];
  if (typeof scripts.test !== 'string' || scripts.test.trim() === '') {
    return ['package.json must define the canonical npm test gate'];
  }

  const reachable = reachableTestScripts(scripts);
  for (const scriptName of Object.keys(scripts).filter((name) => name.startsWith('test:'))) {
    if (LIVE_ONLY_TEST_SCRIPTS.has(scriptName)) continue;
    if (!reachable.has(scriptName)) errors.push(`${scriptName} is outside the canonical npm test gate`);
  }

  for (const liveScript of LIVE_ONLY_TEST_SCRIPTS) {
    if (reachable.has(liveScript)) errors.push(`${liveScript} must remain explicit and outside the offline release gate`);
  }

  return errors;
}

export function validateReleaseWorkflow(path, source) {
  const errors = [];
  const canonicalGate = source.search(/^[ \t]*(?:-\s*)?run:[ \t]*npm test[ \t]*$/m);
  if (canonicalGate < 0) errors.push(`${path} must invoke the canonical npm test gate`);
  const parallelTestInvocation = /npm\s+run\s+test:|node\s+--test\b|node\s+[^\n]*(?:\.test\.(?:mjs|cjs|js)|browser-import-smoke\.mjs)/;
  if (parallelTestInvocation.test(source)) {
    errors.push(`${path} must not maintain a parallel suite-specific test list`);
  }

  if (path.endsWith('/pages.yml') && canonicalGate >= 0) {
    const downstreamSteps = [
      'node scripts/write-intelligence-test-build-meta.mjs',
      'actions/upload-pages-artifact@',
      'actions/deploy-pages@',
    ];
    for (const marker of downstreamSteps) {
      const index = source.indexOf(marker);
      if (index < 0) errors.push(`${path} is missing required deployment step: ${marker}`);
      else if (index < canonicalGate) errors.push(`${path} executes ${marker} before the canonical test gate`);
    }
  }

  return errors;
}

export function verifyRepositoryReleaseGate(rootDirectory) {
  const read = (path) => readFileSync(`${rootDirectory}/${path}`, 'utf8');
  const packageJson = JSON.parse(read('package.json'));
  const errors = validatePackageTestGate(packageJson);
  for (const path of RELEASE_WORKFLOWS) {
    errors.push(...validateReleaseWorkflow(path, read(path)));
  }
  return errors;
}

const invokedAsScript = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedAsScript) {
  const rootDirectory = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
  const errors = verifyRepositoryReleaseGate(rootDirectory);
  if (errors.length) {
    for (const error of errors) console.error(`release-gate violation: ${error}`);
    process.exitCode = 1;
  } else {
    console.log('Canonical repository release gate: PASS');
  }
}
