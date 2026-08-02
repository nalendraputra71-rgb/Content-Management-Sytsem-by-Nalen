const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/<HistoryView isMobile=\{isMobile\} setShowHistory=\{setShowHistory\} lang=\{lang\} d=\{d\} onClose=\{onClose\}  workspaceId=\{workspace\?\.id\} editorProfiles=\{editorProfiles\} \/>/, `<HistoryView isMobile={isMobile} setShowHistory={setShowHistory} lang={lang} d={d} onClose={onClose} workspaceId={workspace?.id} editorProfiles={editorProfiles} planDetails={planDetails} />`);
  fs.writeFileSync(file, code);
}

patchFile('src/components/ContentModalMobileView.tsx');
patchFile('src/components/ContentModalDesktopView.tsx');
