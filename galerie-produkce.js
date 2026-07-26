(function () {
  'use strict';

  /* ---------- DATA ----------
     src   = cesta k fotce
     w,h   = rozměry fotky (kvůli poměru stran karty)
     title = nadpis pod fotkou
     desc  = krátký popis
  --------------------------------- */
  var DATA = [
    { src: 'galerie/zaznam-koncertu.webp',        w: 1600, h: 900,  title: 'zaznam-koncertu',        desc: '' },
    { src: 'galerie/slavkov-zamecka-zahrada.webp', w: 1280, h: 1600, title: 'slavkov-zamecka-zahrada',                desc: '' },
    { src: 'galerie/prenos-bohosluzby.webp',      w: 1600, h: 900,  title: 'prenos-bohosluzby',      desc: '' },
    { src: 'galerie/festival-duchovni-hudby.webp', w: 1600, h: 1067, title: 'festival-duchovni-hudby', desc: ''},
    { src: 'galerie/za-kamerou.webp',             w: 1200, h: 1600, title: 'Za kamerou',             desc: '' },
    { src: 'galerie/literarni-pout.webp',         w: 1600, h: 1153, title: 'literarni-pout',         desc: '' },
    { src: 'galerie/reportazni-rozhovor.webp',    w: 1600, h: 1069, title: 'reportazni-rozhovor',    desc: '' },
    { src: 'galerie/letecka-technika.webp',       w: 1600, h: 1067, title: 'letecka-technika',       desc: '' },
    { src: 'galerie/hudba-na-schodech.webp',      w: 1600, h: 1066, title: 'hudba-na-schodech',      desc: '' },
    { src: 'galerie/pietni-akt.webp',             w: 1600, h: 1067, title: 'pietni-akt',      desc: '' },
    { src: 'galerie/hudecek-luhacovice.webp',     w: 1600, h: 1200, title: 'hudecek-luhacovice',             desc: '' },
    { src: 'galerie/strani-arcibiskup.webp',      w: 1600, h: 1138, title: 'strani-arcibiskup',                 desc: '' }
  ];

  var section = document.getElementById('produkce');
  var track = document.getElementById('mfgTrack');
  var dotsWrap = document.getElementById('mfgDots');
  var cap = document.getElementById('mfgCap');
  var prevBtn = document.getElementById('mfgPrev');
  var nextBtn = document.getElementById('mfgNext');
  var lb = document.getElementById('mfgLb');
  var lbFig = document.getElementById('mfgLbFig');

  if (!section || !track || !dotsWrap || !cap || !prevBtn || !nextBtn || !lb || !lbFig) return;

  var active = 0;
  var cards = [];
  var dots = [];

  /* Výška karet i mezera se čtou z CSS, aby je mohl přepsat media query. */
  function metric(name, fallback) {
    var v = parseFloat(getComputedStyle(section).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }

  /* ---------- SESTAVENÍ KARET A TEČEK ---------- */
  DATA.forEach(function (item, i) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'mfg-card';
    card.setAttribute('aria-label', item.title);
    card.innerHTML =
      '<img src="' + item.src + '" alt="' + item.title + '" width="' + item.w + '" height="' + item.h + '" loading="lazy" decoding="async">' +
      '<span class="mfg-zoom" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg></span>';
    card.addEventListener('click', function () {
      if (i === active) openLightbox(); else go(i);
    });
    track.appendChild(card);
    cards.push(card);

    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', item.title);
    dot.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(dot);
    dots.push(dot);
  });

  /* ---------- VYKRESLENÍ ---------- */
  function layout() {
    var h = metric('--mfg-card-h', 360);
    cards.forEach(function (card, i) {
      card.style.width = Math.round(h * DATA[i].w / DATA[i].h) + 'px';
      card.style.height = h + 'px';
    });
  }

  function offsetOfCenter(index) {
    var gap = metric('--mfg-gap', 26);
    var x = 0;
    for (var k = 0; k < index; k++) x += cards[k].offsetWidth + gap;
    return x + cards[index].offsetWidth / 2;
  }

  function render() {
    track.style.transform = 'translate(' + -offsetOfCenter(active) + 'px, -50%)';

    cards.forEach(function (card, i) {
      var isActive = i === active;
      card.classList.toggle('is-active', isActive);
      card.tabIndex = isActive ? 0 : -1;
    });
    dots.forEach(function (dot, i) {
      var isActive = i === active;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    var item = DATA[active];
    cap.classList.remove('anim');
    void cap.offsetWidth; // vynucený reflow, aby se animace přehrála znovu
    cap.classList.add('anim');
    cap.innerHTML = '<h3>' + item.title + '</h3><p>' + item.desc + '</p>';

    prevBtn.disabled = active === 0;
    nextBtn.disabled = active === DATA.length - 1;

    if (lb.classList.contains('is-open')) renderLightbox();
  }

  function go(index) {
    active = Math.max(0, Math.min(DATA.length - 1, index));
    render();
  }

  prevBtn.addEventListener('click', function () { go(active - 1); });
  nextBtn.addEventListener('click', function () { go(active + 1); });

  /* ---------- LIGHTBOX ---------- */
  var lastFocused = null;

  function renderLightbox() {
    var item = DATA[active];
    var count = String(active + 1).padStart(2, '0') + ' / ' + String(DATA.length).padStart(2, '0');
    lbFig.innerHTML =
      '<img src="' + item.src + '" alt="' + item.title + '" width="' + item.w + '" height="' + item.h + '">' +
      '<div class="mfg-lb-cap"><h3>' + item.title + '</h3><p>' + item.desc + '</p>' +
      '<p class="count">' + count + '</p></div>';
  }

  function openLightbox() {
    lastFocused = document.activeElement;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderLightbox();
    document.getElementById('mfgLbClose').focus();
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.getElementById('mfgLbClose').addEventListener('click', closeLightbox);
  document.getElementById('mfgLbPrev').addEventListener('click', function (e) { e.stopPropagation(); go(active - 1); });
  document.getElementById('mfgLbNext').addEventListener('click', function (e) { e.stopPropagation(); go(active + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  /* ---------- KLÁVESNICE ----------
     Šipky ovládají galerii jen když je otevřený lightbox nebo když je
     sekce na obrazovce – jinak by braly scrollování zbytku stránky. */
  var inView = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
    }, { threshold: 0.4 }).observe(section);
  }

  document.addEventListener('keydown', function (e) {
    var lbOpen = lb.classList.contains('is-open');
    if (lbOpen && e.key === 'Escape') { closeLightbox(); return; }
    if (!lbOpen && !inView) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
  });

  /* ---------- START A PŘEPOČET PŘI ZMĚNĚ VELIKOSTI ---------- */
  var resizeTicking = false;
  window.addEventListener('resize', function () {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(function () {
      layout();
      render();
      resizeTicking = false;
    });
  });

  layout();
  render();
})();
