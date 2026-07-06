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

// Showcase section — pinned, slides swap on scroll (Hardware → Software → AI Engine)
(function () {
  const sc     = document.querySelector('.sc');
  const slides = document.querySelectorAll('.sc__slide');
  const dots   = document.querySelectorAll('.sc__dot');
  const wrap   = document.querySelector('.snap-wrap');
  if (!sc || !slides.length || !wrap) return;

  const PARALLAX = 64; // px of drift across each slide's own scroll segment
  const segment = 1 / slides.length;

  let ticking = false;
  let started = false; // becomes true once the section is half scrolled into view,
                        // so entrance + image parallax play early, not once fully pinned

  function update() {
    ticking = false;
    const total = sc.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const rectTop = sc.getBoundingClientRect().top;
    const preRoll = window.innerHeight * 0.5; // extra "runway" before the section is fully pinned

    if (!started) {
      if (rectTop > preRoll) return; // wait until the section is halfway into view
      started = true;
    }

    // Progress starts advancing as soon as the section is half visible (rectTop === preRoll),
    // not only once it's fully pinned (rectTop === 0) — keeps the image parallax/blur in sync
    // with the text instead of sitting frozen until the pin fully engages.
    const progress = Math.min(Math.max((preRoll - rectTop) / (total + preRoll), 0), 1);
    const index = Math.min(Math.floor(progress / segment), slides.length - 1);

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);

      const img = slide.querySelector('.sc__hero-img');
      if (!img) return;
      const local = Math.min(Math.max((progress - i * segment) / segment, 0), 1);
      // AI Engine (slide 2) stays at its original, unscaled size — no zoom, no drift
      // (drift needs extra scale margin to avoid exposing edges, so it's off here too).
      const scale = i === 0 ? 1.2 : (i === 2 ? 1 : 1.1);
      const drift = i === 2 ? 0 : (local - 0.5) * PARALLAX;
      img.style.transform = `scale(${scale}) translateY(${drift.toFixed(1)}px)`;
    });

    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  wrap.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
})();

// Milestones carousel — pinned, advances horizontally as the page scrolls vertically
(function () {
  const mst       = document.querySelector('.mst');
  const track     = document.querySelector('.mst__track');
  const cards     = document.querySelectorAll('.mst__card');
  const wrap      = document.querySelector('.snap-wrap');
  const sideTitle = document.querySelector('.mst__side-title');
  const bgImg     = document.querySelector('.mst__bg-img');
  if (!mst || !track || !cards.length || !wrap) return;

  let ticking = false;
  let started = false; // becomes true once the section is 75% scrolled into view,
                        // so the carousel starts moving before the pin fully engages
  let lastIndex = -1;

  // Measure the scrollable range once, before any card enlarges — reading
  // track.scrollWidth on every tick would create a feedback loop, since the
  // active card growing changes scrollWidth, which shifts the scroll target,
  // which can flip which card is active, causing a visible glitch on entry.
  const maxScroll = track.scrollWidth - track.clientWidth;

  function update() {
    ticking = false;
    const total = mst.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const rectTop = mst.getBoundingClientRect().top;
    const preRoll = window.innerHeight * 0.25; // 25% of viewport left to enter = 75% scrolled in

    if (!started) {
      if (rectTop > preRoll) return; // wait until the section is 75% scrolled into view
      started = true;
    }

    // Progress starts advancing as soon as the section is 75% visible (rectTop === preRoll),
    // not only once it's fully pinned (rectTop === 0) — mirrors the Showcase section's timing.
    const progress = Math.min(Math.max((preRoll - rectTop) / (total + preRoll), 0), 1);
    track.scrollLeft = progress * maxScroll;

    // Which card is "closest to center" follows directly from progress —
    // no need to read back layout geometry (write-then-read on every scroll
    // frame forces the browser to recalc layout synchronously, which is
    // what was causing the section to stutter).
    const index = Math.min(Math.floor(progress * cards.length), cards.length - 1);
    if (index !== lastIndex) {
      lastIndex = index;
      cards.forEach((card, i) => card.classList.toggle('is-active', i === index));

      const active = cards[index];
      const title = active.querySelector('.mst__card-title');
      const img = active.querySelector('.mst__img');
      if (sideTitle && title) sideTitle.textContent = title.textContent;
      if (bgImg && img) bgImg.src = img.src;
    }
  }

  wrap.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Re-sync the side panel text after a language switch, since it's a
  // one-time copy from the active card rather than a live data-i18n target.
  document.addEventListener('i18n:changed', () => {
    if (lastIndex < 0) return;
    const active = cards[lastIndex];
    const title = active.querySelector('.mst__card-title');
    if (sideTitle && title) sideTitle.textContent = title.textContent;
  });

  update();
})();

// Reviews section reveal on scroll
const revObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('rev-visible');
      revObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.rev-reveal').forEach(el => revObserver.observe(el));


// ── TEAM section entrance — all devices ──────────────────────────────────
(function () {
  const section = document.querySelector('.team');
  if (!section) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      section.classList.add('is-visible');
      observer.disconnect();
    }
  }, { threshold: 0.1 });
  observer.observe(section);
})();

// ── CTA / Speak with experts entrance — all devices ──────────────────────
(function () {
  const section = document.querySelector('.cta');
  if (!section) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      section.classList.add('is-visible');
      observer.disconnect();
    }
  }, { threshold: 0.1 });
  observer.observe(section);
})();

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

  const logoHTML = '<img src="logos/favicon-white.png" alt="NC" class="trifeat__orbit-favicon" />';

  function swap(content, isLabel) {
    center.classList.add('switching');
    setTimeout(() => {
      center.innerHTML = isLabel ? content : logoHTML;
      center.dataset.label = isLabel ? 'true' : 'false';
      center.classList.remove('switching');
    }, 150);
  }

  items.forEach(item => {
    item.addEventListener('mouseenter', () => swap(item.dataset.label, true));
    item.addEventListener('mouseleave',  () => swap(null, false));
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

// ── PLATFORM — scroll-driven depth entrance ───────────────────────────────
(function () {
  const grid  = document.querySelector('.trifeat__grid');
  const cards = grid ? [...grid.querySelectorAll('.trifeat__card')] : [];
  if (!cards.length) return;

  // Mobile: staggered IntersectionObserver fade-in per card
  if (window.innerWidth <= 768) {
    cards.forEach((card, i) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(28px)';
      card.style.transition = `opacity 0.55s ease ${i * 0.1}s, transform 0.55s ease ${i * 0.1}s`;
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity   = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(card => obs.observe(card));
    return;
  }

  // Desktop: scroll-driven depth entrance
  const ranges = [
    [0.12, 1.00],
    [0.06, 0.88],
    [0.00, 0.72],
    [0.06, 0.88],
  ];
  const startY = [70, 48, 26, 48];

  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  function update() {
    const vh   = window.innerHeight;
    const rect = grid.getBoundingClientRect();
    const p    = clamp((vh - rect.top) / (vh * 0.75));

    cards.forEach((card, i) => {
      const [s, e] = ranges[i];
      const cp = clamp((p - s) / (e - s));
      card.style.opacity   = cp.toFixed(3);
      card.style.transform = `translateY(${((1 - cp) * startY[i]).toFixed(1)}px)`;
    });
  }

  const snapWrap = document.querySelector('.snap-wrap') || window;
  snapWrap.addEventListener('scroll', update, { passive: true });
  update();
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
  const demoBtnMobile = document.getElementById('cta-demo-mobile');
  if (demoBtnMobile) demoBtnMobile.addEventListener('click', e => { e.preventDefault(); openModal(); });
  if (closeBtn) closeBtn.addEventListener('click',  closeModal);
  if (backdrop) backdrop.addEventListener('click',  closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
})();

// ── HERO 1 → SWITCH: two-phase scroll transition ─────────────
(function () {
  if (window.innerWidth <= 768) return; // disabled on mobile
  const snapWrap  = document.querySelector('.snap-wrap');
  const zone      = document.querySelector('.hero-scroll-zone');
  if (!zone || !snapWrap) return;

  const heroEl    = zone.querySelector('.hero--editorial');
  const heroGrid  = heroEl && heroEl.querySelector('.hero__editorial-grid');
  const heroBg    = heroEl && heroEl.querySelector('.hero__bg');
  if (!heroGrid || !heroBg) return;

  function update() {
    const st       = snapWrap.scrollTop;
    const zoneTop  = zone.offsetTop;
    const vh       = window.innerHeight;
    const raw      = (st - zoneTop) / (2.5 * vh); // 0 → 1 over 250vh of scroll
    const progress = Math.max(0, Math.min(1, raw));

    // Action 1: text slides up
    heroGrid.style.transform = `translateY(${-progress * 100}vh)`;
    heroGrid.style.opacity   = '1';

    // Action 2: whole section slides up — starts when text is at 50%
    const p2 = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
    heroEl.style.transform = `translateY(${-p2 * 100}vh)`;
  }

  snapWrap.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── SWITCH SECTION: mobile entrance + interactive toggle ─────
(function () {
  if (window.innerWidth > 768) return;
  const switchSec = document.querySelector('.switch-sec');
  if (!switchSec) return;

  // Entrance animation via IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        switchSec.classList.add('is-visible');
        observer.unobserve(switchSec);
      }
    });
  }, { threshold: 0.25 });
  observer.observe(switchSec);

  // Interactive toggle: tap to switch on/off
  const toggleWrap = switchSec.querySelector('.switch-sec__toggle-wrap');
  if (toggleWrap) {
    toggleWrap.addEventListener('click', () => {
      switchSec.classList.toggle('switch-sec--on');
    });
  }
})();

// ── SWITCH SECTION: OFF → ON (desktop scroll) ────────────────
(function () {
  if (window.innerWidth <= 768) return; // disabled on mobile
  const snapWrap   = document.querySelector('.snap-wrap');
  const switchZone = document.querySelector('.switch-zone');
  const switchSec  = document.querySelector('.switch-sec');
  if (!snapWrap || !switchZone || !switchSec) return;

  snapWrap.addEventListener('scroll', () => {
    const st      = snapWrap.scrollTop;
    const vh      = window.innerHeight;
    const zoneTop = switchZone.getBoundingClientRect().top + st;
    const into    = st - zoneTop;

    if (into >= vh * 0.20) {
      switchSec.classList.add('switch-sec--on');
    } else {
      switchSec.classList.remove('switch-sec--on');
    }
  }, { passive: true });
})();

// ── SPACES SECTION: scroll-driven entry / active / exit ───────
(function () {
  const snapWrap  = document.querySelector('.snap-wrap');
  const spacesSec = document.querySelector('.spaces-sec');
  if (!snapWrap || !spacesSec) return;

  const label    = spacesSec.querySelector('.spaces-sec__label');
  const title    = spacesSec.querySelector('.spaces-sec__title');
  const desc     = spacesSec.querySelector('.spaces-sec__desc');
  const cta      = spacesSec.querySelector('.spaces-sec__cta');
  const imgBack  = spacesSec.querySelector('.spaces-sec__img--back');
  const imgFront = spacesSec.querySelector('.spaces-sec__img--front');

  function clamp(v)       { return Math.max(0, Math.min(1, v)); }
  function map(v, a, b)   { return clamp((v - a) / (b - a)); }
  function easeOut(t)     { return 1 - (1 - t) * (1 - t); }
  function easeIn(t)      { return t * t; }

  function apply(el, o, x, y, sc) {
    el.style.opacity   = o;
    el.style.transform = `translate(${x}px,${y}px) scale(${sc})`;
  }

  function update() {
    const rect = spacesSec.getBoundingClientRect();
    const vh   = window.innerHeight;
    const p    = clamp(1 - rect.bottom / (vh + rect.height));

    // text elements — staggered entry from below, unified exit upward
    [label, title, desc, cta].forEach((el, i) => {
      const d  = i * 0.05;
      const a  = easeOut(map(p, 0 + d, 0.22 + d));
      const o  = easeIn(map(p, 0.55, 0.92));
      apply(el, a * (1 - o), 0, 22 * (1 - a) - 18 * o, 1);
    });

    // back image — slides in from right, exits right
    const ba = easeOut(map(p, 0.05, 0.35));
    const bo = easeIn(map(p, 0.52, 0.88));
    apply(imgBack, ba * (1 - bo), 55 * (1 - ba) + 28 * bo, 0, 0.94 + 0.06 * ba);

    // front image — slides up from below, exits down
    const fa = easeOut(map(p, 0.12, 0.42));
    const fo = easeIn(map(p, 0.54, 0.90));
    apply(imgFront, fa * (1 - fo), 0, 45 * (1 - fa) + 28 * fo, 0.96 + 0.04 * fa);
  }

  [label, title, desc, cta, imgBack, imgFront].forEach(el => { el.style.opacity = '0'; });

  snapWrap.addEventListener('scroll', update, { passive: true });
  update();
})();

// ── AMBIENT MODULATION: vertical scroll-through + live data ────
(function () {
  if (window.innerWidth <= 768) return; // mobile uses static layout
  const snapWrap  = document.querySelector('.snap-wrap');
  const zone      = document.querySelector('.ambient-zone');
  const ambientSec = document.querySelector('.ambient-sec');
  const cards     = [...document.querySelectorAll('.ambient-card')];
  if (!snapWrap || !zone || !cards.length) return;

  // ── element refs ──────────────────────────────────────────────
  const noiseVal   = document.querySelector('.ambient-noise__value');
  const noiseBars  = [...document.querySelectorAll('.ambient-noise__bars span')];

  const luxTempEl  = document.querySelector('.ambient-lux__meta span:first-child');
  const luxIntEl   = document.querySelector('.ambient-lux__meta span:last-child');
  const luxHandle  = document.querySelector('.ambient-lux__handle');
  const luxDots    = [...document.querySelectorAll('.ambient-lux__dots span')];

  const waveBars   = [...document.querySelectorAll('.ambient-wave__bars span')];

  const climItems  = [...document.querySelectorAll('.ambient-climate__item')];

  const statArc    = document.querySelector('.ambient-stat__ring svg circle:last-child');
  const statVal    = document.querySelector('.ambient-stat__value');

  const aiDots     = [...document.querySelectorAll('.ambient-ai__dots span')];

  const trendVal   = document.querySelector('.ambient-trend__value');

  const bpmVal     = document.querySelector('.ambient-bpm__value');

  const o2Val      = document.querySelector('.ambient-o2__value');
  const o2Bar      = document.querySelector('.ambient-o2__bar div');

  const circClock  = document.querySelector('.ambient-circadian__clock');
  const circPeriod = document.querySelector('.ambient-circadian__period');
  const circBadge  = document.querySelector('.ambient-circadian__toprow .ambient-card__badge');
  const circGlow   = document.querySelector('.ambient-circadian__dial svg circle:nth-last-child(2)');
  const circDot    = document.querySelector('.ambient-circadian__dial svg circle:last-child');
  const bgDark      = document.querySelector('.ambient-sec__bg--dark');
  const bgDarkSpans = bgDark ? [...bgDark.querySelectorAll('span')] : [];
  // scroll range [start, end] for each row's reveal
  const rowRanges   = [[0.02, 0.20], [0.18, 0.36], [0.34, 0.52]];

  // ── helpers ───────────────────────────────────────────────────
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function osc(p, freq, phase) { return 0.5 + 0.5 * Math.sin(p * Math.PI * freq + (phase || 0)); }

  // ── per-card update functions ─────────────────────────────────
  function updateNoise(p) {
    if (!noiseVal) return;
    const wave = Math.pow(osc(p, 4.2), 1.4) * 0.68;
    const db   = Math.round(22 + wave * 52);
    const lit  = Math.round(wave * noiseBars.length);
    noiseVal.firstChild.textContent = db + ' ';
    noiseBars.forEach((b, i) => b.classList.toggle('on', i < lit));
  }

  const LUX_TEMPS = ['2700K · Warm', '3500K · Neutral', '5200K · Daylight', '6500K · Cool'];
  function updateLighting(p) {
    const wave = osc(p, 3.1);
    const pct  = Math.round(18 + wave * 78);
    if (luxTempEl) luxTempEl.textContent  = LUX_TEMPS[Math.min(Math.floor(wave * 4), 3)];
    if (luxIntEl)  luxIntEl.textContent   = 'Intensity ' + pct + '%';
    if (luxHandle) luxHandle.style.left   = pct + '%';
    const lit = Math.round(wave * luxDots.length);
    luxDots.forEach((d, i) => d.classList.toggle('on', i < lit));
  }

  function updateAcoustic(p) {
    waveBars.forEach((bar, i) => {
      bar.style.height = Math.round(12 + 83 * osc(p, 3.8 + i * 0.35, i * 0.55)) + '%';
    });
  }

  function updateClimate(p) {
    if (climItems.length < 2) return;
    const tWave = osc(p, 2.8);
    const hWave = osc(p, 3.5, 1.2);
    const tEl  = climItems[0].querySelector('.ambient-climate__val');
    const tBar = climItems[0].querySelector('.ambient-climate__bar div');
    const hEl  = climItems[1].querySelector('.ambient-climate__val');
    const hBar = climItems[1].querySelector('.ambient-climate__bar div');
    if (tEl)  tEl.innerHTML    = (19.0 + tWave * 5.0).toFixed(1) + '<sup>°</sup>';
    if (tBar) tBar.style.width = Math.round(20 + tWave * 70) + '%';
    if (hEl)  hEl.innerHTML    = Math.round(35 + hWave * 35) + '<sup>%</sup>';
    if (hBar) hBar.style.width = Math.round(35 + hWave * 35) + '%';
  }

  function updateStat(p) {
    const wave = (Math.pow(osc(p, 3.3), 1.3) * 0.85) + 0.15;
    const pct  = Math.round(55 + wave * 42);
    if (statArc) statArc.setAttribute('stroke-dashoffset', (251.3 * (1 - pct / 100)).toFixed(1));
    if (statVal) statVal.textContent = '+' + pct + '%';
  }

  function updateAI(p) {
    const idx = Math.floor(p * 18) % Math.max(aiDots.length, 1);
    aiDots.forEach((d, i) => d.classList.toggle('on', i === idx));
  }

  function updateTrend(p) {
    const wave = Math.pow(osc(p, 3.7), 1.2);
    if (trendVal) trendVal.textContent = '+' + Math.round(62 + wave * 35) + '%';
  }

  function updateBPM(p) {
    const bpm = Math.round(58 + osc(p, 5.1) * 38);
    if (bpmVal) bpmVal.firstChild.textContent = bpm + ' ';
  }

  function updateO2(p) {
    const wave = Math.pow(osc(p, 2.9), 1.5);
    const spo2 = (94.0 + wave * 5.8).toFixed(1);
    if (o2Val) o2Val.firstChild.textContent = spo2 + ' ';
    if (o2Bar) o2Bar.style.width = spo2 + '%';
  }

  const PHASE = {
    Dawn:  { color: '#C0AAEC', bg: 'rgba(192,170,236,0.16)' },
    Day:   { color: '#9EB0F0', bg: 'rgba(158,176,240,0.16)' },
    Dusk:  { color: '#C0AAEC', bg: 'rgba(192,170,236,0.16)' },
    Night: { color: '#6B76B5', bg: 'rgba(107,118,181,0.16)' },
  };
  const DOT_COLOR = { Dawn:'#C0AAEC', Day:'#9EB0F0', Dusk:'#C0AAEC', Night:'#6B76B5' };
  const DOT_GLOW  = { Dawn:'rgba(192,170,236,0.25)', Day:'rgba(158,176,240,0.25)', Dusk:'rgba(192,170,236,0.25)', Night:'rgba(107,118,181,0.25)' };

  function updateCircadian(p) {
    const mins  = Math.round(360 + p * 1020);          // 6:00 → 23:00
    const h     = Math.floor(mins / 60);
    const m     = mins % 60;
    const isPM  = h >= 12;
    const h12   = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    if (circClock)  circClock.textContent  = h12 + ':' + String(m).padStart(2, '0');
    if (circPeriod) circPeriod.textContent = isPM ? 'PM' : 'AM';

    const phase = h >= 5 && h < 8 ? 'Dawn' : h >= 8 && h < 18 ? 'Day' : h >= 18 && h < 20 ? 'Dusk' : 'Night';
    if (circBadge) {
      circBadge.textContent       = phase;
      circBadge.style.color       = PHASE[phase].color;
      circBadge.style.background  = PHASE[phase].bg;
    }

    const frac  = mins / 1440;
    const angle = frac * 2 * Math.PI - Math.PI / 2;
    const cx    = (50 + 36 * Math.cos(angle)).toFixed(1);
    const cy    = (50 + 36 * Math.sin(angle)).toFixed(1);
    if (circDot)  { circDot.setAttribute('cx', cx);  circDot.setAttribute('cy', cy);  circDot.setAttribute('fill', DOT_COLOR[phase]); }
    if (circGlow) { circGlow.setAttribute('cx', cx); circGlow.setAttribute('cy', cy); circGlow.setAttribute('fill', DOT_GLOW[phase]); }
  }

  // ── main scroll handler ───────────────────────────────────────
  const speeds = [1.3, 0.75, 1.55, 0.9, 1.2, 0.65, 1.45, 1.0, 0.8, 1.35, 1.1];

  function update() {
    const vh        = window.innerHeight;
    const st        = snapWrap.scrollTop;
    const zoneTop   = zone.getBoundingClientRect().top + st;
    const scrolled  = Math.max(0, st - zoneTop);
    const maxScroll = zone.offsetHeight - vh;
    const p         = clamp(scrolled / maxScroll);

    const opacity = Math.min(clamp(p / 0.08), clamp((1 - p) / 0.08));
    cards.forEach((card, i) => {
      card.style.transform = `translateY(${vh * (1 - 2 * p) * speeds[i]}px)`;
      card.style.opacity   = String(opacity);
    });

    updateNoise(p);
    updateLighting(p);
    updateAcoustic(p);
    updateClimate(p);
    updateStat(p);
    updateAI(p);
    updateTrend(p);
    updateBPM(p);
    updateO2(p);
    updateCircadian(p);

    // textP: starts 1 full viewport BEFORE the zone enters, so the reveal
    // begins while the previous section is still visible
    const preDistance  = vh * 0.6;
    const textScrolled = Math.max(0, st - (zoneTop - preDistance));
    const textMaxScroll = preDistance + (zone.offsetHeight - vh);
    const textP = clamp(textScrolled / textMaxScroll);

    bgDarkSpans.forEach((span, i) => {
      const [s, e] = rowRanges[i] || [0, 1];
      const rp = Math.max(0, Math.min((textP - s) / (e - s), 1));
      span.style.setProperty('--p', (rp * 118) + '%');
    });
  }

  cards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = `translateY(${window.innerHeight * speeds[i]}px)`;
  });

  snapWrap.addEventListener('scroll', update, { passive: true });
  update();
})();

// Rev section tabs — click still works (mobile fallback, no pin there)
(function () {
  const tabs   = [...document.querySelectorAll('.rev__tab')];
  const panels = [...document.querySelectorAll('.rev__panel')];
  if (!tabs.length) return;

  function activate(tab) {
    tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    panels.forEach(p => p.classList.add('rev__panel--hidden'));
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    const target = document.getElementById('rev-panel-' + tab.dataset.tab);
    if (target) {
      target.classList.remove('rev__panel--hidden');
      target.style.animation = 'none';
      target.offsetHeight; // reflow to restart animation
      target.style.animation = '';
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));
})();

// Language picker toggle
(function () {
  document.querySelectorAll('.lang-picker').forEach(function (picker) {
    var btn = picker.querySelector('.lang-picker__btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = picker.classList.toggle('lang-picker--open');
      btn.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.lang-picker--open').forEach(function (picker) {
      picker.classList.remove('lang-picker--open');
      var btn = picker.querySelector('.lang-picker__btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });
})();
