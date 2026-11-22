(function () {
  'use strict';

  function initNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.classList.toggle('is-active');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initStoryToggle() {
    const btn = document.getElementById('storyToggle');
    const more = document.getElementById('storyMore');
    const label = btn ? btn.querySelector('.story-toggle-label') : null;
    if (!btn || !more || !label) return;

    btn.addEventListener('click', () => {
      const expanded = more.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', expanded);
      label.textContent = expanded ? 'Zobrazit méně' : 'Zobrazit více';
    });
  }

  function initClientsPause() {
    const section = document.querySelector('.clients');
    if (!section || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        section.classList.toggle('is-paused', !entry.isIntersecting);
      });
    }).observe(section);
  }

  function initHeroFade() {
    const hero = document.querySelector('.hero-content');
    if (!hero) return;
    const FADE_DISTANCE = 270;

    window.addEventListener('scroll', () => {
      hero.style.opacity = Math.max(0, 1 - window.scrollY / FADE_DISTANCE);
    }, { passive: true });
  }

  function initClientsLoop() {
  const track = document.querySelector('.clients-track');
  if (!track) return;

  Array.from(track.children).forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    const img = clone.querySelector('img');
    if (img) img.alt = '';
    track.appendChild(clone);
  });
}

  initNav();
  initStoryToggle();
  initClientsPause();
  initHeroFade();
  initClientsLoop();
})();

