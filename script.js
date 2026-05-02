// Pillars section reveal
const pilObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('pil-visible');
      pilObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.pil-reveal').forEach(el => pilObserver.observe(el));

// Features section reveal
const featObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('feat-visible');
      featObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-reveal').forEach(el => featObserver.observe(el));

// Reviews auto-scroll carousel — RAF loop + mouse/touch drag
(function () {
  const track  = document.querySelector('.rev__track');
  const slider = document.querySelector('.rev__cards');
  if (!track || !slider) return;

  const origCards = [...track.querySelectorAll('.rev__card')];
  origCards.forEach(c => track.appendChild(c.cloneNode(true)));

  const GAP       = 16;
  const cardW     = origCards[0].offsetWidth;
  const setW      = origCards.length * (cardW + GAP);
  const autoSpeed = 0.5;

  let posX       = 0;
  let dragging   = false;
  let dragStartX = 0;
  let dragStartPos = 0;

  function normalize(x) {
    let p = x % setW;
    if (p > 0) p -= setW;
    return p;
  }

  function tick() {
    if (!dragging) posX = normalize(posX - autoSpeed);
    track.style.transform = `translateX(${posX}px)`;
    requestAnimationFrame(tick);
  }

  slider.addEventListener('mousedown', e => {
    dragging     = true;
    dragStartX   = e.clientX;
    dragStartPos = posX;
    slider.classList.add('is-dragging');
    e.preventDefault();
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    slider.classList.remove('is-dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    posX = normalize(dragStartPos + (e.clientX - dragStartX));
  });

  slider.addEventListener('touchstart', e => {
    dragStartX   = e.touches[0].clientX;
    dragStartPos = posX;
  }, { passive: true });
  slider.addEventListener('touchmove', e => {
    posX = normalize(dragStartPos + (e.touches[0].clientX - dragStartX));
  }, { passive: true });

  requestAnimationFrame(tick);
})();

// Dynamic nav color — white on light sections, dark on dark sections
(function () {
  const snapWrap = document.querySelector('.snap-wrap');
  const nav      = document.querySelector('.bnb');
  if (!snapWrap || !nav) return;

  const sections    = [...snapWrap.querySelectorAll('section')];
  const darkClasses = ['pil']; // sections with dark backgrounds

  function update() {
    const idx    = Math.round(snapWrap.scrollTop / snapWrap.clientHeight);
    const active = sections[idx];
    if (!active) return;
    const isDark = darkClasses.some(c => active.classList.contains(c));
    nav.classList.toggle('bnb--dark', isDark);
  }

  snapWrap.addEventListener('scroll', update, { passive: true });
  update(); // set correct state on load
})();

// Nav bar — scroll to section + keep active state in sync
(function () {
  const snapWrap = document.querySelector('.snap-wrap');
  const sections = [...document.querySelectorAll('.snap-wrap section')];
  const btns     = [...document.querySelectorAll('.bnb__item')];

  function setActive(idx) {
    btns.forEach(b => b.classList.remove('bnb__item--active'));
    if (btns[idx]) btns[idx].classList.add('bnb__item--active');
  }

  // Click → scroll to section
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.section, 10);
      if (!isNaN(idx) && sections[idx]) {
        snapWrap.scrollTo({ top: sections[idx].offsetTop, behavior: 'smooth' });
      }
    });
  });

  // Scroll → sync active state
  snapWrap.addEventListener('scroll', () => {
    const idx = Math.round(snapWrap.scrollTop / snapWrap.clientHeight);
    setActive(idx);
  }, { passive: true });
})();

// Team carousel — auto-scroll + drag
(function () {
  const track    = document.querySelector('.team__stage');
  const carousel = document.querySelector('.team__carousel');
  if (!track || !carousel) return;

  const origCards = [...track.querySelectorAll('.team__card')];
  origCards.forEach(c => track.appendChild(c.cloneNode(true)));

  const GAP       = 11;
  const cardW     = origCards[0].offsetWidth;
  const setW      = origCards.length * (cardW + GAP);
  const autoSpeed = 0.4;

  let posX        = 0;
  let dragging    = false;
  let dragStartX  = 0;
  let dragStartPos = 0;

  function normalize(x) {
    let p = x % setW;
    if (p > 0) p -= setW;
    return p;
  }

  function tick() {
    if (!dragging) posX = normalize(posX - autoSpeed);
    track.style.transform = `translateX(${posX}px)`;
    requestAnimationFrame(tick);
  }

  carousel.addEventListener('mousedown', e => {
    dragging      = true;
    dragStartX    = e.clientX;
    dragStartPos  = posX;
    carousel.classList.add('is-dragging');
    e.preventDefault();
  });
  document.addEventListener('mouseup', () => {
    dragging = false;
    carousel.classList.remove('is-dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    posX = normalize(dragStartPos + (e.clientX - dragStartX));
  });

  carousel.addEventListener('touchstart', e => {
    dragStartX   = e.touches[0].clientX;
    dragStartPos = posX;
  }, { passive: true });
  carousel.addEventListener('touchmove', e => {
    posX = normalize(dragStartPos + (e.touches[0].clientX - dragStartX));
  }, { passive: true });

  requestAnimationFrame(tick);
})();

// Interactive progress bar sliders in the glass card
(function () {
  let activeRow = null;

  document.querySelectorAll('.gc-slider-row').forEach(row => {
    const track = row.querySelector('.gc-track');
    const fill  = row.querySelector('.gc-fill');
    const pct   = row.querySelector('.gc-progress-row span:last-child');
    if (!track || !fill || !pct) return;

    function applyVal(clientX) {
      const rect = track.getBoundingClientRect();
      const v    = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const p    = Math.round(v * 100);
      fill.style.width = p + '%';
      pct.textContent  = p + '%';
      // position thumb
      track.style.setProperty('--thumb', p + '%');
    }

    track.addEventListener('mousedown', e => {
      activeRow = row;
      applyVal(e.clientX);
      e.preventDefault();
    });

    track.addEventListener('touchstart', e => {
      activeRow = row;
      applyVal(e.touches[0].clientX);
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      applyVal(e.touches[0].clientX);
    }, { passive: true });
  });

  document.addEventListener('mousemove', e => {
    if (!activeRow) return;
    const track = activeRow.querySelector('.gc-track');
    const fill  = activeRow.querySelector('.gc-fill');
    const pct   = activeRow.querySelector('.gc-progress-row span:last-child');
    const rect  = track.getBoundingClientRect();
    const v     = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const p     = Math.round(v * 100);
    fill.style.width = p + '%';
    pct.textContent  = p + '%';
    track.style.setProperty('--thumb', p + '%');
  });

  document.addEventListener('mouseup', () => { activeRow = null; });
})();

// Showcase section reveal on scroll
const scObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('sc-visible');
      scObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.sc-reveal').forEach(el => scObserver.observe(el));

// FAQ accordion
document.querySelectorAll('.faq__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item  = btn.closest('.faq__item');
    const group = btn.closest('.faq__group');
    const isOpen = item.classList.contains('faq__item--open');
    document.querySelectorAll('.faq__item--open').forEach(el => el.classList.remove('faq__item--open'));
    document.querySelectorAll('.faq__group--open').forEach(el => el.classList.remove('faq__group--open'));
    if (!isOpen) {
      item.classList.add('faq__item--open');
      group.classList.add('faq__group--open');
    }
  });
});

// ── FOOTER: newsletter subscribe interaction ───────────────────────────────
(function () {
  const form  = document.querySelector('.ftr__nl-form');
  const input = document.querySelector('.ftr__nl-input');
  const btn   = document.querySelector('.ftr__nl-btn');
  if (!form || !input || !btn) return;

  const arrowSVG = btn.innerHTML;
  const checkSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>`;

  function submit() {
    const val = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      form.style.borderColor = 'rgba(248,113,113,0.5)';
      setTimeout(() => form.style.borderColor = '', 1200);
      return;
    }
    btn.innerHTML = checkSVG;
    btn.classList.add('subscribed');
    input.value = '';
    input.placeholder = 'Thanks for subscribing!';
    setTimeout(() => {
      btn.innerHTML = arrowSVG;
      btn.classList.remove('subscribed');
      input.placeholder = 'Your email address';
    }, 3000);
  }

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
})();

// ── STATS SECTION — bar grow + count-up numbers ──────────────────────────
(function () {
  const section = document.querySelector('.stats');
  const cards   = section ? [...section.querySelectorAll('.stats__card')] : [];
  const numEls  = section ? [...section.querySelectorAll('.stats__num[data-target]')] : [];
  if (!cards.length) return;
  let done = false;

  function countUp(el, target, suffix, delay) {
    setTimeout(() => {
      const t0 = Date.now();
      (function step() {
        const p    = Math.min((Date.now() - t0) / 1400, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })();
    }, delay);
  }

  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || done) return;
    done = true;
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('stats__card--visible'), i * 180);
    });
    numEls.forEach((el, i) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = '0' + suffix;
      countUp(el, target, suffix, i * 180 + 400);
    });
  }, { threshold: 0.35 }).observe(section);
})();

// ── TRIFEAT BLOCK 1: Adaptive Sensing — count-up metrics ──────────────────
(function () {
  const section   = document.querySelector('.trifeat');
  const metricEls = section ? [...section.querySelectorAll('.trifeat__metric-val[data-target]')] : [];
  if (!metricEls.length) return;
  let done = false;

  function countUp(el, target, suffix, delay) {
    setTimeout(() => {
      const t0 = Date.now();
      (function step() {
        const p    = Math.min((Date.now() - t0) / 1300, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })();
    }, delay);
  }

  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || done) return;
    done = true;
    metricEls.forEach((el, i) => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      el.textContent = '0' + suffix;
      countUp(el, target, suffix, i * 220);
    });
  }, { threshold: 0.4 }).observe(section);
})();

// ── TRIFEAT BLOCK 2: Device Integration — orbit center label ──────────────
(function () {
  const center = document.querySelector('.trifeat__orbit-center');
  const items  = document.querySelectorAll('.trifeat__orbit-item[data-label]');
  if (!center || !items.length) return;

  function swap(text) {
    center.classList.add('switching');
    setTimeout(() => {
      center.textContent = text;
      center.dataset.label = text !== 'NC' ? 'true' : 'false';
      center.classList.remove('switching');
    }, 150);
  }

  items.forEach(item => {
    item.addEventListener('mouseenter', () => swap(item.dataset.label));
    item.addEventListener('mouseleave',  () => swap('NC'));
  });
})();

// ── TRIFEAT BLOCK 3: Therapeutic Protocols — tag → slider animation ───────
(function () {
  const wrap = document.querySelector('.trifeat__sliders');
  const tags = document.querySelectorAll('.trifeat__tags .trifeat__tag');
  if (!wrap || !tags.length) return;
  const rows = [...wrap.querySelectorAll('.gc-slider-row')];

  function animSlider(row, to) {
    const fill  = row.querySelector('.gc-fill');
    const track = row.querySelector('.gc-track');
    const pct   = row.querySelector('.gc-progress-row span:last-child');
    if (!fill || !track || !pct) return;
    const from = parseFloat(fill.style.width) || 50;
    const t0   = Date.now();
    (function step() {
      const p    = Math.min((Date.now() - t0) / 700, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v    = from + (to - from) * ease;
      fill.style.width = v + '%';
      track.style.setProperty('--thumb', v + '%');
      pct.textContent  = Math.round(v) + '%';
      if (p < 1) requestAnimationFrame(step);
    })();
  }

  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      tags.forEach(t => t.classList.remove('trifeat__tag--active'));
      tag.classList.add('trifeat__tag--active');
      const vals = [
        parseInt(tag.dataset.sound, 10),
        parseInt(tag.dataset.light, 10),
        parseInt(tag.dataset.scent, 10),
      ];
      rows.forEach((row, i) => { if (!isNaN(vals[i])) animSlider(row, vals[i]); });
    });
  });
})();

// ── TRIFEAT BLOCK 4: AI Insights — Accept / Cancel / chat items ───────────
(function () {
  const reply     = document.querySelector('.trifeat__chat-reply');
  if (!reply) return;
  const msgEl     = reply.querySelector('.trifeat__chat-msg');
  const acceptBtn = reply.querySelector('.trifeat__chat-pill--accept');
  const cancelBtn = reply.querySelector('.trifeat__chat-pill--cancel');
  if (!msgEl || !acceptBtn || !cancelBtn) return;

  const recs = [
    "Reduce ambient light 40% and activate the Sleep Recovery protocol.",
    "Increase white noise to 65% for better sleep onset.",
    "Apply lavender scent at 55% to reduce patient anxiety.",
    "Lower room temperature 1.5°C to improve circadian alignment.",
  ];
  const chatPrompts = [
    "Adjust light spectrum to 2700K and dim to 30% for circadian optimization.",
    "Activate Post-Op Recovery: 45% music, 35% warm light, 50% lavender.",
  ];
  let cur = 0;

  function fadeMsg(newText) {
    msgEl.style.opacity = '0';
    setTimeout(() => {
      msgEl.textContent = newText;
      msgEl.style.opacity = '1';
    }, 260);
  }

  function cycleNext() {
    cur = (cur + 1) % recs.length;
    fadeMsg(recs[cur]);
    acceptBtn.textContent = 'Accept';
    acceptBtn.classList.remove('applied');
  }

  acceptBtn.addEventListener('click', () => {
    if (acceptBtn.classList.contains('applied')) return;
    acceptBtn.textContent = 'Applied ✓';
    acceptBtn.classList.add('applied');
    setTimeout(cycleNext, 1600);
  });

  cancelBtn.addEventListener('click', cycleNext);

  document.querySelectorAll('.trifeat__chat-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      const text = chatPrompts[i];
      if (!text) return;
      fadeMsg(text);
      acceptBtn.textContent = 'Accept';
      acceptBtn.classList.remove('applied');
    });
  });
})();

// ── PLATFORM — staggered card entrance (1 s between each) ────────────────
(function () {
  const section = document.querySelector('.trifeat');
  const cards   = section ? [...section.querySelectorAll('.trifeat__card')] : [];
  if (!cards.length) return;
  let done = false;

  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || done) return;
    done = true;
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('trifeat__card--visible'), i * 1000);
    });
  }, { threshold: 0.15 }).observe(section);
})();

// ── HERO CTAs ────────────────────────────────────────────────
(() => {
  // Explore System → scroll to Platform section (index 1)
  const exploreBtn = document.getElementById('cta-explore');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', e => {
      e.preventDefault();
      const snapWrap = document.querySelector('.snap-wrap');
      const sections = [...document.querySelectorAll('.snap-wrap section')];
      if (sections[1]) snapWrap.scrollTo({ top: sections[1].offsetTop, behavior: 'smooth' });
    });
  }

  // Watch Demo → open video modal with autoplay + sound
  const demoBtn   = document.getElementById('cta-demo');
  const modal     = document.getElementById('demo-modal');
  const video     = document.getElementById('demo-video');
  const closeBtn  = modal && modal.querySelector('.demo-modal__close');
  const backdrop  = modal && modal.querySelector('.demo-modal__backdrop');

  function openModal() {
    modal.classList.add('is-open');
    video.muted = false;
    video.play().catch(() => { video.muted = true; video.play(); });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    video.pause();
    video.currentTime = 0;
  }

  if (demoBtn)  demoBtn.addEventListener('click',  e => { e.preventDefault(); openModal(); });
  if (closeBtn) closeBtn.addEventListener('click',  closeModal);
  if (backdrop) backdrop.addEventListener('click',  closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
})();
