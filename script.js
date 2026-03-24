/* ── Navbar scroll ────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Hamburger ────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navMobile  = document.getElementById('nav-mobile');
hamburger.addEventListener('click', () => navMobile.classList.toggle('open'));
navMobile.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navMobile.classList.remove('open'))
);

/* ── Active nav link ──────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)
      );
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe ||
sections.forEach(s =>
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        navLinks.forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)
        );
    });
  }, { rootMargin: '-40% 0px -55% 0px' }).observe(s)
);

// single observer for all sections
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting)
      navLinks.forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)
      );
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));

/* ── Smooth scroll ────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── Scroll reveal ────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Project items stagger ────────────────────────── */
const projObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = (parseInt(e.target.dataset.index) || 0) * 120;
      setTimeout(() => e.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.project-item').forEach(el => {
  el.classList.add('reveal');
  projObs.observe(el);
});

/* ── Contact form ─────────────────────────────────── */
const form      = document.getElementById('contact-form');
const submitBtn = document.getElementById('form-submit-btn');
const success   = document.getElementById('form-success');
const error     = document.getElementById('form-error');

function validate(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(f => {
    const valid = f.value.trim() !== '';
    f.classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  const em = form.querySelector('input[type="email"]');
  if (em?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)) {
    em.classList.add('invalid');
    ok = false;
  }
  return ok;
}

form?.addEventListener('submit', async e => {
  e.preventDefault();
  success.hidden = true;
  error.hidden   = true;
  if (!validate(form)) return;

  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoad = submitBtn.querySelector('.btn-loading');
  btnText.hidden    = true;
  btnLoad.hidden    = false;
  submitBtn.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (res.ok) { success.hidden = false; form.reset(); }
    else          error.hidden   = false;
  } catch { error.hidden = false; }
  finally {
    btnText.hidden    = false;
    btnLoad.hidden    = true;
    submitBtn.disabled = false;
  }
});

form?.querySelectorAll('input, textarea').forEach(f =>
  f.addEventListener('input', () => f.classList.remove('invalid'))
);

/* ══════════════════════════════════════════════════════
   HERO CANVAS — dual-color particle system
   Purple (Kim) + Cyan (Park)
══════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  const COLORS = ['#c084fc', '#38bdf8'];
  const COUNT  = 55;
  const DIST   = 120;
  let W, H, pts, raf;

  class Pt {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 8;
      this.vx = (Math.random() - .5) * .3;
      this.vy = -(Math.random() * .35 + .1);
      this.r  = Math.random() * 1.4 + .5;
      this.a  = Math.random() * .45 + .2;
      this.c  = COLORS[Math.random() < .5 ? 0 : 1];
      this.life = 0;
      this.max  = Math.random() * 350 + 180;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.max || this.y < -8) this.reset(false);
    }
    draw() {
      const fade = Math.min(1, this.life / 50, (this.max - this.life) / 50);
      ctx.save();
      ctx.globalAlpha = this.a * fade;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c;
      ctx.fill();
      ctx.restore();
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    // connections
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.save();
          ctx.globalAlpha = (1 - d / DIST) * .12;
          ctx.strokeStyle = pts[i].c === pts[j].c ? pts[i].c : '#a78bfa';
          ctx.lineWidth = .5;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    pts.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    pts = Array.from({ length: COUNT }, () => new Pt());
    loop();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    loop();
  });

  // pause when hero not visible
  const hero = document.getElementById('hero');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) loop();
    else cancelAnimationFrame(raf);
  }).observe(hero);

  init();
})();
