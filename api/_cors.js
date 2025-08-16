// api/_cors.js
// 허용 오리진: "http://localhost:5173,https://kimyong-jin71.github.io"
const ALLOWED = (process.env.APP_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function getOrigin(req) {
  // Node.js: req.headers.origin
  if (req?.headers && typeof req.headers === "object") {
    // Edge 런타임이 아닌 일반 Node
    if ("origin" in req.headers) return req.headers.origin;
    if ("Origin" in req.headers) return req.headers.Origin;
  }
  // Edge/Fetch Request: req.headers.get('origin')
  if (typeof req?.headers?.get === "function") {
    return req.headers.get("origin") || req.headers.get("Origin") || "";
  }
  return "";
}

function pickAllowOrigin(requestOrigin) {
  if (!ALLOWED.length) return requestOrigin || "*";
  return ALLOWED.includes(requestOrigin) ? requestOrigin : ALLOWED[0];
}

function applyHeaders(res, allow) {
  // Node.js 응답객체
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", allow);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    return;
  }
  // 혹시 객체로 직접 헤더를 세팅해야 하는 환경 대응
  res.headers = res.headers || {};
  res.headers["Access-Control-Allow-Origin"] = allow;
  res.headers["Vary"] = "Origin";
  res.headers["Access-Control-Allow-Credentials"] = "true";
  res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  res.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
}

export function withCORS(req, res) {
  const origin = getOrigin(req);
  const allow = pickAllowOrigin(origin);
  applyHeaders(res, allow);
}

export function preflight(req, res) {
  const method = req?.method || "";
  if (method.toUpperCase() === "OPTIONS") {
    withCORS(req, res);
    res.statusCode = 204;
    if (typeof res.end === "function") res.end();
    return true;
  }
  return false;
}
