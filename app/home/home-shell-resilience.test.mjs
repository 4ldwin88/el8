import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./home.js', import.meta.url), 'utf8');

assert.match(source, /import\s*\{\s*mountAppShell\s*\}\s*from\s*['"]\.\.\/shell\/app-shell\.js['"]/,
  'Home must statically depend on the primary app shell');
assert.doesNotMatch(source, /^import .*track-sheet\.js['"];?$/m,
  'Track must not remain a static dependency that can prevent Home shell evaluation');
assert.match(source, /mountAppShell\(\{\s*active:\s*['"]home['"]\s*\}\);/,
  'Home must mount primary navigation at module evaluation time');
assert.match(source, /await import\(['"]\.\.\/track\/track-sheet\.js['"]\)/,
  'Track should be loaded dynamically after the primary shell is available');
assert.match(source, /catch\s*\(error\)[\s\S]*primary navigation remains available/,
  'Secondary Track initialization failure must degrade without removing primary navigation');

console.log('Home shell resilience regression: PASS');
