const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const eventRoleCheck = `\n    if (workspace.userRole === "viewer" || workspace.userRole === "commenter") return alert("Akses ditolak: Anda tidak memiliki izin untuk mengelola event.");`;

content = content.replace(
  /onOpenAddEvent={\(\) => { setEditingEvent\(null\); setShowEventModal\(true\); }}/,
  `onOpenAddEvent={() => { if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk mengelola event."); return; } setEditingEvent(null); setShowEventModal(true); }}`
);

content = content.replace(
  /onEditCustomEvent={\(ev: any\) => { setEditingEvent\(ev\); setShowEventModal\(true\); }}/g,
  `onEditCustomEvent={(ev: any) => { if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk mengelola event."); return; } setEditingEvent(ev); setShowEventModal(true); }}`
);

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
