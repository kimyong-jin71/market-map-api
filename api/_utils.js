// 공통 유틸(쿠키, JSON 응답)
export function parseCookies(req) {
  const h = req.headers?.cookie || "";
  return Object.fromEntries(
    h.split(";").map(v => v.trim()).filter(Boolean).map(v => {
      const i = v.indexOf("=");
      return [decodeURIComponent(v.slice(0, i)), decodeURIComponent(v.slice(i + 1))];
    })
  );
}

export function setCookie(res, name, value, opt = {}) {
  const {
    path = "/",
    httpOnly = true,
    sameSite = "None",
    secure = true,
    maxAge, // 초
    expires // Date
  } = opt;
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value ?? "")}`, `Path=${path}`];
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");
  if (sameSite) parts.push(`SameSite=${sameSite}`);
  if (typeof maxAge === "number") parts.push(`Max-Age=${maxAge}`);
  if (expires instanceof Date) parts.push(`Expires=${expires.toUTCString()}`);
  const prev = res.getHeader("Set-Cookie");
  res.setHeader("Set-Cookie", prev ? [].concat(prev, parts.join("; ")) : parts.join("; "));
}

export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "";
    req.on("data", c => (b += c));
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}
