import { parseCookies, setCookie } from "./_utils.js";
import { withCORS } from "./_cors.js";

export default async function handler(req, res) {
  withCORS(res, req.headers.origin);

  const { code, state } = Object.fromEntries(new URL(req.url, "http://x").searchParams);
  const cookies = parseCookies(req);
  if (!code || !state || state !== cookies.oauth_state) {
    res.statusCode = 400;
    return res.end("Invalid state/code");
  }

  const body = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: process.env.OAUTH_REDIRECT
  };

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(r => r.json());

  if (!tokenRes.access_token) {
    res.statusCode = 401;
    return res.end("Token exchange failed");
  }

  // 토큰 저장
  setCookie(res, "gh_token", tokenRes.access_token, { maxAge: 60 * 60 * 24 * 30 }); // 30일
  // state 쿠키 제거
  setCookie(res, "oauth_state", "", { maxAge: 0 });

  const app = process.env.APP_ORIGIN || "http://localhost:5173";
  res.statusCode = 302;
  res.setHeader("Location", `${app}/market-map-web/?login=ok`);
  res.end();
}
