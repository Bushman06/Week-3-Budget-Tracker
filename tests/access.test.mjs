import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/server/index.mjs';
test('private routes reject visitors without a session', async () => {
  for (const path of ['/api/profile', '/api/photo', '/api/finances']) {
    const response = await handler(new Request(`https://example.com${path}`));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
});
test('mutations require the same origin before checking sessions', async () => {
  for (const method of ['PUT', 'PATCH', 'DELETE']) {
    const response = await handler(new Request('https://example.com/api/profile', { method, headers: { origin: 'https://other.example' } }));
    assert.equal(response.status, 403);
  }
});
test('a forged session rejected by Identity cannot read a profile', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 401 });
  try {
    const response = await handler(new Request('https://example.com/api/profile', { headers: { cookie: 'nf_jwt=invalid' } }));
    assert.equal(response.status, 401);
  } finally { globalThis.fetch = original; }
});
