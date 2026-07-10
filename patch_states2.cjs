const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const missingStates = `
  const [activeTab, setActiveTab] = useState("social-dashboard");
`;

code = code.replace(
  `const MOCK_COMMENTS: any[] = [];`,
  `const MOCK_COMMENTS: any[] = [];\n${missingStates}`
);

fs.writeFileSync('src/SocialStudioView.tsx', code);
