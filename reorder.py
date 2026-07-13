import re

with open('src/PublicBriefView.tsx', 'r') as f:
    content = f.read()

main_start = content.find('<main className=')
main_end_tag = '</main>'
main_end = content.find(main_end_tag, main_start)

main_content = content[main_start:main_end]

main_content_mod = re.sub(r'<main className="[^"]+">', '<main className="max-w-[1400px] w-full mx-auto px-4 lg:px-6 mt-8 flex flex-col lg:flex-row gap-6 items-start">', main_content)

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

props_start = main_content_mod.find('<div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col gap-6">')
props_end = find_matching_div(main_content_mod, props_start)

preview_start = main_content_mod.find('{/* REALISTIC MOBILE LIVE PREVIEW PANEL */}', props_end)
preview_end = find_matching_div(main_content_mod, main_content_mod.find('<div', preview_start))

col2_start = main_content_mod.find('{/* LEFT COLUMN (formerly right): Tab Navigation')
col2_end = main_content_mod.find('</main>', col2_start)
if col2_end == -1:
    col2_end = len(main_content_mod)

# Wait, the middle column has a wrapping div: <div className="flex-1 w-full flex flex-col gap-6">
# Let's find it.
col2_div_start = main_content_mod.find('<div', col2_start)
col2_div_end = find_matching_div(main_content_mod, col2_div_start)
col2_content = main_content_mod[col2_div_start:col2_div_end]

col_left = f"""        {{/* LEFT COLUMN: Properties */}}
        <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col gap-6">
{main_content_mod[props_start:props_end]}
        </div>"""

col_middle = f"""        {{/* MIDDLE COLUMN: Tab Navigation and Interactive Cards */}}
{col2_content}"""

col_right = f"""        {{/* RIGHT COLUMN: Mobile Live Preview */}}
        <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-6">
{main_content_mod[preview_start:preview_end]}
        </div>"""

new_main = main_content_mod[:main_content_mod.find('{/* RIGHT COLUMN (formerly left)')] + col_left + "\n\n" + col_middle + "\n\n" + col_right + "\n      "

final_content = content[:main_start] + new_main + content[main_end:]

with open('src/PublicBriefView.tsx', 'w') as f:
    f.write(final_content)

