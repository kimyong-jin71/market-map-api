// api/callback.js
import { withCORS, preflight } from "./_cors.js";
import { parseCookies, setCookie } from "./_utils.js";
import { verifyState } from "./_state.js";

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);

  try {
    const url = new URL(req.url, "http://x");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookies = parseCookies(req);
    const cookieState = cookies.oauth_state;

    if (!code || !state || !cookieState || state !== cookieState || !(await verifyState(state))) {
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

    // 토큰 보관 (30일)
    setCookie(res, "gh_token", tokenRes.access_token, {
      httpOnly: true, secure: true, sameSite: "None", path: "/", maxAge: 60 * 60 * 24 * 30
    });
    // state 쿠키 제거
    setCookie(res, "oauth_state", "", { path: "/", maxAge: 0 });

    // 첫 번째 허용 오리진으로 리다이렉트
    const app = (process.env.APP_ORIGIN || "http://localhost:5173").split(",")[0].trim();
    const dest = app.endsWith("/") ? app : (app + "/");

    res.writeHead(302, { Location: `${dest}?login=ok` });
    res.end();
  } catch (e) {
    console.error("callback error", e);
    res.statusCode = 500;
    res.end("callback failed");
  }
}
