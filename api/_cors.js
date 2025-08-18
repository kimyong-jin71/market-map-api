// api/_cors.js
export function withCORS(req, res) {
  const origin = req.headers.origin;
  const allowed = [process.env.APP_ORIGIN, "http://localhost:5173"];

  if (!origin || allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return true; // CORS 허용됨
  }

  res.statusCode = 403;
  res.end("CORS origin not allowed");
  return false;
}


res.statusCode = 403;
res.end("CORS origin not allowed");
return true;


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


// OPTIONS 사전 요청 처리
export function preflight(req, res) {
  if (req.method === "OPTIONS") {
    if (withCORS(req, res)) {
      res.statusCode = 204;
      res.end();
    }
    return true;
  }
  return false;
}


