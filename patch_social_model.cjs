const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

code = code.replace(
  /const \[selectedAiModel, setSelectedAiModel\] = useState\("gemini-3\.5-flash"\);/,
  `const [selectedAiModel, setSelectedAiModel] = useState(planDetails?.capabilities?.allowedModels?.[0] || "gemini-3.5-flash");`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);
console.log("Patched SocialStudioView.tsx");
