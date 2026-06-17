// Commit MULTIPLE files in a SINGLE commit (one deploy) + regenerate index.html.
const { getEnv, ghFactory, commitChanges } = require('./_lib.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { REPO, BRANCH, TOKEN, PASSWORD } = getEnv();
  if (!TOKEN) return res.status(500).json({ error: 'Servidor sin GITHUB_TOKEN configurado' });

  const { password, files, name, message } = req.body || {};
  if (PASSWORD && password !== PASSWORD) return res.status(401).json({ error: 'No autorizado' });
  if (!Array.isArray(files) || files.length === 0) return res.status(400).json({ error: 'No hay archivos' });
  if (files.length > 25) return res.status(400).json({ error: 'Máximo 25 archivos por tanda' });

  const ALLOWED_DIRS = ['pages/', 'modules/', 'shared/'];
  const ALLOWED_EXT = ['html', 'css', 'js', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'woff', 'woff2', 'json', 'txt', 'md'];

  const clean = [];
  let totalBytes = 0;
  for (const f of files) {
    const path = String((f && f.path) || '').replace(/^\/+/, '');
    if (!path || path.includes('..')) return res.status(400).json({ error: `Ruta no válida: ${f && f.path}` });
    const inRoot = !path.includes('/');
    if (!inRoot && !ALLOWED_DIRS.some((d) => path.startsWith(d))) return res.status(400).json({ error: `Carpeta no permitida: ${path}` });
    const ext = (path.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return res.status(400).json({ error: `Tipo no permitido: ${path}` });
    const b64 = String((f && f.contentBase64) || '');
    if (!b64) return res.status(400).json({ error: `Archivo vacío: ${path}` });
    totalBytes += Math.floor(b64.length * 0.75);
    clean.push({ path, b64 });
  }
  if (totalBytes > 8 * 1024 * 1024) return res.status(413).json({ error: 'La tanda supera 8 MB' });

  try {
    const gh = ghFactory(TOKEN, REPO);
    const who = name ? ` — by ${String(name).slice(0, 40)}` : '';
    const msg = (message || `chore: upload ${clean.length} file(s) via upload page`) + who;
    const commit = await commitChanges({ gh, branch: BRANCH, blobs: clean, removals: [], message: msg, regenIndex: true });
    return res.status(200).json({ ok: true, commit, count: clean.length, paths: clean.map((c) => c.path) });
  } catch (err) {
    const code = err.status && err.status >= 400 && err.status < 500 ? 400 : 502;
    return res.status(code).json({ error: err.message });
  }
};
