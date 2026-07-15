// Vercel serverless function: generic AI-provider relay.
// The browser can't call some providers directly (CORS), so it sends
// {url, headers, body} here and this function makes the real request
// server-side and passes the response straight back through.
//
// The API key travels inside `headers` (set by the client, e.g. Authorization
// or x-api-key) — this function never sees or stores it beyond the request.
//
// An allowlist keeps this from becoming an open relay to arbitrary URLs.

const ALLOWED_HOSTS = new Set([
  'api.groq.com',
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
  'api.openai.com',
  'dashscope.aliyuncs.com',
  'dashscope-intl.aliyuncs.com'
]);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  try {
    const { url, headers, body } = req.body || {};
    if (!url) { res.status(400).json({ error: 'Missing url' }); return; }

    let parsed;
    try { parsed = new URL(url); } catch (e) { res.status(400).json({ error: 'Invalid url' }); return; }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      res.status(403).json({ error: 'Host not allowed: ' + parsed.hostname });
      return;
    }

    const upstream = await fetch(url, {
      method: 'POST',
      headers: headers || { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: String(err && err.message || err) });
  }
};

