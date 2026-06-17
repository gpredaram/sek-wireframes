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
// Build the public index.html — a polished card view of pages/ and modules/.
// `highlight` = paths uploaded in this commit (shown in "Últimas subidas").
function renderIndex(paths, highlight = []) {
  const hi = new Set(highlight);
  const isContent = (p) => p.endsWith('.html') && (p.startsWith('pages/') || p.startsWith('modules/'));
  const pages = paths.filter((p) => p.startsWith('pages/') && p.endsWith('.html')).sort();
  const modules = paths.filter((p) => p.startsWith('modules/') && p.endsWith('.html')).sort();

  const card = (p) => {
    const name = p.split('/').pop().replace(/\.html$/, '');
    const rel = p.replace(/^(pages|modules)\//, '');
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/') + 1) : '';
    const href = '/' + p.replace(/\.html$/, '');
    const tag = hi.has(p) ? '<span class="ix-new">nuevo</span>' : '';
    return `        <a class="ix-card" href="${esc(href)}">
          <span class="ix-card-name">${esc(name)}${tag}</span>
          <span class="ix-card-path">${esc(dir || '—')}</span>
        </a>`;
  };

  const section = (title, items) =>
    items.length
      ? `  <section class="ix-section">
    <h2 class="ix-h2">${title} <span class="ix-count">${items.length}</span></h2>
    <div class="ix-grid">
${items.map(card).join('\n')}
    </div>
  </section>`
      : '';

  const latestPaths = highlight.filter(isContent).sort();
  const latest = latestPaths.length
    ? `  <section class="ix-section ix-latest">
    <h2 class="ix-h2">Últimas subidas</h2>
    <div class="ix-grid">
${latestPaths.map(card).join('\n')}
    </div>
  </section>`
      : '';

  const today = new Date().toISOString().slice(0, 10);
  const empty = !pages.length && !modules.length;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SEK · Wireframes</title>
  <link rel="stylesheet" href="shared/index.css">
</head>
<body>
<div class="ix-shell">
  <header class="ix-head">
    <span class="ix-badge">SEK · Wireframes</span>
    <h1>Wireframes</h1>
    <p>${pages.length} páginas · ${modules.length} módulos · actualizado ${today}</p>
  </header>

${[latest, section('Páginas', pages), section('Módulos', modules)].filter(Boolean).join('\n\n')}
${empty ? '  <p class="ix-empty">Sin páginas ni módulos todavía.</p>' : ''}
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
    const html = renderIndex(paths, blobs.map((b) => b.path));
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
