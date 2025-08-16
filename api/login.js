import { withCORS } from './_cors.js';
import { setCookie } from './_utils.js';
import { makeState } from './_state.js';

export default async function handler(req, res) {
  try {
    withCORS(res, req.headers.origin);

    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirect = process.env.OAUTH_REDIRECT;
    if (!clientId || !redirect) {
      res.statusCode = 500;
      return res.end('Missing env: GITHUB_CLIENT_ID or OAUTH_REDIRECT');
    }

    const state = await makeState();

    // 쿠키(있으면 사용) + 쿼리(state) 모두 전송
    setCookie(res, 'oauth_state', state, {
      httpOnly: true, secure: true, sameSite: 'None', path: '/', maxAge: 300
    });

    const loc =
      `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}`
      + `&redirect_uri=${encodeURIComponent(redirect)}`
      + `&scope=repo`
      + `&state=${encodeURIComponent(state)}`;

    res.writeHead(302, { Location: loc });
    res.end();
  } catch (e) {
    console.error('login error', e);
    res.statusCode = 500;
    res.end('login failed: ' + (e?.message || String(e)));
  }
}
