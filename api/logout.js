// api/logout.js
import { withCORS, preflight } from "./_cors.js";
import { setCookie } from "./_utils.js";

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);

  // 토큰 & state 삭제
  setCookie(res, "gh_token", "", { path: "/", maxAge: 0 });
  setCookie(res, "oauth_state", "", { path: "/", maxAge: 0 });

  res.statusCode = 204;
  res.end();
}
