const fs = require('fs');

let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const undefinedVars = [
  "docRef",
  "docSnap",
  "freshData",
  "fetchProfiles",
  "next",
  "missingIds",
  "handleResize",
  "originalTitle",
  "unsubscribe",
  "data",
  "authorName",
  "updatedComments",
  "commentsList",
  "count",
  "isOpen",
  "sectionComments",
  "unresolvedComments",
  "resolvedComments",
  "showResolved",
  "val",
  "txtEl",
  "timer",
  "uid",
  "email",
  "username"
];

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
  console.log("Fixed ctx 2");
} else {
  console.log("ctx not found");
}
