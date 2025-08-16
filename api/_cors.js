// api/_cors.js
// 안전한 CORS + 프리플라이트 처리 (req가 없을 때도 안전)

const ALLOWED = (process.env.APP_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const getOrigin = (req) =>
  req?.headers?.origin || req?.headers?.Origin || "";

/** 공통 CORS 헤더 적용 */
export function withCORS(req, res) {
  const origin = getOrigin(req);

  if (ALLOWED.length > 0) {
    // allow list에 있으면 요청 origin, 없으면 첫 항목
    const allow = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
    res.setHeader("Access-Control-Allow-Origin", allow);
  } else if (origin) {
    // 설정이 비어 있으면 요청 origin 에코(개발 편의)
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

/** OPTIONS 프리플라이트 빠른 종료 */
export function preflight(req, res) {
  if (req?.method === "OPTIONS") {
    withCORS(req, res);
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

/** (선택) origin 강제 검사 */
export function assertCORS(req, res) {
  const origin = getOrigin(req);
  if (ALLOWED.length && origin && !ALLOWED.includes(origin)) {
    res.statusCode = 403;
    res.end("Forbidden Origin");
    return false;
  }
  return true;
}
