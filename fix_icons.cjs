const fs = require('fs');

let s = fs.readFileSync('src/ContentModal.tsx', 'utf8');

s = s.replace(/<ArrowDownCircle size=\{14\}\/> Status/g, '<Zap size={14}/> Status');
s = s.replace(/<ArrowDownCircle size=\{14\}\/> Section/g, '<Flag size={14}/> Section');
s = s.replace(/<LinkIcon size=\{14\}\/> Referensi/g, '<Link size={14}/> Referensi');
s = s.replace(/<GripVertical size=\{14\}\/> Type/g, '<FileText size={14}/> Type');

fs.writeFileSync('src/ContentModal.tsx', s);
console.log("Fixed icons");
