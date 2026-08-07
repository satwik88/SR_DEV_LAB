import re

with open('index.html', 'r', encoding='utf-8') as f:
    code = f.read()

old_scripts = """  <!-- GSAP -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- GSAP ScrollTrigger for ScrollFloat component -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script type="module" src="script.min.js?v=33"></script>
  <!-- React + Framer Motion Projects Stacking Component (plain ES module, no Babel) -->
  <script type="module" src="projects-component.js"></script>"""

new_scripts = """  <!-- Three.js -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- React & ReactDOM -->
  <script defer src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script defer src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Framer Motion (Global exported as window.Motion) -->
  <script defer src="https://unpkg.com/framer-motion@10.12.16/dist/framer-motion.js"></script>
  <!-- GSAP -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- GSAP ScrollTrigger for ScrollFloat component -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <!-- Main Scripts -->
  <script defer src="script.min.js?v=33"></script>
  <script defer src="projects-component.js"></script>"""

code = code.replace(old_scripts, new_scripts)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(code)
