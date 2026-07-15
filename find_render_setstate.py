import re

with open('src/SocialStudioView.tsx', 'r') as f:
    content = f.read()

# We look for lines where setSomething(...) is called, but not inside an arrow function.
# This might be tricky because of nested blocks.
# Let's just print lines with "set" and "(" that are not preceded by "=>" on the same line.
lines = content.split('\n')
for i, line in enumerate(lines):
    if re.search(r'\bset[A-Z]\w*\(', line):
        if '=>' not in line and 'function' not in line and 'const ' not in line and 'let ' not in line:
            # Check if it's inside a useEffect or callback by looking at context
            pass
            # Actually just grep for setSomething(
            # print(f"{i+1}: {line.strip()}")
