const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const replacement = `          onImportClick={()=>{ 
            const { hasCapability } = usePlanLimits(planDetails);
            if (!hasCapability('csvImportExport')) {
              alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
              return;
            }
            if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk import data."); return; } 
            setShowCsv(true); 
          }}
          onExportClick={()=>{ 
            const { hasCapability } = usePlanLimits(planDetails);
            if (!hasCapability('csvImportExport')) {
              alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
              return;
            }
            setExportModal(true); 
          }}`;

code = code.replace(/          onImportClick=\{\(\)=>\{ if \(workspace\?\.userRole === "viewer" \|\| workspace\?\.userRole === "commenter"\) \{ alert\("Akses ditolak: Anda tidak memiliki izin untuk import data\."\); return; \} setShowCsv\(true\); \}\}\n          onExportClick=\{\(\)=>setExportModal\(true\)\}/g, replacement);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
