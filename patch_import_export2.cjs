const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const replacement = `          onImportClick={()=>{ 
            if (!hasCapability('csvImportExport')) {
              alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
              return;
            }
            if (workspace?.userRole === "viewer" || workspace?.userRole === "commenter") { alert("Akses ditolak: Anda tidak memiliki izin untuk import data."); return; } 
            setShowCsv(true); 
          }}
          onExportClick={()=>{ 
            if (!hasCapability('csvImportExport')) {
              alert("Fitur Bulk Import/Export CSV tidak tersedia di paket Anda. Silakan upgrade paket.");
              return;
            }
            setExportModal(true); 
          }}`;

code = code.replace(/          onImportClick=\{\(\)=>\{ \n            const \{ hasCapability \} = usePlanLimits\(planDetails\);\n            if \(\!hasCapability\('csvImportExport'\)\) \{\n              alert\("Fitur Bulk Import\/Export CSV tidak tersedia di paket Anda\. Silakan upgrade paket\."\);\n              return;\n            \}\n            if \(workspace\?\.userRole === "viewer" \|\| workspace\?\.userRole === "commenter"\) \{ alert\("Akses ditolak: Anda tidak memiliki izin untuk import data\."\); return; \} \n            setShowCsv\(true\); \n          \}\}\n          onExportClick=\{\(\)=>\{ \n            const \{ hasCapability \} = usePlanLimits\(planDetails\);\n            if \(\!hasCapability\('csvImportExport'\)\) \{\n              alert\("Fitur Bulk Import\/Export CSV tidak tersedia di paket Anda\. Silakan upgrade paket\."\);\n              return;\n            \}\n            setExportModal\(true\); \n          \}\}/g, replacement);

fs.writeFileSync('src/layouts/MainLayout.tsx', code);
