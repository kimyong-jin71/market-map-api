import { withCORS, preflight } from './_cors.js';
import { makeState } from './_state.js';
import { setCookie } from './_utils.js';

export default async function handler(req, res) {
  // OPTIONS 프리플라이트 우선 처리
  if (preflight(req, res)) return;

  withCORS(req, res); // ← 반드시 (req, res) 순서


  const { searchParams } = new URL(req.url, 'https://api');
  const code  = searchParams.get('code');
  const state = searchParams.get('state');

  const cookies = parseCookies(req);
  const cookieState = cookies.oauth_state;

  // 쿠키가 없어도 '서명 검증'만 통과하면 OK (있으면 동일성도 체크)
  const ok = await verifyState(state) && (!cookieState || cookieState === state);

  if (!code || !ok) {
    res.statusCode = 400;
    return res.end('Invalid state/code');
  }

  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: process.env.OAUTH_REDIRECT,
  };

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json());

  if (!tokenRes.access_token) {
    res.statusCode = 401;
    return res.end('Token exchange failed');
  }

  setCookie(res, 'gh_token', tokenRes.access_token, {
    httpOnly: true, secure: true, sameSite: 'None', path: '/', maxAge: 60 * 60 * 24 * 30
  });
  setCookie(res, 'oauth_state', '', { path: '/', maxAge: 0 });

  const app = process.env.APP_ORIGIN || 'https://kimyong-jin71.github.io';
  res.writeHead(302, { Location: `${app}/market-map-web/?login=ok` });
  res.end();
}
