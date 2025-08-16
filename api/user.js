import { parseCookies } from "./_utils.js";
import { withCORS, preflight } from "./_cors.js";

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res, req.headers.origin);

  const token = parseCookies(req).gh_token;
  if (!token) {
    res.statusCode = 401;
    return res.end("No token");
  }

  const me = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
  }).then(r => r.json());

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ login: me.login, id: me.id }));
}
