// api/_cors.cjs

const allowedOrigins = [process.env.APP_ORIGIN, "http://localhost:5173"];

function withCORS(req, res) {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    console.log("🟢 CORS allowed for origin:", origin);
    return true;
  }

  console.warn("❌ CORS blocked for origin:", origin);
  res.statusCode = 403;
  res.end("CORS origin not allowed");
  return false;
}

function preflight(req, res) {
  if (req.method === "OPTIONS") {
    if (withCORS(req, res)) {
      res.statusCode = 204;
      res.end();
    }
    return true;
  }
  return false;
}

module.exports = { withCORS, preflight };
