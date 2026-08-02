const fs = require('fs');
let code = fs.readFileSync('src/components/HistoryView.tsx', 'utf8');

code = code.replace(/const fetchedItems = snapshot\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\)\);/g, `const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));`);

fs.writeFileSync('src/components/HistoryView.tsx', code);
console.log("Patched HistoryView");
