// api/_utils.js

export function parseCookies(req) {
  const h = req?.headers?.cookie || "";
  const out = {};
  h.split(/; */).forEach(p => {
    const i = p.indexOf("=");
    if (i > -1) {
      const k = decodeURIComponent(p.slice(0, i).trim());
      const v = decodeURIComponent(p.slice(i + 1));
      out[k] = v;
    }
  });
  return out;
}

export function setCookie(res, name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  parts.push(`Path=${opts.path || "/"}`);
  if (opts.httpOnly !== false) parts.push("HttpOnly");
  if (opts.secure !== false) parts.push("Secure");
  parts.push(`SameSite=${opts.sameSite || "None"}`);
  // 여러 개 set-cookie 가 필요할 수도 있으니 누적 처리
  const prev = res.getHeader("Set-Cookie");
  if (prev) {
    const arr = Array.isArray(prev) ? prev : [prev];
    res.setHeader("Set-Cookie", [...arr, parts.join("; ")]);
  } else {
    res.setHeader("Set-Cookie", parts.join("; "));
  }
}

export async function readJson(req) {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const body = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(body);
}
