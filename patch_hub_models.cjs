const fs = require('fs');
let code = fs.readFileSync('src/HubAiTab.tsx', 'utf8');

code = code.replace(
  /const allowedModels = ctx\.planDetails\?\.capabilities\?\.allowedModels \|\| \["gemini-3\.6-flash"\];/g,
  `const allowedModels = (ctx.planDetails?.capabilities?.allowedModels || ["gemini-3.6-flash"]).map((m: string) => m === "gemini-3.5-flash" ? "gemini-3.6-flash" : m === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : m);`
);

fs.writeFileSync('src/HubAiTab.tsx', code);
