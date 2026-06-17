// Shared helpers for the upload-tool serverless functions.
// Files starting with "_" are NOT turned into routes by Vercel, but can be required.

function getEnv() {
  return {
    REPO: process.env.GITHUB_REPO || 'gpredaram/sek-wireframes',
    BRANCH: process.env.GITHUB_BRANCH || 'main',
    TOKEN: process.env.GITHUB_TOKEN,
    PASSWORD: process.env.UPLOAD_PASSWORD
  };
}

// gh(path, opts) -> JSON, scoped to /repos/{repo}; throws on non-2xx (err.status set)
function ghFactory(token, repo) {
  const base = `https://api.github.com/repos/${repo}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'sek-wireframes-uploader',
    'Content-Type': 'application/json'
  };
  return async function gh(path, opts = {}) {
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
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Build the public index.html (TOC) from the current list of file paths.
function renderIndex(paths) {
  const htmls = paths.filter(
    (p) => p.endsWith('.html') && p !== 'index.html' && p !== 'upload.html' && !p.startsWith('api/')
  );
  const groups = [
    { title: 'Páginas', items: htmls.filter((p) => p.startsWith('pages/')) },
    { title: 'Módulos', items: htmls.filter((p) => p.startsWith('modules/')) },
    { title: 'Otros', items: htmls.filter((p) => !p.startsWith('pages/') && !p.startsWith('modules/')) }
  ].filter((g) => g.items.length);

  const card = (p) => {
    const name = p.split('/').pop().replace(/\.html$/, '');
    const dir = p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '/';
    const href = '/' + p.replace(/\.html$/, '');
    return `        <a class="index-card" href="${esc(href)}"><span class="code">${esc(dir)}</span><span class="name">${esc(name)}</span></a>`;
  };

  const sections = groups
    .map(
      (g) => `  <section class="section">
    <div class="container">
      <div class="section-head"><h2>${esc(g.title)}</h2></div>
      <div class="index-grid">
${g.items.sort().map(card).join('\n')}
      </div>
    </div>
  </section>`
    )
    .join('\n\n');

  const today = new Date().toISOString().slice(0, 10);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SEK · Wireframes — Índice</title>
  <link rel="stylesheet" href="shared/styles.css">
  <script src="shared/wireframe.js" defer></script>
</head>
<body>
<div id="page-wrapper">
  <header class="index-head">
    <div class="container">
      <h1>SEK · Wireframes</h1>
      <p>Índice generado automáticamente · ${today}</p>
    </div>
  </header>

${sections || '  <section class="section"><div class="container"><p>Sin páginas todavía.</p></div></section>'}
</div>
</body>
</html>
`;
}

// Commit a set of changes (adds + removals) in a SINGLE commit, regenerating
// index.html so it always reflects the current files. Returns the commit sha.
async function commitChanges({ gh, branch, blobs = [], removals = [], message, regenIndex = true }) {
  // 1. Latest commit + base tree
  const ref = await gh(`/git/ref/heads/${encodeURIComponent(branch)}`);
  const latestSha = ref.object.sha;
  const baseCommit = await gh(`/git/commits/${latestSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  // 2. Current file set (for index regen)
  const full = await gh(`/git/trees/${baseTreeSha}?recursive=1`);
  const removeSet = new Set(removals);
  let paths = (full.tree || []).filter((t) => t.type === 'blob').map((t) => t.path).filter((p) => !removeSet.has(p));
  blobs.forEach((b) => { if (!paths.includes(b.path)) paths.push(b.path); });

  // 3. Blobs for added files
  const treeItems = [];
  for (const b of blobs) {
    const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: b.b64, encoding: 'base64' }) });
    treeItems.push({ path: b.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  // Removals (sha:null deletes the path against base_tree)
  removals.forEach((p) => treeItems.push({ path: p, mode: '100644', type: 'blob', sha: null }));

  // Regenerate index.html in the same commit
  if (regenIndex) {
    const html = renderIndex(paths);
    const idx = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: Buffer.from(html, 'utf8').toString('base64'), encoding: 'base64' }) });
    treeItems.push({ path: 'index.html', mode: '100644', type: 'blob', sha: idx.sha });
  }

  // 4. Tree -> commit -> move ref
  const tree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }) });
  const commit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [latestSha] }) });
  await gh(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
  return commit.sha;
}

module.exports = { getEnv, ghFactory, renderIndex, commitChanges };
