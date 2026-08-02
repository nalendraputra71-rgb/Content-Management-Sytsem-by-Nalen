const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace(
  /onImportClick={\(\)=>setShowCsv\(true\)}/,
  `onImportClick={()=>{ if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk import data."); return; } setShowCsv(true); }}`
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
