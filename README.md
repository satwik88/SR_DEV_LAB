# SR\_ DEV LAB v2.3

Welcome to the source code for my personal developer portfolio and laboratory interface.

## 🚀 Features

- **Continuous Scroll Architecture:** A high-tech, seamless vertical scroll experience with progress tracking.
- **Progressive Web App (PWA):** Fully installable as a standalone app on mobile and desktop, complete with custom high-res icons and theme colors.
- **Dynamic 3D Background:** Interactive `Three.js` canvas featuring floating particles and a reactive central wireframe that explodes on hover.
- **Glassmorphism UI:** Frosted glass panels, sleek HUD elements, and modern rounded pill shapes for a premium aesthetic.
- **Dynamic Light/Dark Theme:** Seamlessly toggles between light and dark modes with a dedicated theme switcher.
- **Advanced GSAP Animations:** Features a slick staggered mobile menu that morphs an interactive 4-dot grid into an 'X' using fluid timeline animations.
- **Modular Components:** Uses Web Components (e.g. `<project-showcase>`) for reusable, dynamic project cards.
- **Intersection Observers:** Automatically highlights active navigation tabs and handles HUD visibility as you explore different sections.
- **Fully Responsive:** Adapts flawlessly across desktop, tablet, and mobile devices.

## 🛠️ Technology Stack

- **HTML5:** Semantic and structured content.
- **CSS3:** Custom properties (`:root`), flexbox, grid layouts, and advanced CSS animations/transitions.
- **Vanilla JavaScript:** DOM manipulation, scroll-tracking logic, event handling, and Web Components.
- **Three.js (r128):** WebGL rendering for the interactive 3D background.
- **GSAP:** High-performance animation library used for complex stagger and UI motion sequences.

## 🎨 Design System

- **Themes:** Dynamic Light and Dark themes supported via CSS variables.
- **Primary Accent:** Vivid Purple (`#6552D0` / `#a78bfa`)
- **Secondary Accent:** Tech Grey (`#A5A5A5` / `#1e1e2e`)
- **Typography:** `JetBrains Mono` for HUD/Tech elements and `Space Grotesk` for readable paragraphs.

## 📂 File Structure

```text
SR_DEV_LAB/
├── assets/                  # Directory containing images, high-res PWA icons, etc.
├── index.html               # Main HTML document
├── site.webmanifest         # PWA Manifest config
├── projects-component.js    # Web Component definition for project cards
├── README.md                # Project documentation
├── script.js                # Main JavaScript file containing UI logic & GSAP timelines
└── styles.css               # Main CSS stylesheet with custom properties
```

## 🏃‍♂️ Running Locally

1. Clone this repository.
2. Open `index.html` in your web browser.
   _(Note: For the best experience and to avoid CORS issues if you add external assets later, it is recommended to run this via a local development server like VS Code's "Live Server" extension)._

---

_Built by Satwik Raj — Computer Science & Engineering Student and Developer._
