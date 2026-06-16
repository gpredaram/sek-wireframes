// Vercel serverless function — returns the repo file tree for the upload-page
// browser. Token stays server-side; gated by the same UPLOAD_PASSWORD so the
// private repo structure isn't exposed publicly.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const REPO = process.env.GITHUB_REPO || 'gpredaram/sek-wireframes';
  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  const TOKEN = process.env.GITHUB_TOKEN;
  const PASSWORD = process.env.UPLOAD_PASSWORD;

  if (!TOKEN) return res.status(500).json({ error: 'Servidor sin GITHUB_TOKEN configurado' });

  const { password } = req.body || {};
  if (PASSWORD && password !== PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'sek-wireframes-uploader'
  };

  try {
    const url = `https://api.github.com/repos/${REPO}/git/trees/${encodeURIComponent(BRANCH)}?recursive=1`;
    const r = await fetch(url, { headers });
    if (!r.ok) {
      const e = await r.text();
      return res.status(502).json({ error: `GitHub: ${r.status} ${e.slice(0, 120)}` });
    }
    const data = await r.json();
    // Hide infra files from the browser
    const HIDE = /^(\.git|\.github\/|api\/|node_modules\/|\.gitignore$|vercel\.json$|robots\.txt$)/;
    const tree = (data.tree || [])
      .filter((t) => !HIDE.test(t.path))
      .map((t) => ({ path: t.path, type: t.type })); // type: 'blob' | 'tree'
    return res.status(200).json({ ok: true, tree });
  } catch (err) {
    return res.status(500).json({ error: `Error inesperado: ${err.message}` });
  }
};
