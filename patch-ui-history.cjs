const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

// find chatHistory initialization
const oldInit = `const [chatHistory, setChatHistory] = useState<any[]>([]);`;
const newInit = `const [chatHistory, setChatHistory] = useState<any[]>([{ role: "assistant", content: "Halo! Saya HUB.AI, asisten khusus untuk content creator. Apa yang bisa saya bantu hari ini?" }]);`;
code = code.replace(oldInit, newInit);

fs.writeFileSync('src/SocialStudioView.tsx', code);
console.log('patched');
