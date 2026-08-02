const fs = require('fs');

let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const regex = /const renderHistoryView = \(\) => \{[\s\S]*?\n\s+return \([\s\S]*?\}\);\n\s+\};\n/m;
code = code.replace(regex, '');

code = code.replace(/renderHistoryView\(\)/g, '<HistoryView isMobile={isMobile} setShowHistory={setShowHistory} lang={lang} d={d} onClose={onClose} editorProfiles={editorProfiles} />');

if (!code.includes("import { HistoryView }")) {
  code = code.replace("import { HistoryChangeItem } from './components/HistoryChangeItem';", "import { HistoryChangeItem } from './components/HistoryChangeItem';\nimport { HistoryView } from './components/HistoryView';");
}

fs.writeFileSync('src/ContentModal.tsx', code, 'utf8');
