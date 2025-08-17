// 허용된 Origin 목록
const ORIGINS = (process.env.APP_ORIGIN || '').split(',').map(s => s.trim());

export function withCORS(req, res) {
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  } else {
    res.statusCode = 403;
    res.end('CORS origin not allowed');
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

