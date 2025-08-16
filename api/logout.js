import { setCookie } from "./_utils.js";
import { withCORS, preflight, assertCORS } from './_cors.js';

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);
  setCookie(res, "gh_token", "", { maxAge: 0 });
  res.statusCode = 204;
  res.end();
}
