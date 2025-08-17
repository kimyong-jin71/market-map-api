export default async function handler(req, res) {
  const state = crypto.randomUUID();
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.OAUTH_REDIRECT;

  if (!clientId || !redirectUri) {
    res.statusCode = 500;
    return res.end("Missing environment variables");
  }

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=read:user`;

  res.setHeader("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=None`);
  res.writeHead(302, { Location: authUrl });
  res.end();
}
