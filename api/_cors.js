// api/_cors.js
const ORIGINS = (process.env.APP_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export function withCORS(req, res) {
  const origin = req?.headers?.origin;

  console.log("🟡 Incoming CORS request");
  console.log("🔹 Request Origin:", origin);
  console.log("🔹 Allowed Origins:", ORIGINS);

  if (!origin) {
    console.warn("🔴 No origin header present in request");
    res.statusCode = 403;
    res.end("CORS origin header missing");
    return;
  }

  if (ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    console.log("🟢 CORS allowed for origin:", origin);
  } else {
    console.warn("❌ CORS blocked for origin:", origin);
    res.statusCode = 403;
    res.end("CORS origin not allowed");
  }
}

// OPTIONS 사전 요청 처리
export function preflight(req, res) {
  if (req.method === 'OPTIONS') {
    withCORS(req, res);
    if (!res.headersSent) {
      res.statusCode = 204;
      res.end();
    }
    return true;
  }
  return false;
}

