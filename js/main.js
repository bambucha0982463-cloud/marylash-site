const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- появление при скролле + каскад внутри блока ----------
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    if (!REDUCED && el.parentElement) {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const idx = sibs.indexOf(el);
      if (idx > 0) {
        el.style.transitionDelay = Math.min(idx * 80, 480) + 'ms';
        el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      }
    }
    el.classList.add('in-view');
    io.unobserve(el);
  }
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .lashline').forEach((el) => io.observe(el));

// ---------- слайдшоу в hero (crossfade) ----------
(() => {
  if (REDUCED) return;
  const slides = [...document.querySelectorAll('.hero__photo img')];
  if (slides.length < 2) return;
  let cur = 0;
  setInterval(() => {
    const next = (cur + 1) % slides.length;
    const img = slides[next];
    if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
    slides[cur].classList.remove('is-active');
    img.classList.add('is-active');
    cur = next;
  }, 5500);
})();

// ---------- лайтбокс-слайдер галереи ----------
(() => {
  const figs = [...document.querySelectorAll('.works figure')];
  if (!figs.length) return;
  const items = figs.map((f) => { const i = f.querySelector('img'); return { src: i.getAttribute('src'), alt: i.alt }; });

  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML =
    '<button class="lb__btn lb__close" aria-label="Zavrieť">&times;</button>' +
    '<button class="lb__btn lb__prev" aria-label="Predchádzajúca">&#8249;</button>' +
    '<figure class="lb__stage"><img alt=""><figcaption></figcaption></figure>' +
    '<div class="lb__count"></div>' +
    '<button class="lb__btn lb__next" aria-label="Ďalšia">&#8250;</button>';
  document.body.appendChild(lb);

  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  const count = lb.querySelector('.lb__count');
  let idx = 0;
  let lastFocus = null;

  const show = (i) => {
    idx = (i + items.length) % items.length;
    img.classList.remove('lb__swap');
    void img.offsetWidth; // перезапуск анимации
    img.classList.add('lb__swap');
    img.src = items[idx].src;
    img.alt = items[idx].alt;
    cap.textContent = items[idx].alt;
    count.textContent = (idx + 1) + ' / ' + items.length;
  };

  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb__close').focus();
  };

  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  figs.forEach((f, i) => {
    f.tabIndex = 0;
    f.setAttribute('role', 'button');
    f.addEventListener('click', () => open(i));
    f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });

  lb.querySelector('.lb__close').addEventListener('click', close);
  lb.querySelector('.lb__prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb__next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // свайп на тач-экранах
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
})();

// ---------- подсветка активного раздела в меню ----------
(() => {
  const links = [...document.querySelectorAll('.nav__links a')];
  if (!links.length) return;
  const map = new Map();
  links.forEach((a) => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (sec) map.set(sec, a);
  });
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.remove('active'));
        const a = map.get(e.target);
        if (a) a.classList.add('active');
      }
    }
  }, { rootMargin: '-30% 0px -60% 0px' });
  map.forEach((_, sec) => spy.observe(sec));
})();
