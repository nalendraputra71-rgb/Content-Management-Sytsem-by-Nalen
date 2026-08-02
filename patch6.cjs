const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const roleCheck = `\n    if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah pengaturan.");`;

content = content.replace(
  /const updateWsSettings = async \(updates: any\) => {\n    if \(!workspace\) return;/,
  `const updateWsSettings = async (updates: any) => {\n    if (!workspace) return;${roleCheck}`
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
