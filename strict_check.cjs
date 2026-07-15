const fs = require('fs');
const execSync = require('child_process').execSync;
const files = execSync('grep -l -r -E "lang( ===| \\?)" src/').toString().trim().split('\n');

for (const file of files) {
  if (!file) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  let functionScopes = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if lang is used
    if (line.match(/lang( ===| \?)/)) {
      // Find the closest function scope backwards
      let foundDefinition = false;
      for (let j = i; j >= 0; j--) {
        if (lines[j].match(/(function |const .* = .*=>|const .* = function)/)) {
          // Check if this function or a block between j and i defines lang
          let definesLang = false;
          for (let k = j; k <= i; k++) {
            if (lines[k].includes('const { lang') || lines[k].includes('const {lang') || lines[k].includes('const lang =') || lines[k].includes('let lang') || lines[k].includes('(lang:')) {
              definesLang = true;
              break;
            }
          }
          if (definesLang) {
            foundDefinition = true;
            break; // Found a valid definition in the closest enclosing function (roughly)
          }
        }
      }
      
      if (!foundDefinition) {
        console.log(`Missing lang in file: ${file}, line: ${i+1}\nCode: ${line.trim()}`);
      }
    }
  }
}
