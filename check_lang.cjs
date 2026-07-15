const fs = require('fs');
const files = require('child_process').execSync('grep -l -r -E "lang( ===| \\?)" src/').toString().trim().split('\n');
for (const file of files) {
  if (!file) continue;
  const content = fs.readFileSync(file, 'utf8');
  let currentFunc = null;
  const lines = content.split('\n');
  let langDefined = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/(function |const .* = .*=>|const .* = function)/)) {
      currentFunc = line.trim();
      langDefined = false;
    }
    if (line.includes('const { lang') || line.includes('const {lang') || line.includes('const lang =') || line.includes('lang:')) {
      langDefined = true;
    }
    if (line.match(/lang( ===| \?)/)) {
      if (!langDefined) {
        console.log(`Missing lang in file: ${file}, function: ${currentFunc}, line: ${i+1}`);
      }
    }
  }
}
