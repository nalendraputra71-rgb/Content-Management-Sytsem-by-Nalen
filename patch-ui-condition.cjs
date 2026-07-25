const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldCond = `) : chatHistory.length <= 1 ? (`;
const newCond = `) : (chatHistory.length === 0 || (chatHistory.length === 1 && chatHistory[0].role === "assistant")) ? (`;

code = code.replace(oldCond, newCond);
fs.writeFileSync('src/SocialStudioView.tsx', code);
console.log('patched condition');
