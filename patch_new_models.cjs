const fs = require('fs');

function replaceAll(file, search, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replacement);
  fs.writeFileSync(file, content);
}

function replaceRegex(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

// 1. server.ts
replaceRegex('server.ts', /model = "gemini-3.5-flash"/g, 'model = "gemini-3.6-flash"');

// 2. HubAiTab.tsx
replaceRegex('src/HubAiTab.tsx', 
  /\{ value: "gemini-3\.5-flash", label: "Gemini 3\.5 Flash \(5x\)" \}/g, 
  '{ value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (10x)" }');
replaceRegex('src/HubAiTab.tsx', 
  /allowedModels \|\| \["gemini-3\.5-flash"\]/g, 
  'allowedModels || ["gemini-3.6-flash"]');

// 3. AdminPanel.tsx
replaceRegex('src/AdminPanel.tsx', /cap_model_gemini-3\.5-flash/g, 'cap_model_gemini-3.6-flash');
replaceRegex('src/AdminPanel.tsx', /"gemini-3\.5-flash"/g, '"gemini-3.6-flash"');
replaceRegex('src/AdminPanel.tsx', /Gemini 3\.5 Flash/g, 'Gemini 3.6 Flash');

// 4. firebase.ts
replaceRegex('src/firebase.ts', /"gemini-3\.5-flash"/g, '"gemini-3.6-flash"');
replaceRegex('src/firebase.ts', /model\.includes\("gemini-3\.6-flash"\)\) multiplier = 5/g, 'model.includes("gemini-3.6-flash")) multiplier = 10');
// wait, the previous code had: `else if (model.includes("gemini-3.5-flash")) multiplier = 5;`
// Let's rewrite it precisely
let fbCode = fs.readFileSync('src/firebase.ts', 'utf8');
fbCode = fbCode.replace(
  /if \(model\.includes\("gemini-3\.1-flash-lite"\)\) multiplier = 1;\s*else if \(model\.includes\("gemini-3\.5-flash"\)\) multiplier = 5;\s*else if \(model\.includes\("gemini-3\.1-pro"\)\) multiplier = 25;/g,
  `if (model.includes("gemini-3.1-flash-lite")) multiplier = 1;
    else if (model.includes("gemini-3.6-flash")) multiplier = 10;
    else if (model.includes("gemini-3.1-pro")) multiplier = 25;`
);
fs.writeFileSync('src/firebase.ts', fbCode);

// 5. SocialStudioView.tsx
replaceRegex('src/SocialStudioView.tsx', /"gemini-3\.5-flash"/g, '"gemini-3.6-flash"');
replaceRegex('src/SocialStudioView.tsx', /'gemini-3\.5-flash'/g, "'gemini-3.6-flash'");

// 6. AnalyticsView.tsx
replaceRegex('src/AnalyticsView.tsx', /"gemini-3\.5-flash"/g, '"gemini-3.6-flash"');

// 7. ContentModal.tsx
replaceRegex('src/ContentModal.tsx', /"gemini-3\.5-flash"/g, '"gemini-3.6-flash"');

console.log('All files updated to use gemini-3.6-flash, gemini-3.1-pro-preview, gemini-3.1-flash-lite');
