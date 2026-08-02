const fs = require('fs');
let content = fs.readFileSync('src/ContentModal.tsx', 'utf8');

content = content.replace(
  /const set = \(k:string,v:any\) => {\n    if \(!canEdit && k !== "comments"\) {\n      showToast\("Akses Anda sebagai " \+ \(userRole === "commenter" \? "Komentator" : "Pelihat"\) \+ " bersifat Read-Only", "error"\);\n      return;\n    }\n    isDirty\.current = true;/,
  `const set = (k:string,v:any) => {\n    if (!canEdit && k !== "comments") {\n      showToast("Akses Anda sebagai " + (userRole === "commenter" ? "Komentator" : "Pelihat") + " bersifat Read-Only", "error");\n      return;\n    }\n    if (canEdit) isDirty.current = true;`
);

content = content.replace(
  /const handleClose = async \(e\?: any\) => {\n    if \(e && e\.stopPropagation\) e\.stopPropagation\(\);\n    if \(d\.isHubAiDraft && !d\.manuallySaved\) {\n       setShowExitConfirm\(true\);\n       return;\n    }\n        if \(isDirty\.current\) {/,
  `const handleClose = async (e?: any) => {\n    if (e && e.stopPropagation) e.stopPropagation();\n    if (d.isHubAiDraft && !d.manuallySaved && canEdit) {\n       setShowExitConfirm(true);\n       return;\n    }\n        if (isDirty.current && canEdit) {`
);

content = content.replace(
  /<button onClick={async \(\) => {\n              isDirty\.current = false;\n              const newD = { \.\.\.dRef\.current, manuallySaved: true };\n              setD\(newD\);\n              dRef\.current = newD;\n              await onSave\(newD, true\);\n              onClose\(\);\n            }} className="hover-scale" style={{\.\.\.B\(false\), background:"#3B82F6", border:"none", color:"white", padding:"5px 14px", fontSize:12, fontWeight:700}}>{lang === "id" \? "Simpan" : "Save"}<\/button>/,
  `{canEdit ? (\n              <button onClick={async () => {\n                isDirty.current = false;\n                const newD = { ...dRef.current, manuallySaved: true };\n                setD(newD);\n                dRef.current = newD;\n                await onSave(newD, true);\n                onClose();\n              }} className="hover-scale" style={{...B(false), background:"#3B82F6", border:"none", color:"white", padding:"5px 14px", fontSize:12, fontWeight:700}}>{lang === "id" ? "Simpan" : "Save"}</button>\n            ) : (\n              <button onClick={() => onClose()} className="hover-scale" style={{...B(false), background:"rgba(0,0,0,0.05)", border:"none", color:"#111827", padding:"5px 14px", fontSize:12, fontWeight:700}}>{lang === "id" ? "Tutup" : "Close"}</button>\n            )}`
);

fs.writeFileSync('src/ContentModal.tsx', content);
