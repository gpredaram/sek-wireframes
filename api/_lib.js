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
// Build the public index.html from the current file paths, reflecting the real
// folder/file tree. `highlight` = paths uploaded in this commit (shown on top).
function renderIndex(paths, highlight = []) {
  const hi = new Set(highlight);
  const HIDE = (p) =>
    p === 'index.html' || p === 'upload.html' || p === 'robots.txt' || p === 'vercel.json' ||
    p === '.gitignore' || p === 'README.md' || p === 'CLAUDE.md' || p.startsWith('api/') || p.startsWith('.git');

  const files = paths.filter((p) => !HIDE(p)).sort();

  const link = (p, name) => {
    const isHtml = p.endsWith('.html');
    const href = '/' + p.replace(/\.html$/, '');
    const tag = hi.has(p) ? ' <span class="idx-new">nuevo</span>' : '';
    return isHtml
      ? `<a href="${esc(href)}">${esc(name)}</a>${tag}`
      : `<span class="idx-fname">${esc(name)}</span>${tag}`;
  };

  // Nested tree
  const root = { dirs: {}, files: [] };
  files.forEach((p) => {
    const parts = p.split('/');
    let node = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) node.files.push({ name: part, path: p });
      else { node.dirs[part] = node.dirs[part] || { dirs: {}, files: [] }; node = node.dirs[part]; }
    });
  });
  function renderNode(node) {
    let html = '<ul class="idx-tree">';
    Object.keys(node.dirs).sort().forEach((name) => {
      html += `<li class="idx-dir"><span class="idx-dname">${esc(name)}/</span>${renderNode(node.dirs[name])}</li>`;
    });
    node.files.sort((a, b) => a.name.localeCompare(b.name)).forEach((f) => {
      html += `<li class="idx-file">${link(f.path, f.name)}</li>`;
    });
    return html + '</ul>';
  }

  const latestPaths = highlight.filter((p) => !HIDE(p)).sort();
  const latest = latestPaths.length
    ? `  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Últimas subidas</h2><p>${new Date().toLocaleString('es-ES')}</p></div>
      <ul class="idx-latest">
${latestPaths.map((p) => `        <li>${link(p, p)}</li>`).join('\n')}
      </ul>
    </div>
  </section>

`
    : '';

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

${latest}  <section class="section">
    <div class="container">
      <div class="section-head"><h2>Estructura</h2></div>
      ${files.length ? renderNode(root) : '<p>Sin archivos todavía.</p>'}
    </div>
  </section>
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
