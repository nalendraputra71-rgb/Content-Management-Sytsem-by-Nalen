const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

code = code.replace(
  /const allowed = planDetails\?\.capabilities\?\.allowedModels \|\| \['gemini-3\.6-flash'\];/g,
  `const allowed = (planDetails?.capabilities?.allowedModels || ['gemini-3.6-flash']).map((m: string) => m === "gemini-3.5-flash" ? "gemini-3.6-flash" : m === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : m);`
);
code = code.replace(
  /const \[selectedAiModel, setSelectedAiModel\] = useState\(planDetails\?\.capabilities\?\.allowedModels\?\.\[0\] \|\| "gemini-3\.6-flash"\);/g,
  `const mappedDefaultModel = planDetails?.capabilities?.allowedModels?.[0] ? (planDetails.capabilities.allowedModels[0] === "gemini-3.5-flash" ? "gemini-3.6-flash" : planDetails.capabilities.allowedModels[0] === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : planDetails.capabilities.allowedModels[0]) : "gemini-3.6-flash";\n  const [selectedAiModel, setSelectedAiModel] = useState(mappedDefaultModel);`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);
