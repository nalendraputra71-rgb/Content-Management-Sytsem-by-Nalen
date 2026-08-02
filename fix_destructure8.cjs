const fs = require('fs');
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');

// I will just convert ALL literal newlines inside strings to \n
let out = [];
let inString = false;
for (let i = 0; i < code.length; i++) {
  let c = code[i];
  if (c === '"' && code[i-1] !== '\\') {
    inString = !inString;
    out.push(c);
  } else if (c === '\n' && inString) {
    out.push('\\n');
  } else {
    out.push(c);
  }
}
fs.writeFileSync('src/ContentModal.tsx', out.join(''));
