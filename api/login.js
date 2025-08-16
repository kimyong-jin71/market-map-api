// api/login.js
import { withCORS, preflight } from './_cors.js';
import { makeState } from './_state.js';
import { setCookie } from './_utils.js';

export default async function handler(req, res) {
  // OPTIONS 프리플라이트 우선 처리
  if (preflight(req, res)) return;

  withCORS(req, res); // ← 반드시 (req, res) 순서

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirect = process.env.OAUTH_REDIRECT;
  if (!clientId || !redirect) {
    res.statusCode = 500;
    return res.end('Missing env: GITHUB_CLIENT_ID or OAUTH_REDIRECT');
  }

  const state = await makeState();
  setCookie(res, 'oauth_state', state, {
    httpOnly: true, secure: true, sameSite: 'None', path: '/', maxAge: 300
  });

  const loc =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirect)}` +
    `&scope=repo` +
    `&state=${encodeURIComponent(state)}`;

  res.writeHead(302, { Location: loc });
  res.end();
}
