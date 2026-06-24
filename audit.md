# Site Audit Report
**Date:** 2026-06-19
**Project:** SATWIK RAJ // DEV LAB
**Detected stack:** HTML5, CSS3, Vanilla JS, Three.js, React + Framer Motion (via ESM CDN), Vite
**Detected audience/goal:** Personal developer portfolio to showcase projects and skills to recruiters or peers.
**Design system maturity:** Partially tokenized — CSS variables are used for the main theme in `styles.css`, but hardcoded hex values exist in `script.js` for Three.js rendering.

---

## Anti-Pattern Verdict
Does this look AI-generated? **Yes (Partially)** — The site exhibits several strong tells of AI generation or heavy reliance on trendy portfolio templates:
- **Typing animation hero:** The rotating text in the hero section (`"CSE STUDENT"`, `"WEB DEVELOPER"`) is a ubiquitous AI/template trope (`script.js:296`).
- **Glassmorphism overuse:** The `.main-nav` and `.top-blur` heavily rely on `backdrop-filter: blur()` and semi-transparent backgrounds, a common default in AI UI generators.
- **"System status" badges:** The `<span class="meta-val hud-green">Open to Opportunities</span>` and corner HUD elements (`.hud-corner`) are decorative "tech" aesthetics without real function.
- **Color sameness:** The heavy reliance on `#6552d0` (purple) as the primary accent is the most common AI default palette.

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Modals lack focus traps and `aria-expanded` is missing on the hamburger menu. |
| 2 | Performance | 2/4 | Three.js animation loop runs continuously even when scrolled out of view. |
| 3 | Security | 4/4 | No exploitable XSS, secrets, or dangerous DOM insertions found. |
| 4 | Theming & design system | 3/4 | Good CSS variable usage, but Three.js colors are hardcoded in JS. |
| 5 | Responsive design | 3/4 | Good media query coverage, but mobile menu overlay lacks touch-target polish. |
| 6 | Anti-patterns | 1/4 | Heavy reliance on AI portfolio tropes (typing text, glassmorphism, HUD). |
| | **Total** | **15/24** | **Acceptable** |

**Legal & compliance flags:** Privacy Policy **missing** · Terms **missing** · Cookie consent **missing** · GDPR signals **n-a** · COPPA **n-a**

---

## Executive Summary
The portfolio demonstrates a strong technical foundation with a creative mix of Vanilla JS, Three.js, and React via ESM. However, the site suffers from common accessibility gaps, particularly around focus management in custom overlays, and performance issues due to an unoptimized WebGL animation loop. Addressing these, along with removing some of the more cliché AI portfolio tropes, will elevate it from a standard template to a professional showcase.

Total findings by severity: P0 [0] · P1 [3] · P2 [3] · P3 [2]

---

## Quick Wins
The highest-impact issues that are also straightforward to fix:
1. **Hamburger ARIA state (P1)** — Add `aria-expanded="true/false"` toggling to `hamburgerBtn` in `script.js`.
2. **Three.js colors (P2)** — Read the `--purple` CSS variable in `script.js` instead of hardcoding `0x6552d0`.
3. **Form Submissions (P2)** — Replace the `mailto:` hack with a free form endpoint (e.g., Formspree) for better reliability.

---

## Findings

### P0 — Blocking
No issues found.

### P1 — Major

#### Missing focus trap in Project/Cert Modals
- **Category:** Accessibility
- **Location:** `script.js` (openProject and openCertLightbox functions)
- **Issue:** When the project details or certificate lightbox overlays are opened, keyboard focus is not trapped within the modal. Users can tab to elements behind the overlay.
- **User impact:** Screen reader and keyboard-only users will lose context, tabbing into invisible elements on the page behind the modal, making it impossible to navigate the modal content reliably.
- **Fix:** Implement a focus trap utility that locks `Tab` navigation within the `.project-overlay-panel` and `#certLightbox` when they possess the `.open` class.

#### Missing `aria-expanded` on Hamburger Menu
- **Category:** Accessibility
- **Location:** `index.html:114` and `script.js:664`
- **Issue:** The mobile menu toggle button (`#hamburgerBtn`) does not communicate its state to assistive technologies.
- **User impact:** Screen reader users will not know if activating the button successfully opened or closed the menu.
- **Fix:** Add `aria-expanded="false"` to the button in HTML, and toggle it to `"true"` in the `toggleMenu()` function.

#### Unoptimized WebGL Animation Loop
- **Category:** Performance
- **Location:** `script.js:225` (`animate` function)
- **Issue:** The Three.js `requestAnimationFrame` loop runs continuously, computing geometry updates and rendering the scene even when the user scrolls down and the canvas (`#bg-canvas`) is completely out of view.
- **User impact:** High CPU/GPU usage and battery drain on mobile devices, even when reading static content at the bottom of the page.
- **Fix:** Use an `IntersectionObserver` on the `#panel-home` section to pause the `requestAnimationFrame` loop when the hero section is not visible.

### P2 — Minor

#### Hardcoded Theme Colors in WebGL
- **Category:** Theming & design system
- **Location:** `script.js:122` and `script.js:148`
- **Issue:** The particle and icosahedron colors are hardcoded (`0x6552d0`, `0xa5a5a5`) rather than deriving from the CSS variables defined in `styles.css`.
- **User impact:** If the primary brand color is updated in CSS, the 3D background will awkwardly mismatch until the JS is also manually updated.
- **Fix:** Use `getComputedStyle(document.documentElement).getPropertyValue('--purple')` to pass the dynamic color to the Three.js materials.

#### `mailto:` Form Submission
- **Category:** Usability (Error prevention)
- **Location:** `script.js:585`
- **Issue:** The contact form relies on `window.location.href = mailto:...` to submit messages.
- **User impact:** Users without a configured default email client (very common on public computers or certain mobile setups) will click submit and nothing will happen, leading to lost messages and frustration.
- **Fix:** Integrate a simple form-handling API (like Formspree or Netlify Forms) to send the email via an HTTP POST request in the background.

#### Missing Form Labels for Screen Readers
- **Category:** Accessibility
- **Location:** `index.html:471` (Contact Form)
- **Issue:** The inputs use custom stylized labels (`<label>// NAME</label>`), but they might visually float or hide. Ensure the `for` attributes exactly match the `id`s (they do, which is good), but the placeholders are spaces `placeholder=" "`.
- **User impact:** Minor confusion if the floating label CSS fails or is overridden by browser extensions.
- **Fix:** Keep the `for` attributes, but consider adding visually hidden labels if the floating label technique is entirely CSS-dependent and fragile. (Given the current code, it's mostly okay, but verify floating label contrast).

### P3 — Polish

#### Focus Return on Modal Close
- **Category:** Accessibility
- **Location:** `script.js:526` (`closeProject` function)
- **Issue:** When a modal is closed, focus is not returned to the button that originally triggered it.
- **User impact:** Keyboard users are dumped back at the top of the document or lose their place in the DOM order.
- **Fix:** Store `document.activeElement` before opening the modal, and call `.focus()` on it inside the close handler.

#### Typing Animation Cliché
- **Category:** Anti-patterns
- **Location:** `script.js:296`
- **Issue:** The rotating typing animation is heavily overused in junior developer portfolios.
- **User impact:** Recruiter fatigue; it makes the portfolio feel like a template rather than a bespoke engineering artifact.
- **Fix:** Replace the rotating text with a single, strong, static value proposition statement.

---

## Systemic Patterns
- **Focus Management Deficits:** Across the entire application, custom interactive elements (Hamburger menu, Project overlays, Certificate lightboxes) handle visual state (`.open`, `.active`) but completely neglect ARIA states (`aria-expanded`, `aria-hidden`) and focus management. This indicates a systemic gap in keyboard/screen-reader testing during development.

---

## Strengths
- **Native ES Modules:** Excellent use of modern browser capabilities in `projects-component.js` by importing React via CDN and using `React.createElement` directly, avoiding complex build steps for a simple interactive component.
- **Passive Event Listeners:** Scroll events in `script.js` (e.g., `updateActiveNav`, HUD fade) correctly use `{ passive: true }` to prevent scroll jank.
- **Keyboard Accessibility (Partial):** The developer actively added `keydown` event listeners for the `Escape` key to close modals, showing an awareness of keyboard navigation beyond just mouse clicks.

---

## Recommended Priority Order
1. **Fix WebGL Animation Loop (Performance)** — Easiest way to stop draining users' batteries; wrap the animation in an IntersectionObserver.
2. **Implement Focus Traps (Accessibility)** — Critical for making the primary interactive features (projects) usable via keyboard.
3. **Add `aria-expanded` to Hamburger (Accessibility)** — A one-line fix that significantly improves mobile screen reader experience.
4. **Replace `mailto:` Form (Usability)** — Ensures interested parties can actually contact you without technical friction.
5. **Sync WebGL Colors to CSS Variables (Theming)** — Future-proofs the design system.
