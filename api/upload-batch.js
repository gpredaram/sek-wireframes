// Vercel serverless function — commits MULTIPLE files in a SINGLE commit
// (one deploy) via the GitHub Git Data API. Token stays server-side.
//
// Body: { password, files: [{ path, contentBase64 }, ...], message? }

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const REPO = process.env.GITHUB_REPO || 'gpredaram/sek-wireframes';
  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  const TOKEN = process.env.GITHUB_TOKEN;
  const PASSWORD = process.env.UPLOAD_PASSWORD;

  if (!TOKEN) return res.status(500).json({ error: 'Servidor sin GITHUB_TOKEN configurado' });

  const { password, files, message } = req.body || {};
  if (PASSWORD && password !== PASSWORD) return res.status(401).json({ error: 'No autorizado' });
  if (!Array.isArray(files) || files.length === 0) return res.status(400).json({ error: 'No hay archivos' });
  if (files.length > 25) return res.status(400).json({ error: 'Máximo 25 archivos por tanda' });

  const ALLOWED_DIRS = ['pages/', 'modules/', 'shared/'];
  const ALLOWED_EXT = ['html', 'css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'woff', 'woff2', 'json', 'txt', 'md'];

  // Validate + normalize each file
  const clean = [];
  let totalBytes = 0;
  for (const f of files) {
    const path = String((f && f.path) || '').replace(/^\/+/, '');
    if (!path || path.includes('..')) return res.status(400).json({ error: `Ruta no válida: ${f && f.path}` });
    const inRoot = !path.includes('/');
    if (!inRoot && !ALLOWED_DIRS.some((d) => path.startsWith(d))) {
      return res.status(400).json({ error: `Carpeta no permitida: ${path}` });
    }
    const ext = (path.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return res.status(400).json({ error: `Tipo no permitido: ${path}` });
    const b64 = String((f && f.contentBase64) || '');
    if (!b64) return res.status(400).json({ error: `Archivo vacío: ${path}` });
    totalBytes += Math.floor(b64.length * 0.75);
    clean.push({ path, b64 });
  }
  if (totalBytes > 8 * 1024 * 1024) return res.status(413).json({ error: 'La tanda supera 8 MB' });

  const base = `https://api.github.com/repos/${REPO}`;
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'sek-wireframes-uploader',
    'Content-Type': 'application/json'
  };
  const gh = async (path, opts = {}) => {
    const r = await fetch(base + path, { headers, ...opts });
    const text = await r.text();
    let json = {};
    try { json = JSON.parse(text); } catch (e) { /* keep {} */ }
    if (!r.ok) {
      const err = new Error(`GitHub ${r.status}: ${String(json.message || text).slice(0, 140)}`);
      err.status = r.status;
      throw err;
    }
    return json;
  };

  try {
    // 1. Latest commit + its tree
    const ref = await gh(`/git/ref/heads/${encodeURIComponent(BRANCH)}`);
    const latestSha = ref.object.sha;
    const latestCommit = await gh(`/git/commits/${latestSha}`);
    const baseTree = latestCommit.tree.sha;

    // 2. One blob per file
    const treeItems = [];
    for (const f of clean) {
      const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.b64, encoding: 'base64' }) });
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }

    // 3. New tree on top of the current one
    const tree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: baseTree, tree: treeItems }) });

    // 4. Single commit
    const msg = message || `chore: upload ${clean.length} file(s) via upload page`;
    const commit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message: msg, tree: tree.sha, parents: [latestSha] }) });

    // 5. Move the branch -> triggers one Vercel deploy
    await gh(`/git/refs/heads/${encodeURIComponent(BRANCH)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });

    return res.status(200).json({ ok: true, commit: commit.sha, count: clean.length, paths: clean.map((c) => c.path) });
  } catch (err) {
    const code = err.status && err.status >= 400 && err.status < 500 ? 400 : 502;
    return res.status(code).json({ error: err.message });
  }
};
