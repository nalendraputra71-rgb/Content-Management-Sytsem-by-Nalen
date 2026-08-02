const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const roleCheck = `\n    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengubah data.");`;

content = content.replace(
  /const moveItemDate = async \(itemId: string, newDate: number\) => {\n    if \(!workspace\) return;/,
  `const moveItemDate = async (itemId: string, newDate: number) => {\n    if (!workspace) return;${roleCheck}`
);

content = content.replace(
  /const moveItemStatus = async \(itemId: string, newStatus: string\) => {\n    if \(!workspace\) return;/,
  `const moveItemStatus = async (itemId: string, newStatus: string) => {\n    if (!workspace) return;${roleCheck}`
);

content = content.replace(
  /const archiveItem = async \(id:string\) => {\n    if\(!workspace \|\| !id\) return;/,
  `const archiveItem = async (id:string) => {\n    if(!workspace || !id) return;${roleCheck}`
);

content = content.replace(
  /const unarchiveItem = async \(id:string\) => {\n    if\(!workspace \|\| !id\) return;/,
  `const unarchiveItem = async (id:string) => {\n    if(!workspace || !id) return;${roleCheck}`
);

content = content.replace(
  /const deleteItem = async \(id:string\) => {\n    if\(!workspace \|\| !id\) return;/,
  `const deleteItem = async (id:string) => {\n    if(!workspace || !id) return;${roleCheck}`
);

content = content.replace(
  /const handleBulkActions = async \(type: "delete" \| "archive" \| "restore"\) => {\n    if \(!workspace \|\| bulkIds.length === 0 \|\| isRestricted\) return;/,
  `const handleBulkActions = async (type: "delete" | "archive" | "restore") => {\n    if (!workspace || bulkIds.length === 0 || isRestricted) return;${roleCheck}`
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
