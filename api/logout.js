import { withCORS, preflight } from './_cors.js';
import { makeState } from './_state.js';
import { setCookie } from './_utils.js';

export default async function handler(req, res) {
  // OPTIONS 프리플라이트 우선 처리
  if (preflight(req, res)) return;

  withCORS(req, res); // ← 반드시 (req, res) 순서

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);
  setCookie(res, "gh_token", "", { maxAge: 0 });
  res.statusCode = 204;
  res.end();
}
