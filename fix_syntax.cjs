const fs = require('fs');
let code = fs.readFileSync('src/SocialStudioView.tsx', 'utf8');

const lines = code.split('\n');
const fixedLines = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* CONNECTION DIAGNOSTICS */}')) {
    if (lines[i+1] && lines[i+1].includes('</div>')) {
      // skip corrupted block
      while(i < lines.length && !lines[i].includes('<div className="flex flex-col gap-3 mb-8 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">')) {
         i++;
      }
    }
  }
  fixedLines.push(lines[i]);
}

fs.writeFileSync('src/SocialStudioView.tsx', fixedLines.join('\n'));
