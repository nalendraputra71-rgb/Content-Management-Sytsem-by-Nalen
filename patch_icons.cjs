const fs = require('fs');
let content = fs.readFileSync('src/SettingsPanel.tsx', 'utf8');
content = content.replace('  Tag,', '  Tag,\n  GripVertical,');
fs.writeFileSync('src/SettingsPanel.tsx', content);
