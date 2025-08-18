// api/_state.cjs

const { webcrypto } = require('crypto');
const crypto = globalThis.crypto || webcrypto;
const enc = new TextEncoder();

const SECRET = (process.env.STATE_SECRET || process.env.GITHUB_CLIENT_SECRET || 'fallback-secret').slice(0, 64);

async function hmac(input) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
  return Buffer.from(sig).toString('base64url');
}

async function makeState() {
  const nonce = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const ts = Date.now();
  const data = `${nonce}.${ts}`;
  const sig = await hmac(data);
  return `${data}.${sig}`; // "nonce.ts.sig"
}

async function verifyState(state, maxAgeMs = 10 * 60_000) {
  try {
    const [nonce, ts, sig] = String(state || '').split('.');
    if (!nonce || !ts || !sig) return false;
    if (Date.now() - Number(ts) > maxAgeMs) return false;
    const expect = await hmac(`${nonce}.${ts}`);
    return sig === expect;
  } catch {
    return false;
  }
}

module.exports = { makeState, verifyState };
