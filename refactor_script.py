import re

with open('script.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Extract THREE dependencies
three_deps = set(re.findall(r'THREE\.([A-Za-z0-9_]+)', code))
if 'JS' in three_deps:
    three_deps.remove('JS')

# Replace THREE.X with X
for dep in three_deps:
    code = code.replace(f'THREE.{dep}', dep)

import_stmt = f"import {{ {', '.join(sorted(three_deps))} }} from 'https://esm.sh/three@0.128.0';\n"
code = import_stmt + code

# Replace IIFE with load event
code = code.replace('(function initThree() {', 'function initThree() {')
code = code.replace('  });\n})();\n\n/* --- HUD CLOCK --- */', "  });\n}\nwindow.addEventListener('load', initThree);\n\n/* --- HUD CLOCK --- */")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(code)
