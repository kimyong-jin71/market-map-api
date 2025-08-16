// api/login.js
import { withCORS, preflight, assertCORS } from './_cors.js';
import { webcrypto } from 'node:crypto';
const cryptoLike = globalThis.crypto || webcrypto;

function randomState() {
  if (cryptoLike.randomUUID) return cryptoLike.randomUUID();
  const a = new Uint8Array(16);
  cryptoLike.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req, res) {
  try {
    withCORS(req, res);

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirect = process.env.OAUTH_REDIRECT;
    if (!clientId || !redirect) {
      res.statusCode = 500;
      return res.end('Missing env: GITHUB_CLIENT_ID or OAUTH_REDIRECT');
    }

    const state = randomState();
    // state 쿠키
    res.setHeader(
      'Set-Cookie',
      `oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=300`
    );

    const loc =
      `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirect)}` +
      `&scope=repo&state=${encodeURIComponent(state)}`;

    res.statusCode = 302;
    res.setHeader('Location', loc);
    res.end();
  } catch (e) {
    console.error('login error', e);
    res.statusCode = 500;
    res.end('login failed: ' + (e?.message || String(e)));
  }
}
