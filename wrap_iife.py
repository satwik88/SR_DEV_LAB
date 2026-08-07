with open('projects-component.js', 'r', encoding='utf-8') as f:
    code = f.read()

# We only wrap if it's not already wrapped
if not code.strip().startswith('(() => {'):
    code = '(() => {\n' + code + '\n})();\n'
    with open('projects-component.js', 'w', encoding='utf-8') as f:
        f.write(code)
