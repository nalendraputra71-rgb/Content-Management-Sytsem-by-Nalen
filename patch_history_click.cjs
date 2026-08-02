const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const replacement = `onClick={() => {
                const hDays = planDetails?.capabilities?.historyDays ?? 0;
                if (hDays === 0) {
                  alert(lang === 'id' ? 'Upgrade paket untuk melihat riwayat edit.' : 'Upgrade plan to view edit history.');
                  return;
                }
                setShowHistory(true);
              }}`;
              
  code = code.replace(/onClick=\{\(\) => setShowHistory\(true\)\}/g, replacement);
  fs.writeFileSync(file, code);
}

patchFile('src/components/ContentModalMobileView.tsx');
patchFile('src/components/ContentModalDesktopView.tsx');
