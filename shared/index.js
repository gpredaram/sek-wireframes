/* Public index — sidebar nav + search + live preview cards.
   Reads window.IX_DATA = { items: [paths], latest: [paths] }. */
(function () {
  var data = window.IX_DATA || { items: [], latest: [] };
  var items = (data.items || []).slice().sort();
  var latest = new Set(data.latest || []);

  var nav = document.getElementById('ixNav');
  var grid = document.getElementById('ixGrid');
  var search = document.getElementById('ixSearch');
  var titleEl = document.getElementById('ixTitle');

  var GROUPS = [
    { key: 'pages/', label: 'Páginas' },
    { key: 'modules/', label: 'Módulos' }
  ];

  function countFor(prefix) { return items.filter(function (p) { return p.indexOf(prefix) === 0; }).length; }
  function nameOf(p) { return p.split('/').pop().replace(/\.html$/, ''); }
  function dirLabel(p) {
    var rel = p.replace(/^(pages|modules)\//, '');
    return rel.indexOf('/') >= 0 ? rel.slice(0, rel.lastIndexOf('/') + 1) : p.split('/')[0] + '/';
  }
  function subfolders(prefix) {
    var set = {};
    items.forEach(function (p) {
      if (p.indexOf(prefix) !== 0) return;
      var rest = p.slice(prefix.length);
      if (rest.indexOf('/') >= 0) set[prefix + rest.slice(0, rest.indexOf('/') + 1)] = true;
    });
    return Object.keys(set).sort();
  }

  // ---- sidebar ----
  function navItem(label, prefix, level, count) {
    var b = document.createElement('button');
    b.className = 'ix-nav-item' + (level ? ' lvl1' : '');
    b.dataset.prefix = prefix;
    b.innerHTML = '<span>' + label + '</span>' + (count != null ? '<span class="ix-nav-c">' + count + '</span>' : '');
    b.addEventListener('click', function () { select(prefix, label); });
    nav.appendChild(b);
  }
  navItem('Todo', '', 0, items.length);
  if (latest.size) navItem('Recientes', '__latest__', 0, latest.size);
  GROUPS.forEach(function (g) {
    if (!countFor(g.key)) return;
    navItem(g.label, g.key, 0, countFor(g.key));
    subfolders(g.key).forEach(function (sf) {
      navItem(sf.slice(g.key.length).replace(/\/$/, ''), sf, 1, countFor(sf));
    });
  });

  // ---- cards ----
  function makeCard(p) {
    var href = '/' + p.replace(/\.html$/, '');
    var a = document.createElement('a');
    a.className = 'ix-card';
    a.href = href;
    a.dataset.search = (p + ' ' + nameOf(p)).toLowerCase();
    a.innerHTML =
      '<div class="ix-prev"><iframe loading="lazy" src="' + href + '" title="preview" scrolling="no" tabindex="-1"></iframe></div>' +
      '<div class="ix-card-b">' +
      '<span class="ix-card-name"><span class="ix-tt">' + nameOf(p) + '</span>' + (latest.has(p) ? '<span class="ix-new">nuevo</span>' : '') + '</span>' +
      '<span class="ix-card-path">' + dirLabel(p) + '</span>' +
      '</div>';
    var iframe = a.querySelector('iframe');
    iframe.addEventListener('load', function () {
      try {
        var t = iframe.contentDocument && iframe.contentDocument.title;
        if (t) {
          a.querySelector('.ix-tt').textContent = t;
          a.dataset.search = (p + ' ' + t).toLowerCase();
          applySearch();
        }
      } catch (e) { /* cross-origin or blocked: keep filename */ }
    });
    return a;
  }

  function render(prefix) {
    var list;
    if (prefix === '__latest__') list = items.filter(function (p) { return latest.has(p); });
    else list = items.filter(function (p) { return p.indexOf(prefix) === 0; });
    grid.innerHTML = '';
    if (!list.length) { grid.innerHTML = '<p class="ix-empty">Nada aquí.</p>'; return; }
    list.forEach(function (p) { grid.appendChild(makeCard(p)); });
    applySearch();
  }

  function select(prefix, label) {
    [].forEach.call(nav.children, function (n) { n.classList.toggle('active', n.dataset.prefix === prefix); });
    titleEl.textContent = label || 'Todo';
    render(prefix);
  }

  function applySearch() {
    var q = (search.value || '').trim().toLowerCase();
    [].forEach.call(grid.querySelectorAll('.ix-card'), function (c) {
      c.style.display = (!q || c.dataset.search.indexOf(q) >= 0) ? '' : 'none';
    });
  }
  search.addEventListener('input', applySearch);

  select('', 'Todo');
})();
