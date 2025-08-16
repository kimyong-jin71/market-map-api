import { setCookie } from "./_utils.js";
import { withCORS, preflight } from "./_cors.js";

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res, req.headers.origin);
  setCookie(res, "gh_token", "", { maxAge: 0 });
  res.statusCode = 204;
  res.end();
}
