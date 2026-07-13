import re

with open('src/Views.tsx', 'r') as f:
    content = f.read()

target = '              boxShadow: dragOverDate === day ? "inset 0 0 0 1px rgba(0,122,255,0.1)" : isToday ? "0 8px 24px rgba(var(--theme-primary-rgb),0.15)" : "0 2px 12px rgba(0,0,0,0.02)",\n              transition: "all 0.2s"\n            }}>'
replacement = '              boxShadow: dragOverDate === day ? "inset 0 0 0 1px rgba(0,122,255,0.1)" : isToday ? "0 8px 24px rgba(var(--theme-primary-rgb),0.15)" : "0 2px 12px rgba(0,0,0,0.02)",\n              transition: "all 0.2s",\n              position: "relative",\n              overflow: "hidden"\n            }}>'

content = content.replace(target, replacement)

with open('src/Views.tsx', 'w') as f:
    f.write(content)
