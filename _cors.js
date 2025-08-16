// api/_cors.js

// APP_ORIGIN은 콤마로 여러 개 입력 가능
// 예) APP_ORIGIN="http://localhost:5173,https://kimyong-jin71.github.io"
const ALLOWED = (process.env.APP_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const ALLOW_SET = new Set(ALLOWED);

export function withCORS(req, res) {
  const origin = req.headers.origin;

  // 여러 오리진 캐시 분리를 위해 항상 Vary: Origin
  res.setHeader("Vary", "Origin");

  // 자격증명(Cookie)을 쓰려면 * 불가. 요청 Origin이 허용 목록에 있을 때만 반영
  if (!ALLOWED.length || (origin && ALLOW_SET.has(origin))) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  // 최소 허용 헤더/메서드
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

// OPTIONS 처리
export function preflight(req, res) {
  if (req.method !== "OPTIONS") return false;
  withCORS(req, res);
  res.setHeader("Access-Control-Max-Age", "86400"); // 24h
  res.statusCode = 204;
  res.end();
  return true;
}

// 비허용 Origin은 바로 차단(선택)
export function assertCORS(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED.length && origin && !ALLOW_SET.has(origin)) {
    res.statusCode = 403;
    res.end("CORS blocked");
    return false;
  }
  return true;
}
