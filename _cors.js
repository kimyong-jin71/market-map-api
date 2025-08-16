export const ORIGIN = process.env.APP_ORIGIN; // 예: https://kimyong-jin71.github.io

export function withCORS(res) {
  if (ORIGIN) res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

export function preflight(req, res) {
  if (req.method === 'OPTIONS') {
    withCORS(res);
    res.status(204).end();
    return true;
  }
  return false;
}
