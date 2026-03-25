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

  // Flash state for card interaction
  let _flash = null;
  const _BASE_A = new THREE.Color(0xc084fc);
  const _BASE_B = new THREE.Color(0x38bdf8);

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

    // Card flash effect
    if (_flash) {
      const elapsed = (Date.now() - _flash.startMs) / _flash.durationMs;
      if (elapsed >= 1) {
        _flash = null;
        tkA.material.color.copy(_BASE_A); tkA.material.opacity = 0.2; tkA.scale.setScalar(1);
        tkB.material.color.copy(_BASE_B); tkB.material.opacity = 0.15; tkB.scale.setScalar(1);
        icoA.scale.setScalar(1);
      } else {
        const pulse = Math.sin(elapsed * Math.PI);
        tkA.material.color.lerpColors(_BASE_A, _flash.color, pulse);
        tkB.material.color.lerpColors(_BASE_B, _flash.color, pulse);
        tkA.material.opacity = 0.2 + pulse * 0.45;
        tkB.material.opacity = 0.15 + pulse * 0.4;
        const sc = 1 + pulse * 0.28;
        tkA.scale.setScalar(sc); tkB.scale.setScalar(sc);
        icoA.scale.setScalar(1 + pulse * 0.12);
      }
    }

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

  // Expose flash API for card interaction
  window.__heroScene = {
    flash(hexColor, durationMs = 2200) {
      _flash = { color: new THREE.Color(hexColor), startMs: Date.now(), durationMs };
    },
  };
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

/* ══════════════════════════════════════════════════════
   MEMBER DETAIL MODAL — click card → suck into torus → profile
══════════════════════════════════════════════════════ */
(function () {
  const GH_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

  const MEMBERS = {
    kim: {
      initial: 'K', colorClass: 'kim', color: '#c084fc',
      name: 'INSONG KIM', role: 'Security & Dev',
      github: 'https://github.com/insongK', handle: 'insongK',
      bio: '보안과 개발의 경계를 탐구합니다. 네트워크 패킷 분석부터 브라우저 확장까지, 시스템의 가장 낮은 레이어에서 사용자 인터페이스까지 수직으로 관통하는 것을 즐깁니다.',
      highlights: [
        { label: 'Network Security', desc: 'ARP Spoofing 분석 · pcap 패킷 캡처 · 공격/방어 직접 구현 연구' },
        { label: 'AI / CNN',         desc: '이미지 분류를 위한 CNN 모델 설계 및 학습 파이프라인 직접 구현' },
        { label: 'Chrome Extension', desc: 'Manifest V3 · Content Script · Service Worker 기반 브라우저 확장 개발' },
        { label: 'System Programming', desc: 'C / C++ 저수준 프로그래밍 · 네트워크 소켓 · 메모리 제어' },
      ],
      tags: ['JavaScript', 'C / C++', 'Java', 'Network Security', 'CNN / AI', 'Wireshark', 'pcap', 'Chrome Extension'],
    },
    park: {
      initial: 'P', colorClass: 'park', color: '#38bdf8',
      name: 'DOHYUN PARK', role: 'Backend & Cloud',
      github: 'https://github.com/0206pdh', handle: '0206pdh',
      email: '0206pdh@naver.com',
      bio: '클라우드 위에서 AI를 연결합니다. AWS 서버리스 아키텍처 설계부터 LLM 기반 파이프라인 구축까지, 인프라와 AI의 교차점에서 서비스를 만듭니다.',
      highlights: [
        { label: 'AWS Serverless',  desc: 'Lambda · API Gateway · S3 조합 서버리스 아키텍처 설계 및 운영' },
        { label: 'FastAPI',         desc: 'Python FastAPI 기반 고성능 REST API 서비스 설계 및 구축' },
        { label: 'LLM Pipeline',    desc: 'LLM 활용 AI 워크플로우 · 프롬프트 엔지니어링 · RAG 파이프라인' },
        { label: 'DevOps / Cloud',  desc: 'Docker 컨테이너화 · CI/CD 자동화 · 클라우드 네이티브 배포' },
      ],
      tags: ['Python', 'FastAPI', 'AWS', 'LLM', 'Serverless', 'Docker', 'Node.js', 'SQL'],
    },
  };

  function buildHTML(m) {
    return `
      <div class="mp-header">
        <div class="mp-avatar ${m.colorClass}"><span>${m.initial}</span></div>
        <div class="mp-header-info">
          <div class="mp-role ${m.colorClass}">${m.role}</div>
          <h2 class="mp-name">${m.name}</h2>
          <div class="mp-links">
            <a href="${m.github}" target="_blank" rel="noopener" class="mp-gh ${m.colorClass}">${GH_SVG} ${m.handle}</a>
            ${m.email ? `<a href="mailto:${m.email}" class="mp-email">✉ ${m.email}</a>` : ''}
          </div>
        </div>
      </div>
      <p class="mp-bio">${m.bio}</p>
      <div class="mp-highlights">
        ${m.highlights.map(h => `
          <div class="mp-hl">
            <div class="mp-hl-label ${m.colorClass}">${h.label}</div>
            <div class="mp-hl-desc">${h.desc}</div>
          </div>`).join('')}
      </div>
      <div class="mp-tags">
        ${m.tags.map(tag => `<span class="mp-tag ${m.colorClass}">${tag}</span>`).join('')}
      </div>`;
  }

  const modal      = document.getElementById('member-modal');
  const modalPanel = document.getElementById('modal-panel');
  const modalInner = document.getElementById('modal-inner');
  const closeBtn   = document.getElementById('modal-close');

  function openModal(m) {
    modalPanel.style.setProperty('--mc', m.color);
    modalInner.innerHTML = buildHTML(m);
    modal.removeAttribute('aria-hidden');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Card click → suck-in animation → flash 3D → open modal
  document.querySelectorAll('.member-card').forEach(card => {
    const isKim    = card.querySelector('.member-avatar.kim') !== null;
    const memberId = isKim ? 'kim' : 'park';
    card.style.cursor = 'pointer';

    card.addEventListener('click', e => {
      if (e.target.closest('a')) return; // don't intercept link clicks

      const m    = MEMBERS[memberId];
      const rect = card.getBoundingClientRect();
      const dx   = window.innerWidth  / 2 - (rect.left + rect.width  / 2);
      const dy   = window.innerHeight / 2 - (rect.top  + rect.height / 2);

      // Clone card, position it fixed, fly to center
      const clone = card.cloneNode(true);
      Object.assign(clone.style, {
        position: 'fixed', top: rect.top + 'px', left: rect.left + 'px',
        width: rect.width + 'px', height: rect.height + 'px',
        margin: '0', zIndex: '2000', pointerEvents: 'none',
        transform: 'none', transition: 'none',
      });
      document.body.appendChild(clone);

      const anim = clone.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)',          opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(0.04) rotate(600deg)`, opacity: 0 },
      ], { duration: 700, easing: 'cubic-bezier(0.55,0,1,0.45)', fill: 'forwards' });

      if (window.__heroScene) window.__heroScene.flash(m.color, 2400);
      anim.onfinish = () => { clone.remove(); openModal(m); };
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
})();
