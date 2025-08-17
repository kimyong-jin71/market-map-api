// 허용된 Origin 목록
const ORIGINS = (process.env.APP_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// CORS 헤더 추가 함수
export function withCORS(req, res) {
  const origin = req?.headers?.origin;

  
  if (origin && ORIGINS.includes(origin)) {
    // 허용된 Origin일 경우만 CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  } else {
    // Origin 불일치 시 아예 CORS 헤더를 주지 않음 (보안 강화)
    res.statusCode = 403;
    res.end('CORS origin not allowed');
  }
}

// OPTIONS 사전 요청 처리
export function preflight(req, res) {
  if (req.method === 'OPTIONS') {
    withCORS(req, res);
    // CORS 거부 시 이미 응답 끝남
    if (!res.headersSent) {
      res.statusCode = 204;
      res.end();
    }
    return true;
  }
  return false;
}
