// Delete a single file in one commit + regenerate index.html.
const { getEnv, ghFactory, commitChanges } = require('./_lib.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { REPO, BRANCH, TOKEN, PASSWORD } = getEnv();
  if (!TOKEN) return res.status(500).json({ error: 'Servidor sin GITHUB_TOKEN configurado' });

  const { password, path, name } = req.body || {};
  if (PASSWORD && password !== PASSWORD) return res.status(401).json({ error: 'No autorizado' });

  const clean = String(path || '').replace(/^\/+/, '');
  if (!clean || clean.includes('..') || clean.endsWith('/')) return res.status(400).json({ error: 'Ruta no válida' });
  // Any file may be deleted EXCEPT the uploader's own infrastructure.
  const PROTECTED = ['index.html', 'upload.html', 'shared/upload.css', 'vercel.json', 'robots.txt', '.gitignore'];
  if (PROTECTED.includes(clean) || clean.startsWith('api/') || clean.startsWith('.git')) {
    return res.status(400).json({ error: 'Archivo protegido (infraestructura del subidor): no se puede eliminar' });
  }

  try {
    const gh = ghFactory(TOKEN, REPO);
    const who = name ? ` — by ${String(name).slice(0, 40)}` : '';
    const commit = await commitChanges({ gh, branch: BRANCH, blobs: [], removals: [clean], message: `chore: delete ${clean} via upload page${who}`, regenIndex: true });
    return res.status(200).json({ ok: true, commit, path: clean });
  } catch (err) {
    const code = err.status && err.status >= 400 && err.status < 500 ? 400 : 502;
    return res.status(code).json({ error: err.message });
  }
};
