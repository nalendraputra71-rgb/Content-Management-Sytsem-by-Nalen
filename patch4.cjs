const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const roleCheck = `\n    if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk menambah data.");`;

content = content.replace(
  /const openAdd  = \(day:any, prefilled\?: any\) => {\n    if \(isRestricted\)/,
  `const openAdd  = (day:any, prefilled?: any) => {${roleCheck}\n    if (isRestricted)`
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
