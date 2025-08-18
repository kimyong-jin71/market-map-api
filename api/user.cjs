const fetch = require('node-fetch'); // CommonJS 방식
const { withCORS, preflight } = require('./_cors.cjs');

function getToken(req) {
  const h = req.headers.cookie || '';
  const m = h.match(/(?:^|;)\s*gh_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

module.exports = async function handler(req, res) {
  // Preflight 요청 처리
  if (preflight(req, res)) return;

  // CORS 검사 및 헤더 설정
  if (!withCORS(req, res)) return;

  // 쿠키에서 GitHub 토큰 추출
  const token = getToken(req);
  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Missing GitHub token" }));
    return;
  }

  // GitHub API 요청
  const r = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'MyApp'
    }
  });

  if (!r.ok) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Invalid GitHub token" }));
    return;
  }

  const u = await r.json();

  // 사용자 정보 반환
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    login: u.login,
    id: u.id,
    avatar_url: u.avatar_url
  }));
};
