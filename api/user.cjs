import fetch from 'node-fetch'; // ✅ 이 줄 추가
import { withCORS, preflight } from './_cors.cjs';

function getToken(req) {
  const h = req.headers.cookie || '';
  const m = h.match(/(?:^|;)\s*gh_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res);

  const token = getToken(req);
  if (!token) return res.status(401).end();

  const r = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });

  if (!r.ok) return res.status(401).end();

  const u = await r.json();
  res.status(200).json({
    login: u.login,
    id: u.id,
    avatar_url: u.avatar_url
  });
}
