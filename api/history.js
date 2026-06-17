// Paginated change history: recent commits + which files changed (added/modified/removed).
const { getEnv, ghFactory } = require('./_lib.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { REPO, BRANCH, TOKEN, PASSWORD } = getEnv();
  if (!TOKEN) return res.status(500).json({ error: 'Servidor sin GITHUB_TOKEN configurado' });

  const { password, page } = req.body || {};
  if (PASSWORD && password !== PASSWORD) return res.status(401).json({ error: 'No autorizado' });

  const p = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 5;

  try {
    const gh = ghFactory(TOKEN, REPO);
    const commits = await gh(`/commits?sha=${encodeURIComponent(BRANCH)}&per_page=${perPage}&page=${p}`);
    const out = [];
    for (const c of commits) {
      const detail = await gh(`/commits/${c.sha}`);
      const files = (detail.files || [])
        .filter((f) => f.filename !== 'index.html') // auto-generated, hide noise
        .map((f) => ({ name: f.filename, status: f.status }));
      out.push({
        sha: c.sha.slice(0, 7),
        message: (c.commit.message || '').split('\n')[0],
        author: (c.commit.author && c.commit.author.name) || '',
        date: c.commit.author && c.commit.author.date,
        files
      });
    }
    return res.status(200).json({ ok: true, page: p, hasNext: commits.length === perPage, commits: out });
  } catch (err) {
    const code = err.status && err.status >= 400 && err.status < 500 ? 400 : 502;
    return res.status(code).json({ error: err.message });
  }
};
