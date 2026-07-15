import re

with open('src/PublicBriefView.tsx', 'r') as f:
    content = f.read()

# Remove the RIGHT COLUMN: Mobile Live Preview
col_start = content.find('{/* RIGHT COLUMN: Mobile Live Preview */}')
if col_start != -1:
    div_start = content.find('<div', col_start)
    
    def find_matching_div(s, start_idx):
        depth = 0
        i = start_idx
        while i < len(s):
            if s[i:i+4] == '<div':
                depth += 1
            elif s[i:i+5] == '</div':
                depth -= 1
                if depth == 0:
                    return i + 6
            i += 1
        return -1
        
    div_end = find_matching_div(content, div_start)
    content = content[:col_start].rstrip() + "\n      " + content[div_end:].lstrip()

# Change max-w-[1400px] to max-w-6xl
content = content.replace('max-w-[1400px]', 'max-w-6xl')
content = content.replace('w-full lg:w-[280px] xl:w-[320px]', 'w-full lg:w-[380px]')

with open('src/PublicBriefView.tsx', 'w') as f:
    f.write(content)
