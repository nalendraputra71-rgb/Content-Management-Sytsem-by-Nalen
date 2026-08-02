const fs = require('fs');

let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const undefinedVars = [
  "isWsOwnerOrAdmin",
  "isWsEditor",
  "isDocOwner",
  "sharedUsers",
  "matched",
  "savedFields",
  "merged",
  "valStr",
  "timeFormat",
  "minHour",
  "maxHour",
  "newFormat",
  "oldFormat",
  "currentD",
  "savedData",
  "qStr",
  "uRef",
  "q",
  "cleanUsername",
  "found",
  "currentShared",
  "newUser",
  "nextShared",
  "nextSharedUids",
  "nextEditorUids",
  "nextCommenterUids",
  "len",
  "ts",
  "arr",
  "errMsg",
  "updatedD",
  "workspaceRef",
  "getFieldDescription",
  "applyPreset",
  "updated",
  "isFieldVisible",
  "temp",
  "reloaded",
  "id",
  "label",
  "icon",
  "placeholder",
  "translatedLabel",
  "translatedPlaceholder",
  "fieldValue",
  "isEditing",
  "handleCopy",
  "isCopied",
  "renderAiButton",
  "hasFeature",
  "file",
  "reader"
];

// We find the line: const ctx = { ... };
const match = code.match(/const ctx = \{([\s\S]*?)\};/);
if (match) {
  let inside = match[1];
  for (const v of undefinedVars) {
    let regex = new RegExp(`\\b${v}\\b\\s*,?`, "g");
    inside = inside.replace(regex, "");
  }
  // cleanup multiple commas
  inside = inside.replace(/,+/g, ",");
  
  code = code.replace(match[0], `const ctx = {${inside}};`);
  fs.writeFileSync('src/ContentModal.tsx', code);
  console.log("Fixed ctx");
} else {
  console.log("ctx not found");
}
