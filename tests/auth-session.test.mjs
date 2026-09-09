import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

import ts from 'typescript';

function client(fetch) {
  const exports = {};
  const window = new EventTarget();
  const source = fs.readFileSync('app/libs/api.ts', 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, window, fetch, Headers, FormData, AbortSignal, Event });
  return { api: exports, window };
}
function response(data, status = 200) {
  return new Response(JSON.stringify(status === 200 ? { data } : { error: { code: 'AUTH_TOKEN_INVALID' } }), { status });
}

test('concurrent consumers share one complete user/profile lookup', async () => {
  let calls = 0;
  const { api } = client(async () => { calls++; return response({ user: { id: 'seller' }, profile: { role: 'seller' } }); });
  const sessions = await Promise.all([api.getCurrentAuth(), api.getCurrentAuth(true), api.getCurrentAuth()]);
  assert.equal(calls, 1);
  assert.equal(sessions[0].profile.role, 'seller');
  assert.equal(sessions[0], sessions[1]);
});

test('anonymous bootstrap settles once without a recursive authentication request', async () => {
  let calls = 0;
  let changes = 0;
  const { api, window } = client(async () => { calls++; return response(null, 401); });
  window.addEventListener('marketplace-auth', () => { changes++; });
  assert.equal(await api.getCurrentAuth(), null);
  assert.equal(await api.getCurrentAuth(), null);
  assert.equal(calls, 1);
  assert.equal(changes, 1);
});

test('confirmation-required signup does not fabricate a session', async () => {
  const { api } = client(async () => response({ user: { id: 'pending' }, authenticated: false }));
  const result = await api.signup({ email: 'pending@example.com' });
  assert.equal(result.authenticated, false);
  assert.equal(api.getStoredAuth(), null);
});

test('login waits for the authoritative profile before publishing authentication', async () => {
  const calls = [];
  const { api } = client(async (url) => {
    calls.push(url);
    return response(url.endsWith('/login') ? { user: { id: 'seller' } } : { user: { id: 'seller' }, profile: { role: 'seller' } });
  });
  const result = await api.login('seller@example.com', 'Password123!', true);
  assert.equal(result.profile.role, 'seller');
  assert.equal(api.getStoredAuth().profile.role, 'seller');
  assert.deepEqual(calls, ['/api/marketplace/auth/login', '/api/marketplace/auth/me']);
});

test('temporary bootstrap failure can be retried', async () => {
  let calls = 0;
  const { api } = client(async () => { if (++calls === 1) throw new Error('offline'); return response(null, 401); });
  await assert.rejects(api.getCurrentAuth(), /offline/);
  assert.equal(await api.getCurrentAuth(), null);
  assert.equal(calls, 2);
});

test('a stale session response cannot sign the user back in after logout', async () => {
  let resolveSession;
  const { api } = client((url) => url.endsWith('/logout')
    ? Promise.resolve(new Response(null, { status: 204 }))
    : new Promise((resolve) => { resolveSession = resolve; }));
  const pending = api.getCurrentAuth();
  await api.logout();
  resolveSession(response({ user: { id: 'old-user' }, profile: { role: 'seller' } }));
  assert.equal(await pending, null);
  assert.equal(api.getStoredAuth(), null);
});
