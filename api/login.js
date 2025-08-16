import crypto from "node:crypto";
import { setCookie } from "./_utils.js";
import { withCORS } from "./_cors.js";

export default async function handler(req, res) {
  withCORS(res, req.headers.origin);

  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirect = process.env.OAUTH_REDIRECT;
  if (!clientId || !redirect) {
    res.statusCode = 500;
    return res.end("Missing OAuth env");
  }

  const state = crypto.randomUUID();
  setCookie(res, "oauth_state", state, { maxAge: 300 }); // 5분
  const url =
    `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirect)}` +
    `&scope=repo&state=${encodeURIComponent(state)}`;

  res.statusCode = 302;
  res.setHeader("Location", url);
  res.end();
}
