import { withCORS, preflight } from './_cors.js';

function parseCookies(req) {
  const h = req.headers.cookie || '';
  return Object.fromEntries(
    h.split(';').map(s => s.trim().split('=').map(decodeURIComponent)).filter(a => a[0])
  );
}

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res);

  const { code, state } = req.query;
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_REDIRECT } = process.env;
  const cookies = parseCookies(req);

  if (!code || !state || cookies.oauth_state !== state) {
    return res.status(400).send('Invalid state');
  }

  const r = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: OAUTH_REDIRECT
    })
  });
  const data = await r.json();
  if (!data.access_token) return res.status(400).send('Token exchange failed');

  res.setHeader('Set-Cookie', [
    `oauth_state=; Path=/; Max-Age=0`,
    `gh_token=${data.access_token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${60*60*24*7}`
  ]);
  res.writeHead(302, { Location: '/' });
  res.end();
}
