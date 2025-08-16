// api/_cors.js

const ALLOWED = (process.env.APP_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const ALLOW_SET = new Set(ALLOWED);

export function withCORS(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");

  if (!ALLOWED.length || (origin && ALLOW_SET.has(origin))) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export function preflight(req, res) {
  if (req.method !== "OPTIONS") return false;
  withCORS(req, res);
  res.setHeader("Access-Control-Max-Age", "86400");
  res.statusCode = 204;
  res.end();
  return true;
}

export function assertCORS(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED.length && origin && !ALLOW_SET.has(origin)) {
    res.statusCode = 403;
    res.end("CORS blocked");
    return false;
  }
  return true;
}
