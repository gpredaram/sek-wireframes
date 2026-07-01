/* ── ACCORDION (SEK-CON-004) ─────────────────────────────────── */
function toggleAcord(header) {
  var chevron = header.querySelector('.acord-chevron');
  var body = header.nextElementSibling;
  var isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
}

/* ── VER MÁS GENÉRICO — mobile (PAT-VER-MAS) ────────────────── */
function toggleTextExpand(btn) {
  var block = btn.previousElementSibling;
  if (!block || !block.classList.contains('text-expand')) return;
  var expanded = block.classList.toggle('expanded');
  btn.innerHTML = expanded ? 'Ver menos <span class="ver-mas-chevron">∧</span>' : 'Ver más <span class="ver-mas-chevron">∨</span>';
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
  if (e.key === 'Escape') { closeVideoModal(); closeBioModal(); closeAllDropdowns(); closeDrawer(); }
});

/* ── PAT-004 — Bio modal ─────────────────────────────────────── */
function openBioModal(cardEl) {
  var overlay = document.getElementById('bio-modal-overlay');
  if (!overlay) return;
  overlay.querySelector('.bio-modal-area').textContent  = cardEl.dataset.area  || '';
  overlay.querySelector('.bio-modal-name').textContent  = cardEl.dataset.name  || '';
  overlay.querySelector('.bio-modal-cargo').textContent = cardEl.dataset.cargo || '';
  overlay.querySelector('.bio-modal-text').textContent  = cardEl.dataset.bio   || '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  var closeBtn = overlay.querySelector('.bio-modal-close');
  if (closeBtn) setTimeout(function() { closeBtn.focus(); }, 50);
}

function closeBioModal() {
  var overlay = document.getElementById('bio-modal-overlay');
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* Focus trap for bio modal */
document.addEventListener('keydown', function(e) {
  if (e.key !== 'Tab') return;
  var overlay = document.getElementById('bio-modal-overlay');
  if (!overlay || !overlay.classList.contains('open')) return;
  var inner = overlay.querySelector('.bio-modal-inner');
  if (!inner) return;
  var focusable = Array.from(inner.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  if (focusable.length < 2) return;
  var first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
  else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
});

/* ── SEG DRAWER — 2-level nav (SEK Education Group pages) ───── */
function segDrawerShowL2(panelId) {
  var l1 = document.getElementById('seg-drawer-l1');
  if (l1) l1.classList.add('hidden');
  document.querySelectorAll('.seg-drawer-l2').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

function segDrawerBack() {
  var l1 = document.getElementById('seg-drawer-l1');
  if (l1) l1.classList.remove('hidden');
  document.querySelectorAll('.seg-drawer-l2').forEach(function(p) { p.classList.remove('active'); });
}

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

/* ── SEK SCHOOLS DRAWER — fuente única (M-2) ─────────────────── */
function injectSekSchoolsDrawer() {
  var el = document.getElementById('nav-drawer');
  if (el) return; /* ya existe, no duplicar */
  var div = document.createElement('div');
  div.innerHTML = `<div id="nav-drawer">

  <!-- Panel principal -->
  <div id="panel-main" class="drawer-panel active">
    <div class="drawer-panel-body">
      <div class="drawer-section-sep">SEK Ciudalcampo</div>
      <button class="drawer-nav-item" onclick="openPanel('panel-colegio')">El Colegio <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-etapas')">Etapas <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-instalaciones')">Instalaciones <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-servicios')">Servicios <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-vida')">Vida Escolar <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-idiomas')">Idiomas e Internacional <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-admisiones')">Admisiones <span class="drawer-nav-chevron">›</span></button>
      <div class="drawer-section-sep">SEK</div>
      <button class="drawer-nav-item" onclick="openPanel('panel-colegios-sek')">Colegios SEK <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-modelo')">Modelo Educativo <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-por-que')">¿Por qué SEK? <span class="drawer-nav-chevron">›</span></button>
      <button class="drawer-nav-item" onclick="openPanel('panel-actualidad')">Actualidad <span class="drawer-nav-chevron">›</span></button>
    </div>
    <div class="drawer-panel-cta">
      <button class="drawer-cta-btn">Solicitar información</button>
    </div>
  </div>

  <!-- Panel: El Colegio -->
  <div id="panel-colegio" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> El Colegio</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="bienvenida.html" class="drawer-sub-item">Bienvenida</a>
      <a href="#" class="drawer-sub-item">Curso 25-26</a>
      <a href="#" class="drawer-sub-item">Calendario de eventos</a>
      <a href="#" class="drawer-sub-item">Equipo docente</a>
      <a href="#" class="drawer-sub-item">Resultados</a>
      <a href="#" class="drawer-sub-item">Dónde estamos</a>
    </div>
  </div>

  <!-- Panel: Etapas -->
  <div id="panel-etapas" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Etapas</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Early Childhood</a>
      <a href="#" class="drawer-sub-item">Primaria</a>
      <a href="#" class="drawer-sub-item">Secundaria</a>
      <a href="#" class="drawer-sub-item">Bachillerato</a>
    </div>
  </div>

  <!-- Panel: Instalaciones -->
  <div id="panel-instalaciones" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Instalaciones</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Espacios de aprendizaje</a>
      <a href="#" class="drawer-sub-item">Espacios deportivos</a>
      <a href="#" class="drawer-sub-item">Tour virtual</a>
    </div>
  </div>

  <!-- Panel: Servicios -->
  <div id="panel-servicios" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Servicios</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <div class="drawer-section-sep">Incluidos</div>
      <a href="#" class="drawer-sub-item">Nutrición</a>
      <a href="#" class="drawer-sub-item">Servicio Médico</a>
      <a href="#" class="drawer-sub-item">Dpto. Psicológico y orientación</a>
      <a href="#" class="drawer-sub-item">Actividades de enriquecimiento curricular</a>
      <a href="#" class="drawer-sub-item">Aulas para familias</a>
      <a href="#" class="drawer-sub-item">Uniformes</a>
      <div class="drawer-section-sep">Complementarios</div>
      <a href="#" class="drawer-sub-item">Transporte</a>
      <a href="#" class="drawer-sub-item">Actividades Extraescolares</a>
      <a href="#" class="drawer-sub-item">Cursos de verano</a>
      <a href="#" class="drawer-sub-item">Mutualidad SEK</a>
      <a href="#" class="drawer-sub-item">Residencia</a>
    </div>
  </div>

  <!-- Panel: Vida Escolar -->
  <div id="panel-vida" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Vida Escolar</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <div class="drawer-section-sep">Actividades del centro</div>
      <a href="#" class="drawer-sub-item">Semana Blanca</a>
      <a href="#" class="drawer-sub-item">Duke of Edinburgh's</a>
      <a href="#" class="drawer-sub-item">SEKMUN</a>
      <div class="drawer-section-sep">Alto rendimiento</div>
      <a href="#" class="drawer-sub-item">Escuela de alto rendimiento deportivo</a>
    </div>
  </div>

  <!-- Panel: Idiomas e Internacional -->
  <div id="panel-idiomas" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Idiomas e Internacional</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Idiomas y Certificación Oficial</a>
      <a href="#" class="drawer-sub-item">Estancias internacionales</a>
      <a href="#" class="drawer-sub-item">Intercambios culturales</a>
    </div>
  </div>

  <!-- Panel: Admisiones -->
  <div id="panel-admisiones" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Admisiones</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Admisiones generales</a>
      <a href="#" class="drawer-sub-item">Admisiones internacionales</a>
      <a href="#" class="drawer-sub-item">Becas y ayudas</a>
      <a href="#" class="drawer-sub-item">Ayudas a la enseñanza</a>
    </div>
  </div>

  <!-- Panel: Colegios SEK -->
  <div id="panel-colegios-sek" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Colegios SEK</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Colegios en Madrid</a>
      <a href="#" class="drawer-sub-item">Colegios en Cataluña</a>
      <a href="#" class="drawer-sub-item">Todos los colegios</a>
    </div>
  </div>

  <!-- Panel: Modelo Educativo -->
  <div id="panel-modelo" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Modelo Educativo</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Filosofía SEK</a>
      <a href="#" class="drawer-sub-item">Aprendizaje activo</a>
      <a href="future-learning-model.html" class="drawer-sub-item">SEK Future Learning</a>
    </div>
  </div>

  <!-- Panel: ¿Por qué SEK? -->
  <div id="panel-por-que" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> ¿Por qué SEK?</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Resultados académicos</a>
      <a href="#" class="drawer-sub-item">Comunidad educativa</a>
      <a href="#" class="drawer-sub-item">Instalaciones</a>
    </div>
  </div>

  <!-- Panel: Actualidad -->
  <div id="panel-actualidad" class="drawer-panel">
    <div class="drawer-panel-header">
      <button class="drawer-back-btn" onclick="goBack()"><span class="drawer-back-arrow">‹</span> Actualidad</button>
      <button class="drawer-close-btn" onclick="closeDrawer()">&#10005;</button>
    </div>
    <div class="drawer-panel-body">
      <a href="#" class="drawer-sub-item">Noticias</a>
      <a href="#" class="drawer-sub-item">Agenda</a>
      <a href="#" class="drawer-sub-item">Blog</a>
    </div>
  </div>

</div>`;
  document.body.appendChild(div.firstElementChild);
}

window.addEventListener('resize', applyCarousel);
document.addEventListener('DOMContentLoaded', function() {
  if (document.body.dataset.drawer === 'sek-schools') injectSekSchoolsDrawer();
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

  /* PAT-009 — nav institucional (Capa 1) hide on scroll down, ≥768px only */
  var capa1 = document.querySelector('.nav-layer--red');
  if (capa1) {
    var pat009last = 0;
    window.addEventListener('scroll', function() {
      if (window.innerWidth < 768) return;
      var cur = window.scrollY;
      if (cur > pat009last && cur > 100) {
        capa1.classList.add('hidden');
      } else {
        capa1.classList.remove('hidden');
      }
      pat009last = cur;
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

/* ── ACORDEÓN CON CABECERA ILUSTRADA — PAT-001 exclusivo (SEK-CON-021 v1.3) */
function toggleCon021(head) {
  var item   = head.closest('.con021-item');
  var list   = item.closest('.con021-list');
  var isOpen = item.classList.contains('open');
  list.querySelectorAll('.con021-item').forEach(function(i) { i.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
}
