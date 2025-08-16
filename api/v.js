// 허용 오리진 처리 + OPTIONS 프리플라이트
const ALLOWED = (process.env.APP_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);

export function withCORS(res, origin) {
  if (ALLOWED.length) {
    const allow = ALLOWED.includes(origin) ? origin : ALLOWED[0];
    res.setHeader("Access-Control-Allow-Origin", allow);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export function preflight(req, res) {
  if (req.method === "OPTIONS") {
    withCORS(res, req.headers.origin);
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}
