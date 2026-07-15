import re
import glob

for filename in glob.glob('src/**/*.tsx', recursive=True):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Simple regex to match useEffect calls and capture the array if present
    # This is a bit fragile for nested things but let's just see line numbers of 'useEffect'
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'useEffect(' in line:
            # check the following 20 lines for ']' or '}, ['
            block = '\n'.join(lines[i:i+30])
            if '}, [' not in block and '},[])' not in block.replace(' ', ''):
                print(f"{filename}:{i+1}")
