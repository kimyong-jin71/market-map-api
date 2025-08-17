import { withCORS, preflight } from './_cors.js';
import { setCookie } from './_utils.js';

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);

  // 토큰 제거
  setCookie(res, 'gh_token', '', { path: '/', maxAge: 0 });

  const base = (process.env.APP_REDIRECT ||
                process.env.APP_ORIGIN?.split(',')[0] ||
                'http://localhost:5173').trim();
  const redirectTo = base.endsWith('/') ? base : base + '/';

  res.writeHead(302, { Location: `${redirectTo}?logout=ok` });
  res.end();
}
