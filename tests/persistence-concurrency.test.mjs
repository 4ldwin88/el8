import assert from 'node:assert/strict';

const SUPABASE_URL = process.env.EL8_SUPABASE_URL || 'https://jprdsidxwjkgiqqakwpr.supabase.co';
const ENDPOINT = process.env.EL8_PERSISTENCE_HARNESS_URL || `${SUPABASE_URL}/functions/v1/persistence-harness`;
const PUBLISHABLE_KEY = process.env.EL8_SUPABASE_PUBLISHABLE_KEY;
const QA_EMAIL = process.env.EL8_QA_EMAIL;
const QA_PASSWORD = process.env.EL8_QA_PASSWORD;

function requireSecret(name, value) {
  if (!value) throw new Error(`Missing required live-test environment variable: ${name}`);
  return value;
}

async function getAccessToken() {
  requireSecret('EL8_SUPABASE_PUBLISHABLE_KEY', PUBLISHABLE_KEY);
  requireSecret('EL8_QA_EMAIL', QA_EMAIL);
  requireSecret('EL8_QA_PASSWORD', QA_PASSWORD);

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: PUBLISHABLE_KEY
    },
    body: JSON.stringify({ email: QA_EMAIL, password: QA_PASSWORD })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(`QA authentication failed (HTTP ${response.status}): ${body.error_description || body.msg || body.error || 'no access token returned'}`);
  }
  return body.access_token;
}

const ACCESS_TOKEN = await getAccessToken();
const stamp = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);

async function rawWrite(entry_id, payload, simulate_ambiguous = false) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify({ entry_id, payload, simulate_ambiguous })
  });
  let body;
  try { body = await response.json(); } catch { body = { error: 'non-json response' }; }
  return { ok: response.ok, status: response.status, body };
}

async function write(entry_id, payload) {
  const response = await rawWrite(entry_id, payload);
  assert.equal(response.ok, true, response.body?.error || `HTTP ${response.status}`);
  return response.body;
}

async function distinctConcurrentIds() {
  const run = stamp();
  const ids = Array.from({ length: 20 }, (_, i) => `M0-HARNESS-DIST-${run}-${String(i + 1).padStart(2, '0')}`);
  const out = await Promise.all(ids.map((id, i) => write(id, { kind: 'distinct', i, run })));
  assert.equal(out.filter(x => x.status === 'created').length, 20);
  assert.equal(new Set(out.map(x => x.entry_id)).size, 20);
}

async function duplicateSafeRetries() {
  const run = stamp();
  const id = `M0-HARNESS-SAME-${run}`;
  const payload = { kind: 'same', run };
  const out = await Promise.all(Array.from({ length: 20 }, () => write(id, payload)));
  assert.equal(out.filter(x => x.status === 'created').length, 1);
  assert.equal(out.filter(x => x.status === 'duplicate_safe').length, 19);
  assert.equal(out.filter(x => x.status === 'conflict').length, 0);
}

async function conflictingPayloads() {
  const run = stamp();
  const id = `M0-HARNESS-CONFLICT-${run}`;
  const out = await Promise.all([
    write(id, { kind: 'conflict', value: 'A', run }),
    write(id, { kind: 'conflict', value: 'B', run })
  ]);
  assert.equal(out.filter(x => x.status === 'created').length, 1);
  assert.equal(out.filter(x => x.status === 'conflict').length, 1);
}

async function ambiguousAcknowledgement() {
  const run = stamp();
  const id = `M0-HARNESS-AMBIG-${run}`;
  const payload = { kind: 'ambiguous', run };
  const first = await rawWrite(id, payload, true);
  const retry = await rawWrite(id, payload, false);
  assert.equal(first.ok, false);
  assert.equal(first.status, 504);
  assert.equal(retry.ok, true);
  assert.equal(retry.body?.status, 'duplicate_safe');
}

async function repeatedOverlappingRounds() {
  for (let round = 1; round <= 10; round++) {
    const run = stamp();
    const ids = Array.from({ length: 8 }, (_, i) => `M0-HARNESS-R${round}-${run}-${i}`);
    const calls = ids.flatMap((id, i) => [
      write(id, { round, i, run }),
      write(id, { round, i, run })
    ]);
    const out = await Promise.all(calls);
    assert.equal(out.filter(x => x.status === 'created').length, 8, `round ${round} created count`);
    assert.equal(out.filter(x => x.status === 'duplicate_safe').length, 8, `round ${round} duplicate-safe count`);
    assert.equal(out.filter(x => x.status === 'conflict').length, 0, `round ${round} conflict count`);
  }
}

console.log(`Live persistence endpoint: ${ENDPOINT}`);
await distinctConcurrentIds();
await duplicateSafeRetries();
await conflictingPayloads();
await ambiguousAcknowledgement();
await repeatedOverlappingRounds();
console.log('canonical live persistence concurrency test passed');
