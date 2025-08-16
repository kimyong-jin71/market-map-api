import { withCORS, preflight } from './_cors.js';

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res);

  res.setHeader('Set-Cookie', `gh_token=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`);
  res.status(204).end();
}
