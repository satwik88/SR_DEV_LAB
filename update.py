import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# WebP replacements
html = html.replace('logo.png', 'logo.webp')
html = html.replace('portfolio.png', 'portfolio.webp')
html = html.replace('agentic_ai_cert.jpg.jpeg', 'agentic_ai_cert.webp')

# Width and Height replacements
html = html.replace('<img src="assets/logo.webp" alt="Satwik Raj Logo" class="nav-logo-img" />', '<img src="assets/logo.webp" alt="Satwik Raj Logo" class="nav-logo-img" width="476" height="476" />')

html = html.replace(
    '<img src="assets/agentic_ai_cert.webp"\n                  alt="Coursera Certificate - Building Agentic RAG with LlamaIndex" class="cert-img" loading="lazy" />',
    '<img src="assets/agentic_ai_cert.webp"\n                  alt="Coursera Certificate - Building Agentic RAG with LlamaIndex" class="cert-img" loading="lazy" width="1600" height="1122" />'
)

# GSAP script movement
# Remove from head
gsap_script = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
html = html.replace(gsap_script, '')

# Add defer to bottom scripts and move gsap
bottom_scripts = """  <!-- Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- GSAP ScrollTrigger for ScrollFloat component -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="script.js?v=33"></script>"""

new_bottom_scripts = """  <!-- GSAP -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- GSAP ScrollTrigger for ScrollFloat component -->
  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script type="module" src="script.js?v=33"></script>"""

html = html.replace(bottom_scripts, new_bottom_scripts)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
