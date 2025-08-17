// api/_cors.js
const origin = req.headers.origin;
const allowed = [process.env.APP_ORIGIN, "http://localhost:5173"];

if (!origin || allowed.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return true;
  }

  return false; // OPTIONS가 아니면 통과
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

