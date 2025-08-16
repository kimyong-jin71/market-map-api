import { withCORS, preflight } from './_cors.js';

function getToken(req) {
  const h = req.headers.cookie || '';
  const m = h.match(/(?:^|;)\s*gh_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function toBase64Unicode(str) {
  return Buffer.from(unescape(encodeURIComponent(str)), 'binary').toString('base64');
}

function readBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => resolve(JSON.parse(data || '{}')));
  });
}

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(res);

  if (req.method !== 'POST') return res.status(405).end();

  const token = getToken(req);
  if (!token) return res.status(401).send('unauthorized');

  const { owner, repo, branch = 'main', path = 'public/market.json', payload } = await readBody(req);
  if (!payload || !payload.shops) return res.status(400).send('invalid payload');

  const api = (sub) => `https://api.github.com/repos/${owner}/${repo}${sub}`;

  // sha 조회
  let sha;
  const meta = await fetch(`${api(`/contents/${encodeURIComponent(path)}`)}?ref=${encodeURIComponent(branch)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
  });
  if (meta.status === 200) sha = (await meta.json()).sha;
  else if (meta.status !== 404) return res.status(meta.status).send(await meta.text());

  // 파일 저장
  const content = toBase64Unicode(JSON.stringify(payload, null, 2));
  const put = await fetch(api(`/contents/${encodeURIComponent(path)}`), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'update market.json from app',
      content, branch, sha
    })
  });

  if (!put.ok) return res.status(put.status).send(await put.text());
  res.status(200).json({ ok: true });
}
