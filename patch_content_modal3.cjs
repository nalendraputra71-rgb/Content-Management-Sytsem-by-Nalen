const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

const startIdx = code.indexOf('const renderHistoryView = () => {');
if (startIdx !== -1) {
    let braceCount = 0;
    let endIdx = -1;
    let foundFirstBrace = false;
    for (let i = startIdx; i < code.length; i++) {
        if (code[i] === '{') {
            braceCount++;
            foundFirstBrace = true;
        } else if (code[i] === '}') {
            braceCount--;
        }
        if (foundFirstBrace && braceCount === 0) {
            endIdx = i;
            break;
        }
    }
    
    if (endIdx !== -1) {
        code = code.substring(0, startIdx) + code.substring(endIdx + 1);
        fs.writeFileSync('src/ContentModal.tsx', code, 'utf8');
        console.log("Replaced successfully!");
    } else {
        console.log("End brace not found.");
    }
} else {
    console.log("Start not found.");
}
