import { withCORS, preflight } from './_cors.js';
import { makeState } from './_state.js';
import { setCookie } from './_utils.js';

export default async function handler(req, res) {
  // OPTIONS 프리플라이트 우선 처리
  if (preflight(req, res)) return;

  withCORS(req, res); // ← 반드시 (req, res) 순서

const OWNER = process.env.REPO_OWNER || "kimyong-jin71";
const REPO  = process.env.REPO_NAME  || "market-map-web";
const PATH  = process.env.FILE_PATH  || "public/market.json";
const BR    = process.env.REPO_BRANCH || "main";

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);

  if (req.method !== "POST") return json(res, 405, { error: "POST only" });

  const token = parseCookies(req).gh_token;
  if (!token) return json(res, 401, { error: "Unauthorized" });

  let data;
  try {
    data = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: "Invalid JSON" });
  }

  // ?�재 ?�일 sha 조회
  let sha = undefined;
  const getRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}?ref=${BR}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
  });
  if (getRes.ok) {
    const j = await getRes.json();
    sha = j.sha;
  }

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(PATH)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify({
      message: "Update market.json",
      content,
      sha,
      branch: BR
    })
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    return json(res, 500, { error: "save failed", detail: err });
  }
  const out = await putRes.json();
  return json(res, 200, { ok: true, commit: out.commit?.sha });
}
