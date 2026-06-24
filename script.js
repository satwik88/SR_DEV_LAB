/* --- THEME TOGGLE — dark / light mode --- */
(function initTheme() {
  const root = document.documentElement;
  const btns = document.querySelectorAll("#themeToggle, #themeToggle-mobile");

  const BG_LIGHT = 0xf4f4f5;
  const BG_DARK = 0x0d0d12;

  window.__threeSetBg = null;

  function applyTheme(dark) {
    if (dark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    if (window.__threeSetBg) window.__threeSetBg(dark ? BG_DARK : BG_LIGHT);
  }

  /* --- Restore saved preference --- */
  let dark = localStorage.getItem("theme") === "dark";
  applyTheme(dark);

  window.__applyTheme = applyTheme;
  window.__isDark = () => dark;

  /* --- Circle-wipe transition --- */
  let animating = false;

  if (btns.length > 0) {
    btns.forEach(btn => btn.addEventListener("click", () => {
      if (animating) return;

      // Get overlay lazily so it's always found regardless of DOM order
      const overlay = document.getElementById("theme-transition-overlay");

      animating = true;
      dark = !dark;
      localStorage.setItem("theme", dark ? "dark" : "light");

      if (!overlay) {
        // Fallback: no overlay, just apply theme directly
        applyTheme(dark);
        animating = false;
        return;
      }

      /* Get button center as percentage of viewport */
      const rect = btn.getBoundingClientRect();
      const ox =
        (((rect.left + rect.width / 2) / window.innerWidth) * 100).toFixed(2) +
        "%";
      const oy =
        (((rect.top + rect.height / 2) / window.innerHeight) * 100).toFixed(2) +
        "%";

      /* Setup overlay — plain background, no icon */
      overlay.style.background = dark ? "#0d0d12" : "#f4f4f5";
      overlay.textContent = "";

      /* --- Expand from button → full screen (280ms) --- */
      overlay.style.transition = "none";
      overlay.style.clipPath = `circle(0% at ${ox} ${oy})`;

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          overlay.style.transition =
            "clip-path 0.28s cubic-bezier(0.25, 0, 0.35, 1)";
          overlay.style.clipPath = `circle(150% at ${ox} ${oy})`;
        }),
      );

      /* Apply theme once screen is fully covered */
      setTimeout(() => {
        applyTheme(dark);
        overlay.style.transition = "none";
        overlay.style.clipPath = "circle(0% at 50% 50%)";
        animating = false;
      }, 290);
    }));
  }
})();

/* --- THREE.JS PARTICLE BACKGROUND --- */
// Prompt 1: IntersectionObserver to pause rendering when canvas is offscreen
let isCanvasVisible = true;

(function initThree() {
  // Prompt 5: Sync Three.js accent color from CSS variable
  const style = getComputedStyle(document.documentElement);
  const accentColor = style.getPropertyValue('--purple').trim();
  const threeColor = parseInt(accentColor.replace('#', ''), 16);

  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xf4f4f5, 1);

  // Register background-colour setter for theme toggle
  window.__threeSetBg = (hex) => renderer.setClearColor(hex, 1);
  // Apply current theme immediately (in case theme was already set)
  if (window.__isDark && window.__isDark()) renderer.setClearColor(0x0d0d12, 1);

  // Prompt 1: Observe #panel-home (or #bg-canvas) to pause WebGL when off-screen
  const observeTarget = document.getElementById("panel-home") || canvas;
  new IntersectionObserver(
    (entries) => { isCanvasVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  ).observe(observeTarget);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200,
  );
  camera.position.set(0, 0, 30);

  /* --- Particle field --- */
  const COUNT = 1200;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 100;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    const t = Math.random();
    // Prompt 5: Derive purple channel values from CSS variable (threeColor)
    const pr = ((threeColor >> 16) & 0xff) / 255;
    const pg = ((threeColor >> 8) & 0xff) / 255;
    const pb = (threeColor & 0xff) / 255;
    col[i * 3] = t > 0.5 ? pr : 0.647;     // purple r or grey r (#a5)
    col[i * 3 + 1] = t > 0.5 ? pg : 0.647; // purple g or grey g (#a5)
    col[i * 3 + 2] = t > 0.5 ? pb : 0.647; // purple b or grey b (#a5)
    sizes[i] = Math.random() * 1.5 + 0.3;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* --- Central wireframe (Explodable) --- */
  let icoGeo = new THREE.IcosahedronGeometry(4, 1);
  if (icoGeo.index !== null) {
    icoGeo = icoGeo.toNonIndexed(); // Separate triangles so they can break apart
  }

  const icoMat = new THREE.MeshBasicMaterial({
    color: threeColor, // Prompt 5: synced from --purple CSS variable
    wireframe: true,
    transparent: true,
    opacity: 0.15,
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
    const cx = (origPos[i] + origPos[i + 3] + origPos[i + 6]) / 3;
    const cy = (origPos[i + 1] + origPos[i + 4] + origPos[i + 7]) / 3;
    const cz = (origPos[i + 2] + origPos[i + 5] + origPos[i + 8]) / 3;

    const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
    const explodeDist = Math.random() * 8 + 4; // random distance outwards

    for (let v = 0; v < 3; v++) {
      targetPos[i + v * 3] =
        origPos[i + v * 3] +
        (cx / len) * explodeDist +
        (Math.random() - 0.5) * 2;
      targetPos[i + v * 3 + 1] =
        origPos[i + v * 3 + 1] +
        (cy / len) * explodeDist +
        (Math.random() - 0.5) * 2;
      targetPos[i + v * 3 + 2] =
        origPos[i + v * 3 + 2] +
        (cz / len) * explodeDist +
        (Math.random() - 0.5) * 2;
    }
  }

  /* --- Orbit ring --- */
  const ringGeo = new THREE.TorusGeometry(6, 0.015, 2, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xa5a5a5,
    transparent: true,
    opacity: 0.4,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  /* --- Mouse tracking & Raycaster --- */
  const mouse = { x: 0, y: 0 };
  const rayMouse = new THREE.Vector2(-999, -999);
  const raycaster = new THREE.Raycaster();
  let explodeProgress = 0;

  document.addEventListener("mousemove", (e) => {
    // For camera parallax
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    // For raycasting
    rayMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    rayMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  /* --- FPS counter --- */
  let lastTime = performance.now(),
    frameCount = 0;
  const fpsEl = document.getElementById("hudFrames");

  /* --- Animate --- */
  let t = 0;
  function animate() {
    // Prompt 1: Skip expensive rendering when canvas is not visible
    if (!isCanvasVisible) { requestAnimationFrame(animate); return; }
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
        const wobble = isHovered
          ? Math.sin(t * 20 + i) * 0.1 * explodeProgress
          : 0;
        posAttr.array[i] =
          origPos[i] + (targetPos[i] - origPos[i]) * explodeProgress + wobble;
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
      frameCount = 0;
      lastTime = now;
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* --- HUD CLOCK --- */
(function clock() {
  const els = document.querySelectorAll("#hudTime, #hudTime-mobile");
  setInterval(() => {
    const d = new Date();
    els.forEach(el => el.textContent = d.toTimeString().slice(0, 8));
  }, 1000);
})();

/* --- TYPING ANIMATION --- */
(function typing() {
  const phrases = [
    "CSE STUDENT",
    "WEB DEVELOPER",
    "IOT ENGINEER",
    "PYTHON DEV",
    "GAME CREATOR",
    "AI ENTHUSIAST",
  ];
  let pi = 0,
    ci = 0,
    del = false;
  const els = document.querySelectorAll("#typedRole, #typedRole-mobile");
  if (els.length === 0) return;
  function tick() {
    const cur = phrases[pi];
    const text = del ? cur.slice(0, --ci) : cur.slice(0, ++ci);
    els.forEach(el => el.textContent = text);
    if (!del && ci === cur.length) {
      del = true;
      setTimeout(tick, 1800);
      return;
    }
    if (del && ci === 0) {
      del = false;
      pi = (pi + 1) % phrases.length;
    }
    setTimeout(tick, del ? 55 : 100);
  }
  tick();
})();

/* --- NAVIGATION — smooth scroll --- */
const sectionOrder = [
  "home",
  "about",
  "skills",
  "projects",
  "certs",
  "contact",
];

function switchSection(name) {
  const targetDesktop = document.getElementById("panel-" + name);
  const targetMobile = document.getElementById("panel-" + name + "-mobile");
  if (targetDesktop && targetDesktop.offsetParent !== null) targetDesktop.scrollIntoView({ behavior: "smooth", block: "start" });
  else if (targetMobile && targetMobile.offsetParent !== null) targetMobile.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Nav button clicks → smooth scroll
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchSection(btn.dataset.section));
});



// --- Active nav highlight via scroll spy ---
// Finds which section's top is closest to 35% from viewport top.
// This is pixel-accurate regardless of section height or scroll speed.
function updateActiveNav() {
  const triggerY = window.innerHeight * 0.35;
  let closestSection = null;
  let closestDist = Infinity;

  sectionOrder.forEach((name) => {
    const el = document.getElementById("panel-" + name);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Only consider sections that are at least partially visible
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const dist = Math.abs(rect.top - triggerY);
    if (dist < closestDist) {
      closestDist = dist;
      closestSection = name;
    }
  });

  if (closestSection) {
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(`.nav-btn[data-section="${closestSection}"]`).forEach((b) => b.classList.add("active"));
  }
}

// Run on scroll (passive for performance)
window.addEventListener("scroll", updateActiveNav, { passive: true });
// Run once on load to set initial active state
updateActiveNav();

// Separate observer only for triggering skill bar animation
const skillsEl = document.getElementById("panel-skills");
if (skillsEl) {
  new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) animateBars(); },
    { threshold: 0.2 }
  ).observe(skillsEl);
}


/* --- SCROLL HUD FADE --- */
const hudCorners = document.querySelectorAll(".hud-corner");

window.addEventListener(
  "scroll",
  () => {
    const scrolled = window.scrollY;

    // Fade out HUD corners when scrolling down past 100px
    if (scrolled > 100) {
      hudCorners.forEach((corner) => corner.classList.add("hidden"));
    } else {
      hudCorners.forEach((corner) => corner.classList.remove("hidden"));
    }
  },
  { passive: true },
);

/* --- SECTION REVEAL ON SCROLL --- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll(".panel-inner")
  .forEach((el) => revealObserver.observe(el));
// Immediately reveal the home section
const homeInner = document.querySelector("#panel-home .panel-inner");
const homeInnerMobile = document.querySelector("#panel-home-mobile .panel-inner");
if (homeInner) homeInner.classList.add("revealed");
if (homeInnerMobile) homeInnerMobile.classList.add("revealed");

/* --- SKILL BAR ANIMATION --- */
function animateBars() {
  document.querySelectorAll(".bar-fill").forEach((bar) => {
    bar.style.animation = "none";
    // Force reflow then re-trigger
    void bar.offsetWidth;
    bar.style.animation = "growBar 1s ease both";
  });
}

/* --- PROJECT DATA --- */
const projects = [
  {
    pre: "// PROJECT_001 — WEB / LIVE",
    title: "PERSONAL_WEBSITE",
    desc: "My personal developer portfolio and interactive laboratory. Built from scratch with Vanilla JS, Glassmorphism UI, a reactive 3D WebGL particle field using Three.js, and smooth continuous scroll architectures.",
    tech: ["HTML5", "CSS3", "JavaScript", "Three.js", "UI/UX"],
    img: "assets/portfolio.png",
    github: "https://github.com/satwik88/SR_DEV_LAB",
    demo: "https://satwik88.github.io/SR_DEV_LAB",
  },
  {
    pre: "// PROJECT_002 — PYTHON",
    title: "FOOD_ORDERING_SYSTEM",
    desc: "Built a CLI-based food ordering app in Python with full MySQL persistence. Handles menu browsing, order placement, and order history. Designed the full database schema — tables for users, menu items, orders, and order items with relational integrity.",
    tech: ["Python", "MySQL", "CLI", "DBMS", "OOP"],
    img: "assets/food_ordering.png",
    github: "https://github.com/satwik88/Food-Ordering-System",
    demo: null,
  },
  {
    pre: "// PROJECT_003 — WEB / LIVE",
    title: "SNAKE_GAME",
    desc: "Browser Snake clone built in vanilla JS — no frameworks. Features neon UI, local high score storage, and 3 difficulty speeds. Focused on clean game loop logic and smooth canvas rendering.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas API", "localStorage"],
    img: "assets/snake_game.png",
    github: "https://github.com/satwik88/Snake",
    demo: "https://satwik88.github.io/Snake",
  },
];

let _projectOverlayTrigger = null; // Prompt 3: track triggering element for focus restore

function openProject(i) {
  _projectOverlayTrigger = document.activeElement; // Prompt 3: save focus origin
  const p = projects[i];
  const overlay = document.getElementById("projectOverlay");
  document.getElementById("overlayPre").textContent = p.pre;
  document.getElementById("overlayTitle").textContent = p.title;
  document.getElementById("overlayDesc").textContent = p.desc;
  document.getElementById("overlayImg").src = p.img;
  document.getElementById("overlayImg").alt = p.title;

  const techEl = document.getElementById("overlayTech");
  techEl.textContent = "";
  p.tech.forEach((t) => {
    const span = document.createElement("span");
    span.textContent = t;
    techEl.appendChild(span);
  });

  const linksEl = document.getElementById("overlayLinks");
  linksEl.textContent = "";
  
  const createBracket = (text) => {
    const span = document.createElement("span");
    span.className = "btn-bracket";
    span.textContent = text;
    return span;
  };

  const githubLink = document.createElement("a");
  githubLink.href = p.github;
  githubLink.target = "_blank";
  githubLink.className = "action-btn";
  githubLink.appendChild(createBracket("["));
  githubLink.appendChild(document.createTextNode(" GITHUB "));
  githubLink.appendChild(createBracket("]"));
  linksEl.appendChild(githubLink);

  if (p.demo) {
    const demoLink = document.createElement("a");
    demoLink.href = p.demo;
    demoLink.target = "_blank";
    demoLink.className = "action-btn action-ghost";
    demoLink.appendChild(createBracket("["));
    demoLink.appendChild(document.createTextNode(" LIVE DEMO "));
    demoLink.appendChild(createBracket("]"));
    linksEl.appendChild(demoLink);
  }

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  // Prompt 3: trap focus inside project overlay panel
  const panel = overlay.querySelector(".project-overlay-panel") || overlay;
  trapFocus(panel);
}

function closeProject() {
  document.getElementById("projectOverlay").classList.remove("open");
  document.body.style.overflow = "";
  // Prompt 3: restore focus to triggering element
  if (_projectOverlayTrigger && typeof _projectOverlayTrigger.focus === 'function') {
    _projectOverlayTrigger.focus();
    _projectOverlayTrigger = null;
  }
}

// Close on escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProject();
});

/* --- INLINE EVENT HANDLERS REPLACEMENT --- */
document.addEventListener("DOMContentLoaded", () => {
  const navBrandBtn = document.getElementById("navBrandBtn");
  if (navBrandBtn) {
    navBrandBtn.addEventListener("click", () => switchSection("home"));
    navBrandBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        switchSection("home");
      }
    });
  }

  const exploreBtn = document.getElementById("exploreBtn");
  if (exploreBtn) exploreBtn.addEventListener("click", () => switchSection("projects"));

  document.querySelectorAll(".cert-lightbox-trigger").forEach((el) => {
    el.addEventListener("click", () => openCertLightbox(el.getAttribute("data-cert")));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCertLightbox(el.getAttribute("data-cert"));
      }
    });
  });

  const certLightbox = document.getElementById("certLightbox");
  if (certLightbox) certLightbox.addEventListener("click", closeCertLightbox);

  const certLightboxCloseBtn = document.getElementById("certLightboxCloseBtn");
  if (certLightboxCloseBtn) certLightboxCloseBtn.addEventListener("click", closeCertLightbox);

  const closeOverlayBtn = document.getElementById("closeOverlayBtn");
  if (closeOverlayBtn) closeOverlayBtn.addEventListener("click", closeProject);

  // Init footer FX animation
  initFooterFX();
});

/* --- CONTACT FORM --- */
/* Prompt 4: Replaced mailto: with Formspree fetch submission */
document.querySelectorAll("#contactForm, #contactForm-mobile").forEach(form => form.addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = this.querySelector("[id^=formSubmitBtn]");
  const note = this.querySelector("[id^=formNote]");
  const name = this.querySelector("[id^=formName]").value.trim();
  const email = this.querySelector("[id^=formEmail]").value.trim();
  const message = this.querySelector("[id^=formMessage]").value.trim();

  btn.textContent = "[ TRANSMITTING... ]";
  btn.disabled = true;

  fetch('https://formspree.io/f/xgojolwr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, message: message })
  })
  .then(res => {
    btn.textContent = "[ TRANSMIT MESSAGE ]";
    btn.disabled = false;
    if (res.ok) {
      note.textContent = "// TRANSMISSION SUCCESSFUL — message sent.";
      note.className = "form-note success";
      this.reset();
    } else {
      note.textContent = "// ERROR — something went wrong. Try again.";
      note.className = "form-note error";
    }
    setTimeout(() => {
      note.textContent = "";
      note.className = "form-note";
    }, 5000);
  })
  .catch(() => {
    btn.textContent = "[ TRANSMIT MESSAGE ]";
    btn.disabled = false;
    note.textContent = "// NETWORK ERROR — check your connection.";
    note.className = "form-note error";
    setTimeout(() => {
      note.textContent = "";
      note.className = "form-note";
    }, 5000);
  });
}));

/* --- FOCUS TRAP UTILITY (Prompt 3) --- */
function trapFocus(element) {
  const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusableEls = Array.from(element.querySelectorAll(focusableSelectors)).filter(el => !el.closest('[hidden]'));
  if (focusableEls.length === 0) return;
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      // Shift+Tab: if focus is on first element, wrap to last
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab: if focus is on last element, wrap to first
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }

  // Remove any previous trap on this element before attaching a new one
  if (element._trapFocusHandler) element.removeEventListener('keydown', element._trapFocusHandler);
  element._trapFocusHandler = handleKeydown;
  element.addEventListener('keydown', handleKeydown);
  // Move focus into the container
  firstEl.focus();
}

/* --- CERT LIGHTBOX --- */
let _certLightboxTrigger = null; // Prompt 3: track triggering element for focus restore

function openCertLightbox(src) {
  _certLightboxTrigger = document.activeElement; // Prompt 3: save focus origin
  const lb = document.getElementById("certLightbox");
  const img = document.getElementById("certLightboxImg");
  img.src = src;
  lb.classList.add("open");
  document.body.style.overflow = "hidden";
  // Prompt 3: trap focus inside lightbox
  trapFocus(lb);
}

function closeCertLightbox(e) {
  // Close if clicking the backdrop (not the image itself)
  if (e && e.target === document.getElementById("certLightboxImg")) return;
  const lb = document.getElementById("certLightbox");
  lb.classList.remove("open");
  document.body.style.overflow = "";
  // Prompt 3: restore focus to triggering element
  if (_certLightboxTrigger && typeof _certLightboxTrigger.focus === 'function') {
    _certLightboxTrigger.focus();
    _certLightboxTrigger = null;
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeCertLightbox();
});

/* --- MOBILE HAMBURGER MENU --- */
/* --- MOBILE HAMBURGER MENU (GSAP Staggered) --- */
(function initStaggeredMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const panel = document.getElementById("staggeredPanel");
  const menuOverlay = document.getElementById("menuOverlay");
  
  if (!hamburgerBtn || !panel || typeof gsap === "undefined") return;

  let isMenuOpen = false;

  // Set initial states. Force x: 0 to override any CSS translateX parsed as pixels.
  gsap.set(".sm-prelayer", { x: 0, xPercent: 100 });
  gsap.set(".staggered-menu-panel", { x: 0, xPercent: 100 });
  gsap.set(".sm-panel-itemLabel", { y: 100, rotation: 5, opacity: 0 });
  gsap.set(".menu-overlay", { clipPath: "inset(0px 0px 0px 100%)", opacity: 0, pointerEvents: "none" });

  // Create GSAP Timeline
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.inOut" } });

  tl.to(".menu-overlay", {
    clipPath: "inset(0px 0px 0px 0px)",
    opacity: 1,
    duration: 0.6,
    pointerEvents: "auto",
    ease: "power2.inOut"
  })
  .to(".sm-prelayer", {
    xPercent: 0,
    duration: 0.8,
    stagger: 0.1
  }, "-=0.4")
  .to(".staggered-menu-panel", {
    xPercent: 0,
    duration: 0.8
  }, "-=0.6")
  .to(".sm-panel-itemLabel", {
    y: 0,
    rotation: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.05,
    ease: "power4.out"
  }, "-=0.4");

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    hamburgerBtn.classList.toggle("open", isMenuOpen);
    panel.classList.toggle("active", isMenuOpen);
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    document.body.style.overflowX = isMenuOpen ? "hidden" : "";
    // Prompt 2: update aria-expanded on hamburger button
    hamburgerBtn.setAttribute('aria-expanded', isMenuOpen ? 'true' : 'false');

    if (isMenuOpen) {
      tl.play();
    } else {
      tl.reverse();
    }
  }

  function closeMenu() {
    if (isMenuOpen) toggleMenu();
  }

  // Toggle on hamburger click
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  const smPanelClose = document.getElementById("smPanelClose");
  if (smPanelClose) {
    smPanelClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  // Close when clicking nav links
  const navLinks = panel.querySelectorAll(".sm-panel-item");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      closeMenu();
      
      // Delay scroll until menu animation mostly finishes
      setTimeout(() => {
        switchSection(targetId);
      }, 600);
    });
  });

  // Close when clicking outside panel or on overlay
  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMenu);
  }

  document.addEventListener("click", (e) => {
    if (isMenuOpen && !panel.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      closeMenu();
    }
  });
})();

/* --- FOOTER FX: Flickering Grid + Ripple Name Animation --- */
function initFooterFX() {
  const section = document.getElementById('panel-footer-fx');
  const canvas  = document.getElementById('footer-flicker-canvas');
  const nameEl  = document.getElementById('footer-name-text');
  if (!section || !canvas || !nameEl) return;

  const ctx = canvas.getContext('2d');

  // ── Live color reading — re-reads on theme toggle ──────────
  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }

  let purple = { r: 101, g: 82, b: 208 }; // fallback #6552d0
  function refreshColors() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--purple').trim();
    if (raw) purple = hexToRgb(raw);
  }
  refreshColors();

  // Re-read on theme toggle (watches data-theme attribute)
  new MutationObserver(refreshColors).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] }
  );

  // rgba helpers — always read from live `purple` object
  const purpleRgba = (a) => `rgba(${purple.r},${purple.g},${purple.b},${a})`;
  const greyRgba   = (a) => `rgba(165,165,165,${a})`; // #a5a5a5, same as Three.js grey particles

  // ── Canvas resize ──────────────────────────────────────────
  function resizeCanvas() {
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
    buildGrid();
  }

  // ── Grid squares ───────────────────────────────────────────
  const SQUARE_SIZE = 4;
  const GRID_GAP    = 6;
  const STEP        = SQUARE_SIZE + GRID_GAP;
  let squares = [];

  function buildGrid() {
    squares = [];
    const cols = Math.ceil(canvas.width  / STEP) + 1;
    const rows = Math.ceil(canvas.height / STEP) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        squares.push({
          x:       c * STEP,
          y:       r * STEP,
          opacity: Math.random() * 0.3,
          target:  Math.random() * 0.3,
          speed:   0.02 + Math.random() * 0.05,
          isGrey:  Math.random() > 0.3, // 70% grey, 30% purple — matches reference
        });
      }
    }
  }

  function updateSquares() {
    squares.forEach(sq => {
      sq.opacity += (sq.target - sq.opacity) * sq.speed;
      if (Math.random() < 0.008) sq.target = Math.random() * 0.3;
    });
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    squares.forEach(sq => {
      ctx.fillStyle = sq.isGrey ? greyRgba(sq.opacity) : purpleRgba(sq.opacity);
      ctx.fillRect(sq.x, sq.y, SQUARE_SIZE, SQUARE_SIZE);
    });
  }

  // ── Ripple ─────────────────────────────────────────────────
  function easeOutQuad(t) { return t * (2 - t); }

  function rippleReveal(callback) {
    const cx    = canvas.width  / 2;
    const cy    = canvas.height / 2;
    const maxR  = Math.sqrt(cx * cx + cy * cy);
    const DURATION = 800;
    const start = performance.now();

    function frame(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased    = easeOutQuad(progress);
      const radius   = eased * maxR;

      drawGrid();

      // Expanding fill
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = purpleRgba(0.18);
      ctx.fill();
      // Glowing ring edge
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = purpleRgba(0.55);
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        callback();
      }
    }
    requestAnimationFrame(frame);
  }

  // ── IntersectionObserver: pause RAF when off-screen ────────
  let isSectionVisible = false;
  new IntersectionObserver(
    (entries) => { isSectionVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  ).observe(section);

  // ── Grid flicker RAF loop ──────────────────────────────────
  let flickerRafId  = null;
  let flickerActive = false;

  function startFlicker() {
    flickerActive = true;
    function loop() {
      if (!flickerActive) return;
      if (isSectionVisible) {
        updateSquares();
        drawGrid();
      }
      flickerRafId = requestAnimationFrame(loop);
    }
    flickerRafId = requestAnimationFrame(loop);
  }

  function stopFlicker() {
    flickerActive = false;
    if (flickerRafId) cancelAnimationFrame(flickerRafId);
    flickerRafId = null;
  }

  // ── Animation sequence (loops forever) ────────────────────
  //  Phase 1: flicker 5s
  //  Phase 2: ripple → show name
  //  Phase 3: hold name 2s
  //  Phase 4: ripple → hide name
  //  Loop back to Phase 1

  function runSequence() {
    // Phase 1 — flicker 5 seconds
    startFlicker();
    setTimeout(() => {
      stopFlicker();

      // Phase 2 — ripple reveal → show name
      rippleReveal(() => {
        nameEl.style.opacity = '1';

        // Phase 3 — hold name 2 seconds
        setTimeout(() => {

          // Phase 4 — ripple reveal → hide name → loop
          rippleReveal(() => {
            nameEl.style.opacity = '0';
            runSequence(); // Phase 5 → restart
          });

        }, 2000);
      });

    }, 5000);
  }

  // ── Bootstrap ─────────────────────────────────────────────
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  runSequence();
}
