const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const oldRender = `{chatHistory.map((msg, idx) =>
                        idx === 0 ? null : (
                          <motion.div`;
const newRender = `{chatHistory.map((msg, idx) =>
                        (idx === 0 && msg.role === "assistant" && msg.content.includes("HUB.AI")) ? null : (
                          <motion.div`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/SocialStudioView.tsx', code);
console.log('patched render');
