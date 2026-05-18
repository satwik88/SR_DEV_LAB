/* ═══════════════════════════════════════════════════
   THREE.JS PARTICLE BACKGROUND
═══════════════════════════════════════════════════ */
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xf4f4f5, 1);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 30);

  /* ── Particle field ── */
  const COUNT = 1200;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 100;
    pos[i*3+1] = (Math.random() - 0.5) * 100;
    pos[i*3+2] = (Math.random() - 0.5) * 60;
    const t    = Math.random();
    col[i*3]   = t > 0.5 ? 0.396 : 0.647;   // purple r (#65) or grey r (#a5)
    col[i*3+1] = t > 0.5 ? 0.321 : 0.647;   // purple g (#52) or grey g (#a5)
    col[i*3+2] = t > 0.5 ? 0.815 : 0.647;   // purple b (#d0) or grey b (#a5)
    sizes[i]   = Math.random() * 1.5 + 0.3;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.3, vertexColors: true,
    transparent: true, opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);



  /* ── Central wireframe (Explodable) ── */
  let icoGeo = new THREE.IcosahedronGeometry(4, 1);
  icoGeo = icoGeo.toNonIndexed(); // Separate triangles so they can break apart
  
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x6552D0, wireframe: true, transparent: true, opacity: 0.15,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // Invisible hit-box for stable raycasting (prevents jitter when geometry expands)
  const hitGeo = new THREE.SphereGeometry(5, 16, 16);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  ico.add(hitMesh);

  // Setup explosion targets
  const posAttr = icoGeo.attributes.position;
  const origPos = new Float32Array(posAttr.array);
  const targetPos = new Float32Array(posAttr.array.length);
  
  for (let i = 0; i < posAttr.array.length; i += 9) {
    // Find center of each triangle
    const cx = (origPos[i] + origPos[i+3] + origPos[i+6]) / 3;
    const cy = (origPos[i+1] + origPos[i+4] + origPos[i+7]) / 3;
    const cz = (origPos[i+2] + origPos[i+5] + origPos[i+8]) / 3;
    
    const len = Math.sqrt(cx*cx + cy*cy + cz*cz);
    const explodeDist = Math.random() * 8 + 4; // random distance outwards
    
    for (let v = 0; v < 3; v++) {
      targetPos[i + v*3]     = origPos[i + v*3]     + (cx / len) * explodeDist + (Math.random()-0.5)*2;
      targetPos[i + v*3 + 1] = origPos[i + v*3 + 1] + (cy / len) * explodeDist + (Math.random()-0.5)*2;
      targetPos[i + v*3 + 2] = origPos[i + v*3 + 2] + (cz / len) * explodeDist + (Math.random()-0.5)*2;
    }
  }

  /* ── Orbit ring ── */
  const ringGeo = new THREE.TorusGeometry(6, 0.015, 2, 80);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xa5a5a5, transparent: true, opacity: 0.4 });
  const ring    = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  /* ── Mouse tracking & Raycaster ── */
  const mouse = { x: 0, y: 0 };
  const rayMouse = new THREE.Vector2(-999, -999);
  const raycaster = new THREE.Raycaster();
  let explodeProgress = 0;

  document.addEventListener('mousemove', e => {
    // For camera parallax
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    // For raycasting
    rayMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    rayMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* ── FPS counter ── */
  let lastTime = performance.now(), frameCount = 0;
  const fpsEl  = document.getElementById('hudFrames');

  /* ── Animate ── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;

    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.012;

    ico.rotation.y = t * 0.5;
    ico.rotation.x = t * 0.3;
    ring.rotation.z = t * 0.2;

    // Raycast to check hover using the invisible stable hit-box
    raycaster.setFromCamera(rayMouse, camera);
    const intersects = raycaster.intersectObject(hitMesh);
    const isHovered = intersects.length > 0;

    // Explode animation
    explodeProgress += ((isHovered ? 1 : 0) - explodeProgress) * 0.08;
    
    if (explodeProgress > 0.001) {
      for (let i = 0; i < posAttr.array.length; i++) {
        // Add a slight sine wave wobble when exploded for extra effect
        const wobble = isHovered ? Math.sin(t * 20 + i) * 0.1 * explodeProgress : 0;
        posAttr.array[i] = origPos[i] + (targetPos[i] - origPos[i]) * explodeProgress + wobble;
      }
      posAttr.needsUpdate = true;
    } else if (posAttr.array[0] !== origPos[0]) {
      // Snap back precisely to save performance
      for (let i = 0; i < posAttr.array.length; i++) {
        posAttr.array[i] = origPos[i];
      }
      posAttr.needsUpdate = true;
    }

    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    // FPS
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      if (fpsEl) fpsEl.textContent = `FPS: ${frameCount}`;
      frameCount = 0; lastTime = now;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


/* ═══════════════════════════════════════════════════
   HUD CLOCK
═══════════════════════════════════════════════════ */
(function clock() {
  const el = document.getElementById('hudTime');
  setInterval(() => {
    if (!el) return;
    const d = new Date();
    el.textContent = d.toTimeString().slice(0, 8);
  }, 1000);
})();


/* ═══════════════════════════════════════════════════
   TYPING ANIMATION
═══════════════════════════════════════════════════ */
(function typing() {
  const phrases = [
    'CSE STUDENT', 'WEB DEVELOPER', 'IOT ENGINEER',
    'PYTHON DEV', 'GAME CREATOR', 'AI ENTHUSIAST',
  ];
  let pi = 0, ci = 0, del = false;
  const el = document.getElementById('typedRole');
  if (!el) return;
  function tick() {
    const cur = phrases[pi];
    el.textContent = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    if (!del && ci === cur.length) { del = true; setTimeout(tick, 1800); return; }
    if (del && ci === 0)           { del = false; pi = (pi + 1) % phrases.length; }
    setTimeout(tick, del ? 55 : 100);
  }
  tick();
})();


/* ═══════════════════════════════════════════════════
   NAVIGATION — smooth scroll
═══════════════════════════════════════════════════ */
const sectionOrder = ['home', 'about', 'skills', 'projects', 'certs', 'contact'];

function switchSection(name) {
  const target = document.getElementById('panel-' + name);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Nav button clicks → smooth scroll
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchSection(btn.dataset.section));
});

// Highlight active nav link via IntersectionObserver
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const name = entry.target.id.replace('panel-', '');
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      const active = document.querySelector(`.nav-btn[data-section="${name}"]`);
      if (active) active.classList.add('active');
      // Trigger skill bar animation when skills comes into view
      if (name === 'skills') animateBars();
    }
  });
}, { threshold: 0.4 });

sectionOrder.forEach(name => {
  const el = document.getElementById('panel-' + name);
  if (el) navObserver.observe(el);
});

/* ═══════════════════════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════════════════════ */
const progressBar = document.getElementById('scrollProgress');
const hudCorners = document.querySelectorAll('.hud-corner');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total    = document.body.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = (scrolled / total * 100) + '%';
  
  // Fade out HUD corners when scrolling down past 100px
  if (scrolled > 100) {
    hudCorners.forEach(corner => corner.classList.add('hidden'));
  } else {
    hudCorners.forEach(corner => corner.classList.remove('hidden'));
  }
}, { passive: true });

/* ═══════════════════════════════════════════════════
   SECTION REVEAL ON SCROLL
═══════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.panel-inner').forEach(el => revealObserver.observe(el));
// Immediately reveal the home section
const homeInner = document.querySelector('#panel-home .panel-inner');
if (homeInner) homeInner.classList.add('revealed');

/* ═══════════════════════════════════════════════════
   SKILL BAR ANIMATION
═══════════════════════════════════════════════════ */
function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    bar.style.animation = 'none';
    // Force reflow then re-trigger
    void bar.offsetWidth;
    bar.style.animation = 'growBar 1s ease both';
  });
}


/* ═══════════════════════════════════════════════════
   PROJECT DATA
═══════════════════════════════════════════════════ */
const projects = [
  {
    pre: '// PROJECT_001 — IOT',
    title: 'SMART_PLANT_MONITOR',
    desc: 'An IoT system using NodeMCU ESP8266 and soil moisture sensors that automatically monitors plant health and triggers a water pump when moisture drops below threshold. Sensor data transmitted in real-time via Wi-Fi.',
    tech: ['NodeMCU', 'ESP8266', 'Soil Sensor', 'Arduino IDE', 'IoT', 'C++'],
    img: 'assets/project1.png',
    github: 'https://github.com/satwik88',
    demo: null,
  },
  {
    pre: '// PROJECT_002 — PYTHON',
    title: 'FOOD_ORDERING_SYSTEM',
    desc: 'A command-line food ordering system built with Python and MySQL. Users can browse restaurant menus, add items to cart, place orders, and view order history — all backed by a relational database.',
    tech: ['Python', 'MySQL', 'CLI', 'DBMS', 'OOP'],
    img: 'assets/project2.png',
    github: 'https://github.com/satwik88',
    demo: null,
  },
  {
    pre: '// PROJECT_003 — WEB / LIVE',
    title: 'SNAKE_GAME',
    desc: 'A feature-complete browser Snake game clone with smooth 60fps Canvas rendering, neon retro UI, local high-score persistence, multiple speed levels, wall-collision toggle, and a particle death animation.',
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Canvas API', 'localStorage'],
    img: 'assets/project3.png',
    github: 'https://github.com/satwik88/Snake',
    demo: 'https://satwik88.github.io/Snake',
  },
];

function openProject(i) {
  const p = projects[i];
  const overlay = document.getElementById('projectOverlay');
  document.getElementById('overlayPre').textContent   = p.pre;
  document.getElementById('overlayTitle').textContent = p.title;
  document.getElementById('overlayDesc').textContent  = p.desc;
  document.getElementById('overlayImg').src           = p.img;
  document.getElementById('overlayImg').alt           = p.title;

  const techEl = document.getElementById('overlayTech');
  techEl.innerHTML = p.tech.map(t => `<span>${t}</span>`).join('');

  const linksEl = document.getElementById('overlayLinks');
  linksEl.innerHTML = `
    <a href="${p.github}" target="_blank" class="action-btn">
      <span class="btn-bracket">[</span> GITHUB <span class="btn-bracket">]</span>
    </a>
    ${p.demo ? `<a href="${p.demo}" target="_blank" class="action-btn action-ghost">
      <span class="btn-bracket">[</span> LIVE DEMO <span class="btn-bracket">]</span>
    </a>` : ''}
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  document.getElementById('projectOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on escape
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });


/* ═══════════════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════════════ */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn  = document.getElementById('formSubmitBtn');
  const note = document.getElementById('formNote');
  const name = document.getElementById('formName').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const msg  = document.getElementById('formMessage').value.trim();

  btn.textContent = '[ TRANSMITTING... ]';
  btn.disabled    = true;

  setTimeout(() => {
    window.location.href = `mailto:satwikraj707@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(msg + '\n\nFrom: ' + email)}`;
    btn.innerHTML = '<span class="btn-bracket">[</span> TRANSMIT MESSAGE <span class="btn-bracket">]</span>';
    btn.disabled  = false;
    note.textContent  = '// TRANSMISSION SUCCESSFUL — email client opened.';
    note.className    = 'form-note success';
    this.reset();
    setTimeout(() => { note.textContent = ''; note.className = 'form-note'; }, 5000);
  }, 800);
});
