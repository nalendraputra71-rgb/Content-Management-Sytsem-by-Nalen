import re

with open('src/SocialStudioView.tsx', 'r') as f:
    content = f.read()

def replace_border(match):
    value = match.group(1)
    if 'solid' in value:
        parts = value.split(' solid ')
        if len(parts) == 2:
            return f'borderWidth: "{parts[0]}", borderStyle: "solid", borderColor: "{parts[1]}"'
    if 'dashed' in value:
        parts = value.split(' dashed ')
        if len(parts) == 2:
            return f'borderWidth: "{parts[0]}", borderStyle: "dashed", borderColor: "{parts[1]}"'
    return match.group(0)

new_content = re.sub(r'border:\s*"([^"]+)"', replace_border, content)
new_content = re.sub(r"border:\s*'([^']+)'", replace_border, new_content)

with open('src/SocialStudioView.tsx', 'w') as f:
    f.write(new_content)
