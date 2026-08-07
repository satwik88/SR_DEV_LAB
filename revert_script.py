import re

with open('script.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove import statement
code = re.sub(r"import \{.*?\} from 'https://esm\.sh/three@0\.128\.0';\n", '', code)

# The words to replace
deps = ['BufferAttribute', 'BufferGeometry', 'IcosahedronGeometry', 'Mesh', 'MeshBasicMaterial', 'PerspectiveCamera', 'Points', 'PointsMaterial', 'Raycaster', 'Scene', 'SphereGeometry', 'TorusGeometry', 'Vector2', 'WebGLRenderer']

for dep in deps:
    # Use word boundary to ensure we don't replace parts of other words
    code = re.sub(rf'\b{dep}\b', f'THREE.{dep}', code)

# Revert initThree
code = code.replace('function initThree() {', '(function initThree() {')
code = code.replace("  });\n}\nwindow.addEventListener('load', initThree);\n\n/* --- HUD CLOCK --- */", "  });\n})();\n\n/* --- HUD CLOCK --- */")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(code)
