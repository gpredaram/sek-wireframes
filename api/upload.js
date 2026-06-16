// Vercel serverless function — receives a file (base64) and commits it to GitHub.
// The GitHub token lives ONLY here (env var), never in the browser.
//
// Required Vercel env vars:
//   GITHUB_TOKEN     fine-grained PAT with Contents: Read/Write on the repo
//   UPLOAD_PASSWORD  shared password the uploader must enter
// Optional:
//   GITHUB_REPO      "owner/repo" (defaults to gpredaram/sek-wireframes)
//   GITHUB_BRANCH    branch (defaults to main)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const REPO = process.env.GITHUB_REPO || 'gpredaram/sek-wireframes';
  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  const TOKEN = process.env.GITHUB_TOKEN;
  const PASSWORD = process.env.UPLOAD_PASSWORD;

  if (!TOKEN) return res.status(500).json({ error: 'Servidor sin GITHUB_TOKEN configurado' });

  const { path, contentBase64, password, message } = req.body || {};

  // Auth: shared password (if configured)
  if (PASSWORD && password !== PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  if (!path || !contentBase64) {
    return res.status(400).json({ error: 'Faltan datos (path / archivo)' });
  }

  // Sanitize path: no leading slash, no traversal
  const clean = String(path).replace(/^\/+/, '');
  if (clean.includes('..') || clean === '') {
    return res.status(400).json({ error: 'Ruta no válida' });
  }

  // Folder allowlist: root file, or under pages/ | modules/ | shared/
  const ALLOWED_DIRS = ['pages/', 'modules/', 'shared/'];
  const inRoot = !clean.includes('/');
  if (!inRoot && !ALLOWED_DIRS.some((d) => clean.startsWith(d))) {
    return res.status(400).json({ error: 'Carpeta no permitida' });
  }

  // File-type allowlist
  const ALLOWED_EXT = ['html', 'css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'woff', 'woff2', 'json', 'txt', 'md'];
  const ext = (clean.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return res.status(400).json({ error: `Tipo de archivo no permitido (.${ext})` });
  }

  // Size limit (~4 MB, under Vercel's request body cap). base64 ≈ 4/3 of bytes.
  const approxBytes = Math.floor(String(contentBase64).length * 0.75);
  if (approxBytes > 4 * 1024 * 1024) {
    return res.status(413).json({ error: 'Archivo demasiado grande (máx. 4 MB)' });
  }

  const apiPath = clean.split('/').map(encodeURIComponent).join('/');
  const url = `https://api.github.com/repos/${REPO}/contents/${apiPath}`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'sek-wireframes-uploader'
  };

  try {
    // If the file already exists we need its sha to update it.
    let sha;
    const getRes = await fetch(`${url}?ref=${encodeURIComponent(BRANCH)}`, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    } else if (getRes.status !== 404) {
      const e = await getRes.text();
      return res.status(502).json({ error: `GitHub (lectura): ${getRes.status} ${e.slice(0, 120)}` });
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: message || `chore: upload ${clean} via upload page`,
        content: contentBase64,
        branch: BRANCH,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const e = await putRes.text();
      return res.status(502).json({ error: `GitHub (escritura): ${putRes.status} ${e.slice(0, 160)}` });
    }

    const out = await putRes.json();
    return res.status(200).json({
      ok: true,
      path: clean,
      commit: out.commit && out.commit.sha,
      updated: Boolean(sha)
    });
  } catch (err) {
    return res.status(500).json({ error: `Error inesperado: ${err.message}` });
  }
};
