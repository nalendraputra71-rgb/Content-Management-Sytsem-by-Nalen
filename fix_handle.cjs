const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

code = code.replace(
  `const MOCK_COMMENTS: any[] = [];

    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);`,
  `const MOCK_COMMENTS: any[] = [];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const newHistory = [...chatHistory, { role: "user", content: userMsg }];
    let currentSessionId = activeSessionId;

    setChatHistory(newHistory);
    setChatInput("");
    setChatLoading(true);`
);

const fetchEndRegex = /        \}\n      \} catch \(e\) \{\n        console\.error\("Gagal save session ke Firebase", e\);\n      \}\n    \} catch \(err: any\) \{/;
// Wait, the end of handleSendMessage might have been intact.
// Let's check where the closing brace for handleSendMessage is.

fs.writeFileSync('src/SocialStudioView.tsx', code);
