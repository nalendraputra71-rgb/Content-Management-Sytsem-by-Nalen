const fs = require('fs');

function fixFile(file) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let inString = false;
  let quoteChar = null;
  let out = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let oddQuotes = (line.match(/"/g) || []).length % 2 !== 0;
    
    if (oddQuotes) {
       // if we have an open quote, we append \n to this line and merge it with the next
       // But wait, it's easier to just do:
    }
  }
}
// Actually, let's just do an exact match using indexOf
let code = fs.readFileSync('src/ContentModal.tsx', 'utf8');
code = code.replace(/errMsg \+ "\.\nSilakan/g, 'errMsg + ".\\nSilakan');
fs.writeFileSync('src/ContentModal.tsx', code);
