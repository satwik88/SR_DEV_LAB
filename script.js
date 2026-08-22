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

  /* --- Restore saved preference or use time-based default --- */
  let savedTheme = localStorage.getItem("theme");
  let dark = false;

  if (savedTheme) {
    dark = savedTheme === "dark";
  } else {
    const hour = new Date().getHours();
    // Light mode from 6 AM (6) to 5:59 PM (17)
    // Dark mode from 6 PM (18) to 5:59 AM (5)
    dark = (hour >= 18 || hour < 6);
  }

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
  // Skip WebGL entirely on mobile — too expensive, body bg-color handles the visual
  const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) {
    document.body.classList.add('no-webgl');
    return;
  }
  // Desktop only: load Three.js dynamically, then init the scene
  const _threeScript = document.createElement('script');
  _threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  _threeScript.onload = runThree;
  document.head.appendChild(_threeScript);

  function runThree() {
  // Sync Three.js accent color from CSS variable
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

  // Observe the canvas itself so it doesn't freeze when scrolling past the home section
  const observeTarget = canvas;
  new IntersectionObserver(
    (entries) => { isCanvasVisible = entries[0].isIntersecting; },
    { threshold: 0 }
  ).observe(observeTarget);

  // Pause rendering when the tab is hidden (Page Visibility API)
  document.addEventListener('visibilitychange', () => {
    isCanvasVisible = !document.hidden && observeTarget.getBoundingClientRect().height > 0;
  });

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

  /* --- Mouse tracking & THREE.Raycaster --- */
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

  /* --- Animate — capped at 30fps --- */
  const FRAME_INTERVAL = 1000 / 30; // ~33ms
  let lastFrameTime = 0;
  let t = 0;
  function animate(now) {
    // Skip expensive rendering when canvas is not visible
    if (!isCanvasVisible) { requestAnimationFrame(animate); return; }
    // 30fps cap: skip frames that arrive faster than 33ms
    if (now - lastFrameTime < FRAME_INTERVAL) { requestAnimationFrame(animate); return; }
    lastFrameTime = now;
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
    const fpsNow = now;
    if (fpsNow - lastTime >= 1000) {
      if (fpsEl) fpsEl.textContent = `FPS: ${frameCount}`;
      frameCount = 0;
      lastTime = fpsNow;
    }

    renderer.render(scene, camera);
  }
  animate(performance.now());


  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  } // end runThree
})();

/* --- HUD CLOCK --- */
(function clock() {
  const els = document.querySelectorAll("#hudTime, #hudTime-mobile");
  setInterval(() => {
    const d = new Date();
    const timeString = d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    els.forEach(el => el.textContent = timeString);
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
    ci = phrases[0].length,
    del = true;
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
  // Hold the pre-filled first phrase (baked into index.html so .role-line paints
  // as an instant LCP element), then begin the delete→retype cycle — no reflow.
  setTimeout(tick, 1800);
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
      const n = link.dataset.section;
      closeMenu();
      
      // Delay scroll until menu animation mostly finishes
      setTimeout(() => {
        switchSection(n);
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


/* --- SERVICE WORKER REGISTRATION --- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('[SW] Registration successful with scope:', registration.scope);
    }).catch(err => {
      console.error('[SW] Registration failed:', err);
    });
  });
} else {
  console.warn('[SW] Service Workers are not supported in this browser.');
}

window.addEventListener('load', () => { const fontLink = document.getElementById('google-fonts-css'); if (fontLink) fontLink.media = 'all'; });
