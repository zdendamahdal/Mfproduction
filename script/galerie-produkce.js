(function () {
  'use strict';

  /* Fotky jsou v HTML (index.html, sekce #produkce). Tenhle skript řeší jen:
     která karta je uprostřed a lightbox. Posouvání obstarává CSS scroll-snap. */

  var section = document.getElementById('produkce');
  var stage = document.getElementById('mfgStage');
  var dotsWrap = document.getElementById('mfgDots');
  var prevBtn = document.getElementById('mfgPrev');
  var nextBtn = document.getElementById('mfgNext');
  var lb = document.getElementById('mfgLb');
  var lbFig = document.getElementById('mfgLbFig');

  if (!section || !stage || !dotsWrap || !prevBtn || !nextBtn || !lb || !lbFig) return;

  var cards = Array.prototype.slice.call(stage.querySelectorAll('.mfg-card'));
  if (!cards.length) return;

  /* Zdroje fotek se přečtou jednou z HTML, ať je lightbox nemusí hledat znovu. */
  var items = cards.map(function (card) {
    var img = card.querySelector('img');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      w: img ? img.getAttribute('width') : '',
      h: img ? img.getAttribute('height') : ''
    };
  });

  var active = -1;

  /* ---------- POSUN NA KARTU ---------- */
  function scrollToCard(index, instant) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    var stageBox = stage.getBoundingClientRect();
    var cardBox = cards[index].getBoundingClientRect();
    // Střed karty se scale() transformem neposouvá, takže je spolehlivý.
    var delta = (cardBox.left + cardBox.width / 2) - (stageBox.left + stageBox.width / 2);
    stage.scrollTo({
      left: stage.scrollLeft + delta,
      behavior: instant ? 'auto' : 'smooth'
    });
  }

  /* ---------- KTERÁ KARTA JE UPROSTŘED ---------- */
  function nearestCard() {
    var stageBox = stage.getBoundingClientRect();
    var center = stageBox.left + stageBox.width / 2;
    var best = 0;
    var bestDist = Infinity;

    cards.forEach(function (card, i) {
      var box = card.getBoundingClientRect();
      var dist = Math.abs((box.left + box.width / 2) - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  function setActive(index) {
    if (index === active) return;
    active = index;

    cards.forEach(function (card, i) {
      card.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      var on = i === active;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-current', on ? 'true' : 'false');
    });

    prevBtn.disabled = active === 0;
    nextBtn.disabled = active === cards.length - 1;

    if (lb.classList.contains('is-open')) renderLightbox();
  }

  /* ---------- TEČKY ---------- */
  var dots = items.map(function (item, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Fotka ' + (i + 1));
    dot.addEventListener('click', function () { scrollToCard(i); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  /* ---------- OVLÁDÁNÍ ---------- */
  cards.forEach(function (card, i) {
    var btn = card.querySelector('.mfg-card-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (i === active) openLightbox(); else scrollToCard(i);
    });
  });

  prevBtn.addEventListener('click', function () { scrollToCard(active - 1); });
  nextBtn.addEventListener('click', function () { scrollToCard(active + 1); });

  var scrollTicking = false;
  stage.addEventListener('scroll', function () {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      setActive(nearestCard());
      scrollTicking = false;
    });
  }, { passive: true });

  /* ---------- LIGHTBOX ---------- */
  var lastFocused = null;

  function renderLightbox() {
    var item = items[active];
    var count = String(active + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    lbFig.innerHTML =
      '<img src="' + item.src + '" alt="' + item.alt + '" width="' + item.w + '" height="' + item.h + '">' +
      '<div class="mfg-lb-cap"><p class="count">' + count + '</p></div>';
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
  document.getElementById('mfgLbPrev').addEventListener('click', function (e) { e.stopPropagation(); scrollToCard(active - 1); });
  document.getElementById('mfgLbNext').addEventListener('click', function (e) { e.stopPropagation(); scrollToCard(active + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  /* ---------- KLÁVESNICE ----------
     Šipky patří galerii jen když je otevřený lightbox nebo když je
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
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollToCard(active - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); scrollToCard(active + 1); }
  });

  /* ---------- START ---------- */
  var resizeTicking = false;
  window.addEventListener('resize', function () {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(function () {
      scrollToCard(active, true);
      resizeTicking = false;
    });
  });

  setActive(0);
  scrollToCard(0, true);
})();
