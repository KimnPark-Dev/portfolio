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
   HERO — Three.js 3D scene
   Purple (Kim) + Cyan (Park) dual-color particles
   + rotating wireframe geometry + mouse parallax
══════════════════════════════════════════════════════ */
(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('hero-canvas');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 100);
  camera.position.z = 7;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ── PARTICLES ─────────────────────────────────────── */
  const COUNT = 280;
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);
  const vel   = [];

  const C_KIM  = new THREE.Color('#c084fc');
  const C_PARK = new THREE.Color('#38bdf8');
  const C_MIX  = new THREE.Color('#a78bfa');

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    pos[i3]     = (Math.random() - 0.5) * 14;
    pos[i3 + 1] = (Math.random() - 0.5) * 9;
    pos[i3 + 2] = (Math.random() - 0.5) * 7;

    vel.push({
      x: (Math.random() - 0.5) * 0.005,
      y:  Math.random() * 0.007 + 0.0015,
      z: (Math.random() - 0.5) * 0.003,
    });

    const r  = Math.random();
    const c  = r < 0.38 ? C_KIM : r < 0.76 ? C_PARK : C_MIX;
    col[i3]     = c.r;
    col[i3 + 1] = c.g;
    col[i3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.048, vertexColors: true,
    transparent: true, opacity: 0.72,
    sizeAttenuation: true, depthWrite: false,
  })));

  /* ── CENTRAL GEOMETRY ──────────────────────────────── */
  // Outer torus knot — warm purple wireframe
  const tkA = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.05, 0.33, 140, 16),
    new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.2 })
  );
  scene.add(tkA);

  // Inner torus knot — cool cyan, counter-rotating
  const tkB = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.72, 0.22, 90, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.15 })
  );
  scene.add(tkB);

  // Outer icosahedron shell — accent purple, very faint
  const icoA = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.1, 1),
    new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.05 })
  );
  scene.add(icoA);

  /* ── MOUSE PARALLAX ────────────────────────────────── */
  let tgtX = 0, tgtY = 0, camX = 0, camY = 0;
  window.addEventListener('mousemove', e => {
    tgtX = (e.clientX / window.innerWidth  - 0.5) * 3.5;
    tgtY = (e.clientY / window.innerHeight - 0.5) * 2.5;
  }, { passive: true });

  /* ── TOUCH PARALLAX ────────────────────────────────── */
  window.addEventListener('touchmove', e => {
    if (!e.touches[0]) return;
    tgtX = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
    tgtY = (e.touches[0].clientY / window.innerHeight - 0.5) * 1.5;
  }, { passive: true });

  /* ── ANIMATION ─────────────────────────────────────── */
  let raf, t = 0;

  function animate() {
    raf = requestAnimationFrame(animate);
    t  += 0.007;

    // Rotate central shapes
    tkA.rotation.x =  t * 0.22;
    tkA.rotation.y =  t * 0.31;
    tkB.rotation.x = -t * 0.18;
    tkB.rotation.y =  t * 0.28;
    icoA.rotation.x = t * 0.05;
    icoA.rotation.y = t * 0.08;

    // Smooth camera parallax
    camX += (tgtX - camX) * 0.025;
    camY += (-tgtY - camY) * 0.025;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    // Move particles
    const p = pGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      p[i3]     += vel[i].x;
      p[i3 + 1] += vel[i].y;
      p[i3 + 2] += vel[i].z;
      if (p[i3 + 1] >  4.5) { p[i3 + 1] = -4.5; p[i3] = (Math.random() - 0.5) * 14; }
      if (p[i3]     >  7)   p[i3]     = -7;
      if (p[i3]     < -7)   p[i3]     =  7;
      if (p[i3 + 2] >  3.5) p[i3 + 2] = -3.5;
      if (p[i3 + 2] < -3.5) p[i3 + 2] =  3.5;
    }
    pGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  resize();
  animate();
  window.addEventListener('resize', resize, { passive: true });

  // Pause only when browser tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) animate();
  });
})();

/* ══════════════════════════════════════════════════════
   3D CARD TILT — member cards & project items
══════════════════════════════════════════════════════ */
(function () {
  function addTilt(selector, maxX, maxY) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        el.style.transform  = `perspective(700px) rotateX(${-y * maxY}deg) rotateY(${x * maxX}deg) translateY(-4px)`;
        el.style.transition = 'transform 0.06s linear';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform  = '';
        el.style.transition = 'transform 0.55s cubic-bezier(.4,0,.2,1), border-color .22s, box-shadow .22s';
      });
    });
  }

  addTilt('.member-card', 10, 8);
  addTilt('.project-item:not(.project-upcoming)', 4, 3);
})();
