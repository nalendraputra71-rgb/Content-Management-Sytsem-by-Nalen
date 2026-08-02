const fs = require('fs');

const code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const exportContentModalIdx = code.indexOf('export function ContentModal({');
const renderMobileViewIdx = code.indexOf('  const renderMobileView = () => {');

let logicCode = code.substring(exportContentModalIdx, renderMobileViewIdx);

const regex = /^\s*(?:export\s+)?const\s+(?:\[(.*?)\]|([a-zA-Z0-9_]+))\s*=/gm;
let match;
const exportedVars = [];
while ((match = regex.exec(logicCode)) !== null) {
  if (match[1]) {
    const vars = match[1].split(',').map(s => s.trim());
    exportedVars.push(...vars);
  } else if (match[2]) {
    exportedVars.push(match[2]);
  }
}
const uniqueVars = [...new Set(exportedVars)].filter(v => v !== "React" && v !== "" && !v.includes(" ") && !v.includes("...") && !v.includes(":") && !v.includes("{"));

const propsList = ["modal", "workspace", "userProfile", "planDetails", "onSave","onClose","onArchive","onRestore","onDelete","onDuplicate","pillars","platforms","contentTypes","pics","statuses","onSettingUpdate"];
uniqueVars.push(...propsList);
const allCtxVars = [...new Set(uniqueVars)];

console.log("const ctx = {\\n  " + allCtxVars.join(', ') + "\\n};");
