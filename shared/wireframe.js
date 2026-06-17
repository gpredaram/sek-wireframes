/* ── ACCORDION (SEK-CON-004) ─────────────────────────────────── */
function toggleAcord(header) {
  var chevron = header.querySelector('.acord-chevron');
  var body = header.nextElementSibling;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
}

/* ── CARTA VER MÁS — mobile (SEK-CON-003) ───────────────────── */
function toggleCartaMobile() {
  var cb = document.getElementById('carta-body');
  var btn = document.getElementById('ver-mas-carta-btn');
  var expanded = cb.classList.toggle('expanded');
  btn.textContent = expanded ? 'Ver menos' : 'Ver más';
}
function resetCartaMobile() {
  var cb  = document.getElementById('carta-body');
  var btn = document.getElementById('ver-mas-carta-btn');
  if (cb && btn) { cb.classList.remove('expanded'); btn.textContent = 'Ver más'; }
}

/* ── RECONOCIMIENTOS "VER TODOS" — mobile (SEK-CON-006) ─────── */
function toggleRecoTodos() {
  var extras  = document.querySelectorAll('.reco-extra');
  var btn     = document.getElementById('reco-ver-todos');
  var showing = btn.dataset.showing === 'true';
  extras.forEach(function(el) { el.style.display = showing ? '' : 'flex'; });
  btn.textContent    = showing ? 'Ver todos' : 'Ver menos';
  btn.dataset.showing = showing ? 'false' : 'true';
}

/* ── CERTIFICADOS "VER MÁS" — mobile (SEK-CON-004) ─────────── */
function toggleAcordExtra() {
  var extras  = document.querySelectorAll('.acord-extra');
  var btn     = document.getElementById('acord-ver-mas');
  var showing = btn.dataset.showing === 'true';
  extras.forEach(function(el) { el.style.display = showing ? '' : 'block'; });
  btn.textContent     = showing ? (btn.dataset.label || 'Ver más del bloque') : 'Ver menos';
  btn.dataset.showing = showing ? 'false' : 'true';
}

/* Limpia estados expandidos (usado al cruzar breakpoint mobile/tablet) */
function resetExpandables() {
  var recoExtras = document.querySelectorAll('.reco-extra');
  var recoBtn    = document.getElementById('reco-ver-todos');
  recoExtras.forEach(function(el) { el.style.display = ''; });
  if (recoBtn) { recoBtn.textContent = 'Ver todos'; recoBtn.dataset.showing = 'false'; }

  var acordExtras = document.querySelectorAll('.acord-extra');
  var acordBtn    = document.getElementById('acord-ver-mas');
  acordExtras.forEach(function(el) { el.style.display = ''; });
  if (acordBtn) { acordBtn.textContent = acordBtn.dataset.label || 'Ver más del bloque'; acordBtn.dataset.showing = 'false'; }
}

/* Muestra u oculta los CTAs de expandir según si hay ítems ocultos */
function syncExpandBtns() {
  var acordBtn = document.getElementById('acord-ver-mas');
  if (acordBtn) {
    acordBtn.style.display = document.querySelectorAll('.acord-extra').length === 0 ? 'none' : '';
  }
  var recoBtn = document.getElementById('reco-ver-todos');
  if (recoBtn) {
    recoBtn.style.display = document.querySelectorAll('.reco-extra').length === 0 ? 'none' : '';
  }
}

/* ── CAROUSEL — desktop/tablet (SEK-CRD-002) ────────────────── */
var carouselIndex = 0;

function applyCarousel() {
  if (window.innerWidth < 768) {
    var t = document.getElementById('carousel-track');
    if (t) t.style.transform = '';
    return;
  }
  var CARDS_VISIBLE = window.innerWidth >= 1200 ? 4 : 3;
  var track = document.getElementById('carousel-track');
  if (!track) return;
  var cards    = track.querySelectorAll('.card-nav');
  var total    = cards.length;
  var maxIndex = Math.max(0, total - CARDS_VISIBLE);
  carouselIndex = Math.min(Math.max(carouselIndex, 0), maxIndex);
  if (!cards.length) return;
  var cardWidth = cards[0].offsetWidth + 12;
  track.style.transform = 'translateX(-' + (carouselIndex * cardWidth) + 'px)';
  var arrowsDiv = document.querySelector('.carousel-arrows');
  var prev = document.getElementById('arrow-prev');
  var next = document.getElementById('arrow-next');
  if (maxIndex === 0) {
    if (arrowsDiv) arrowsDiv.style.display = 'none';
    return;
  }
  if (arrowsDiv) arrowsDiv.style.display = 'flex';
  if (prev) { prev.style.opacity = carouselIndex === 0       ? '0.3' : '1'; prev.style.pointerEvents = carouselIndex === 0       ? 'none' : ''; }
  if (next) { next.style.opacity = carouselIndex >= maxIndex ? '0.3' : '1'; next.style.pointerEvents = carouselIndex >= maxIndex ? 'none' : ''; }
}

function moveCarousel(dir) {
  if (window.innerWidth < 768) return;
  carouselIndex += dir;
  applyCarousel();
}

/* ── VIDEO MODAL ─────────────────────────────────────────────── */
function openVideoModal() {
  document.getElementById('video-modal').style.display = 'flex';
}
function closeVideoModal() {
  document.getElementById('video-modal').style.display = 'none';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeVideoModal(); closeAllDropdowns(); closeDrawer(); }
});

/* ── NAVIGATION — Desktop dropdowns ────────────────────────── */
function toggleDropdown(item, ddId) {
  var isOpen = item.classList.contains('active');
  closeAllDropdowns();
  if (!isOpen) {
    item.classList.add('active');
    var ch = item.querySelector('.nav-chevron');
    if (ch) ch.classList.add('open');
    var dd = document.getElementById(ddId);
    if (dd) dd.classList.add('open');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.nav-item.active').forEach(function(item) {
    item.classList.remove('active');
    var ch = item.querySelector('.nav-chevron');
    if (ch) ch.classList.remove('open');
  });
  document.querySelectorAll('.nav-dropdown.open').forEach(function(dd) {
    dd.classList.remove('open');
  });
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('#site-nav') && !e.target.closest('#seg-nav')) closeAllDropdowns();
});

/* ── NAVIGATION — Mobile drawer (Apple-style panel stack) ────── */
var panelStack = ['panel-main'];

function toggleDrawer() {
  var drawer = document.getElementById('nav-drawer');
  var btn = document.querySelector('.nav-hamburger');
  if (!drawer) return;
  if (drawer.classList.contains('open')) {
    closeDrawer();
  } else {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
}

function openPanel(panelId) {
  var currentId = panelStack[panelStack.length - 1];
  var current = document.getElementById(currentId);
  if (current) { current.classList.remove('active'); current.classList.add('prev'); }
  var next = document.getElementById(panelId);
  if (next) next.classList.add('active');
  panelStack.push(panelId);
}

function goBack() {
  if (panelStack.length <= 1) return;
  var currentId = panelStack.pop();
  var current = document.getElementById(currentId);
  if (current) current.classList.remove('active');
  var prevId = panelStack[panelStack.length - 1];
  var prev = document.getElementById(prevId);
  if (prev) { prev.classList.remove('prev'); prev.classList.add('active'); }
}

function closeDrawer() {
  var drawer = document.getElementById('nav-drawer');
  var btn = document.querySelector('.nav-hamburger');
  if (!drawer) return;
  drawer.classList.remove('open');
  document.body.style.overflow = '';
  if (btn) btn.setAttribute('aria-expanded', 'false');
  setTimeout(function() {
    panelStack = ['panel-main'];
    document.querySelectorAll('.drawer-panel').forEach(function(p) {
      p.classList.remove('active', 'prev');
    });
    var main = document.getElementById('panel-main');
    if (main) main.classList.add('active');
  }, 350);
}

window.addEventListener('resize', applyCarousel);
document.addEventListener('DOMContentLoaded', function() {
  applyCarousel();
  syncExpandBtns();

  /* PAT-009 — Anchor bar hide/show on scroll */
  var anchorBar = document.getElementById('anchor-bar');
  if (anchorBar) {
    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var current = window.scrollY;
      if (current > lastScroll && current > 100) {
        anchorBar.style.transform = 'translateY(-100%)';
      } else {
        anchorBar.style.transform = 'translateY(0)';
      }
      lastScroll = current;
    });
  }
});

/* ── ACORDEÓN EXCLUSIVO — PAT-001 modo exclusivo (SEK-CON-011) ─ */
function toggleAcordExcl(header) {
  var list = header.closest('.acord-excl-list');
  var thisBody = header.nextElementSibling;
  var thisChevron = header.querySelector('.acord-chevron');
  var isOpen = thisBody.classList.contains('open');
  list.querySelectorAll('.acord-excl-body').forEach(function(b) { b.classList.remove('open'); });
  list.querySelectorAll('.acord-excl-header .acord-chevron').forEach(function(c) { c.classList.remove('open'); });
  if (!isOpen) {
    thisBody.classList.add('open');
    if (thisChevron) thisChevron.classList.add('open');
  }
}

/* ── HISTORIA "VER MÁS" — mobile (SEK-CON-009) ─────────────── */
function toggleHistoriaVerMas() {
  var texto = document.getElementById('historia-texto');
  var btn   = document.getElementById('historia-ver-mas-btn');
  if (!texto || !btn) return;
  var expanded = texto.classList.toggle('expanded');
  btn.textContent = expanded ? 'Ver menos' : 'Ver más';
}

/* ── ANCHOR BAR — PAT-009 (future-learning-model) ───────────── */
function setAncla(el, targetId) {
  document.querySelectorAll('.anclas__item').forEach(function(a) { a.classList.remove('active'); });
  el.classList.add('active');
  var target = document.getElementById(targetId);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── ACCORDION EXCLUSIVO DE PÁGINA — PAT-001 (future-learning-model) */
function toggleAccordion(btn) {
  var item   = btn.closest('.accordion__item');
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion__item').forEach(function(i) { i.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
}
