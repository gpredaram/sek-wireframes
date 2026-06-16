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

/* ── NAVIGATION — Mobile drawer ─────────────────────────────── */
function openDrawer() {
  document.getElementById('nav-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  var drawer = document.getElementById('nav-drawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  document.body.style.overflow = '';
  var submenu = document.getElementById('drawer-cta-submenu');
  var chevron = document.getElementById('drawer-cta-chevron');
  if (submenu) submenu.classList.remove('open');
  if (chevron) chevron.classList.remove('open');
}

function selectDrawerItem(btn, panelId) {
  document.querySelectorAll('.drawer-item-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  btn.classList.add('active');
  document.querySelectorAll('.drawer-panel').forEach(function(p) {
    p.classList.remove('active');
  });
  var panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.add('active');
    panel.parentElement.scrollTop = 0;
  }
}

function toggleDrawerItem(header) {
  var body = header.nextElementSibling;
  var chevron = header.querySelector('.drawer-chevron');
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chevron) chevron.classList.toggle('open', !isOpen);
}

function toggleDrawerCTA() {
  var submenu = document.getElementById('drawer-cta-submenu');
  var chevron = document.getElementById('drawer-cta-chevron');
  if (!submenu) return;
  var isOpen = submenu.classList.contains('open');
  submenu.classList.toggle('open', !isOpen);
  if (chevron) chevron.classList.toggle('open', !isOpen);
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

/* ── HISTORIA "VER MÁS" — mobile (SEK-CON-009) ─────────────── */
function toggleHistoriaVerMas() {
  var texto = document.getElementById('historia-texto');
  var btn   = document.getElementById('historia-ver-mas-btn');
  if (!texto || !btn) return;
  var expanded = texto.classList.toggle('expanded');
  btn.textContent = expanded ? 'Ver menos' : 'Ver más';
}
