// ✅ 최상단에 위치
const { serialize } = require("cookie");
const fetch = require("node-fetch");

// 다른 import 또는 코드보다 먼저 위치해야 함
const { withCORS, preflight } = require("./_cors.js");
const { parseCookies } = require("./_utils.js");
const { validateState } = require("./_state.js");

module.exports = async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);

  const { code, state } = req.query || {};
  console.log("📥 [CALLBACK] Query Params:", req.query);

  try {
    const cookies = parseCookies(req);
    console.log("🍪 [CALLBACK] Parsed cookies:", cookies);
    if (!state || !validateState(state, cookies.oauth_state)) {
      console.warn("⚠️ [CALLBACK] Invalid OAuth state");
      res.statusCode = 400;
      return res.end("Invalid OAuth state");
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    console.log("🔐 [CALLBACK] Client ID:", clientId);
    console.log("🔐 [CALLBACK] Client Secret exists:", !!clientSecret);

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      res.statusCode = 401;
      return res.end("OAuth token fetch failed");
    }

    const cookie = serialize("gh_token", access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.setHeader("Set-Cookie", cookie);

    const redirect = process.env.APP_REDIRECT || "/";
    res.writeHead(302, { Location: redirect });
    res.end();
  } catch (e) {
    console.error("OAuth callback error", e);
    res.statusCode = 500;
    res.end("callback failed: " + (e?.message || String(e)));
  }
};
