// api/save.js
import { withCORS, preflight } from "./_cors.js";
import { parseCookies, readJson } from "./_utils.js";

export default async function handler(req, res) {
  if (preflight(req, res)) return;
  withCORS(req, res);

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  try {
    const token = parseCookies(req).gh_token;
    if (!token) {
      res.statusCode = 401;
      return res.end("Unauthorized");
    }

    const { owner, repo, branch = "main", path, payload, message } = await readJson(req);
    if (!owner || !repo || !path) {
      res.statusCode = 400;
      return res.end("Missing owner/repo/path");
    }

    const content = Buffer.from(JSON.stringify(payload, null, 2), "utf8").toString("base64");

    // 기존 SHA 조회(있으면 update, 없으면 create)
    const base = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    let sha = undefined;
    const head = await fetch(`${base}?ref=${encodeURIComponent(branch)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
    });
    if (head.ok) {
      const j = await head.json();
      sha = j.sha;
    }

    const put = await fetch(base, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({
        message: message || "chore: update market.json via API",
        content,
        branch,
        sha
      })
    });

    if (!put.ok) {
      const t = await put.text();
      res.statusCode = 500;
      return res.end(`Save failed: ${t}`);
    }

    res.statusCode = 200;
    res.end("OK");
  } catch (e) {
    console.error("save error", e);
    res.statusCode = 500;
    res.end("Save failed");
  }
}
