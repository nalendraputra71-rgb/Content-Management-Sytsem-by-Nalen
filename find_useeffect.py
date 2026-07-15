import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'useEffect(' in line:
        print(f"--- Line {i+1} ---")
        for j in range(i, min(i+10, len(lines))):
            print(f"{j+1}: {lines[j]}", end='')
