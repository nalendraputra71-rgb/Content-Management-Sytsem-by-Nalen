import re

with open('src/AnalyticsView.tsx', 'r') as f:
    content = f.read()

# 1. Remove states
content = re.sub(r'  const \[editDemoData, setEditDemoData\] = useState<any>\(null\);\n', '', content)
content = re.sub(r'  const \[editingPlatform, setEditingPlatform\] = useState\(""\);\n', '', content)
content = re.sub(r'  const \[tempDemographics, setTempDemographics\] = useState<any>\(\{\}\);\n', '', content)

# 2. Simplify first edit button (around line 2408)
content = re.sub(
    r'onClick=\{\(\) => \{\n\s*const initialTemp = JSON\.parse.*?setEditDemoData.*?setIsDemoModalOpen\(true\);\n\s*\}\}',
    r'onClick={() => setIsDemoModalOpen(true)}',
    content,
    flags=re.DOTALL
)

# 3. Remove inline modal code
# We find the start and end of the modal
modal_start_str = '{/* DEMOGRAPHICS EDITING MODAL */}'
modal_end_str = '{/* PRINT CONFIGURATION MODAL */}'

start_idx = content.find(modal_start_str)
end_idx = content.find(modal_end_str)

if start_idx != -1 and end_idx != -1:
    modal_code = content[start_idx:end_idx]
    content = content[:start_idx] + '      {/* DEMOGRAPHICS EDITING MODAL */}\n      <DemoEditModal \n        isDemoModalOpen={isDemoModalOpen} \n        setIsDemoModalOpen={setIsDemoModalOpen} \n        demographics={demographics} \n        setDemographics={setDemographics} \n        platformFilter={platformFilter} \n        platforms={platforms} \n      />\n\n      ' + content[end_idx:]

with open('src/AnalyticsView.tsx', 'w') as f:
    f.write(content)

