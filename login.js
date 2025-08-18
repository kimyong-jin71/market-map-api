import { withCORS, preflight } from './_cors.js';

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res);

  const { GITHUB_CLIENT_ID, OAUTH_REDIRECT } = process.env;

  const state = Math.random().toString(36).slice(2);
  res.setHeader('Set-Cookie',
    `oauth_state=${state}; Path=/; HttpOnly; SameSite=None; Secure`
  );

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', OAUTH_REDIRECT);
  url.searchParams.set('scope', 'repo'); // public_repo만 필요하면 변경
  url.searchParams.set('state', state);

  res.writeHead(302, { Location: url.toString() });
  res.end();
}
